import { Menu, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../../api'; 

const Header = ({ activeTab, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    photo: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUnreadCount();
    fetchUserData();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications');
      const unread = response.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await api.get('/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const userData = response.data.data || response.data;
      setUser({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        photo: userData.photo || null
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFullName = () => {
    return `${user.firstName} ${user.lastName}`.trim() || 'Admin User';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="ml-2 lg:ml-0 text-xl font-semibold text-gray-900 capitalize">
            {activeTab}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => navigate('/admin-notifications')} 
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-1"
          >
            {!isLoading && (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {user.photo ? (
                  <img 
                    src={user.photo} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
                {/* Fallback icon if image fails to load */}
                {user.photo && (
                  <User className="w-4 h-4 text-white" style={{ display: 'none' }} />
                )}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {!isLoading ? getFullName() : 'Loading...'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;