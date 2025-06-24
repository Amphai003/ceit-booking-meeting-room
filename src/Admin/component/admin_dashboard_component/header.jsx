import { Menu, Bell, User } from 'lucide-react';

const Header = ({ activeTab, setSidebarOpen }) => {
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
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">Admin User</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;