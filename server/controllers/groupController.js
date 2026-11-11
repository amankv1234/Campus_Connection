const Group = require('../models/Group');
const User = require('../models/User');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { name, description, avatar } = req.body;

    const newGroup = await Group.create({
      name,
      description,
      avatar: avatar || 'https://cdn-icons-png.flaticon.com/512/33/33308.png',
      creator: req.user.id,
      members: [req.user.id],
      admins: [req.user.id]
    });

    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('members', 'name profilePic');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a group
// @route   PUT /api/groups/:id/join
// @ access Private
const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    group.members.push(req.user.id);
    await group.save();

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave a group
// @route   PUT /api/groups/:id/leave
// @ access Private
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.members = group.members.filter(member => member.toString() !== req.user.id);
    
    // If the creator leaves or it's empty, we might handle assigning a new admin or deleting, 
    // but simply removing them here for now.
    await group.save();

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  joinGroup,
  leaveGroup
};
