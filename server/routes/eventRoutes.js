const express = require('express');
const router = express.Router();
const { createEvent, getEvents, registerForEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createEvent)
  .get(protect, getEvents);

router.post('/:id/register', protect, registerForEvent);

module.exports = router;
