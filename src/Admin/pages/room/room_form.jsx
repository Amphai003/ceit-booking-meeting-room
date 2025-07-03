import React, { useState, useEffect } from 'react';
import { Edit2, Users, Wifi, Tv, Coffee, Upload, X, Loader, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const roomTypes = [
  'Conference Room',
  'Meeting Room',
  'Training Room',
  'Boardroom',
  'Workshop Room',
  'Interview Room'
];

const RoomForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  onPhotoUpload,
  uploading = false,
  equipmentOptions = []
}) => {
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 🧠 Handle pre-fill on edit
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        equipment: (initialData.equipment || []).map(e => ({
          equipment: e.equipment?._id || e.equipment,
          quantity: e.quantity
        }))
      }));
    }
  }, [initialData]);

  // ✅ Update quantity or add/remove equipment
  const handleEquipmentChange = (equipmentId, quantity) => {
    setFormData(prev => {
      const existing = prev.equipment.find(eq => eq.equipment === equipmentId);
      let updated;

      if (quantity === 0 || quantity === '') {
        updated = prev.equipment.filter(eq => eq.equipment !== equipmentId);
      } else if (existing) {
        updated = prev.equipment.map(eq =>
          eq.equipment === equipmentId ? { ...eq, quantity: parseInt(quantity) } : eq
        );
      } else {
        updated = [...prev.equipment, { equipment: equipmentId, quantity: parseInt(quantity) }];
      }

      return { ...prev, equipment: updated };
    });
  };

  const getEquipmentQuantity = (equipmentId) => {
    const eq = formData.equipment.find(item => item.equipment === equipmentId);
    return eq ? eq.quantity : '';
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const photoUrl = await onPhotoUpload(file);
      if (photoUrl) {
        setFormData(prev => ({ ...prev, photo: photoUrl }));
      } else {
        throw new Error('No photo URL returned');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload photo');
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.roomType || !formData.capacity || !formData.location) {
      setError('Please fill in all required fields');
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
      await onSubmit({
        ...formData,
        capacity: parseInt(formData.capacity),
        equipment: formData.equipment.filter(e => e.quantity > 0)
      });
    } catch (err) {
      setError(err.message || 'Failed to save room. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
               placeholder="Enter room name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
            <select
              value={formData.roomType}
              onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select room type</option>
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., 4th Floor, Building A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <div className="flex gap-4 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
              >
                {uploading ? <Loader className="animate-spin" size={16} /> : <Upload size={16} />}
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </label>

              {formData.photo && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="p-2 text-red-500 hover:text-red-700 rounded-lg"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {formData.photo && (
              <div className="mt-3 w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={formData.photo}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
            <div className="grid grid-cols-2 gap-3">
              {equipmentOptions.map(eq => (
                <div key={eq.id} className="flex items-center gap-2 border px-2 py-1 rounded">
                  <span className="text-sm text-gray-700 flex-1">{eq.name}</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={getEquipmentQuantity(eq.id)}
                    onChange={(e) => handleEquipmentChange(eq.id, e.target.value)}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows="3"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter any additional notes"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition"
            >
              {submitting ? (
                <div className="flex items-center gap-2 justify-center">
                  <Loader className="animate-spin" size={16} />
                  {initialData ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                initialData ? 'Update Room' : 'Create Room'
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
