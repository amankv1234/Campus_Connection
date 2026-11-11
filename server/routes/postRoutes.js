const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createPost, getPosts, getGroupPosts, updatePost, likePost, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB safe limit for MongoDB storage
});

router.route('/')
  .post(protect, upload.single('image'), createPost)
  .get(protect, getPosts);

router.route('/:id')
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.put('/:id/like', protect, likePost);
router.get('/group/:groupId', protect, getGroupPosts);

module.exports = router;
