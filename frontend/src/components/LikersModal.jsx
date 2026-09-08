import React from 'react';
import { X, Heart, User } from 'lucide-react';
import './LikersModal.css';

export const LikersModal = ({ isOpen, onClose, likers = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Heart size={18} className="heart-icon-filled" />
            <h3>Liked by</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {likers.length === 0 ? (
            <p className="no-likers">No likes yet. Be the first to like this post!</p>
          ) : (
            <ul className="likers-list">
              {likers.map((user, idx) => {
                const username = typeof user === 'string' ? user : user.username || 'Anonymous User';
                return (
                  <li key={idx} className="liker-item">
                    <div className="liker-avatar">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="liker-info">
                      <span className="liker-name">@{username}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
