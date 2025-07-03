import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api';
import UserNavbar from './userNavbar';

const UserLayout = ({ children }) => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadNotificationsCount = async () => {
    try {
      const response = await api.get('/notifications');
      const notifications = response.data || []; 
      const count = notifications.filter(n => !n.isRead).length; 
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread notifications:", error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadNotificationsCount();
    const interval = setInterval(fetchUnreadNotificationsCount, 60000);
    return () => clearInterval(interval);
  }, []);

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
      <UserNavbar activeTab={getActiveTab()} unreadCount={unreadCount} />
      
    </div>
    
  );
};

export default UserLayout;
