const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// @desc    Get dashboard metrics, charts, and activity feed
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    let projectIds = [];

    // 1. Fetch Projects User has access to
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      const allProjects = await Project.find({}, '_id');
      projectIds = allProjects.map((p) => p._id);
    } else {
      const userProjects = await Project.find(
        {
          $or: [{ owner: req.user.id }, { members: req.user.id }],
        },
        '_id'
      );
      projectIds = userProjects.map((p) => p._id);
    }

    // Handlers for empty workspaces
    if (projectIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          projectsCount: 0,
          tasksCount: 0,
          completedTasksCount: 0,
          pendingTasksCount: 0,
          priorityBreakdown: { Low: 0, Medium: 0, High: 0, Urgent: 0 },
          statusBreakdown: { Backlog: 0, Todo: 0, 'In Progress': 0, Review: 0, Done: 0 },
          activities: [],
          usersCount: await User.countDocuments(),
        },
      });
    }

    // 2. Aggregate count of projects by status
    const projectsCount = projectIds.length;
    const activeProjectsCount = await Project.countDocuments({
      _id: { $in: projectIds },
      status: 'Active',
    });

    // 3. Aggregate Task Stats
    const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
    const completedTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'Done',
    });
    const pendingTasks = totalTasks - completedTasks;

    // 4. Priority breakdown
    const priorities = ['Low', 'Medium', 'High', 'Urgent'];
    const priorityStats = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    const priorityBreakdown = {};
    priorities.forEach((p) => {
      const found = priorityStats.find((s) => s._id === p);
      priorityBreakdown[p] = found ? found.count : 0;
    });

    // 5. Status breakdown
    const statuses = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
    const statusStats = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusBreakdown = {};
    statuses.forEach((s) => {
      const found = statusStats.find((stat) => stat._id === s);
      statusBreakdown[s] = found ? found.count : 0;
    });

    // 6. Recent Activity Feed
    const activities = await ActivityLog.find({ project: { $in: projectIds } })
      .populate('user', 'name email avatar role')
      .populate('project', 'name')
      .sort('-createdAt')
      .limit(10);

    // 7. Core team members info (Total registered users)
    const usersCount = await User.countDocuments();
    const teamMembersList = await User.find({}, 'name email role avatar').limit(10);

    res.status(200).json({
      success: true,
      data: {
        projectsCount,
        activeProjectsCount,
        tasksCount: totalTasks,
        completedTasksCount: completedTasks,
        pendingTasksCount: pendingTasks,
        priorityBreakdown,
        statusBreakdown,
        activities,
        usersCount,
        teamMembersList,
      },
    });
  } catch (error) {
    next(error);
  }
};
