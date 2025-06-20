import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './Auth/loginScreen';
import SplashScreen from './Auth/splashScreen'
import SignUp from './Auth/SignUp';
import UserHomeScreen from './User/pages/homeScreen';
import FavoriteRoomsScreen from './User/pages/favoriteRoom';
import UserLayout from './User/component/userLayout';
import BookingScreen from './User/pages/bookingRoom';
import NotificationsScreen from './User/pages/notificationRoom';
import ProfileScreen from './User/pages/profile';


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
        <Route path="/user-home" element={
          isLoggedIn ?
            <UserLayout><UserHomeScreen /></UserLayout> :
            <Navigate to="/login" />
        } />
        <Route path="/user-favorite" element={
          isLoggedIn ?
            <UserLayout><FavoriteRoomsScreen /></UserLayout> :
            <Navigate to="/login" />
        } />
        <Route path="/user-bookings" element={
          isLoggedIn ?
            <UserLayout><BookingScreen /></UserLayout> :
            <Navigate to="/login" />
        } />
         <Route path="/user-notifications" element={
          isLoggedIn ?
            <UserLayout><NotificationsScreen/></UserLayout> :
            <Navigate to="/login" />
        } />
           <Route path="/user-profile" element={
          isLoggedIn ?
            <UserLayout><ProfileScreen/></UserLayout> :
            <Navigate to="/login" />
        } />



        {/* Redirect all other paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;