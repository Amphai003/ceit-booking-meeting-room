import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Wifi, Tv, Coffee, Car, Search, Filter, AlertCircle, Loader, ArrowLeft, Upload, X } from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [limit] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    roomType: '',
    capacity: '',
    location: '',
    status: 'available',
    photo: '',
    note: '',
    equipment: []
  });

  const roomTypes = [
    'Conference Room',
    'Meeting Room',
    'Training Room',
    'Boardroom',
    'Workshop Room',
    'Interview Room'
  ];

  const equipmentOptions = [
    { id: 'projector', name: 'Projector', icon: Tv },
    { id: 'tv', name: 'TV', icon: Tv },
    { id: 'whiteboard', name: 'Whiteboard', icon: Edit2 },
    { id: 'microphone', name: 'Microphone', icon: Users },
    { id: 'wifi', name: 'WiFi', icon: Wifi },
    { id: 'coffee', name: 'Coffee Machine', icon: Coffee }
  ];

  const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-200',
    occupied: 'bg-red-100 text-red-800 border-red-200',
    maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  // Fetch rooms from API with pagination
  const fetchRooms = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      
      const response = await api.get(`/rooms?${params.toString()}`);
      
      // Handle the response structure based on your API response
      if (response && response.data) {
        // Adjust these based on your actual API response structure
        const roomsData = response.data.data || response.data.rooms || response.data || [];
        const pagination = response.data.pagination || {};
        
        setRooms(roomsData);
        setCurrentPage(pagination.currentPage || page);
        setTotalPages(pagination.totalPages || Math.ceil((pagination.total || roomsData.length) / limit));
        setTotalRooms(pagination.total || roomsData.length);
      } else {
        console.warn('Unexpected API response structure:', response);
        setRooms([]);
        setTotalPages(1);
        setTotalRooms(0);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again.');
      setRooms([]);
      setTotalPages(1);
      setTotalRooms(0);
      await Swal.fire({
        icon: 'error',
        title: 'Error Loading Rooms',
        text: 'Failed to load rooms. Please check your connection and try again.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(currentPage, searchTerm, statusFilter);
  }, [currentPage]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentPage === 1) {
        fetchRooms(1, searchTerm, statusFilter);
      } else {
        setCurrentPage(1); // This will trigger fetchRooms via the useEffect above
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    if (currentPage === 1) {
      fetchRooms(1, searchTerm, status);
    } else {
      setCurrentPage(1); // This will trigger fetchRooms via the useEffect above
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Upload photo function
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      
      const response = await api.post('/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Get the photo URL from response - adjust based on your API response structure
      const photoUrl = response.data?.url || response.data?.Location || response.data?.path || '';
      
      if (photoUrl) {
        setFormData(prev => ({ ...prev, photo: photoUrl }));
        
        await Swal.fire({
          icon: 'success',
          title: 'Photo Uploaded!',
          text: 'Photo has been uploaded successfully.',
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        throw new Error('No photo URL returned from server');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to upload photo. Please try again.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.capacity || !formData.location || !formData.roomType) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      const roomData = {
        name: formData.name,
        roomType: formData.roomType,
        capacity: parseInt(formData.capacity),
        location: formData.location,
        status: formData.status,
        photo: formData.photo || '', // Use the photo URL, not the file object
        note: formData.note,
        equipment: formData.equipment
      };

      if (editingRoom) {
        await api.patch(`/rooms/${editingRoom._id || editingRoom.id}`, roomData);
        await Swal.fire({
          icon: 'success',
          title: 'Room Updated!',
          text: `${formData.name} has been updated successfully.`,
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        await api.post('/rooms', roomData);
        await Swal.fire({
          icon: 'success',
          title: 'Room Created!',
          text: `${formData.name} has been created successfully.`,
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          timerProgressBar: true
        });
      }
      
      await fetchRooms(currentPage, searchTerm, statusFilter);
      resetForm();
    } catch (err) {
      console.error('Error saving room:', err);
      setError('Failed to save room. Please try again.');
      await Swal.fire({
        icon: 'error',
        title: 'Error Saving Room',
        text: err.response?.data?.message || 'Failed to save room. Please check your connection and try again.',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      roomType: '',
      capacity: '',
      location: '',
      status: 'available',
      photo: '',
      note: '',
      equipment: []
    });
    setEditingRoom(null);
    setShowModal(false);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      roomType: room.roomType,
      capacity: room.capacity.toString(),
      location: room.location,
      status: room.status,
      photo: room.photo || '',
      note: room.note || '',
      equipment: room.equipment || []
    });
    setShowModal(true);
  };

  const handleDelete = async (room) => {
    const result = await Swal.fire({
      title: 'Delete Room?',
      text: `Are you sure you want to delete "${room.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setError(null);
        await api.delete(`/rooms/${room._id || room.id}`);
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `${room.name} has been deleted successfully.`,
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          timerProgressBar: true
        });
        await fetchRooms(currentPage, searchTerm, statusFilter);
      } catch (err) {
        console.error('Error deleting room:', err);
        setError('Failed to delete room. Please try again.');
        await Swal.fire({
          icon: 'error',
          title: 'Error Deleting Room',
          text: 'Failed to delete room. Please check your connection and try again.',
          confirmButtonColor: '#3B82F6'
        });
      }
    }
  };

  const handleEquipmentChange = (equipmentName, quantity) => {
    setFormData(prev => {
      const existingEquipment = prev.equipment.find(eq => eq.name === equipmentName);
      let newEquipment;
      
      if (quantity === 0 || quantity === '') {
        newEquipment = prev.equipment.filter(eq => eq.name !== equipmentName);
      } else if (existingEquipment) {
        newEquipment = prev.equipment.map(eq => 
          eq.name === equipmentName ? { ...eq, quantity: parseInt(quantity) } : eq
        );
      } else {
        newEquipment = [...prev.equipment, { name: equipmentName, quantity: parseInt(quantity) }];
      }
      
      return { ...prev, equipment: newEquipment };
    });
  };

  const getEquipmentQuantity = (equipmentName) => {
    const equipment = formData.equipment.find(eq => eq.name === equipmentName);
    return equipment ? equipment.quantity : 0;
  };

  const getEquipmentIcon = (equipmentName) => {
    const equipment = equipmentOptions.find(eq => eq.name.toLowerCase() === equipmentName.toLowerCase());
    return equipment ? equipment.icon : Users;
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin" size={24} />
          <span>Loading rooms...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-gray-600">Manage your office spaces efficiently</p>
              {/* <p className="text-sm text-gray-500 mt-1">
                Total: {totalRooms} rooms | Page {currentPage} of {totalPages}
              </p> */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add Room Button - Moved below filters */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Room
          </button>
        </div>

        {/* Loading indicator for content updates */}
        {loading && rooms.length > 0 && (
          <div className="text-center py-4 mb-4">
            <div className="inline-flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Loader className="animate-spin" size={16} />
              <span>Updating rooms...</span>
            </div>
          </div>
        )}

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {rooms.map(room => (
            <div key={room._id || room.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {room.photo && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={room.photo} 
                    alt={room.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{room.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{room.roomType}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[room.status]}`}>
                      {room.status?.charAt(0).toUpperCase() + room.status?.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(room)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} />
                    <span>Capacity: {room.capacity} people</span>
                  </div>
                  <div className="text-gray-600">
                    <span>Location: {room.location}</span>
                  </div>
                </div>

                {room.note && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.note}</p>
                )}

                {room.equipment && room.equipment.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {room.equipment.map((equipment, index) => {
                      const IconComponent = getEquipmentIcon(equipment.name);
                      return (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          <IconComponent size={12} />
                          {equipment.name} ({equipment.quantity})
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {rooms.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No rooms found matching your criteria.</p>
          </div>
        )}

        {/* Simplified Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-4 flex justify-center items-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              Previous
            </button>
            
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              Next
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingRoom ? 'Edit Room' : 'Add New Room'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter room name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Type *
                    </label>
                    <select
                      value={formData.roomType}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select room type</option>
                      {roomTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="available">Available</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 4th Floor, Building A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Photo
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e.target.files[0])}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors"
                        >
                          {uploading ? (
                            <Loader className="animate-spin" size={16} />
                          ) : (
                            <Upload size={16} />
                          )}
                          {uploading ? 'Uploading...' : 'Upload Photo'}
                        </label>
                        {formData.photo && (
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      {formData.photo && (
                        <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                          <img
                            src={formData.photo}
                            alt="Room preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {equipmentOptions.map(equipment => {
                        const IconComponent = equipment.icon;
                        const quantity = getEquipmentQuantity(equipment.name);
                        return (
                          <div key={equipment.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                            <IconComponent size={16} className="text-gray-600" />
                            <span className="text-sm text-gray-700 flex-1">{equipment.name}</span>
                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={quantity}
                              onChange={(e) => handleEquipmentChange(equipment.name, e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.note}
                      onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter additional notes"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader className="animate-spin" size={16} />}
                      {editingRoom ? 'Update Room' : 'Add Room'}
                    </button>
                    <button
                      onClick={resetForm}
                      disabled={submitting}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;