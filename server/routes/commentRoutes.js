const express = require('express');
const router = express.Router();
const { addComment, deleteComment, getCommentsByPost } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:postId')
  .post(protect, addComment)
  .get(protect, getCommentsByPost);

router.delete('/:id', protect, deleteComment);

module.exports = router;
