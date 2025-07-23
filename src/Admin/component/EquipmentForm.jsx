import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const EquipmentForm = ({ onSubmit, initialData = null }) => {
  const { t, i18n } = useTranslation(); // Initialize translation hook

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        quantity: initialData.quantity || 1,
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={`block text-sm font-medium text-gray-700 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
          {t('equipmentForm.equipmentName')} *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${i18n.language === 'lo' ? 'font-lao' : ''}`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium text-gray-700 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
          {t('equipmentForm.description')}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows="3"
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${i18n.language === 'lo' ? 'font-lao' : ''}`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium text-gray-700 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
          {t('equipmentForm.quantity')} *
        </label>
        <input
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
          required
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${i18n.language === 'lo' ? 'font-lao' : ''}`}
        />
      </div>

      <button
        type="submit"
        className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg ${i18n.language === 'lo' ? 'font-lao' : ''}`}
      >
        {initialData ? t('equipmentForm.updateEquipment') : t('equipmentForm.addEquipment')}
      </button>
    </form>
  );
};

export default EquipmentForm;
