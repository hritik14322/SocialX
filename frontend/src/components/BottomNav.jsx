import React from 'react';
import { Home, CheckSquare, Globe, Award, MessageCircle } from 'lucide-react';
import './BottomNav.css';

export const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <button className="nav-item">
        <Home size={20} />
        <span>Home</span>
      </button>
      <button className="nav-item">
        <CheckSquare size={20} />
        <span>Tasks</span>
      </button>
      <button className="nav-item active">
        <Globe size={20} />
        <span>Social</span>
      </button>
      <button className="nav-item">
        <Award size={20} />
        <span>Leader Board</span>
      </button>
      <button className="nav-item">
        <MessageCircle size={20} />
        <span>Chat</span>
      </button>
    </nav>
  );
};
