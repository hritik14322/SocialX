import React, { useState } from 'react';
import { Camera, Smile, Menu, Megaphone, Send, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './CreatePostCard.css';

export const CreatePostCard = ({ onPostCreated, showToast }) => {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear image attachment
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrlInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to create a post', 'error');
      return;
    }

    const finalImage = imagePreview || imageUrlInput;
    if (!content.trim() && !finalImage) {
      showToast('Please provide post text or attach an image', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build form payload
      const formData = new FormData();
      if (content.trim()) formData.append('content', content.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrlInput.trim()) {
        formData.append('imageUrl', imageUrlInput.trim());
      }

      await onPostCreated(formData);
      
      // Reset form on success
      setContent('');
      removeImage();
      setShowUrlInput(false);
      showToast('Post published successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to publish post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="create-post-card login-prompt-card">
        <p>Log in to share updates, images, and engage with the community!</p>
      </div>
    );
  }

  return (
    <div className="create-post-card">
      <div className="create-post-header">
        <h3 className="create-post-title">Create Post</h3>
        <div className="create-post-subtabs">
          <span className="subtab active">All Posts</span>
          <span className="subtab">Promotions</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
        </div>

        {/* Image URL Input Option Toggle */}
        {showUrlInput && !imagePreview && (
          <div className="url-input-box">
            <input
              type="url"
              placeholder="Paste Image URL..."
              value={imageUrlInput}
              onChange={(e) => {
                setImageUrlInput(e.target.value);
                setImagePreview(e.target.value);
              }}
            />
            <button type="button" onClick={() => setShowUrlInput(false)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Image Preview Box */}
        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Upload Preview" />
            <button type="button" className="remove-image-btn" onClick={removeImage}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="create-post-actions">
          <div className="media-tools">
            <label className="tool-btn" title="Upload Image">
              <Camera size={18} className="icon-camera" />
              <input type="file" accept="image/*" onChange={handleFileChange} hidden />
            </label>

            <button
              type="button"
              className="tool-btn"
              title="Add Image via URL"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              <ImageIcon size={18} className="icon-image" />
            </button>

            <button type="button" className="tool-btn" title="Emojis">
              <Smile size={18} className="icon-smile" />
            </button>

            <button type="button" className="tool-btn promote-btn">
              <Megaphone size={16} />
              <span>Promote</span>
            </button>
          </div>

          <button type="submit" className="submit-post-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="spinner"></span>
            ) : (
              <>
                <Send size={16} />
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
