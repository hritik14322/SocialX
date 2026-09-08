import React from 'react';
import { Search } from 'lucide-react';
import './PostFilterBar.css';

export const PostFilterBar = ({ activeFilter, setFilter, searchQuery, setSearchQuery }) => {
  const filters = [
    { id: 'all', label: 'All Post' },
    { id: 'foryou', label: 'For You' },
    { id: 'liked', label: 'Most Liked' },
    { id: 'commented', label: 'Most Commented' },
  ];

  return (
    <div className="filter-bar-container">
      {/* Search Input Box */}
      <div className="search-box">
        <Search className="search-icon" size={16} />
        <input
          type="text"
          placeholder="Search promotions, users, posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {filters.map((f) => (
          <button
            key={f.id}
            className={`filter-chip ${activeFilter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
};
