const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getUsers, getUserById, updateUserProfile, uploadProfilePic, uploadResume, connectUser, disconnectUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB safe limit
});

router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateUserProfile);
router.post('/profile-pic', protect, upload.single('image'), uploadProfilePic);
router.post('/resume', protect, upload.single('resume'), uploadResume);

router.post('/connect/:id', protect, connectUser);
router.post('/disconnect/:id', protect, disconnectUser);

module.exports = router;
