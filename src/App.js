import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home';
import About from './components/About';
import PlantDiseaseDetector from './components/PlantDiseaseDetector';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import History from './components/History';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Check for existing user on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleAuthModeChange = (mode) => {
    setAuthMode(mode);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'about':
        return <About />;
      case 'detect':
        return <PlantDiseaseDetector />;
      case 'history':
        return <History user={user} />;
      case 'login':
        return (
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={() => handleAuthModeChange('register')}
          />
        );
      case 'register':
        return (
          <Register 
            onRegister={handleRegister}
            onSwitchToLogin={() => handleAuthModeChange('login')}
          />
        );
      case 'profile':
        return (
          <Profile 
            user={user}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      default:
        return <Home />;
    }
  };

  return (
    <div className="App">
      <Navigation 
        currentPage={currentPage}
        onPageChange={handlePageChange}
        user={user}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;