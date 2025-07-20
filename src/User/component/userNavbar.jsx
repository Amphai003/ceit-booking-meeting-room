import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Heart, Calendar, Bell, User } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const UserNavbar = ({ activeTab, unreadCount }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Initialize translation hook

  const navItems = [
    { icon: Home, label: 'Home', path: '/user-home', translationKey: 'userNavbar.home' },
    { icon: Heart, label: 'Favorite', path: '/user-favorite', translationKey: 'userNavbar.favorite' },
    { icon: Calendar, label: 'Bookings', path: '/user-bookings', translationKey: 'userNavbar.bookings' },
    { icon: Bell, label: 'Notifications', path: '/user-notifications', translationKey: 'userNavbar.notifications' },
    { icon: User, label: 'Profile', path: '/user-profile', translationKey: 'userNavbar.profile' },
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2 sticky bottom-0 w-full z-50">
      <div className="flex justify-around items-center max-w-5xl mx-auto">
        {navItems.map(({ icon: Icon, label, path, translationKey }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex flex-col items-center space-y-1 py-2 relative"
          >
            <Icon className={`w-5 h-5 ${activeTab === label ? 'text-black' : 'text-gray-400'}`} />
            
            {label === 'Notifications' && unreadCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}

            <span className={`text-xs ${activeTab === label ? 'text-black' : 'text-gray-400'} ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t(translationKey)} 
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserNavbar;