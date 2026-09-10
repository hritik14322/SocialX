import React from "react";
import { Home, CheckSquare, Globe, Award, MessageCircle } from "lucide-react";
import "./BottomNav.css";

export const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <button className="nav-item">
        <Home size={20} />
        <span>Home</span>
      </button>
    </nav>
  );
};
