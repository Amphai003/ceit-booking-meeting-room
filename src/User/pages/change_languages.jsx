import React, { useState } from 'react';
import { ArrowLeft, Globe, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ChangeLanguageScreen = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'lo', name: 'Laos', nativeName: 'Laos', flag: 'lo' },

  ];

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.name);
    
    // Show confirmation dialog
    Swal.fire({
      title: 'Change Language?',
      text: `Switch to ${language.name} (${language.nativeName})?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Change',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl font-medium px-6 py-3',
        cancelButton: 'rounded-xl font-medium px-6 py-3'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Simulate language change
        Swal.fire({
          title: 'Language Changed!',
          text: `Application language has been changed to ${language.name}`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl font-medium px-6 py-3'
          }
        }).then(() => {
          // In a real app, you would implement language switching logic here
          // For now, just navigate back to profile
          navigate('/user-profile');
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-10">
        <div className="px-4 py-4 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1 text-center mr-11">Change Language</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="px-4 py-4">
          <div className="max-w-md mx-auto w-full">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Select Language</h2>
              <p className="text-gray-600 text-center text-sm leading-relaxed">
                Choose your preferred language for the application interface and content.
              </p>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Current: {selectedLanguage}
                </span>
              </div>
            </div>

            {/* Language List */}
            <div className="space-y-2">
              {languages.map((language, index) => (
                <button
                  key={index}
                  onClick={() => handleLanguageSelect(language)}
                  className={`w-full bg-white rounded-xl p-4 flex items-center justify-between border transition-all duration-200 hover:shadow-md active:scale-95 ${
                    selectedLanguage === language.name 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{language.flag}</span>
                    <div className="text-left">
                      <p className={`font-medium ${
                        selectedLanguage === language.name ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {language.name}
                      </p>
                      <p className={`text-sm ${
                        selectedLanguage === language.name ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {language.nativeName}
                      </p>
                    </div>
                  </div>
                  {selectedLanguage === language.name && (
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Language Support Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Support</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Interface Translation</p>
                    <p className="text-xs text-gray-600">All menu items, buttons, and labels will be translated</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Content Localization</p>
                    <p className="text-xs text-gray-600">Date formats, number formats, and currency will be localized</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Right-to-Left Support</p>
                    <p className="text-xs text-gray-600">Full RTL layout support for Arabic and other RTL languages</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-4">
              <div className="flex items-start space-x-3">
                <Globe className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Language Preference</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Your language preference will be saved and applied across all your sessions. 
                    You can change it anytime from this screen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeLanguageScreen;