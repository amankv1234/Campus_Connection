const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { getTopLeaders } = require('../services/leaderboardService');

// @desc    Get top users for leaderboard (Redis ZSET powered)
// @route   GET /api/users/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const leaders = await getTopLeaders(limit);
    res.status(200).json(leaders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Discovery)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { search, skill, branch, year } = req.query;
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (skill) {
      query.skills = { $regex: skill, $options: 'i' };
    }
    if (branch) {
      query.branch = branch;
    }
    if (year) {
      query.year = year;
    }

    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      // Increment views if someone else is viewing
      if (req.user.id !== req.params.id) {
        user.views += 1;
        await user.save();
      }
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.branch = req.body.branch || user.branch;
      user.year = req.body.year || user.year;
      user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;
      user.interests = req.body.interests !== undefined ? req.body.interests : user.interests;
      user.profilePic = req.body.profilePic || user.profilePic;
      user.githubLink = req.body.githubLink !== undefined ? req.body.githubLink : user.githubLink;
      user.linkedinLink = req.body.linkedinLink !== undefined ? req.body.linkedinLink : user.linkedinLink;
      user.resumeUrl = req.body.resumeUrl !== undefined ? req.body.resumeUrl : user.resumeUrl;
      
      if (req.body.projects) {
        user.projects = req.body.projects;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        branch: updatedUser.branch,
        year: updatedUser.year,
        skills: updatedUser.skills,
        interests: updatedUser.interests,
        profilePic: updatedUser.profilePic,
        githubLink: updatedUser.githubLink,
        linkedinLink: updatedUser.linkedinLink,
        resumeUrl: updatedUser.resumeUrl,
        projects: updatedUser.projects,
        isAdmin: updatedUser.isAdmin,
        points: updatedUser.points,
        connections: updatedUser.connections,
        views: updatedUser.views
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile-pic
// @access  Private
const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    user.profilePic = `data:${req.file.mimetype};base64,${b64}`;
    await user.save();
    
    res.status(200).json({
      profilePic: user.profilePic
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload resume
// @route   POST /api/users/resume
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    user.resumeUrl = `data:${req.file.mimetype};base64,${b64}`;
    await user.save();
    
    res.status(200).json({
      resumeUrl: user.resumeUrl
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Connect with a user
// @route   POST /api/users/connect/:id
// @access  Private
const connectUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (!currentUser.connections.includes(targetUserId)) {
      currentUser.connections.push(targetUserId);
      targetUser.connections.push(currentUserId);
      await currentUser.save();
      await targetUser.save();

      // Notify target user
      await createNotification(
        targetUserId,
        currentUserId,
        'connection', 
        `${currentUser.name} connected with you`,
        `/discovery`
      );
    }

    res.status(200).json(currentUser.connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Disconnect from a user
// @route   POST /api/users/disconnect/:id
// @access  Private
const disconnectUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    currentUser.connections = currentUser.connections.filter(id => id.toString() !== targetUserId);
    targetUser.connections = targetUser.connections.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json(currentUser.connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserProfile,
  uploadProfilePic,
  uploadResume,
  connectUser,
  disconnectUser,
  getLeaderboard
};
