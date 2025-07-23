
import React, { useState, useEffect } from 'react';
import { Edit2, Users, Wifi, Tv, Coffee, Upload, X, Loader, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

// roomTypes array is now removed from here, it will be passed as a prop from parent

const RoomForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  onPhotoUpload,
  uploading = false,
  equipmentOptions = [],
  roomTypeOptions = [] // ✅ NEW PROP: Expect room types fetched from backend
}) => {
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    roomType: '', // This will now store the ObjectId
    capacity: '',
    location: '',
    status: 'available',
    photo: '',
    note: '',
    equipment: [] // Stores { equipment: equipmentId, quantity }
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Effect to pre-fill the form when initialData is provided (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Crucial: Set roomType to its _id if initialData.roomType is an object
        roomType: initialData.roomType?._id || initialData.roomType || '',
        // Map equipment to the expected format { equipmentId, quantity }
        equipment: (initialData.equipment || []).map(e => ({
          equipment: e.equipment?._id || e.equipment, // Handle nested object or direct ID
          quantity: e.quantity
        }))
      }));
    }
  }, [initialData]);

  // Handle changes for equipment quantities
  const handleEquipmentChange = (equipmentId, quantity) => {
    setFormData(prev => {
      const parsedQuantity = parseInt(quantity, 10); // Ensure quantity is a number
      const existing = prev.equipment.find(eq => eq.equipment === equipmentId);
      let updatedEquipment;

      if (parsedQuantity === 0 || isNaN(parsedQuantity)) {
        // Remove equipment if quantity is 0 or invalid
        updatedEquipment = prev.equipment.filter(eq => eq.equipment !== equipmentId);
      } else if (existing) {
        // Update quantity if equipment already exists
        updatedEquipment = prev.equipment.map(eq =>
          eq.equipment === equipmentId ? { ...eq, quantity: parsedQuantity } : eq
        );
      } else {
        // Add new equipment
        updatedEquipment = [...prev.equipment, { equipment: equipmentId, quantity: parsedQuantity }];
      }

      return { ...prev, equipment: updatedEquipment };
    });
  };

  // Helper to get the current quantity of a specific equipment
  const getEquipmentQuantity = (equipmentId) => {
    const eq = formData.equipment.find(item => item.equipment === equipmentId);
    return eq ? eq.quantity : '';
  };

  // Handle photo file selection and upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Call the parent's photo upload function
      const photoUrl = await onPhotoUpload(file);
      if (photoUrl) {
        setFormData(prev => ({ ...prev, photo: photoUrl }));
        setError(null); // Clear any previous photo upload errors
      } else {
        throw new Error('Photo upload failed: No URL returned.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || t('roomForm.failedToUploadPhoto'));
    }
  };

  // Remove the currently displayed photo
  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: '' }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic client-side validation
    if (!formData.name || !formData.roomType || !formData.capacity || !formData.location) {
      setError(t('roomForm.pleaseFillAllRequiredFields'));
      await Swal.fire({
        icon: 'warning',
        title: t('roomForm.missingInformation'),
        text: t('roomForm.pleaseFillAllRequiredFields'),
        confirmButtonColor: '#3B82F6',
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
      return;
    }

    setSubmitting(true);
    try {
      // Filter out equipment with 0 quantity before submitting
      const dataToSubmit = {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
        equipment: formData.equipment.filter(e => e.quantity > 0)
      };
      await onSubmit(dataToSubmit);
    } catch (err) {
      setError(err.message || t('roomForm.failedToSaveRoom'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Outer container for modal-like appearance, responsive width and height
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl mx-auto my-8 max-h-[95vh] overflow-hidden flex flex-col">
      <div className="p-6 overflow-y-auto flex-1"> {/* Added flex-1 for content to grow */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className={`text-2xl font-extrabold text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            {initialData ? t('roomForm.editRoomDetails') : t('roomForm.addNewRoom')}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close form"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`bg-red-50 border border-red-300 rounded-lg p-4 mb-6 flex items-center gap-3 text-red-800 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Room Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Room Name */}
          <div>
            <label htmlFor="roomName" className={`block text-sm font-semibold text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('roomForm.roomName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="roomName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              placeholder={t('roomForm.roomNamePlaceholder')}
              required
            />
          </div>

          {/* Room Type */}
          <div>
            <label htmlFor="roomType" className={`block text-sm font-semibold text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('roomForm.roomType')} <span className="text-red-500">*</span>
            </label>
            <select
              id="roomType"
              value={formData.roomType}
              onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value }))}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              required
            >
              <option value="">{t('roomForm.selectRoomType')}</option>
              {roomTypeOptions.map(type => ( // ✅ Use roomTypeOptions prop
                <option key={type._id} value={type._id}>{type.typeName}</option> // ✅ Use _id as value, name for display
              ))}
            </select>
          </div>

          {/* Capacity & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="capacity" className={`block text-sm font-semibold text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {t('roomForm.capacity')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="capacity"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                placeholder={t('roomForm.capacityPlaceholder')}
                required
              />
            </div>

            <div>
              <label htmlFor="status" className={`block text-sm font-semibold text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {t('roomForm.status')}
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              >
                <option value="available">{t('roomForm.available')}</option>
                <option value="maintenance">{t('roomForm.maintenance')}</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className={`block text-sm font-semibold text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('roomForm.location')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              placeholder={t('roomForm.locationPlaceholder')}
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className={`block text-sm font-semibold text-gray-700 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('roomForm.roomPhoto')}
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className={`flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg cursor-pointer transition-colors duration-200 border border-blue-200 shadow-sm ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              >
                {uploading ? <Loader className="animate-spin" size={18} /> : <Upload size={18} />}
                {uploading ? t('roomForm.uploading') : t('roomForm.uploadPhoto')}
              </label>

              {formData.photo && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className={`flex items-center gap-1 text-red-600 hover:text-red-800 p-2 rounded-md transition-colors duration-200 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                  aria-label={t('roomForm.removePhoto')}
                >
                  <X size={18} />
                  <span className="text-sm">{t('roomForm.removePhoto')}</span>
                </button>
              )}
            </div>

            {formData.photo && (
              <div className="mt-4 w-full h-48 sm:h-56 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                <img
                  src={formData.photo}
                  alt={t('roomForm.uploadedRoomPreview')}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Equipment Selection */}
          <div>
            <label className={`block text-sm font-semibold text-gray-700 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('roomForm.equipmentAvailable')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {equipmentOptions.length > 0 ? (
                equipmentOptions.map(eq => (
                  <div key={eq.id} className="flex flex-col p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-base font-medium text-gray-800 flex-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{eq.name}</span>
                      <input
                        type="number"
                        min="0"
                        // Max value should be the available quantity if provided, otherwise a high number
                        max={eq.availableQuantity !== undefined ? eq.availableQuantity : "999"}
                        value={getEquipmentQuantity(eq.id)}
                        onChange={(e) => handleEquipmentChange(eq.id, e.target.value)}
                        className={`w-20 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-center ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                        aria-label={t('roomForm.quantityFor', { equipmentName: eq.name })}
                      />
                    </div>
                    {eq.description && (
                      <p className={`text-xs text-gray-500 italic ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        {eq.description}
                      </p>
                    )}
                    {eq.availableQuantity !== undefined && (
                      <p className={`text-xs text-gray-600 font-medium mt-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        {t('roomForm.availableQuantity')} <span className="text-blue-600">{eq.availableQuantity}</span>
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className={`text-gray-500 text-sm italic col-span-full ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('roomForm.noEquipmentOptions')}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className={`block text-sm font-semibold text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('roomForm.additionalNotes')}
            </label>
            <textarea
              id="notes"
              rows="3"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              placeholder={t('roomForm.additionalNotesPlaceholder')}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-6">
            <button
              type="submit"
              disabled={submitting || uploading}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  {initialData ? t('roomForm.updatingRoom') : t('roomForm.creatingRoom')}
                </>
              ) : (
                initialData ? t('roomForm.updateRoom') : t('roomForm.createRoom')
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting || uploading}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold rounded-lg transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              {t('roomForm.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;