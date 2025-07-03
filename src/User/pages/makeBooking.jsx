import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Trash,
  X,
  Check,
  Wifi,
  Monitor,
  Mic,
  Users,
  MapPin
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// Removed: import TimePicker from 'react-time-picker';
// Removed: import 'react-time-picker/dist/TimePicker.css';

const MakeBookingScreen = () => {
  const { state } = useLocation();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeError, setTimeError] = useState(null); // New state for time validation

  // Helper function to ensure valid time format (HH:MM)
  const formatTime = (timeString) => {
    if (!timeString) return '08:00';
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  // Form state
  const [formData, setFormData] = useState({
    bookingDate: new Date(),
    startTime: '08:00',
    endTime: '09:00',
    purpose: '',
    requestedEquipment: [],
    equipmentNotes: ''
  });

  // Room details
  const [room, setRoom] = useState(state?.room || null);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Fetch booking details if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (bookingId) {
          // Fetch booking details
          const response = await api.get(`/bookings/${bookingId}`);
          setBookingDetails(response.data.data);

          // Set form data from existing booking
          const booking = response.data.data;
          setFormData({
            bookingDate: new Date(booking.bookingDate),
            startTime: formatTime(booking.startTime),
            endTime: formatTime(booking.endTime),
            purpose: booking.purpose || '',
            requestedEquipment: booking.requestedEquipment || [],
            equipmentNotes: booking.equipmentNotes || ''
          });

          // If room data wasn't passed in state, fetch it
          if (!state?.room) {
            const roomResponse = await api.get(`/rooms/${booking.room._id}`);
            setRoom(roomResponse.data.data);
          }
        } else if (state?.room) {
          // New booking with room data from state
          setRoom(state.room);
        } else {
          throw new Error('No room or booking information provided');
        }
      } catch (err) {
        setError(err.message || 'Failed to load booking data');
        console.error('Error:', err);

        Swal.fire({
          icon: 'error',
          title: 'Error Loading Booking',
          text: err.message || 'Could not load booking information',
          confirmButtonText: 'Go Back',
          confirmButtonColor: '#000000'
        }).then(() => {
          navigate(-1);
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [bookingId, state, navigate]);

  // Validate time range whenever startTime or endTime changes
  useEffect(() => {
    const start = new Date(`2000/01/01 ${formData.startTime}`);
    const end = new Date(`2000/01/01 ${formData.endTime}`);

    if (start >= end) {
      setTimeError('End time must be after start time.');
    } else {
      setTimeError(null);
    }
  }, [formData.startTime, formData.endTime]);


  const handleEquipmentChange = (equip, action = 'toggle') => {
    setFormData(prev => {
      const existingIndex = prev.requestedEquipment.findIndex(e => e.name === equip.name);

      if (action === 'toggle') {
        if (existingIndex >= 0) {
          // Remove if already selected
          const newEquipment = [...prev.requestedEquipment];
          newEquipment.splice(existingIndex, 1);
          return { ...prev, requestedEquipment: newEquipment };
        } else {
          // Add to selection with quantity 1
          return {
            ...prev,
            requestedEquipment: [...prev.requestedEquipment, { ...equip, requestedQuantity: 1 }]
          };
        }
      } else if (action === 'quantity') {
        if (existingIndex >= 0) {
          const newEquipment = [...prev.requestedEquipment];
          newEquipment[existingIndex] = { ...newEquipment[existingIndex], ...equip };
          return { ...prev, requestedEquipment: newEquipment };
        }
      }

      return prev;
    });
  };

  // Handle time change using standard input type="time"
  const handleTimeChange = (field, e) => {
    const time = e.target.value;
    setFormData(prev => ({ ...prev, [field]: formatTime(time) }));
  };

 // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  if (timeError) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Time Range',
      text: timeError,
      confirmButtonText: 'OK',
      confirmButtonColor: '#000000'
    });
    return;
  }

  setIsSubmitting(true);

  try {
    // Create a new date object to avoid timezone issues
    const bookingDate = new Date(formData.bookingDate);
    
    // Format the date in local timezone to avoid UTC conversion issues
    const year = bookingDate.getFullYear();
    const month = (bookingDate.getMonth() + 1).toString().padStart(2, '0');
    const day = bookingDate.getDate().toString().padStart(2, '0');
    
    const localBookingDate = `${year}-${month}-${day}`;
    
    // Additional check: ensure we're not booking for a past date
    const today = new Date();
    const todayString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    // If booking for today, check if the start time has already passed
    if (localBookingDate === todayString) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (formData.startTime <= currentTime) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Time',
          text: 'Cannot book for a time that has already passed today',
          confirmButtonText: 'OK',
          confirmButtonColor: '#000000'
        });
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      ...formData,
      bookingDate: localBookingDate,
      startTime: formatTime(formData.startTime),
      endTime: formatTime(formData.endTime)
    };

    let response;

    if (bookingId) {
      // Update existing booking
      response = await api.patch(`/bookings/${bookingId}`, payload);
      Swal.fire({
        icon: 'success',
        title: 'Booking Updated!',
        text: 'Your booking has been successfully updated',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      // Create new booking
      response = await api.post(`/rooms/${room._id}/booking`, payload);
      Swal.fire({
        icon: 'success',
        title: 'Booking Created!',
        text: 'Your room has been successfully booked',
        timer: 2000,
        showConfirmButton: false
      });
    }

    // Go back to previous screen after success
    setTimeout(() => navigate(-1), 2000);
  } catch (err) {
    console.error('Error submitting booking:', err);
    setError(err.message || 'Failed to submit booking');

    Swal.fire({
      icon: 'error',
      title: 'Booking Failed',
      text: err.message || 'Could not process your booking request',
      confirmButtonText: 'OK',
      confirmButtonColor: '#000000'
    });
  } finally {
    setIsSubmitting(false);
  }
};

  // Handle booking rejection
  const handleReject = async () => {
    if (!bookingId) return;

    const result = await Swal.fire({
      title: 'Reject Booking?',
      text: 'Are you sure you want to reject this booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, reject it!'
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/bookings/${bookingId}/reject`);
        Swal.fire({
          icon: 'success',
          title: 'Booking Rejected!',
          text: 'The booking has been successfully rejected',
          timer: 2000,
          showConfirmButton: false
        });
        navigate(-1);
      } catch (err) {
        console.error('Error rejecting booking:', err);
        Swal.fire({
          icon: 'error',
          title: 'Rejection Failed',
          text: err.message || 'Could not reject the booking',
          confirmButtonText: 'OK',
          confirmButtonColor: '#000000'
        });
      }
    }
  };

  // Handle booking deletion
  const handleDelete = async () => {
    if (!bookingId) return;

    const result = await Swal.fire({
      title: 'Delete Booking?',
      text: 'Are you sure you want to delete this booking? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/bookings/${bookingId}`);
        Swal.fire({
          icon: 'success',
          title: 'Booking Deleted!',
          text: 'Your booking has been successfully deleted',
          timer: 2000,
          showConfirmButton: false
        });
        navigate(-1);
      } catch (err) {
        console.error('Error deleting booking:', err);
        Swal.fire({
          icon: 'error',
          title: 'Deletion Failed',
          text: err.message || 'Could not delete the booking',
          confirmButtonText: 'OK',
          confirmButtonColor: '#000000'
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Booking</h2>
          <p className="text-gray-600 mb-6">{error || 'No room information available'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <h1 className="text-lg font-semibold">
          {bookingId ? (isEditMode ? 'Edit Booking' : 'Booking Details') : 'New Booking'}
        </h1>

        {bookingId && !isEditMode ? (
          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center space-x-1 text-gray-600 hover:text-black"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">Edit</span>
          </button>
        ) : bookingId ? (
          <button
            onClick={() => setIsEditMode(false)}
            className="flex items-center space-x-1 text-gray-600 hover:text-black"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Cancel</span>
          </button>
        ) : (
          <div className="w-9"></div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-3xl mx-auto">
        {/* Room Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {room.photo ? (
              <img
                src={room.photo}
                alt={room.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl font-bold text-gray-600">
                  {room.name ? room.name.substring(0, 2).toUpperCase() : 'RM'}
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">{room.name}</h2>

            <div className="flex flex-wrap gap-3 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{room.location || 'Unknown location'}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                <span>Capacity: {room.capacity || 'N/A'}</span>
              </div>
            </div>

            {room.equipment && room.equipment.length > 0 && (
              <div className="mb-3">
                <div className="text-sm text-gray-600">
                  Equipment: {room.equipment.map((item, index) => {
                    const name = item.equipment?.name || item.name || 'Unknown';
                    const quantity = item.quantity;
                    return (
                      <span key={index}>
                        {index > 0 && ', '}
                        {name} ({quantity})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Date
            </label>
            <div className="relative">
              <DatePicker
                selected={formData.bookingDate}
                onChange={(date) => setFormData({ ...formData, bookingDate: date })}
                minDate={new Date()}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                disabled={!isEditMode && !!bookingId}
              />
              <Calendar className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <div className="relative">
                <input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleTimeChange('startTime', e)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black appearance-none"
                  disabled={!isEditMode && !!bookingId}
                  step="900" // 15-minute intervals
                  required
                />

              </div>
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <div className="relative">
                <input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleTimeChange('endTime', e)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black appearance-none"
                  disabled={!isEditMode && !!bookingId}
                  step="900" // 15-minute intervals
                  required
                />

              </div>
            </div>
          </div>
          {timeError && (
            <p className="text-red-500 text-sm mt-1">{timeError}</p>
          )}

          {/* Purpose */}
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
              rows={3}
              placeholder="Briefly describe the purpose of your booking..."
              disabled={!isEditMode && !!bookingId}
              required
            />
          </div>

          {/* Equipment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Equipment (Optional)
            </label>
            {room.equipment?.length > 0 ? (
              <div className="space-y-3">
                {room.equipment.map((item) => {
                  const name = item.equipment?.name || item.name || 'Unknown';
                  const selectedEquip = formData.requestedEquipment.find(e => e.name === name);
                  const isSelected = !!selectedEquip;
                  const requestedQuantity = selectedEquip?.requestedQuantity || 1;

                  return (
                    <div key={name} className="border border-gray-300 rounded-lg p-4">
                      {/* Equipment Header */}
                      <div className="flex items-center justify-between mb-2">
                        <button
                          type="button"
                          onClick={() => isEditMode || !bookingId ? handleEquipmentChange({
                            name: name,
                            quantity: item.quantity
                          }, 'toggle') : null}
                          className={`flex items-center space-x-2 transition-colors ${!isEditMode && bookingId ? 'cursor-default' : 'cursor-pointer'
                            }`}
                        >
                          <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${isSelected ? 'bg-black border-black' : 'border-gray-400'
                            }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="font-medium">{name}</span>
                        </button>
                        <span className="text-sm text-gray-500">{item.quantity} available</span>
                      </div>

                      {/* Quantity Selector (shown when selected) */}
                      {isSelected && (
                        <div className="mt-2 flex items-center space-x-3">
                          <label className="text-sm text-gray-600">Quantity needed:</label>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => isEditMode || !bookingId ? handleEquipmentChange({
                                name: name,
                                quantity: item.quantity,
                                requestedQuantity: Math.max(1, requestedQuantity - 1)
                              }, 'quantity') : null}
                              className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                              disabled={requestedQuantity <= 1 || (!isEditMode && bookingId)}
                            >
                              -
                            </button>

                            <span className="w-8 text-center font-medium">{requestedQuantity}</span>

                            <button
                              type="button"
                              onClick={() => isEditMode || !bookingId ? handleEquipmentChange({
                                name: name,
                                quantity: item.quantity,
                                requestedQuantity: Math.min(item.quantity, requestedQuantity + 1)
                              }, 'quantity') : null}
                              className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                              disabled={requestedQuantity >= item.quantity || (!isEditMode && bookingId)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No equipment available for this room</p>
            )}
          </div>

          {/* Equipment Notes Section */}
          <div>
            <label htmlFor="equipmentNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Equipment Notes (Optional)
            </label>
            <textarea
              id="equipmentNotes"
              value={formData.equipmentNotes}
              onChange={(e) => setFormData({ ...formData, equipmentNotes: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
              rows={2}
              placeholder="Request additional equipment or special arrangements..."
              disabled={!isEditMode && !!bookingId}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use this field to request equipment not listed above or specify special requirements.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {(isEditMode || !bookingId) && (
              <button
                type="submit"
                disabled={isSubmitting || timeError}
                className="flex-1 bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    {bookingId ? 'Updating...' : 'Booking...'}
                  </span>
                ) : (
                  <span>{bookingId ? 'Update Booking' : 'Confirm Booking'}</span>
                )}
              </button>
            )}

            {bookingId && !isEditMode && (
              <>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-100 text-red-600 py-3 px-6 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                  <span>Delete Booking</span>
                </button>

                {bookingDetails?.status === 'pending' && (
                  <button
                    type="button"
                    onClick={handleReject}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-600 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Booking</span>
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MakeBookingScreen;