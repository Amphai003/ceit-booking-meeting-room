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
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

const MakeBookingScreen = () => {
  const { state } = useLocation();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    bookingDate: new Date(),
    startTime: '10:00',
    endTime: '12:00',
    purpose: '',
    requestedEquipment: []
  });

  // Available equipment options
  const [availableEquipment, setAvailableEquipment] = useState([
    { name: 'TV', quantity: 1 },
    { name: 'Monitor', quantity: 1 },
    { name: 'Mic', quantity: 2 },
    { name: 'Wifi', quantity: 1 }
  ]);

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
            startTime: booking.startTime,
            endTime: booking.endTime,
            purpose: booking.purpose,
            requestedEquipment: booking.requestedEquipment || []
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

  // Handle equipment selection
  const handleEquipmentChange = (equip) => {
    setFormData(prev => {
      const existingIndex = prev.requestedEquipment.findIndex(e => e.name === equip.name);
      
      if (existingIndex >= 0) {
        // Remove if already selected
        const newEquipment = [...prev.requestedEquipment];
        newEquipment.splice(existingIndex, 1);
        return { ...prev, requestedEquipment: newEquipment };
      } else {
        // Add to selection
        return { 
          ...prev, 
          requestedEquipment: [...prev.requestedEquipment, equip] 
        };
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        bookingDate: formData.bookingDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
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
        //    {/* Spacer for alignment */}
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
                <h3 className="text-sm font-medium text-gray-700 mb-1">Available Equipment:</h3>
                <div className="flex flex-wrap gap-2">
                  {room.equipment.map((item, index) => (
                    <div key={index} className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {item.name === 'Wifi' && <Wifi className="w-3 h-3 mr-1" />}
                      {item.name === 'TV' && <Monitor className="w-3 h-3 mr-1" />}
                      {item.name === 'Mic' && <Mic className="w-3 h-3 mr-1" />}
                      <span>{item.name} ({item.quantity})</span>
                    </div>
                  ))}
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
                onChange={(date) => setFormData({...formData, bookingDate: date})}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <div className="relative">
                <TimePicker
                  value={formData.startTime}
                  onChange={(time) => setFormData({...formData, startTime: time})}
                  disableClock={true}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  disabled={!isEditMode && !!bookingId}
                />
                <Clock className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <div className="relative">
                <TimePicker
                  value={formData.endTime}
                  onChange={(time) => setFormData({...formData, endTime: time})}
                  disableClock={true}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                  disabled={!isEditMode && !!bookingId}
                />
                <Clock className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableEquipment.map((equip) => {
                const isSelected = formData.requestedEquipment.some(e => e.name === equip.name);
                return (
                  <button
                    key={equip.name}
                    type="button"
                    onClick={() => isEditMode || !bookingId ? handleEquipmentChange(equip) : null}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isSelected 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 hover:border-gray-400'
                    } ${
                      !isEditMode && bookingId ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center">
                      {equip.name === 'Wifi' && <Wifi className="w-5 h-5 mr-2" />}
                      {equip.name === 'TV' && <Monitor className="w-5 h-5 mr-2" />}
                      {equip.name === 'Monitor' && <Monitor className="w-5 h-5 mr-2" />}
                      {equip.name === 'Mic' && <Mic className="w-5 h-5 mr-2" />}
                      <span>{equip.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm mr-2">{equip.quantity} available</span>
                      {isSelected ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 border border-gray-400 rounded-sm" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {(isEditMode || !bookingId) && (
              <button
                type="submit"
                disabled={isSubmitting}
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