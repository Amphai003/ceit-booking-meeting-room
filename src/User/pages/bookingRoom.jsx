import React, { useEffect, useState } from 'react';
import api from '../../api';
import Swal from 'sweetalert2';
import {
  MapPin, Wifi, Monitor, Mic,
  Clock, CheckCircle, XCircle, AlertCircle, Calendar, Edit, Play, CheckSquare, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import html2pdf from 'html2pdf.js'; // Import html2pdf.js

const StatusBadge = ({ status }) => {
  const { t, i18n } = useTranslation();

  const statusConfig = {
    confirmed: {
      icon: CheckCircle, color: 'text-green-600',
      bg: 'bg-green-50', border: 'border-green-200', text: 'Confirmed'
    },
    approved: {
      icon: CheckCircle, color: 'text-green-600',
      bg: 'bg-green-50', border: 'border-green-200', text: 'Approved'
    },
    pending: {
      icon: AlertCircle, color: 'text-yellow-600',
      bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'Pending'
    },
    completed: {
      icon: CheckCircle, color: 'text-blue-600',
      bg: 'bg-blue-50', border: 'border-blue-200', text: 'Completed'
    },
    cancelled: {
      icon: XCircle, color: 'text-red-600',
      bg: 'bg-red-50', border: 'border-red-200', text: 'Cancelled'
    },
    rejected: {
      icon: XCircle, color: 'text-red-600',
      bg: 'bg-red-50', border: 'border-red-200', text: 'Rejected'
    }
  };
  const config = statusConfig[status];
  if (!config) return null;
  const Icon = config.icon;

  const translatedText = t(`bookingScreen.${status}Status`, { defaultValue: config.text });

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg} ${config.border} border ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
      <Icon className="w-3 h-3 mr-1" />
      {translatedText}
    </div>
  );
};

const AvailabilityBadge = ({ booking }) => {
  const { t, i18n } = useTranslation();

  const getCurrentAvailability = (booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.bookingDate);
    const today = new Date();

    const isToday = bookingDate.toDateString() === today.toDateString();

    if (!isToday || (booking.status !== 'approved' && booking.status !== 'confirmed')) {
      return null;
    }

    const [startHours, startMinutes] = booking.startTime.split(':').map(Number);
    const [endHours, endMinutes] = booking.endTime.split(':').map(Number);

    const startTime = new Date(today);
    startTime.setHours(startHours, startMinutes, 0, 0);

    const endTime = new Date(today);
    endTime.setHours(endHours, endMinutes, 0, 0);

    const currentTime = now.getTime();
    const startTimeMs = startTime.getTime();
    const endTimeMs = endTime.getTime();

    if (currentTime >= startTimeMs && currentTime <= endTimeMs) {
      const remainingMs = endTimeMs - currentTime;
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));

      return {
        status: 'in-progress',
        text: t('bookingScreen.meetingInProgress', { count: remainingMinutes }),
        icon: Play,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      };
    } else if (currentTime < startTimeMs) {
      const timeToStart = startTimeMs - currentTime;
      const minutesToStart = Math.ceil(timeToStart / (1000 * 60));

      if (minutesToStart <= 15) {
        return {
          status: 'starting-soon',
          text: t('bookingScreen.startingIn', { count: minutesToStart }),
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200'
        };
      }
    } else {
      return {
        status: 'ready',
        text: t('bookingScreen.roomReadyToBook'),
        icon: CheckSquare,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200'
      };
    }

    return null;
  };

  const availability = getCurrentAvailability(booking);

  if (!availability) return null;

  const Icon = availability.icon;

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${availability.color} ${availability.bg} ${availability.border} border ml-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
      <Icon className="w-3 h-3 mr-1" />
      {availability.text}
    </div>
  );
};

