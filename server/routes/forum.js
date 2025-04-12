const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost');
const { auth } = require('../middleware/auth');

// Get all forum posts
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, sort = '-createdAt' } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;

    const posts = await ForumPost.find(filter)
      .populate('author', 'firstName lastName role')
      .sort(sort)
      .lean()
      .exec();

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new forum post
router.post('/', auth, async (req, res) => {
  try {
    const post = new ForumPost({
      ...req.body,
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'firstName lastName role');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get forum post by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'firstName lastName role')
      .populate('comments.author', 'firstName lastName role')
      .populate('likes', 'firstName lastName');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update forum post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await ForumPost.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    Object.assign(post, req.body);
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment to post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      content: req.body.content,
      author: req.user._id
    });

    await post.save();
    await post.populate('comments.author', 'firstName lastName role');

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/Unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete comment
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update post status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const post = await ForumPost.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.status = req.body.status;
    await post.save();

    res.json({ message: 'Post status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;