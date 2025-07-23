// src/pages/EditRoomPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import api from '../../../api'; // Assuming this is your axiosConfig.js import
import RoomForm from './room_form';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const EditRoomPage = () => {
  const { t, i18n } = useTranslation();

  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [roomTypeOptions, setRoomTypeOptions] = useState([]); // ✅ NEW STATE for room types

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch room data
        const roomRes = await api.get(`/rooms/${id}`);
        setRoom(roomRes.data);

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
        // Ensure your backend returns objects like: [{_id: "...", name: "Conference Room"}]
        setRoomTypeOptions(roomTypeRes.data);

      } catch (err) {
        console.error('Error loading data:', err);
        await Swal.fire({
          icon: 'error',
          title: t('editRoomPage.errorLoadingData'),
          text: t('editRoomPage.failedToLoadRoomOrEquipment'),
          confirmButtonColor: '#3B82F6',
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
        navigate('/rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, t, i18n.language]);


  const handlePhotoUpload = async (file) => {
    if (!file) return '';

    setUploading(true);
    try {
      // Check file type and size first
      if (!file.type.match('image.*')) {
        throw new Error(t('profileScreen.invalidFileText'));
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error(t('profileScreen.fileTooLargeText'));
      }

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

      // Extract URL from different possible response formats
      const photoUrl = response.data?.url ||
        response.data?.Location ||
        response.data?.imageUrl ||
        response.data; // Fallback for direct URL string response

      if (!photoUrl) {
        throw new Error('No image URL returned from server');
      }

      await Swal.fire({
        icon: 'success',
        title: t('editRoomPage.photoUploaded'),
        text: t('editRoomPage.photoUploadedSuccessfully'),
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
        title: t('editRoomPage.uploadFailed'),
        text: err.message || t('editRoomPage.failedToUploadPhoto'),
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
      await api.patch(`/rooms/${id}`, {
        ...formData,
        capacity: parseInt(formData.capacity),
      });

      await Swal.fire({
        icon: 'success',
        title: t('editRoomPage.roomUpdated'),
        text: t('editRoomPage.roomUpdatedSuccessfully', { roomName: formData.name }),
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
      console.error('Error updating room:', err);
      throw new Error(err.response?.data?.message || t('editRoomPage.failedToUpdateRoom'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin" size={24} />
          <span className={`${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('editRoomPage.loadingRoomData')}</span>
        </div>
      </div>
    );
  }

  if (!room) {
    return null; // Or show an error message/redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-3xl font-bold text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('editRoomPage.editRoom')}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <RoomForm
          initialData={room}
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

export default EditRoomPage;