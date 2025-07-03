import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import api from '../../../api';
import RoomForm from './room_form';
import Swal from 'sweetalert2';

const EditRoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [equipmentOptions, setEquipmentOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch room data
        const roomRes = await api.get(`/rooms/${id}`);
        setRoom(roomRes.data);

        // Fetch equipment list
        const eqRes = await api.get('/equipment');
        const formatted = eqRes.data.map(eq => ({
          id: eq._id,
          name: eq.name,
        }));
        setEquipmentOptions(formatted);
      } catch (err) {
        console.error('Error loading data:', err);
        await Swal.fire({
          icon: 'error',
          title: 'Error Loading Data',
          text: 'Failed to load room or equipment data.',
          confirmButtonColor: '#3B82F6'
        });
        navigate('/rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);


  const handlePhotoUpload = async (file) => {
    if (!file) return '';

    setUploading(true);
    try {
      // Check file type and size first
      if (!file.type.match('image.*')) {
        throw new Error('Please select an image file (JPEG, PNG, etc.)');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Please select an image smaller than 5MB');
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await api.post('/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      // Extract URL from different possible response formats
      const photoUrl = response.data?.url ||
        response.data?.Location ||
        response.data?.imageUrl ||
        response.data;

      if (!photoUrl) {
        throw new Error('No image URL returned from server');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Photo Uploaded!',
        text: 'Photo has been uploaded successfully.',
        confirmButtonColor: '#3B82F6',
        timer: 2000
      });

      return photoUrl;
    } catch (err) {
      console.error('Error uploading photo:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.message || 'Failed to upload photo. Please try again.',
        confirmButtonColor: '#3B82F6'
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
        title: 'Room Updated!',
        text: `${formData.name} has been updated successfully.`,
        confirmButtonColor: '#3B82F6',
        timer: 2000
      });

      navigate('/rooms');
    } catch (err) {
      console.error('Error updating room:', err);
      throw new Error(err.response?.data?.message || 'Failed to update room');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin" size={24} />
          <span>Loading room data...</span>
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Room</h1>
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
        />
      </div>
    </div>
  );
};

export default EditRoomPage;