import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Database, Share2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyScreen = () => {
  const navigate = useNavigate();

  const privacySections = [
    {
      icon: Database,
      title: "Data Collection",
      content: "We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support. This includes your name, email address, phone number, and department information."
    },
    {
      icon: Eye,
      title: "How We Use Your Data",
      content: "We use your personal information to provide, maintain, and improve our services, communicate with you, send you updates and notifications, and ensure the security of your account."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted both in transit and at rest."
    },
    {
      icon: Share2,
      title: "Information Sharing",
      content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this privacy policy or as required by law."
    },
    {
      icon: AlertCircle,
      title: "Your Rights",
      content: "You have the right to access, update, or delete your personal information. You can also opt out of certain communications and request a copy of your data at any time."
    }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900 flex-1 text-center mr-11">Privacy Policy</h1>
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
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Your Privacy Matters</h2>
              <p className="text-gray-600 text-center text-sm leading-relaxed">
                We are committed to protecting your privacy and ensuring the security of your personal information.
              </p>
              <div className="mt-4 text-center">
                <span className="text-xs text-gray-500">Last updated: January 2025</span>
              </div>
            </div>

            {/* Privacy Sections */}
            <div className="space-y-4">
              {privacySections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Data Protection Officer:</span>
                  </p>
                  <p className="text-sm text-gray-800">privacy@company.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Support Team:</span>
                  </p>
                  <p className="text-sm text-gray-800">support@company.com</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    If you have any questions about this Privacy Policy or our data practices, 
                    please contact us using the information provided above.
                  </p>
                </div>
              </div>
            </div>

            {/* Cookie Policy */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookie Policy</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                and improve our services. You can control cookie settings through your browser preferences.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Essential Cookies</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Always On</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Analytics Cookies</span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Optional</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Marketing Cookies</span>
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Disabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyScreen;