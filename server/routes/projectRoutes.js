const express = require('express');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  assignMembers,
} = require('../controllers/projectController');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// All project routes require auth
router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(authorizeRoles('Admin', 'Manager'), createProject);

router
  .route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.post('/:id/members', assignMembers);

module.exports = router;
