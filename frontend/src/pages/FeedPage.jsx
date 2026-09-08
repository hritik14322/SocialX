import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { CreatePostCard } from '../components/CreatePostCard';
import { PostFilterBar } from '../components/PostFilterBar';
import { PostCard } from '../components/PostCard';
import { LikersModal } from '../components/LikersModal';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Toast } from '../components/Toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Sparkles } from 'lucide-react';
import './FeedPage.css';

export const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Modal State
  const [likersModalOpen, setLikersModalOpen] = useState(false);
  const [selectedLikers, setSelectedLikers] = useState([]);

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => setToast({ message, type });

  // Fetch Posts Function
  const fetchPosts = useCallback(async (pageNum = 1, filter = activeFilter, append = false) => {
    try {
      if (!append) setLoading(true);
      const res = await api.get(`/posts?page=${pageNum}&limit=10&filter=${filter}`);
      
      const fetchedPosts = res.data.posts || res.data || [];
      if (append) {
        setPosts((prev) => [...prev, ...fetchedPosts]);
      } else {
        setPosts(fetchedPosts);
      }

      setHasMore(fetchedPosts.length === 10);
    } catch (err) {
      showToast(err.message || 'Error fetching feed', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, activeFilter, false);
  // Re-fetch when the active user changes (login / logout / switch account)
  }, [activeFilter, fetchPosts, user]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPosts(1, activeFilter, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, activeFilter, true);
  };

  // Handler: Create Post
  const handleCreatePost = async (formData) => {
    const res = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const newPost = res.data.post || res.data;
    setPosts((prev) => [newPost, ...prev]);
  };

  // Handler: Optimistic Like Toggle
  const handleLike = async (postId) => {
    const res = await api.post(`/posts/${postId}/like`);
    const updatedPost = res.data.post || res.data;
    
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, likes: updatedPost.likes } : p))
    );
  };

  // Handler: Add Comment
  const handleAddComment = async (postId, text) => {
    const res = await api.post(`/posts/${postId}/comments`, { text });
    const updatedComments = res.data.comments || res.data.post?.comments;

    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          return {
            ...p,
            comments: updatedComments || [...(p.comments || []), res.data.comment || { text, createdAt: new Date().toISOString() }],
          };
        }
        return p;
      })
    );
    showToast('Comment added!', 'success');
  };

  // Handler: Delete Comment
  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await api.delete(`/posts/${postId}/comments/${commentId}`);
      const updatedComments = res.data.comments || res.data.post?.comments;

      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            return {
              ...p,
              comments: updatedComments || p.comments.filter((c) => c._id !== commentId),
            };
          }
          return p;
        })
      );
      showToast('Comment deleted', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete comment', 'error');
    }
  };

  // Handler: Delete Post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      showToast('Post deleted', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete post', 'error');
    }
  };

  // Handler: Open Likers Modal
  const handleOpenLikers = (likers) => {
    setSelectedLikers(likers);
    setLikersModalOpen(true);
  };

  // Filter & Search client filtering
  const filteredPosts = posts.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const contentMatch = p.content && p.content.toLowerCase().includes(query);
    const authorMatch = (p.author?.username || p.username || '').toLowerCase().includes(query);
    return contentMatch || authorMatch;
  });

  return (
    <div className="feed-layout">
      {/* Top Sticky Header */}
      <Navbar />

      {/* Main Centered Content Container */}
      <main className="feed-container">
        {/* Create Post Section */}
        <CreatePostCard onPostCreated={handleCreatePost} showToast={showToast} />

        {/* Filter and Search Bar */}
        <PostFilterBar
          activeFilter={activeFilter}
          setFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Refresh Feed Action Header */}
        <div className="feed-header-row">
          <div className="feed-status-title">
            <Sparkles size={16} className="text-gold" />
            <span>Community Feed</span>
          </div>
          <button className={`refresh-btn ${refreshing ? 'spinning' : ''}`} onClick={handleRefresh} title="Refresh Feed">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Feed Posts List */}
        {loading ? (
          <>
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
          </>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-feed-card">
            <div className="empty-icon-circle">
              <Sparkles size={32} color="#0066FF" />
            </div>
            <h3>No Posts Found</h3>
            <p>Be the first to create a post or try changing your search query!</p>
          </div>
        ) : (
          <div className="posts-list">
            {filteredPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onDelete={handleDeletePost}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onOpenLikers={handleOpenLikers}
                showToast={showToast}
              />
            ))}

            {/* Pagination / Load More Button */}
            {hasMore && (
              <div className="load-more-wrapper">
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Load More Posts
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav />

      {/* Likers Modal Popup */}
      <LikersModal
        isOpen={likersModalOpen}
        onClose={() => setLikersModalOpen(false)}
        likers={selectedLikers}
      />

      {/* Toast Banner Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
