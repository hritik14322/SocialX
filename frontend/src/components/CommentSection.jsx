import React, { useState } from 'react';
import { Send, Trash2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './CommentSection.css';

export const CommentSection = ({ postId, comments = [], onAddComment, onDeleteComment, showToast }) => {
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to leave a comment', 'error');
      return;
    }
    if (!commentText.trim()) {
      showToast('Comment text cannot be empty', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddComment(postId, commentText.trim());
      setCommentText('');
    } catch (err) {
      showToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="comments-drawer animate-fade-in">
      {/* Comment Input Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="comment-input-form">
          <div className="comment-avatar">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" className="send-comment-btn" disabled={isSubmitting || !commentText.trim()}>
            <Send size={15} />
          </button>
        </form>
      ) : (
        <div className="login-comment-hint">
          <span>Log in to join the conversation</span>
        </div>
      )}

      {/* List of Comments */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to start the conversation!</p>
        ) : (
          comments.map((comment) => {
            const authorName = comment.username || comment.user?.username || 'User';
            const isOwner = user && (user.id === comment.user || user._id === comment.user || user.username === authorName);

            return (
              <div key={comment._id || Math.random()} className="comment-item">
                <div className="comment-item-avatar">
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <div className="comment-bubble">
                  <div className="comment-bubble-header">
                    <span className="comment-author">@{authorName}</span>
                    <span className="comment-time">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
                {isOwner && onDeleteComment && (
                  <button
                    className="delete-comment-btn"
                    title="Delete Comment"
                    onClick={() => onDeleteComment(postId, comment._id)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
