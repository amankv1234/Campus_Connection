const express = require('express');
const router = express.Router();
const { createGroup, getGroups, joinGroup, leaveGroup } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createGroup)
  .get(protect, getGroups);

router.put('/:id/join', protect, joinGroup);
router.put('/:id/leave', protect, leaveGroup);

module.exports = router;
