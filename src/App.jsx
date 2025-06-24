import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './Auth/loginScreen';
import SplashScreen from './Auth/splashScreen'
import SignUp from './Auth/SignUp';
import UserHomeScreen from './User/pages/homeScreen';


function App() {
  const [showSplash, setShowSplash] = useState(true);
  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 seconds splash screen
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Splash Screen Route */}
        <Route 
          path="/" 
          element={showSplash ? <SplashScreen /> : <Navigate to="/login" replace />} 
        />

       {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* USER */}
       <Route path="/user-home" element={isLoggedIn ? <UserHomeScreen /> : <Navigate to="/login" />} />

       {/* ADMIN */}
        <Route path="/admin-dashboard" element={isLoggedIn ? <div>Admin Dashboard</div> : <Navigate to="/login" />} />

        {/* Redirect all other paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;