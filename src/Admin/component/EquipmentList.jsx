import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const EquipmentList = ({ items, onEdit, onDelete }) => {
  const { t, i18n } = useTranslation(); // Initialize translation hook

  if (!items.length) {
    return <p className={`text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('equipmentList.noEquipmentFound')}</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item._id}
          className="border p-4 rounded flex justify-between items-center"
        >
          <div>
            <h2 className={`text-lg font-semibold ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{item.name}</h2>
            <p className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{item.description}</p>
            <p className={`text-sm text-gray-700 font-medium ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('equipmentList.quantity')} {item.quantity}
            </p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => onEdit(item)}
              className={`text-blue-600 hover:underline ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              {t('equipmentList.edit')}
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className={`text-red-600 hover:underline ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              {t('equipmentList.delete')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EquipmentList;