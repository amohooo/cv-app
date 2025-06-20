import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { pages } = useContent();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">


        <div className="navbar-menu">
          {pages.map((page) => (
            <Link
              key={page.id}
              to={`/page/${page.slug}`}
              className="navbar-link"
            >
              {page.title}
            </Link>
          ))}
        </div>

        <div className="navbar-user">
          {user ? (
            <div className="user-menu">
              <span className="username">{user.username}</span>
              <Link to="/admin" className="admin-button">
                Admin Dashboard
              </Link>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="navbar-toggle-icon"></span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="navbar-mobile-menu">
          {pages.map((page) => (
            <Link
              key={page.id}
              to={`/page/${page.slug}`}
              className="navbar-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {page.title}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/admin"
                className="navbar-mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="navbar-mobile-link"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="navbar-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
