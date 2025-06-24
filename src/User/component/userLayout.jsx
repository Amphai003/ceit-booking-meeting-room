
import React from 'react';

import { useLocation } from 'react-router-dom';
import UserNavbar from './userNavbar';

const UserLayout = ({ children }) => {
  const location = useLocation();
  
  const getActiveTab = () => {
    switch (location.pathname) {
      case '/user-home': return 'Home';
      case '/user-favorite': return 'Favorite';
      case '/user-bookings': return 'Bookings';
      case '/user-notifications': return 'Notifications';
      case '/user-profile': return 'Profile';
      default: return 'Home';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <UserNavbar activeTab={getActiveTab()} />
    </div>
  );
};

export default UserLayout;