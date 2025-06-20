import { 
  User, 
  ChevronRight, 
  Globe, 
  Shield, 
  FileText, 
  LogOut 
} from 'lucide-react';

 const ProfileScreen = () => {
  const menuItems = [
    {
      icon: User,
      label: 'Edit Profile',
      hasArrow: true
    },
    {
      icon: Globe,
      label: 'Language',
      hasArrow: true
    },
    {
      icon: Shield,
      label: 'Privacy Policy',
      hasArrow: true
    },
    {
      icon: FileText,
      label: 'Terms & Conditions',
      hasArrow: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 px-6 py-8 text-center relative">
          <div className="absolute top-4 left-4">
            <button className="text-white/80 hover:text-white transition-colors">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
          </div>
          
          <h1 className="text-white text-lg font-semibold mb-6">Edit Profile</h1>
          
          {/* Profile Avatar */}
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white"></div>
          </div>
          
          <h2 className="text-white text-xl font-semibold mt-4">JohnDoe</h2>
          <p className="text-purple-200 text-sm">john.doe@email.com</p>
        </div>

        {/* Menu Items */}
        <div className="p-6 space-y-1">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-gray-800 font-medium">{item.label}</span>
                </div>
                {item.hasArrow && (
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                )}
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="p-6 pt-2">
          <button className="w-full bg-gray-800 hover:bg-gray-900 text-white py-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;