const BookingCard = ({ booking, onManage, onCancel, onEdit }) => {
  const [imageError, setImageError] = useState(false);
  const { t, i18n } = useTranslation();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'lo' ? 'lo-LA' : 'en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatTimeRange = (dateString, startTime, endTime) => {
    const date = new Date(dateString);
    const [startHours, startMinutes] = startTime.split(':');
    const [endHours, endMinutes] = endTime.split(':');

    date.setHours(startHours, startMinutes);
    const start = date.toLocaleTimeString(i18n.language === 'lo' ? 'lo-LA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    date.setHours(endHours, endMinutes);
    const end = date.toLocaleTimeString(i18n.language === 'lo' ? 'lo-LA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    return `${start} - ${end}`;
  };

  const calculateDuration = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    let hours = endHours - startHours;
    let minutes = endMinutes - startMinutes;

    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }

    if (hours < 0) {
      hours += 24;
    }

    if (hours === 0) {
      return t('bookingScreen.minutesLeft', { count: minutes });
    } else if (minutes === 0) {
      return t('bookingScreen.hoursOnly', { count: hours });
    } else {
      return t('bookingScreen.hoursAndMinutes', { hours: hours, minutes: minutes });
    }
  };

  const isToday = () => {
    const today = new Date();
    const bookingDate = new Date(booking.bookingDate);
    return bookingDate.toDateString() === today.toDateString();
  };

  const canCancel = booking.status === 'confirmed' || booking.status === 'pending';

  const now = new Date();
  const bookingDate = new Date(booking.bookingDate);
  const [startHours, startMinutes] = booking.startTime.split(':').map(Number);

  const meetingStartDateTime = new Date(bookingDate);
  meetingStartDateTime.setHours(startHours, startMinutes, 0, 0);

  const hasMeetingStarted = now > meetingStartDateTime;

  const canEdit = (booking.status === 'confirmed' || booking.status === 'pending') && !hasMeetingStarted;

  const getRoomPhotoUrl = () => {
    if (booking.roomId?.photos && Array.isArray(booking.roomId.photos) && booking.roomId.photos.length > 0) {
      return booking.roomId.photos[0];
    }
    if (booking.roomId?.photo) {
      return booking.roomId.photo;
    }
    if (booking.roomId?.image) {
      return booking.roomId.image;
    }
    if (booking.roomId?.images && Array.isArray(booking.roomId.images) && booking.roomId.images.length > 0) {
      return booking.roomId.images[0];
    }
    return null;
  };

  const photoUrl = getRoomPhotoUrl();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="relative">
        {photoUrl && !imageError ? (
          <div className="aspect-video bg-gray-100 relative overflow-hidden">
            <img
              src={photoUrl}
              alt={booking.roomId?.name || t('roomCard.unnamedRoom')}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <Monitor className="w-12 h-12 mx-auto mb-2 opacity-60" />
                <p className={`text-sm font-medium opacity-80 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                  {booking.roomId?.name || t('roomCard.unnamedRoom')}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center">
          <StatusBadge status={booking.status} />
          {isToday() && <AvailabilityBadge booking={booking} />}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-semibold text-lg text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            {booking.roomId?.name || t('roomCard.unnamedRoom')}
          </h3>
          <span className={`text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>#{booking._id.slice(-6).toUpperCase()}</span>
        </div>

        {booking.roomId?.location && (
          <div className={`flex items-center text-gray-600 text-sm mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            <MapPin className="w-4 h-4 mr-1" />
            {booking.roomId.location}
          </div>
        )}

        <div className={`flex items-center text-gray-600 text-sm mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
          <Calendar className="w-4 h-4 mr-1" />
          {formatDate(booking.bookingDate)}
          {isToday() && <span className="ml-2 text-blue-600 font-medium">{t('bookingScreen.today')}</span>}
        </div>

        <div className={`flex items-center text-gray-600 text-sm mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
          <Clock className="w-4 h-4 mr-1" />
          {formatTimeRange(booking.bookingDate, booking.startTime, booking.endTime)}
          ({calculateDuration(booking.startTime, booking.endTime)})
        </div>

        <div className={`flex items-center text-gray-600 text-sm mb-3 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
          <Users className="w-4 h-4 mr-1" />
          {booking.numberOfAttendees || booking.attendees || t('bookingScreen.notSpecified')} {t('roomCard.capacityUnit')} ({t('bookingScreen.capacityLabel')} {booking.roomId?.capacity || t('bookingScreen.notSpecified')})
        </div>

        {booking.purpose && (
          <div className="mb-3">
            <p className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              <span className="font-medium">{t('bookingScreen.purposeLabel')}</span> {booking.purpose}
            </p>
          </div>
        )}

        {booking.requestedEquipment?.length > 0 && (
          <div className="mb-3">
            <p className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              <span className="font-medium">{t('bookingScreen.requestedEquipmentLabel')}</span> {booking.requestedEquipment.map((item, index) => {
                const name = item.name || t('bookingScreen.unknown');
                const quantity = item.quantity || item.requestedQuantity || 1;
                return (
                  <span key={index}>
                    {index > 0 && ', '}
                    {name} ({quantity})
                  </span>
                );
              })}
            </p>
          </div>
        )}

        {booking.notes && (
          <div className="mb-3">
            <p className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              <span className="font-medium">{t('bookingScreen.notesLabel')}</span> {booking.notes}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={() => onManage(booking)}
            className={`bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
          >
            {t('bookingScreen.viewDetailsButton')}
          </button>

          <div className="flex space-x-2">
            {canEdit && (
              <button
                onClick={() => onEdit(booking)}
                className={`bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 flex items-center ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              >
                <Edit className="w-4 h-4 mr-1" />
                {t('bookingScreen.editButton')}
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => onCancel(booking)}
                className={`bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              >
                {t('bookingScreen.cancelButton')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        let endpoint = '/bookings/me';

        if (activeFilter === 'history') {
          endpoint = '/bookings/me/history';
        }

        const response = await api.get(endpoint);
        setBookings(response.data.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        Swal.fire({
          title: t('bookingScreen.fetchErrorTitle'),
          text: t('bookingScreen.fetchErrorText'),
          icon: 'error',
          customClass: {
            title: i18n.language === 'lo' ? 'font-lao' : '',
            htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
            confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    const interval = setInterval(fetchBookings, 60000);

    return () => clearInterval(interval);
  }, [activeFilter, t, i18n.language]);

  const handlePrintBookingDetails = (booking) => {
    const userName = booking.userId ? `${booking.userId.firstName || ''} ${booking.userId.lastName || ''}`.trim() : t('bookingScreen.notSpecified');
    const userPhone = booking.userId?.phoneNumber || t('bookingScreen.notSpecified');

    const element = document.createElement('div');
    element.className = `text-left p-6 bg-white rounded-lg shadow-lg ${i18n.language === 'lo' ? 'font-lao' : ''}`;
    element.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">${t('bookingScreen.bookingDetailsTitle')}</h2>
      <p class="mb-2"><strong>${t('bookingScreen.roomLabel')}:</strong> ${booking.roomId?.name || t('bookingScreen.notSpecified')}</p>
      <p class="mb-2"><strong>${t('bookingScreen.bookingIdLabel')}:</strong> #${booking._id.slice(-6).toUpperCase()}</p>
      <p class="mb-2"><strong>${t('bookingScreen.bookedByLabel')}:</strong> ${userName}</p>
      <p class="mb-2"><strong>${t('bookingScreen.contactPhoneLabel')}:</strong> ${userPhone}</p>
      <p class="mb-2"><strong>${t('bookingScreen.dateLabel')}:</strong> ${new Date(booking.bookingDate).toLocaleDateString(i18n.language === 'lo' ? 'lo-LA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p class="mb-2"><strong>${t('bookingScreen.timeLabel')}:</strong> ${booking.startTime} - ${booking.endTime}</p>
      <p class="mb-2"><strong>${t('bookingScreen.statusLabel')}:</strong> <span class="capitalize">${t(`bookingScreen.${booking.status}Status`, { defaultValue: booking.status })}</span></p>
      <p class="mb-2"><strong>${t('bookingScreen.purposeLabel')}:</strong> ${booking.purpose || t('bookingScreen.notSpecified')}</p>
      <p class="mb-2"><strong>${t('bookingScreen.attendeesLabel')}:</strong> ${booking.numberOfAttendees || t('bookingScreen.notSpecified')} ${t('roomCard.capacityUnit')} (${t('bookingScreen.capacityLabel')} ${booking.roomId?.capacity || t('bookingScreen.notSpecified')})</p>
      ${booking.requestedEquipment?.length ? `
        <div class="mb-2">
          <p class="mb-1"><strong>${t('bookingScreen.requestedEquipmentLabel')}:</strong></p>
          <ul class="list-disc pl-5">
            ${booking.requestedEquipment.map(item => {
              const name = item.name || t('bookingScreen.unknown');
              const quantity = item.quantity || item.requestedQuantity || 1;
              return `<li>${name} (${quantity})</li>`;
            }).join('')}
          </ul>
        </div>
      ` : `<p class="mb-2">${t('bookingScreen.noEquipmentRequested')}</p>`}
      ${booking.notes ? `<p class="mb-2"><strong>${t('bookingScreen.notesLabel')}:</strong> ${booking.notes}</p>` : ''}
    `;

    const opt = {
      margin: 10,
      filename: `booking_details_${booking._id.slice(-6).toUpperCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const handleManage = (booking) => {
    const userName = booking.userId ? `${booking.userId.firstName || ''} ${booking.userId.lastName || ''}`.trim() : t('bookingScreen.notSpecified');
    const userPhone = booking.userId?.phoneNumber || t('bookingScreen.notSpecified');

    Swal.fire({
      title: t('bookingScreen.bookingDetailsTitle'),
      html: `
      <div id="booking-details-content" class="text-left ${i18n.language === 'lo' ? 'font-lao' : ''}">
        <p><strong>${t('bookingScreen.roomLabel')}:</strong> ${booking.roomId?.name || t('bookingScreen.notSpecified')}</p>
        <p><strong>${t('bookingScreen.dateLabel')}:</strong> ${new Date(booking.bookingDate).toLocaleDateString(i18n.language === 'lo' ? 'lo-LA' : 'en-US')}</p>
        <p><strong>${t('bookingScreen.timeLabel')}:</strong> ${booking.startTime} - ${booking.endTime}</p>
        <p><strong>${t('bookingScreen.statusLabel')}:</strong> ${t(`bookingScreen.${booking.status}Status`, { defaultValue: booking.status })}</p>
        <p><strong>${t('bookingScreen.bookedByLabel')}:</strong> ${userName}</p>
        <p><strong>${t('bookingScreen.contactPhoneLabel')}:</strong> ${userPhone}</p>
        <p><strong>${t('bookingScreen.purposeLabel')}:</strong> ${booking.purpose || t('bookingScreen.notSpecified')}</p>
        <p><strong>${t('bookingScreen.attendeesLabel')}</strong> ${booking.numberOfAttendees || t('bookingScreen.notSpecified')} ${t('roomCard.capacityUnit')} (${t('bookingScreen.capacityLabel')} ${booking.roomId?.capacity || t('bookingScreen.notSpecified')})</p>
        ${booking.requestedEquipment?.length ? `
          <p><strong>${t('bookingScreen.requestedEquipmentLabel')}</strong></p>
          <ul class="list-disc pl-5">
            ${booking.requestedEquipment.map(item => {
              const name = item.name || t('bookingScreen.unknown');
              const quantity = item.quantity || item.requestedQuantity || 1;
              return `<li>${name} (${quantity})</li>`;
            }).join('')}
          </ul>
        ` : `<p>${t('bookingScreen.noEquipmentRequested')}</p>`}
        ${booking.notes ? `<p><strong>${t('bookingScreen.notesLabel')}</strong> ${booking.notes}</p>` : ''}
      </div>
      `,
      confirmButtonText: t('bookingScreen.closeButton'),
      showCancelButton: true,
      cancelButtonText: t('bookingScreen.printButton'),
      cancelButtonColor: '#007bff',
      reverseButtons: true,
      customClass: {
        title: i18n.language === 'lo' ? 'font-lao' : '',
        htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
        confirmButton: i18n.language === 'lo' ? 'font-lao' : '',
        cancelButton: i18n.language === 'lo' ? 'font-lao' : ''
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        handlePrintBookingDetails(booking);
      }
    });
  };

  const handleEdit = (booking) => {
    navigate(`/bookings/edit/${booking._id}`, {
      state: {
        room: booking.roomId,
        booking: booking
      }
    });
  };

  const handleCancel = async (booking) => {
    const result = await Swal.fire({
      title: t('bookingScreen.cancelBookingConfirmationTitle', { bookingId: booking._id.slice(-6).toUpperCase() }),
      text: t('bookingScreen.cancelBookingConfirmationText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: t('bookingScreen.yesCancelIt'),
      cancelButtonText: t('userHomeScreen.cancel'),
      customClass: {
        title: i18n.language === 'lo' ? 'font-lao' : '',
        htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
        confirmButton: i18n.language === 'lo' ? 'font-lao' : '',
        cancelButton: i18n.language === 'lo' ? 'font-lao' : ''
      }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/bookings/${booking._id}`);

        setBookings(prev => prev.map(b =>
          b._id === booking._id ? { ...b, status: 'cancelled' } : b
        ));

        Swal.fire({
          title: t('bookingScreen.cancelledTitle'),
          text: t('bookingScreen.cancelledSuccessText'),
          icon: 'success',
          customClass: {
            title: i18n.language === 'lo' ? 'font-lao' : '',
            htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
            confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
          }
        });
      } catch (err) {
        Swal.fire({
          title: t('bookingScreen.cancelErrorTitle'),
          text: t('bookingScreen.cancelErrorText'),
          icon: 'error',
          customClass: {
            title: i18n.language === 'lo' ? 'font-lao' : '',
            htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
            confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
          }
        });
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const searchMatch =
      (booking.roomId?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.roomId?.location?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking._id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.purpose?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeFilter === 'history') return searchMatch;

    return searchMatch;
  });

  const filterTabs = [
    { key: 'all', label: t('bookingScreen.allBookingsTab') },
    { key: 'history', label: t('bookingScreen.historyTab') }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        <p className={i18n.language === 'lo' ? 'font-lao' : ''}>{t('bookingScreen.loadingBookings')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4 text-center max-w-5xl mx-auto">
          <h1 className={`text-2xl font-bold text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('bookingScreen.myBookingsHeader')}</h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex space-x-2 overflow-x-auto sticky top-[72px] z-30 max-w-5xl mx-auto w-full">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === tab.key ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${i18n.language === 'lo' ? 'font-lao' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-[128px] z-20 max-w-5xl mx-auto w-full">
        <input
          type="text"
          placeholder={t('bookingScreen.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-4 py-3 bg-gray-50 rounded-full text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
        />
      </div>

      {/* Booking Cards Grid */}
      <div className="flex-1 px-4 py-4 w-full max-w-5xl mx-auto">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Calendar className="w-16 h-16 mb-4" />
            <h3 className={`text-xl font-semibold ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('bookingScreen.noBookingsFound')}</h3>
            <p className={i18n.language === 'lo' ? 'font-lao' : ''}>{searchQuery ? t('bookingScreen.tryDifferentSearch') : t('bookingScreen.noBookingsYet')}</p>
          </div>
        ) : (
          <>
            <p className={`text-sm text-gray-600 mb-4 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('bookingScreen.showingBookingsSummary', { count: filteredBookings.length, count_plural: filteredBookings.length !== 1 ? 's' : '' })}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map(booking => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onManage={handleManage}
                  onCancel={handleCancel}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingScreen;