const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createOpportunity, getOpportunities, bookmarkOpportunity } = require('../controllers/opportunityController');
const { protect } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB safe limit
});

router.route('/')
  .post(protect, upload.single('image'), createOpportunity)
  .get(protect, cacheMiddleware('opportunities', 300), getOpportunities);

router.put('/:id/bookmark', protect, bookmarkOpportunity);

module.exports = router;
