import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Left: Brand logo */}
        <Link to="/" className="navbar-brand">
          <span className="brand-text">socialX</span>
        </Link>

        {/* Right: Actions */}
        <div className="navbar-right">
          {/* Theme Toggle Button */}
          <button
            className="icon-btn theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Profile Avatar */}
              <div className="avatar-wrapper" title={`Logged in as ${user?.username}`}>
                <div className="avatar-circle">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>

              {/* Logout Button */}
              <button className="icon-btn logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-btn btn-ghost">
                <LogIn size={16} /> Log In
              </Link>
              <Link to="/signup" className="nav-btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
