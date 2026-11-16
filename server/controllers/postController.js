const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { updateUserPoints } = require('../services/leaderboardService');

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    let imageUrl = '';
    
    // If an image file was provided, store directly in MongoDB as Base64 Data URI
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${b64}`;
    }

    const newPost = await Post.create({
      user: req.user.id,
      content: req.body.content,
      image: imageUrl || req.body.image || '',
      group: req.body.group || null
    });

    // Reward points in DB and Redis Sorted Set
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 5 } });
    await updateUserPoints(req.user.id, 5);

    const populatedPost = await newPost.populate('user', 'name profilePic');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const connectionIds = currentUser.connections || [];
    const validUserIds = [...connectionIds, req.user.id];

    // Basic feed: posts that don't belong to a group, and are from the user or connections
    const posts = await Post.find({ group: null, user: { $in: validUserIds } })
      .populate('user', 'name profilePic')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or un-like a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if post already liked by user
    if (post.likes.includes(req.user.id)) {
      // Unlike
      post.likes = post.likes.filter((userId) => userId.toString() !== req.user.id);
    } else {
      // Like
      post.likes.push(req.user.id);
      
      // Notify post owner if they aren't the one liking
      if (post.user.toString() !== req.user.id) {
        await createNotification(
          post.user,
          req.user.id,
          'like',
          `${req.user.name} liked your post`,
          `/`
        );
      }
    }

    await post.save();
    res.status(200).json(post.likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await post.deleteOne();
    // Also delete comments
    await Comment.deleteMany({ post: req.params.id });

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    post.content = req.body.content || post.content;
    const updatedPost = await post.save();
    
    const populatedPost = await updatedPost.populate('user', 'name profilePic');
    res.status(200).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group posts
// @route   GET /api/posts/group/:groupId
// @access  Private
const getGroupPosts = async (req, res) => {
  try {
    const posts = await Post.find({ group: req.params.groupId })
      .populate('user', 'name profilePic')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getGroupPosts,
  updatePost,
  likePost,
  deletePost
};
