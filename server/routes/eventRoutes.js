const express = require('express');
const router = express.Router();
const { createEvent, getEvents, registerForEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

router.route('/')
  .post(protect, createEvent)
  .get(protect, cacheMiddleware('events', 300), getEvents);

router.post('/:id/register', protect, registerForEvent);

module.exports = router;
