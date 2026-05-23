const Comment = require('../models/Comment');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

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
    console.error(`[Activity Log Error] ${error.message}`);
  }
};

// @desc    Add a comment to a task
// @route   POST /api/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { taskId, content } = req.body;

    if (!taskId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide task ID and comment content',
      });
    }

    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Access check: must be a member of the project
    const project = task.project;
    const isMember = project.members.some(m => m.toString() === req.user.id);
    const isOwner = project.owner.toString() === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Manager';

    if (!isMember && !isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add comments in this project',
      });
    }

    const comment = await Comment.create({
      task: taskId,
      user: req.user.id,
      content,
    });

    await logActivity(
      project._id,
      req.user.id,
      'Comment Added',
      `Commented on task "${task.title}": "${content.substring(0, 30)}..."`
    );

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(comment.id || req.params.id).populate({
      path: 'task',
      populate: { path: 'project' }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    const task = comment.task;
    const project = task.project;

    // Authorization: comment author, task creator, project owner, or Admin/Manager
    const isCommentAuthor = comment.user.toString() === req.user.id;
    const isTaskCreator = task.creator.toString() === req.user.id;
    const isProjectOwner = project.owner.toString() === req.user.id;
    const isPrivileged = req.user.role === 'Admin' || req.user.role === 'Manager';

    if (!isCommentAuthor && !isTaskCreator && !isProjectOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    await Comment.findByIdAndDelete(comment._id);

    await logActivity(
      project._id,
      req.user.id,
      'Comment Deleted',
      `Deleted a comment from task "${task.title}"`
    );

    res.status(200).json({
      success: true,
      message: 'Comment successfully deleted',
    });
  } catch (error) {
    next(error);
  }
};
