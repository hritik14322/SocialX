import React from 'react';
import './SkeletonLoader.css';

export const SkeletonLoader = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-text-group">
          <div className="skeleton-line short"></div>
          <div className="skeleton-line xshort"></div>
        </div>
      </div>
      <div className="skeleton-body">
        <div className="skeleton-line full"></div>
        <div className="skeleton-line medium"></div>
      </div>
      <div className="skeleton-media"></div>
    </div>
  );
};
