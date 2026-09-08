import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from './CommentSection';
import './PostCard.css';

export const PostCard = ({ post, onLike, onDelete, onAddComment, onDeleteComment, onOpenLikers, showToast }) => {
  const { user, isAuthenticated } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const computeIsLiked = (likes) => {
    if (!user || !likes) return false;
    return likes.some((l) =>
      typeof l === 'string'
        ? l === user.id || l === user._id || l === user.username
        : l._id === user.id || l._id === user._id || l.username === user.username
    );
  };

  const [isLiked, setIsLiked] = useState(() => computeIsLiked(post.likes));
  const [likesCount, setLikesCount] = useState(post.likes ? post.likes.length : 0);

  // Sync like state whenever the post prop updates (e.g. feed refresh)
  useEffect(() => {
    setIsLiked(computeIsLiked(post.likes));
    setLikesCount(post.likes ? post.likes.length : 0);
  }, [post.likes, user]);
  const [heartAnim, setHeartAnim] = useState(false);

  // Author details
  const author = post.author || {};
  const authorName = author.username || post.username || 'socialX User';
  const isOwner = user && (user.id === author._id || user._id === author._id || user.username === authorName);

  // Format Image URL helper
  const getImageSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const backendHost = apiBase.replace(/\/api\/?$/, '');
    return `${backendHost}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Relative timestamp calculation
  const formatTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Instant optimistic like handler
  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to like posts', 'error');
      return;
    }

    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);

    try {
      await onLike(post._id);
    } catch (err) {
      // Revert state on failure
      setIsLiked(!nextState);
      setLikesCount((prev) => (nextState ? Math.max(0, prev - 1) : prev + 1));
      showToast(err.message || 'Failed to update like status', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Post link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-card-header">
        <div className="author-info">
          <div className="author-avatar">
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div className="author-meta">
            <div className="author-name-row">
              <span className="author-display-name">{authorName}</span>
            </div>
            <div className="author-sub-row">
              <span className="author-handle">@{authorName.toLowerCase().replace(/\s+/g, '')}</span>
              <span className="dot-separator">•</span>
              <span className="post-timestamp">{formatTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="header-right-actions">
          <button className="follow-btn">Follow</button>
          
          {/* Options Dropdown */}
          <div className="options-wrapper">
            <button className="options-btn" onClick={() => setShowMenu(!showMenu)}>
              <MoreHorizontal size={18} />
            </button>

            {showMenu && (
              <div className="options-dropdown animate-fade-in">
                {isOwner ? (
                  <button
                    className="dropdown-item danger-item"
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(post._id);
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete Post</span>
                  </button>
                ) : (
                  <button className="dropdown-item" onClick={() => setShowMenu(false)}>
                    <span>Report Post</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Text Content */}
      {post.content && (
        <div className="post-body">
          <p>{post.content}</p>
        </div>
      )}

      {/* Post Image Attachment */}
      {post.image && (
        <div className="post-media-container">
          <img src={getImageSrc(post.image)} alt="Post Attachment" loading="lazy" />
        </div>
      )}

      {/* Post Actions Bar */}
      <div className="post-actions-bar">
        {/* Like Button & Count */}
        <div className="action-group">
          <button
            className={`action-btn like-btn ${isLiked ? 'liked' : ''} ${heartAnim ? 'heart-bounce' : ''}`}
            onClick={handleLikeClick}
          >
            <Heart size={18} fill={isLiked ? 'var(--like-red)' : 'none'} />
          </button>
          <button
            className="action-count-link"
            onClick={() => onOpenLikers(post.likes || [])}
            title="View who liked this post"
          >
            {likesCount}
          </button>
        </div>

        {/* Comment Button & Count */}
        <div className="action-group">
          <button
            className={`action-btn comment-btn ${showComments ? 'active' : ''}`}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare size={18} />
          </button>
          <span className="action-count">{post.comments ? post.comments.length : 0}</span>
        </div>

        {/* Share Button & Count */}
        <div className="action-group">
          <button className="action-btn share-btn" onClick={handleShare} title="Share post">
            <Share2 size={18} />
          </button>
          <span className="action-count">0</span>
        </div>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <CommentSection
          postId={post._id}
          comments={post.comments || []}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          showToast={showToast}
        />
      )}
    </div>
  );
};
