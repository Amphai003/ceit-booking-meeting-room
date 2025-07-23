import React, { useEffect, useState } from 'react';
import EquipmentForm from '../component/EquipmentForm';
import EquipmentList from '../component/EquipmentList';
import api from '../../api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const EquipmentPage = () => {
  const { t, i18n } = useTranslation(); // Initialize translation hook

  const [equipmentList, setEquipmentList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const navigate = useNavigate();

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipmentList(response.data);
    } catch (err) {
      Swal.fire({
        title: t('equipmentPage.error'),
        text: t('equipmentPage.failedToLoadEquipment'),
        icon: 'error',
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
    }
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editItem) {
        await api.put(`/equipment/${editItem._id}`, data);
        Swal.fire({
          title: t('equipmentPage.updated'),
          text: t('equipmentPage.equipmentUpdated'),
          icon: 'success',
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
      } else {
        await api.post('/equipment', data);
        Swal.fire({
          title: t('equipmentPage.created'),
          text: t('equipmentPage.newEquipmentAdded'),
          icon: 'success',
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
      }
      fetchEquipment();
      setEditItem(null);
    } catch (err) {
      Swal.fire({
        title: t('equipmentPage.error'),
        text: t('equipmentPage.operationFailed'),
        icon: 'error',
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: t('equipmentPage.deleteConfirmationTitle'),
      text: t('equipmentPage.deleteConfirmationText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('equipmentPage.yes'),
      customClass: {
        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        cancelButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
      }
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/equipment/${id}`);
        fetchEquipment();
        Swal.fire({
          title: t('equipmentPage.deleted'),
          text: t('equipmentPage.equipmentDeleted'),
          icon: 'success',
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
      } catch (err) {
        Swal.fire({
          title: t('equipmentPage.error'),
          text: t('equipmentPage.deleteFailed'),
          icon: 'error',
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
      }
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className={`text-sm text-blue-600 hover:underline ${i18n.language === 'lo' ? 'font-lao' : ''}`}
        >
          ← {t('equipmentPage.back')}
        </button>
        <h1 className={`text-xl font-semibold text-gray-800 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
          {t('equipmentPage.equipmentManagement')}
        </h1>
        <div />
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className={`text-lg font-bold mb-4 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            {editItem ? t('equipmentPage.editEquipment') : t('equipmentPage.addNewEquipment')}
          </h2>
          <EquipmentForm onSubmit={handleCreateOrUpdate} initialData={editItem} />
        </section>

        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className={`text-lg font-bold mb-4 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            {t('equipmentPage.equipmentList')}
          </h2>
          <EquipmentList
            items={equipmentList}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>
      </main>
    </div>
  );
};

export default EquipmentPage;
