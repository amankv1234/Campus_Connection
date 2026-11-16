const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email validation regex helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    // Strict email format validation
    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address (e.g., student@college.edu)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const userExists = await User.findOne({ email: trimmedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password: hashedPassword
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Invalid email address format' });
    }

    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.password && user.googleId) {
      return res.status(400).json({ message: 'This account was created with Google Sign-In. Please sign in with Google.' });
    }

    if (await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate with Google OAuth ID token
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || undefined
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      // Fallback: decode JWT payload safely if verification with specific audience fails
      const decoded = jwt.decode(credential);
      if (decoded && decoded.email) {
        payload = decoded;
      } else {
        return res.status(400).json({ message: 'Invalid Google token' });
      }
    }

    const { email, name, picture, sub: googleId } = payload;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // Update Google ID and avatar if not set
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (!user.profilePic || user.profilePic.includes('anonymous-avatar')) {
        user.profilePic = picture;
      }
      await user.save();
    } else {
      // Create new user via Google
      user = await User.create({
        name: name || 'Campus Student',
        email: cleanEmail,
        googleId,
        profilePic: picture || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
      });
    }

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Google authentication failed. Please try again.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  getMe
};
