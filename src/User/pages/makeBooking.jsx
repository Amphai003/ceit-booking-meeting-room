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
  Users,
  MapPin,
  Eye,
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Import the new RoomCalendarModal component
import RoomCalendarModal from '../component/RoomCalendarModal';

const MakeBookingScreen = () => {
  const { t, i18n } = useTranslation(); // Initialize translation hook

  const { state } = useLocation();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeError, setTimeError] = useState(null);
  const [attendeesError, setAttendeesError] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const formatTime = (timeString) => {
    if (!timeString) return '08:00';
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    bookingDate: new Date(),
    startTime: '08:00',
    endTime: '09:00',
    purpose: '',
    requestedEquipment: [],
    equipmentNotes: '',
    numberOfAttendees: 0,
  });

  const [room, setRoom] = useState(state?.room || null);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (bookingId) {
          const response = await api.get(`/bookings/${bookingId}`);
          setBookingDetails(response.data.data);

          const booking = response.data.data;
          setFormData({
            bookingDate: new Date(booking.bookingDate),
            startTime: formatTime(booking.startTime),
            endTime: formatTime(booking.endTime),
            purpose: booking.purpose || '',
            requestedEquipment: booking.requestedEquipment || [],
            equipmentNotes: booking.equipmentNotes || '',
            numberOfAttendees: booking.numberOfAttendees || 0,
          });

          if (!state?.room) {
            const roomResponse = await api.get(`/rooms/${booking.roomId._id}`);
            setRoom(roomResponse.data.data);
          } else {
            setRoom(state.room);
          }
          setIsEditMode(true);
        } else if (state?.room) {
          setRoom(state.room);
        } else {
          throw new Error(t('makeBookingScreen.noRoomInfoAvailable'));
        }
      } catch (err) {
        setError(err.message || t('makeBookingScreen.couldNotLoadBookingInfo'));
        console.error('Error:', err);

        Swal.fire({
          icon: 'error',
          title: t('makeBookingScreen.errorLoadingBooking'),
          text: err.message || t('makeBookingScreen.couldNotLoadBookingInfo'),
          confirmButtonText: t('makeBookingScreen.goBack'),
          confirmButtonColor: '#000000',
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        }).then(() => {
          navigate(-1);
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [bookingId, state, navigate, t, i18n]); // Added t and i18n to dependencies

  useEffect(() => {
    const start = new Date(`2000/01/01 ${formData.startTime}`);
    const end = new Date(`2000/01/01 ${formData.endTime}`);

    if (start >= end) {
      setTimeError(t('makeBookingScreen.endTimeAfterStartTimeError'));
    } else {
      setTimeError(null);
    }
  }, [formData.startTime, formData.endTime, t]); // Added t to dependencies

  useEffect(() => {
    if (room && formData.numberOfAttendees > room.capacity) {
      setAttendeesError(t('makeBookingScreen.attendeesExceedCapacityError', { current: formData.numberOfAttendees, max: room.capacity }));
    } else if (formData.numberOfAttendees < 0) {
      setAttendeesError(t('makeBookingScreen.attendeesNegativeError'));
    } else {
      setAttendeesError(null);
    }
  }, [formData.numberOfAttendees, room, t]); // Added t to dependencies

  const handleEquipmentChange = (equip, action = 'toggle') => {
    setFormData((prev) => {
      const existingIndex = prev.requestedEquipment.findIndex((e) => e.name === equip.name);

      if (action === 'toggle') {
        if (existingIndex >= 0) {
          const newEquipment = [...prev.requestedEquipment];
          newEquipment.splice(existingIndex, 1);
          return { ...prev, requestedEquipment: newEquipment };
        } else {
          return {
            ...prev,
            requestedEquipment: [...prev.requestedEquipment, { ...equip, requestedQuantity: 1 }],
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

  const handleTimeChange = (field, e) => {
    const time = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: formatTime(time) }));
  };

  const handleAttendeesChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFormData((prev) => ({ ...prev, numberOfAttendees: isNaN(value) ? '' : value }));
  };

  const handleSelectTimeFromCalendar = (selectedSlot) => {
    setFormData((prev) => ({
      ...prev,
      startTime: selectedSlot,
      endTime: formatTime(
        (parseInt(selectedSlot.split(':')[0], 10) + 1).toString() + ':' + selectedSlot.split(':')[1]
      ), // Set end time to 1 hour after start
    }));
    setShowCalendarModal(false); // Close the modal after selection
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (timeError || attendeesError) {
      Swal.fire({
        icon: 'error',
        title: t('makeBookingScreen.validationError'),
        text: timeError || attendeesError,
        confirmButtonText: t('bookingScreen.okButton'),
        confirmButtonColor: '#000000',
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingDate = new Date(formData.bookingDate);

      const year = bookingDate.getFullYear();
      const month = (bookingDate.getMonth() + 1).toString().padStart(2, '0');
      const day = bookingDate.getDate().toString().padStart(2, '0');

      const localBookingDate = `${year}-${month}-${day}`;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const selectedDate = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());

      if (selectedDate < today) {
        Swal.fire({
          icon: 'error',
          title: t('makeBookingScreen.invalidDate'),
          text: t('makeBookingScreen.cannotBookPastDate'),
          confirmButtonText: t('bookingScreen.okButton'),
          confirmButtonColor: '#000000',
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
        setIsSubmitting(false);
        return;
      }

      if (selectedDate.getTime() === today.getTime()) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [startHour, startMinute] = formData.startTime.split(':').map(Number);
        const startTimeInMinutes = startHour * 60 + startMinute;

        if (startTimeInMinutes <= currentMinutes) {
          Swal.fire({
            icon: 'error',
            title: t('makeBookingScreen.invalidTime'),
            text: t('makeBookingScreen.cannotBookPastTime'),
            confirmButtonText: t('bookingScreen.okButton'),
            confirmButtonColor: '#000000',
            customClass: {
              popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
              title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
              htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
              confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
            }
          });
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        ...formData,
        bookingDate: localBookingDate,
        startTime: formatTime(formData.startTime),
        endTime: formatTime(formData.endTime),
        numberOfAttendees: parseInt(formData.numberOfAttendees) || 0,
      };

      let response;

      if (bookingId) {
        response = await api.patch(`/bookings/${bookingId}`, payload);
        Swal.fire({
          icon: 'success',
          title: t('makeBookingScreen.bookingUpdated'),
          text: t('makeBookingScreen.bookingUpdatedText'),
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
      } else {
        response = await api.post(`/rooms/${room._id}/booking`, payload);
        Swal.fire({
          icon: 'success',
          title: t('makeBookingScreen.bookingCreated'),
          text: t('makeBookingScreen.bookingCreatedText'),
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
      }

      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      console.error('Error submitting booking:', err);
      const errorMessage = err.response?.data?.message || err.message || t('makeBookingScreen.couldNotProcessBooking');

      Swal.fire({
        icon: 'error',
        title: t('makeBookingScreen.bookingFailed'),
        text: errorMessage,
        confirmButtonText: t('bookingScreen.okButton'),
        confirmButtonColor: '#000000',
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!bookingId) return;

    const result = await Swal.fire({
      title: t('makeBookingScreen.rejectBookingConfirmationTitle'),
      text: t('makeBookingScreen.rejectBookingConfirmationText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: t('makeBookingScreen.yesRejectIt'),
      customClass: {
        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        cancelButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
      }
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/bookings/${bookingId}/reject`);
        Swal.fire({
          icon: 'success',
          title: t('makeBookingScreen.bookingRejected'),
          text: t('makeBookingScreen.bookingRejectedText'),
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
        navigate(-1);
      } catch (err) {
        console.error('Error rejecting booking:', err);
        Swal.fire({
          icon: 'error',
          title: t('makeBookingScreen.rejectionFailed'),
          text: err.response?.data?.message || err.message || t('makeBookingScreen.couldNotRejectBooking'),
          confirmButtonText: t('bookingScreen.okButton'),
          confirmButtonColor: '#000000',
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!bookingId) return;

    const result = await Swal.fire({
      title: t('makeBookingScreen.deleteBookingConfirmationTitle'),
      text: t('makeBookingScreen.deleteBookingConfirmationText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: t('makeBookingScreen.yesDeleteIt'),
      customClass: {
        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        cancelButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
      }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/bookings/${bookingId}`);
        Swal.fire({
          icon: 'success',
          title: t('makeBookingScreen.bookingDeleted'),
          text: t('makeBookingScreen.bookingDeletedText'),
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
        navigate(-1);
      } catch (err) {
        console.error('Error deleting booking:', err);
        Swal.fire({
          icon: 'error',
          title: t('makeBookingScreen.deletionFailed'),
          text: err.response?.data?.message || err.message || t('makeBookingScreen.couldNotDeleteBooking'),
          confirmButtonText: t('bookingScreen.okButton'),
          confirmButtonColor: '#000000',
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className={`text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('makeBookingScreen.loadingBookingDetails')}</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className={`text-xl font-semibold mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('makeBookingScreen.errorLoadingBooking')}</h2>
          <p className={`text-gray-600 mb-6 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{error || t('makeBookingScreen.noRoomInfoAvailable')}</p>
          <button
            onClick={() => navigate(-1)}
            className={`bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}
          >
            {t('makeBookingScreen.goBack')}
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
          className={`flex items-center space-x-2 text-gray-600 hover:text-black ${i18n.language === 'lo' ? 'font-lao' : ''}`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t('makeBookingScreen.backButton')}</span>
        </button>

        <h1 className={`text-lg font-semibold ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
          {bookingId ? (isEditMode ? t('makeBookingScreen.editBooking') : t('makeBookingScreen.bookingDetails')) : t('makeBookingScreen.newBooking')}
        </h1>

        {bookingId && !isEditMode ? (
          <button
            onClick={() => setIsEditMode(true)}
            className={`flex items-center space-x-1 text-gray-600 hover:text-black ${i18n.language === 'lo' ? 'font-lao' : ''}`}
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">{t('makeBookingScreen.editButton')}</span>
          </button>
        ) : bookingId ? (
          <button
            onClick={() => setIsEditMode(false)}
            className={`flex items-center space-x-1 text-gray-600 hover:text-black ${i18n.language === 'lo' ? 'font-lao' : ''}`}
          >
            <X className="w-4 h-4" />
            <span className="text-sm">{t('makeBookingScreen.cancelButton')}</span>
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
                <div className={`text-4xl font-bold text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                  {room.name ? room.name.substring(0, 2).toUpperCase() : 'RM'}
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            <h2 className={`text-xl font-semibold mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{room.name}</h2>

            <div className="flex flex-wrap gap-3 mb-3">
              <div className={`flex items-center text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                <MapPin className="w-4 h-4 mr-1" />
                <span>{room.location || t('makeBookingScreen.unknownLocation')}</span>
              </div>

              <div className={`flex items-center text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                <Users className="w-4 h-4 mr-1" />
                <span>{t('makeBookingScreen.capacity')} {room.capacity || 'N/A'}</span>
              </div>
            </div>

            {room.equipment && room.equipment.length > 0 && (
              <div className="mb-3">
                <div className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                  {t('makeBookingScreen.equipment')} {room.equipment.map((item, index) => {
                    const name = item.equipment?.name || item.name || t('makeBookingScreen.unknown');
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
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('makeBookingScreen.bookingDate')}
            </label>
            <div className="relative">
              <DatePicker
                selected={formData.bookingDate}
                onChange={(date) => setFormData({ ...formData, bookingDate: date })}
                minDate={new Date()}
                className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                disabled={!isEditMode && !!bookingId}
              />
              <Calendar className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className={`block text-sm font-medium text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {t('makeBookingScreen.startTime')}
              </label>
              <div className="relative">
                <input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleTimeChange('startTime', e)}
                  className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black appearance-none ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                  disabled={!isEditMode && !!bookingId}
                  step="900" // 15-minute intervals
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="endTime" className={`block text-sm font-medium text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {t('makeBookingScreen.endTime')}
              </label>
              <div className="relative">
                <input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleTimeChange('endTime', e)}
                  className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black appearance-none ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                  disabled={!isEditMode && !!bookingId}
                  step="900" // 15-minute intervals
                  required
                />
              </div>
            </div>
          </div>
          {timeError && (
            <p className={`text-red-500 text-sm mt-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{timeError}</p>
          )}

          {/* View Calendar Button */}
          {(isEditMode || !bookingId) && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowCalendarModal(true)}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                {t('makeBookingScreen.viewAvailabilityCalendar')}
              </button>
            </div>
          )}

          {/* Number of Attendees Input */}
          <div>
            <label htmlFor="numberOfAttendees" className={`block text-sm font-medium text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('makeBookingScreen.numberOfAttendees')}
            </label>
            <input
              id="numberOfAttendees"
              type="number"
              value={formData.numberOfAttendees}
              onChange={handleAttendeesChange}
              min="0"
              max={room.capacity}
              className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              disabled={!isEditMode && !!bookingId}
              required
            />
            {attendeesError && (
              <p className={`text-red-500 text-sm mt-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{attendeesError}</p>
            )}
            <p className={`text-xs text-gray-500 mt-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('makeBookingScreen.attendeesHint', { capacity: room.capacity })}
            </p>
          </div>

          {/* Purpose */}
          <div>
            <label htmlFor="purpose" className={`block text-sm font-medium text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('makeBookingScreen.purpose')}
            </label>
            <textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              rows={3}
              placeholder={t('makeBookingScreen.purposePlaceholder')}
              disabled={!isEditMode && !!bookingId}
              required
            />
          </div>

          {/* Equipment Selection */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('makeBookingScreen.requestEquipmentOptional')}
            </label>
            {room.equipment?.length > 0 ? (
              <div className="space-y-3">
                {room.equipment.map((item) => {
                  const name = item.equipment?.name || item.name || t('makeBookingScreen.unknown');
                  const selectedEquip = formData.requestedEquipment.find((e) => e.name === name);
                  const isSelected = !!selectedEquip;
                  const requestedQuantity = selectedEquip?.requestedQuantity || 1;

                  return (
                    <div key={name} className="border border-gray-300 rounded-lg p-4">
                      {/* Equipment Header */}
                      <div className="flex items-center justify-between mb-2">
                        <button
                          type="button"
                          onClick={() =>
                            isEditMode || !bookingId
                              ? handleEquipmentChange(
                                {
                                  name: name,
                                  quantity: item.quantity,
                                },
                                'toggle'
                              )
                              : null
                          }
                          className={`flex items-center space-x-2 transition-colors ${!isEditMode && bookingId ? 'cursor-default' : 'cursor-pointer'
                            } ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                        >
                          <div
                            className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${isSelected ? 'bg-black border-black' : 'border-gray-400'
                              }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="font-medium">{name}</span>
                        </button>
                        <span className={`text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{item.quantity} {t('makeBookingScreen.available')}</span>
                      </div>

                      {/* Quantity Selector (shown when selected) */}
                      {isSelected && (
                        <div className="mt-2 flex items-center space-x-3">
                          <label className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('makeBookingScreen.quantityNeeded')}</label>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                isEditMode || !bookingId
                                  ? handleEquipmentChange(
                                    {
                                      name: name,
                                      quantity: item.quantity,
                                      requestedQuantity: Math.max(1, requestedQuantity - 1),
                                    },
                                    'quantity'
                                  )
                                  : null
                              }
                              className={`w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                              disabled={requestedQuantity <= 1 || (!isEditMode && bookingId)}
                            >
                              -
                            </button>

                            <span className={`w-8 text-center font-medium ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{requestedQuantity}</span>

                            <button
                              type="button"
                              onClick={() =>
                                isEditMode || !bookingId
                                  ? handleEquipmentChange(
                                    {
                                      name: name,
                                      quantity: item.quantity,
                                      requestedQuantity: Math.min(item.quantity, requestedQuantity + 1),
                                    },
                                    'quantity'
                                  )
                                  : null
                              }
                              className={`w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
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
              <p className={`text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('makeBookingScreen.noEquipmentAvailable')}</p>
            )}
          </div>

          {/* Equipment Notes Section */}
          <div>
            <label htmlFor="equipmentNotes" className={`block text-sm font-medium text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('makeBookingScreen.additionalEquipmentNotesOptional')}
            </label>
            <textarea
              id="equipmentNotes"
              value={formData.equipmentNotes}
              onChange={(e) => setFormData({ ...formData, equipmentNotes: e.target.value })}
              className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              rows={2}
              placeholder={t('makeBookingScreen.additionalEquipmentNotesPlaceholder')}
              disabled={!isEditMode && !!bookingId}
            />
            <p className={`text-xs text-gray-500 mt-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('makeBookingScreen.additionalEquipmentNotesHint')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {(isEditMode || !bookingId) && (
              <button
                type="submit"
                disabled={isSubmitting || timeError || attendeesError}
                className={`flex-1 bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    {bookingId ? t('makeBookingScreen.updating') : t('makeBookingScreen.booking')}
                  </span>
                ) : (
                  <span>{bookingId ? t('makeBookingScreen.updateBooking') : t('makeBookingScreen.confirmBooking')}</span>
                )}
              </button>
            )}

            {bookingId && !isEditMode && (
              <>
                <button
                  type="button"
                  onClick={handleDelete}
                  className={`flex-1 flex items-center justify-center space-x-2 bg-red-100 text-red-600 py-3 px-6 rounded-lg hover:bg-red-200 transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                >
                  <Trash className="w-4 h-4" />
                  <span>{t('makeBookingScreen.deleteBooking')}</span>
                </button>

                {bookingDetails?.status === 'pending' && (
                  <button
                    type="button"
                    onClick={handleReject}
                    className={`flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-600 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                  >
                    <X className="w-4 h-4" />
                    <span>{t('makeBookingScreen.rejectBooking')}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && room && (
        <RoomCalendarModal
          room={room}
          initialSelectedDate={formData.bookingDate} // Pass the current booking date
          onClose={() => setShowCalendarModal(false)}
          onTimeSelect={handleSelectTimeFromCalendar}
        />
      )}
    </div>
  );
};

export default MakeBookingScreen;