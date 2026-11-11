const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, deleteUser, deletePost, getAllPosts } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/stats', protect, admin, getStats);
router.get('/users', protect, admin, getAllUsers);
router.get('/posts', protect, admin, getAllPosts);
router.delete('/users/:id', protect, admin, deleteUser);
router.delete('/posts/:id', protect, admin, deletePost);

module.exports = router;
