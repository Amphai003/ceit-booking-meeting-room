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
import MeetingRoomDashboard from './Admin/pages/admiDashboard';
import { AuthProvider, useAuth } from '../src/Auth/authContext';
import UserManagement from './Admin/pages/userManagement';
import RoomManagement from './Admin/pages/roomManagement';
import MakeBookingScreen from './User/pages/makeBooking';
import AdminBookingsApp from './Admin/pages/adminBooking';



function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

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
        {/* ADMIN */}
       
        <Route path="/admin-dashboard" element={
          isLoggedIn ? <MeetingRoomDashboard /> : <Navigate to="/login" />
        } />
         <Route path="/users" element={<UserManagement />} />
         <Route path="/rooms" element={<RoomManagement />} />
         <Route path="/bookings" element={<AdminBookingsApp />} />
        <Route path="/rooms/:id" element={<RoomManagement />} />
        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* USER */}
       <Route path="/user-home" element={
          isLoggedIn ? <UserLayout><UserHomeScreen /></UserLayout> : <Navigate to="/login" />
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
<Route path="/booking" element={<MakeBookingScreen />} />


       {/* ADMIN */}
        <Route path="/admin-dashboard" element={isLoggedIn ? <div>Admin Dashboard</div> : <Navigate to="/login" />} />

        {/* Redirect all other paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;