import { useNavigate } from 'react-router-dom';
import { Home, Video, Calendar, Users, Settings, X, Megaphone, Tv2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Initialize translation hook

  const sidebarItems = [
    { id: 'dashboard', icon: Home, label: t('sidebar.dashboard'), path: '/dashboard' },
    { id: 'equipment', icon: Tv2Icon, label: t('sidebar.equipment'), path: '/equipment' },
    { id: 'rooms', icon: Video, label: t('sidebar.rooms'), path: '/rooms' },
    { id: 'bookings', icon: Calendar, label: t('sidebar.bookings'), path: '/bookings' },
    { id: 'users', icon: Users, label: t('sidebar.users'), path: '/users' },
    { id: 'advertises', icon: Megaphone, label: t('sidebar.advertises'), path: '/advertises' },
    { id: 'settings', icon: Settings, label: t('sidebar.settings'), path: '/settings' },
  ];

  return (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <h1 className={`text-xl font-bold text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('sidebar.roomAdmin')}</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    } ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
