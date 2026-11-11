const Opportunity = require('../models/Opportunity');

// @desc    Create an opportunity
// @route   POST /api/opportunities
// @access  Private
const createOpportunity = async (req, res) => {
  try {
    const { title, description, company, type, applyLink, deadline } = req.body;
    let imageUrl = '';

    // If an image file was provided, store directly in MongoDB as Base64 Data URI
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${b64}`;
    }

    const newOpp = await Opportunity.create({
      title,
      description,
      company,
      type,
      applyLink,
      deadline,
      image: imageUrl,
      postedBy: req.user.id
    });

    res.status(201).json(newOpp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Private
const getOpportunities = async (req, res) => {
  try {
    const type = req.query.type;
    let query = {};
    if (type) query.type = type;

    const opps = await Opportunity.find(query).sort({ createdAt: -1 });
    res.status(200).json(opps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bookmark/Unbookmark an opportunity
// @route   PUT /api/opportunities/:id/bookmark
// @access  Private
const bookmarkOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);

    if (!opp) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opp.bookmarks.includes(req.user.id)) {
      opp.bookmarks = opp.bookmarks.filter(userId => userId.toString() !== req.user.id);
    } else {
      opp.bookmarks.push(req.user.id);
    }

    await opp.save();
    res.status(200).json(opp.bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOpportunity,
  getOpportunities,
  bookmarkOpportunity
};
