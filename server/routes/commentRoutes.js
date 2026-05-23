const express = require('express');
const { addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', addComment);
router.delete('/:id', deleteComment);

module.exports = router;
