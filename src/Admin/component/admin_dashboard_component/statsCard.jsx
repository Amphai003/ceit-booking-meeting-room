import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const StatsCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const { i18n } = useTranslation(); // Initialize translation hook

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600'
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{title}</p>
          <p className={`text-3xl font-bold ${textColorClasses[color]} ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
