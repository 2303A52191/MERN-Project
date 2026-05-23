const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const Comment = require('../models/Comment');

// Helper to log activity
const logActivity = async (projectId, userId, action, details) => {
  try {
    await ActivityLog.create({
      project: projectId,
      user: userId,
      action,
      details,
    });
  } catch (error) {
    console.error(`[Activity Log Error] ${error.message}`);
  }
};

// @desc    Create a task inside a project
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, project: projectId, status, priority, assignee, dueDate, tags } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide task title and project ID',
      });
    }

    // Verify project exists and user is part of it
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Associated project not found`,
      });
    }

    const isMember = project.members.some(m => m.toString() === req.user.id);
    const isOwner = project.owner.toString() === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Manager';

    if (!isMember && !isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create tasks in this project workspace',
      });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      status: status || 'Todo',
      priority: priority || 'Medium',
      assignee: assignee || null,
      creator: req.user.id,
      dueDate,
      tags: tags || [],
    });

    await logActivity(
      projectId,
      req.user.id,
      'Task Created',
      `Task "${title}" created and prioritized as [${task.priority}]`
    );

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for a project (with filtering and search)
// @route   GET /api/tasks/project/:projectId
// @access  Private
exports.getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { search, status, priority, assignee } = req.query;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Auth verification
    const isMember = project.members.some(m => m.toString() === req.user.id);
    const isOwner = project.owner.toString() === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Manager';

    if (!isMember && !isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view tasks in this project',
      });
    }

    // Build filters object
    const filter = { project: projectId };

    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (assignee) {
      filter.assignee = assignee;
    }
    if (search) {
      // Case-insensitive regex search on title and description
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task detail (with comments loaded)
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('project', 'name owner members');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify project access
    const project = task.project;
    const isMember = project.members.some(m => m.toString() === req.user.id);
    const isOwner = project.owner.toString() === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Manager';

    if (!isMember && !isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task',
      });
    }

    // Load related comments
    const comments = await Comment.find({ task: task._id })
      .populate('user', 'name email avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: task,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Access authorization check
    const project = task.project;
    const isMember = project.members.some(m => m.toString() === req.user.id);
    const isOwner = project.owner.toString() === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Manager';

    if (!isMember && !isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update tasks in this project workspace',
      });
    }

    const { title, description, status, priority, assignee, dueDate, tags } = req.body;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, assignee, dueDate, tags },
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar');

    await logActivity(
      task.project._id,
      req.user.id,
      'Task Updated',
      `Task "${task.title}" updated by ${req.user.name}`
    );

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (specifically for Kanban board Drag-and-Drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide target status',
      });
    }

    let task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify project access
    const project = task.project;
    const isMember = project.members.some(m => m.toString() === req.user.id);
    const isOwner = project.owner.toString() === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Manager';

    if (!isMember && !isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify task status',
      });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await logActivity(
      task.project._id,
      req.user.id,
      'Status Changed',
      `Moved task "${task.title}" from "${oldStatus}" to "${status}"`
    );

    const updatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar');

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Access authorization check
    const project = task.project;
    const isOwner = project.owner.toString() === req.user.id;
    const isCreator = task.creator.toString() === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Manager';

    if (!isOwner && !isCreator && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Delete associated comments
    await Comment.deleteMany({ task: req.params.id });

    await logActivity(
      project._id,
      req.user.id,
      'Task Deleted',
      `Task "${task.title}" was permanently removed`
    );

    res.status(200).json({
      success: true,
      message: 'Task and comments deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
