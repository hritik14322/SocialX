const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    let imagePath = '';

    // Handle Multer uploaded file or direct image URL
    if (req.file) {
      // Relative URL for uploaded image
      imagePath = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      imagePath = imageUrl;
    }

    if (!content && !imagePath) {
      return res.status(400).json({ message: 'A post must contain text or an image' });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content ? content.trim() : '',
      image: imagePath,
      likes: [],
      comments: [],
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username badge avatar')
      .populate('likes', 'username');

    return res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost,
    });
  } catch (error) {
    console.error('Create Post Error:', error);
    return res.status(500).json({ message: error.message || 'Server error creating post' });
  }
};

// @desc    Get all posts (with pagination & filters)
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || 'all';

    let sortOption = { createdAt: -1 }; // Reverse chronological order (newest first)

    if (filter === 'liked') {
      // Sort by like count descending (most liked first)
      sortOption = { likes: -1, createdAt: -1 };
    } else if (filter === 'commented') {
      // Sort by comment count descending
      sortOption = { comments: -1, createdAt: -1 };
    }

    const posts = await Post.find()
      .populate('author', 'username badge avatar')
      .populate('likes', 'username')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    return res.status(200).json({
      posts,
      page,
      pages: Math.ceil(totalPosts / limit),
      totalPosts,
    });
  } catch (error) {
    console.error('Get Posts Error:', error);
    return res.status(500).json({ message: error.message || 'Server error fetching posts' });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username badge avatar')
      .populate('likes', 'username');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({ post });
  } catch (error) {
    return res.status(500).json({ message: 'Invalid post ID or post not found' });
  }
};

// @desc    Delete post by ID
// @route   DELETE /api/posts/:id
// @access  Private (Author only)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Verify ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Post deleted successfully', postId: req.params.id });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error deleting post' });
  }
};

// @desc    Like / Unlike post (Toggle atomic operation)
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const hasLiked = post.likes.some((id) => id.toString() === userId.toString());

    if (hasLiked) {
      // Unlike post (pull user ID from likes array)
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Like post (push user ID into likes array)
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'username badge avatar')
      .populate('likes', 'username');

    return res.status(200).json({
      message: hasLiked ? 'Post unliked' : 'Post liked',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Like Post Error:', error);
    return res.status(500).json({ message: error.message || 'Server error toggling like' });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      username: req.user.username,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.unshift(newComment); // New comments on top
    await post.save();

    return res.status(201).json({
      message: 'Comment added successfully',
      comments: post.comments,
      comment: post.comments[0],
    });
  } catch (error) {
    console.error('Add Comment Error:', error);
    return res.status(500).json({ message: error.message || 'Server error adding comment' });
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('comments');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({ comments: post.comments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment from post
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private (Comment Author or Post Author)
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Verify ownership (comment creator or post creator)
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    return res.status(200).json({
      message: 'Comment deleted successfully',
      comments: post.comments,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error deleting comment' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  likePost,
  addComment,
  getComments,
  deleteComment,
};
