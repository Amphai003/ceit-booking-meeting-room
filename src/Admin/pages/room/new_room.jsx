
import React, { useState,useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../../api';
import RoomForm from './room_form';
import Swal from 'sweetalert2';

const NewRoomPage = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [equipmentOptions, setEquipmentOptions] = useState([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get('/equipment');
        // Normalize equipment data for RoomForm usage
        const formatted = res.data.map(eq => ({
          id: eq._id,
          name: eq.name,
       
        }));
        setEquipmentOptions(formatted);
      } catch (err) {
        console.error('Failed to load equipment:', err);
        Swal.fire('Error', 'Failed to load equipment list.', 'error');
      }
    };
    fetchEquipment();
  }, []);

const handlePhotoUpload = async (file) => {
  if (!file) return '';
  
  setUploading(true);
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    
    const response = await api.post('/upload', uploadFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });
    
    // Extract URL from response (adjust according to your API response structure)
    const photoUrl = response.data.url || 
                    response.data.Location || 
                    response.data.imageUrl || 
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
      text: err.response?.data?.message || 'Failed to upload photo. Please try again.',
      confirmButtonColor: '#3B82F6'
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
        title: 'Room Created!',
        text: `${formData.name} has been created successfully.`,
        confirmButtonColor: '#3B82F6',
        timer: 2000
      });
      
      navigate('/rooms');
    } catch (err) {
      console.error('Error creating room:', err);
      throw new Error(err.response?.data?.message || 'Failed to create room');
    }
  };

 return (
    <div className="min-h-screen bg-gray-50">
      {/* Header and back button */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/rooms')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Add New Room</h1>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-7xl mx-auto p-4">
        <RoomForm
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

export default NewRoomPage;