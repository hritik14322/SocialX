const mongoose = require('mongoose');

// Embedded comment schema
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Collection 2: Posts (embedded likes and embedded comments)
const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    // Embedded Likes array storing references to users who liked the post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Embedded Comments array subdocuments
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

// Validation: At least content or image must be provided
postSchema.pre('validate', function () {
  if (!this.content && !this.image) {
    this.invalidate('content', 'Post must contain either text content or an image');
  }
});

module.exports = mongoose.model('Post', postSchema);
