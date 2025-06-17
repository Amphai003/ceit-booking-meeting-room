import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CEITLogo from '../assets/ceit-logo.png'; // Adjust path to your logo
import Login from './loginScreen';

const SplashScreen = ({ onSkip }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-900 to-indigo-800 cursor-pointer"
      onClick={onSkip}
    >
      <div className="text-center animate-fade-in">
        <img 
          src={CEITLogo} 
          alt="CEIT Logo" 
          className="w-48 h-auto mx-auto mb-6 object-contain" 
        />
        <h1 className="text-2xl font-medium text-white mb-8">CEIT Room Booking System</h1>
        <div className="w-10 h-10 mx-auto border-4 border-opacity-20 border-white rounded-full animate-spin" 
             style={{ borderTopColor: 'white' }} />
      </div>
    </div>
  );
};

SplashScreen.propTypes = {
  onSkip: PropTypes.func.isRequired,
};

const AppEntry = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const navigate = useNavigate();

  const handleSkip = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 seconds splash screen

    return () => clearTimeout(timer);
  }, []);

  // Check authentication status from localStorage when splash is done
  useEffect(() => {
    if (!showSplash) {
      checkInitialAuthState();
    }
  }, [showSplash]);

  const checkInitialAuthState = () => {
    setIsCheckingAuth(true);
    
    // Check if we have an auth token in localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // If token exists, set as authenticated (actual role will be checked later)
      setIsAuthenticated(true);
      
      // For demo purposes, set a default role (you might have this in localStorage too)
      const role = localStorage.getItem('userRole') || 'user';
      setUserRole(role);
    } else {
      setIsAuthenticated(false);
    }
    
    setIsCheckingAuth(false);
  };

  // Handle navigation based on auth state
  useEffect(() => {
    if (isCheckingAuth) return;
    
    if (!isAuthenticated && !showSplash) {
      navigate('/login');
    } else if (isAuthenticated && userRole) {
      if (userRole === "admin" || userRole === "super-admin") {
        navigate("/admin/home");
      } else {
        navigate("/user/home");
      }
    }
  }, [isAuthenticated, userRole, navigate, showSplash, isCheckingAuth]);

  if (showSplash) {
    return <SplashScreen onSkip={handleSkip} />;
  }

  if (!isAuthenticated) {
    return <Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />;
  }

  // Show loading spinner while checking auth state
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return null;
};

export default AppEntry;