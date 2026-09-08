const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  likePost,
  addComment,
  getComments,
  deleteComment,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Post endpoints
router.route('/')
  .post(protect, upload.single('image'), createPost)
  .get(getPosts);

router.route('/:id')
  .get(getPostById)
  .delete(protect, deletePost);

// Like endpoint (toggles like/unlike)
router.post('/:id/like', protect, likePost);

// Comment endpoints
router.route('/:id/comments')
  .post(protect, addComment)
  .get(getComments);

router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
