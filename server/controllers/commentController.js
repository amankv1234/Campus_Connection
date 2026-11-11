const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Add a comment to a post
// @route   POST /api/comments/:postId
// @access  Private
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = await Comment.create({
      post: req.params.postId,
      user: req.user.id,
      text: req.body.text
    });

    // Reward points for commenting
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 2 } });

    // Notify post owner
    if (post.user.toString() !== req.user.id) {
      await createNotification(
        post.user,
        req.user.id,
        'comment',
        `${req.user.name} commented on your post`,
        `/`
      );
    }

    const populatedComment = await newComment.populate('user', 'name profilePic');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments by post
// @route   GET /api/comments/:postId
// @access  Private
const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'name profilePic')
      .sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await comment.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  getCommentsByPost,
  deleteComment
};
