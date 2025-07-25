import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Heart, Calendar, Bell, User } from 'lucide-react';

const UserNavbar = ({ activeTab, unreadCount }) => {
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/user-home' },
    { icon: Heart, label: 'Favorite', path: '/user-favorite' },
    { icon: Calendar, label: 'Bookings', path: '/user-bookings' },
    { icon: Bell, label: 'Notifications', path: '/user-notifications' },
    { icon: User, label: 'Profile', path: '/user-profile' },
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2 sticky bottom-0 w-full z-50">
      <div className="flex justify-around items-center max-w-5xl mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex flex-col items-center space-y-1 py-2 relative"
          >
            <Icon className={`w-5 h-5 ${activeTab === label ? 'text-black' : 'text-gray-400'}`} />
            
            {/* 🔔 Show unread count only on Notifications tab */}
            {label === 'Notifications' && unreadCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}

            <span className={`text-xs ${activeTab === label ? 'text-black' : 'text-gray-400'}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserNavbar;
