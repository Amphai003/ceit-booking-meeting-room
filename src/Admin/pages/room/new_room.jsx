
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft,Loader  } from 'lucide-react';
import api from '../../../api'; // Assuming this is your axiosConfig.js import
import RoomForm from './room_form';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const NewRoomPage = () => {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [roomTypeOptions, setRoomTypeOptions] = useState([]); // ✅ NEW STATE for room types
  const [loadingOptions, setLoadingOptions] = useState(true); // To indicate loading equipment/room types

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        // Fetch equipment list
        const eqRes = await api.get('/equipment');
        const formattedEq = eqRes.data.map(eq => ({
          id: eq._id,
          name: eq.name,
          availableQuantity: eq.quantity,
          description: eq.description,
        }));
        setEquipmentOptions(formattedEq);

        // ✅ NEW: Fetch room types
        const roomTypeRes = await api.get('/room-types'); // Assuming this is your endpoint
        setRoomTypeOptions(roomTypeRes.data);

      } catch (err) {
        console.error('Failed to load options:', err);
        Swal.fire({
          title: t('equipmentPage.error'),
          text: t('newRoomPage.failedToLoadEquipmentList'), // This message might need to be more generic for both
          icon: 'error',
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [t, i18n.language]);

  const handlePhotoUpload = async (file) => {
    if (!file) return '';

    setUploading(true);
    try {
      // The 'api' instance already handles the Authorization header.
      // You should not manually add it here if using your configured 'api' instance.
      // const token = localStorage.getItem('token') || sessionStorage.getItem('token'); // ❌ REMOVE THIS LINE
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await api.post('/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // 'Authorization': `Bearer ${token}` // ❌ REMOVE THIS LINE, INTERCEPTOR HANDLES IT
        },
      });

      const photoUrl = response.data?.url || // Use optional chaining to prevent error if data is null/undefined
        response.data?.Location ||
        response.data?.imageUrl ||
        response.data;

      if (!photoUrl) {
        throw new Error('No image URL returned from server');
      }

      await Swal.fire({
        icon: 'success',
        title: t('newRoomPage.photoUploaded'),
        text: t('newRoomPage.photoUploadedSuccessfully'),
        confirmButtonColor: '#3B82F6',
        timer: 2000,
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });

      return photoUrl;
    } catch (err) {
      console.error('Error uploading photo:', err);
      await Swal.fire({
        icon: 'error',
        title: t('newRoomPage.uploadFailed'),
        text: err.response?.data?.message || t('newRoomPage.failedToUploadPhoto'),
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
      return '';
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await api.post('/rooms', {
        ...formData,
        capacity: parseInt(formData.capacity),
      });

      await Swal.fire({
        icon: 'success',
        title: t('newRoomPage.roomCreated'),
        text: t('newRoomPage.roomCreatedSuccessfully', { roomName: formData.name }),
        confirmButtonColor: '#3B82F6',
        timer: 2000,
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });

      navigate('/rooms');
    } catch (err) {
      console.error('Error creating room:', err);
      throw new Error(err.response?.data?.message || t('newRoomPage.failedToCreateRoom'));
    }
  };

  if (loadingOptions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin" size={24} />
          <span className={`${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            {t('newRoomPage.loadingOptions')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/rooms')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-3xl font-bold text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('newRoomPage.addNewRoom')}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <RoomForm
          initialData={null} // For new room, no initial data
          onSubmit={handleSubmit}
          onCancel={() => navigate('/rooms')}
          onPhotoUpload={handlePhotoUpload}
          uploading={uploading}
          equipmentOptions={equipmentOptions}
          roomTypeOptions={roomTypeOptions} // ✅ Pass room types to RoomForm
        />
      </div>
    </div>
  );
};

export default NewRoomPage;