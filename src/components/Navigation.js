import React, { useState, useEffect } from 'react';
import { Home, Leaf, Info, User, LogOut, Menu, X } from 'lucide-react';
import './Navigation.css';
import { Clock } from 'lucide-react';

const Navigation = ({ currentPage, onPageChange, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'detect', label: 'Plant Detection', icon: Leaf },
    { id: 'about', label: 'About', icon: Info },
    ...(user ? [{ id: 'history', label: 'History', icon: Clock }] : []),
  ];

  const handleNavClick = (pageId) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <Leaf className="logo-icon" />
          <span className="logo-text">PlantCare AI</span>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-menu desktop-menu">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Section */}
        <div className="nav-user">
          {user ? (
            <div className="user-profile">
              <button
                className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
                onClick={() => handleNavClick('profile')}
              >
                <User size={20} />
                <span>{user.name}</span>
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="nav-item"
                onClick={() => handleNavClick('login')}
              >
                <User size={20} />
                <span>Login</span>
              </button>
              <button
                className="nav-item register-btn"
                onClick={() => handleNavClick('register')}
              >
                <span>Register</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          {user ? (
            <>
              <button
                className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
                onClick={() => handleNavClick('profile')}
              >
                <User size={20} />
                <span>Profile</span>
              </button>
              <button className="nav-item logout-btn" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-item"
                onClick={() => handleNavClick('login')}
              >
                <User size={20} />
                <span>Login</span>
              </button>
              <button
                className="nav-item register-btn"
                onClick={() => handleNavClick('register')}
              >
                <span>Register</span>
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
