const User = require('../models/User');

// @desc    Get all users (for assignment lists)
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'name email role avatar').sort('name');
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
