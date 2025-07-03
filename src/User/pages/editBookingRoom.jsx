import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Check,
  Users, // Used for attendee count icon
  MapPin
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EditBookingScreen = () => {
  const { state } = useLocation();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeError, setTimeError] = useState(null);

  // Form state - attendees is now a number
  const [formData, setFormData] = useState({
    bookingDate: new Date(),
    startTime: '08:00',
    endTime: '09:00',
    purpose: '',
    requestedEquipment: [],
    equipmentNotes: '',
    numberOfAttendees: 0 // Changed to a number
  });

  const [room, setRoom] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (!bookingId) {
          navigate('/bookings');
          return;
        }

        const bookingResponse = await api.get(`/bookings/${bookingId}`);
        let bookingData = null;

        if (bookingResponse.data?.data) {
          bookingData = bookingResponse.data.data;
        } else if (bookingResponse.data && typeof bookingResponse.data === 'object') {
          bookingData = bookingResponse.data;
        } else if (Array.isArray(bookingResponse.data) && bookingResponse.data.length > 0) {
          bookingData = bookingResponse.data[0];
        }

        if (!bookingData || typeof bookingData !== 'object') {
          throw new Error('Booking data not found or is empty.');
        }

        setBooking(bookingData);

        const roomData = bookingData.roomId;
        if (!roomData) {
          throw new Error('Room information not found in booking data');
        }
        setRoom(roomData);

        setFormData({
          bookingDate: bookingData.bookingDate ? new Date(bookingData.bookingDate) : new Date(),
          startTime: bookingData.startTime || '08:00',
          endTime: bookingData.endTime || '09:00',
          purpose: bookingData.purpose || '',
          requestedEquipment: Array.isArray(bookingData.requestedEquipment) ? bookingData.requestedEquipment : [],
          equipmentNotes: bookingData.equipmentNotes || '',
          numberOfAttendees: bookingData.numberOfAttendees || 0 // Initialize from the numerical field
        });

      } catch (err) {
        console.error('Error fetching booking data:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load booking data';
        setError(errorMessage);

        Swal.fire({
          icon: 'error',
          title: 'Error Loading Booking',
          text: errorMessage,
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
  }, [bookingId, navigate]);

  useEffect(() => {
    const start = new Date(`2000/01/01 ${formData.startTime}`);
    const end = new Date(`2000/01/01 ${formData.endTime}`);

    if (start >= end) {
      setTimeError('End time must be after start time.');
    } else {
      setTimeError(null);
    }
  }, [formData.startTime, formData.endTime]);

  const handleTimeChange = (field, e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleEquipmentChange = (equip, action = 'toggle', newQuantity = 1) => {
    setFormData(prev => {
      const existingIndex = prev.requestedEquipment.findIndex(e => e.name === (equip.equipment?.name || equip.name));
      const equipName = equip.equipment?.name || equip.name;

      if (action === 'toggle') {
        if (existingIndex >= 0) {
          const newEquipment = [...prev.requestedEquipment];
          newEquipment.splice(existingIndex, 1);
          return { ...prev, requestedEquipment: newEquipment };
        } else {
          return {
            ...prev,
            requestedEquipment: [...prev.requestedEquipment, {
              name: equipName,
              quantity: equip.quantity,
              requestedQuantity: 1
            }]
          };
        }
      } else if (action === 'quantity') {
        if (existingIndex >= 0) {
          const newEquipment = [...prev.requestedEquipment];
          const totalAvailableQuantity = room.equipment.find(e => (e.equipment?.name || e.name) === equipName)?.quantity || 1;
          const safeQuantity = Math.min(newQuantity, totalAvailableQuantity);

          newEquipment[existingIndex] = {
            ...newEquipment[existingIndex],
            requestedQuantity: safeQuantity
          };
          return { ...prev, requestedEquipment: newEquipment };
        }
      }
      return prev;
    });
  };

  const validateForm = () => {
    if (timeError) {
      return timeError;
    }
    if (!formData.purpose.trim()) {
      return 'Please provide a purpose for the booking';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.bookingDate.setHours(0, 0, 0, 0) < today.getTime()) {
      return 'Booking date cannot be in the past.';
    }
    if (formData.numberOfAttendees < 0) {
        return 'Number of attendees cannot be negative.';
    }
    if (formData.numberOfAttendees > (room?.capacity || Infinity)) {
        return `Number of attendees (${formData.numberOfAttendees}) exceeds room capacity (${room?.capacity || 'N/A'}).`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: validationError,
        confirmButtonColor: '#000000'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const year = formData.bookingDate.getFullYear();
      const month = (formData.bookingDate.getMonth() + 1).toString().padStart(2, '0');
      const day = formData.bookingDate.getDate().toString().padStart(2, '0');
      const localBookingDate = `${year}-${month}-${day}`;

      const payload = {
        ...formData,
        bookingDate: localBookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfAttendees: Number(formData.numberOfAttendees), // Ensure it's a number
        requestedEquipment: formData.requestedEquipment.map(item => ({
          name: item.name,
          requestedQuantity: item.requestedQuantity
        }))
      };

      await api.patch(`/bookings/${bookingId}`, payload);

      Swal.fire({
        icon: 'success',
        title: 'Booking Updated!',
        text: 'Your booking has been successfully updated',
        timer: 2000,
        showConfirmButton: false
      });

      setTimeout(() => navigate(`/user-bookings`), 2000);
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update booking');

      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.message || err.message || 'Could not update the booking',
        confirmButtonText: 'OK',
        confirmButtonColor: '#000000'
      });
    } finally {
      setIsSubmitting(false);
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

  if (error || !room || !booking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Booking</h2>
          <p className="text-gray-600 mb-6">{error || 'No booking information available'}</p>
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

        <h1 className="text-lg font-semibold">Edit Booking</h1>

        <div className="w-12"></div> {/* Placeholder to keep title centered */}
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
                onError={(e) => e.target.style.display = 'none'}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl font-bold text-gray-600">
                  {room.name.substring(0, 2).toUpperCase()}
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

            {room.equipment?.length > 0 && (
              <div className="mb-3">
                <div className="text-sm text-gray-600">
                  Equipment: {room.equipment.map((item, index) => {
                    const name = item.equipment?.name || item.name || 'Unknown';
                    return (
                      <span key={index}>
                        {index > 0 && ', '}
                        {name} ({item.quantity})
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
              />
              <Calendar className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleTimeChange('startTime', e)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                />
                <Clock className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleTimeChange('endTime', e)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                />
                <Clock className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          {timeError && (
            <p className="text-red-500 text-sm mt-1">{timeError}</p>
          )}

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
              rows={3}
              placeholder="Briefly describe the purpose of your booking..."
              required
            />
          </div>

          {/* Number of Attendees */}
          <div>
            <label htmlFor="numberOfAttendees" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Attendees
            </label>
            <div className="relative">
              <input
                type="number"
                id="numberOfAttendees"
                value={formData.numberOfAttendees}
                onChange={(e) => setFormData({ ...formData, numberOfAttendees: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                placeholder="e.g., 10"
              />
              <Users className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
            {formData.numberOfAttendees > (room?.capacity || Infinity) && (
                <p className="text-red-500 text-sm mt-1">
                    Number of attendees ({formData.numberOfAttendees}) exceeds room capacity ({room?.capacity || 'N/A'}).
                </p>
            )}
            {formData.numberOfAttendees < 0 && (
                <p className="text-red-500 text-sm mt-1">
                    Number of attendees cannot be negative.
                </p>
            )}
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
                  const totalAvailableQuantity = item.quantity || 1;
                  const selectedEquip = formData.requestedEquipment.find(e => e.name === name);
                  const isSelected = !!selectedEquip;
                  const requestedQuantity = selectedEquip ? selectedEquip.requestedQuantity : 1;

                  return (
                    <div key={name} className="border border-gray-300 rounded-lg p-4 bg-white">
                      {/* Equipment Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div
                          onClick={() => handleEquipmentChange(item, 'toggle')}
                          className="flex items-center space-x-2 cursor-pointer hover:text-black transition-colors"
                        >
                          <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-black border-black'
                              : 'border-gray-400 hover:border-gray-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="font-medium text-gray-900">{name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {totalAvailableQuantity} available
                        </span>
                      </div>

                      {/* Quantity Selector (shown when selected) */}
                      {isSelected && (
                        <div className="mt-2 flex items-center space-x-3">
                          <label className="text-sm text-gray-600">Quantity needed:</label>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEquipmentChange(item, 'quantity', Math.max(1, requestedQuantity - 1))}
                              className={`w-8 h-8 border border-gray-300 rounded flex items-center justify-center transition-colors ${
                                requestedQuantity <= 1
                                  ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                  : 'hover:bg-gray-100 cursor-pointer'
                              }`}
                              disabled={requestedQuantity <= 1}
                            >
                              -
                            </button>

                            <span className="w-8 text-center font-medium text-gray-900">
                              {requestedQuantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleEquipmentChange(item, 'quantity', Math.min(totalAvailableQuantity, requestedQuantity + 1))}
                              className={`w-8 h-8 border border-gray-300 rounded flex items-center justify-center transition-colors ${
                                requestedQuantity >= totalAvailableQuantity
                                  ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                  : 'hover:bg-gray-100 cursor-pointer'
                              }`}
                              disabled={requestedQuantity >= totalAvailableQuantity}
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
              <p className="text-sm text-gray-500">No equipment available for this room.</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors flex items-center justify-center
              ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Updating Booking...
              </>
            ) : (
              <>
                <Edit className="w-5 h-5 mr-2" />
                Update Booking
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBookingScreen;