const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// Helper to log project activity
const logActivity = async (projectId, userId, action, details) => {
  try {
    await ActivityLog.create({
      project: projectId,
      user: userId,
      action,
      details,
    });
  } catch (error) {
    console.error(`[Activity Log Error] Failed to log activity: ${error.message}`);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin or Manager)
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, dueDate, members } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a project name',
      });
    }

    const project = await Project.create({
      name,
      description,
      dueDate,
      owner: req.user.id,
      members: members || [],
    });

    await logActivity(
      project._id,
      req.user.id,
      'Project Created',
      `Project "${name}" was successfully initiated by ${req.user.name}`
    );

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    let query;

    // Admins and Managers can see all projects
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      query = Project.find().populate('owner', 'name email avatar').populate('members', 'name email avatar');
    } else {
      // Team Members see projects they own or are assigned to
      query = Project.find({
        $or: [{ owner: req.user.id }, { members: req.user.id }],
      })
        .populate('owner', 'name email avatar')
        .populate('members', 'name email avatar');
    }

    const projects = await query.sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project with ID ${req.params.id} not found`,
      });
    }

    // Access check: Admin/Manager, Owner, or Member
    const isMember = project.members.some(
      (m) => m._id.toString() === req.user.id || m.toString() === req.user.id
    );
    const isOwner = project.owner._id.toString() === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Manager';

    if (!isOwner && !isMember && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project',
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project with ID ${req.params.id} not found`,
      });
    }

    // Access check
    const isOwner = project.owner.toString() === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Manager';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      });
    }

    const { name, description, status, dueDate, members } = req.body;

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, status, dueDate, members },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    await logActivity(
      project._id,
      req.user.id,
      'Project Updated',
      `Project parameters edited: "${project.name}" (Status: ${project.status})`
    );

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project with ID ${req.params.id} not found`,
      });
    }

    // Access check
    const isOwner = project.owner.toString() === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Manager';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
    }

    // UsingdeleteOne to trigger cascading task drops if necessary, or simple deletion
    await Project.findByIdAndDelete(req.params.id);

    // Delete related ActivityLogs and Tasks
    // Avoid leaving orphaned tasks
    const Task = require('../models/Task');
    await Task.deleteMany({ project: req.params.id });
    await ActivityLog.deleteMany({ project: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Project and its associated tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign team members to a project
// @route   POST /api/projects/:id/members
// @access  Private
exports.assignMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project with ID ${req.params.id} not found`,
      });
    }

    // Access check
    const isOwner = project.owner.toString() === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Manager';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage project assignments',
      });
    }

    const { memberIds } = req.body;
    if (!Array.isArray(memberIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of user IDs (memberIds)',
      });
    }

    project.members = memberIds;
    await project.save();

    await logActivity(
      project._id,
      req.user.id,
      'Members Assigned',
      `Assigned ${memberIds.length} members to the project workspace`
    );

    const updatedProject = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(200).json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};
