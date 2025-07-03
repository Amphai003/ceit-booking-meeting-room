import React, { useEffect, useState } from 'react';
import api from '../../api';
import Swal from 'sweetalert2';
import {
  MapPin, Wifi, Car, Coffee, Utensils, Users,
  Monitor, Projector, Clock, CheckCircle,
  XCircle, AlertCircle, Calendar, Edit, Play, CheckSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }) => {
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
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg} ${config.border} border`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </div>
  );
};

const AvailabilityBadge = ({ booking }) => {
  const getCurrentAvailability = (booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.bookingDate);
    const today = new Date();

    // Check if booking is today
    const isToday = bookingDate.toDateString() === today.toDateString();

    if (!isToday || (booking.status !== 'approved' && booking.status !== 'confirmed')) {
      return null; // Don't show availability for non-today or non-active bookings
    }

    // Parse booking times
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
      // Meeting is currently in progress
      const remainingMs = endTimeMs - currentTime;
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));

      return {
        status: 'in-progress',
        text: `Meeting in progress • ${remainingMinutes}m left`,
        icon: Play,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      };
    } else if (currentTime < startTimeMs) {
      // Meeting hasn't started yet
      const timeToStart = startTimeMs - currentTime;
      const minutesToStart = Math.ceil(timeToStart / (1000 * 60));

      if (minutesToStart <= 15) {
        return {
          status: 'starting-soon',
          text: `Starting in ${minutesToStart}m`,
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200'
        };
      }
    } else {
      // Meeting has finished
      return {
        status: 'ready',
        text: 'Room is ready to book',
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
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${availability.color} ${availability.bg} ${availability.border} border ml-2`}>
      <Icon className="w-3 h-3 mr-1" />
      {availability.text}
    </div>
  );
};

const BookingCard = ({ booking, onManage, onCancel, onEdit }) => {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatTimeRange = (dateString, startTime, endTime) => {
    const date = new Date(dateString);
    const [startHours, startMinutes] = startTime.split(':');
    const [endHours, endMinutes] = endTime.split(':');

    date.setHours(startHours, startMinutes);
    const start = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    date.setHours(endHours, endMinutes);
    const end = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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

    if (hours === 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    } else if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} minutes`;
    }
  };

  const isToday = () => {
    const today = new Date();
    const bookingDate = new Date(booking.bookingDate);
    return bookingDate.toDateString() === today.toDateString();
  };

  // --- MODIFIED LOGIC HERE ---
  // A booking can only be canceled if its status is 'confirmed' or 'pending'.
  // A booking can only be edited if its status is 'confirmed' or 'pending'.
  const canCancel = booking.status === 'confirmed' || booking.status === 'pending';
  const canEdit = booking.status === 'confirmed' || booking.status === 'pending';
  // --- END MODIFIED LOGIC ---

  // Function to get room photo URL
  const getRoomPhotoUrl = () => {
    // Check different possible photo field structures
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"> {/* Removed mb-4 to allow grid gap to handle spacing */}
      <div className="relative">
        {photoUrl && !imageError ? (
          <div className="aspect-video bg-gray-100 relative overflow-hidden">
            <img
              src={photoUrl}
              alt={booking.roomId?.name || 'Meeting Room'}
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
                <p className="text-sm font-medium opacity-80">
                  {booking.roomId?.name || 'Meeting Room'}
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
          <h3 className="font-semibold text-lg text-gray-900">
            {booking.roomId?.name || 'Meeting Room'}
          </h3>
          <span className="text-sm text-gray-500">#{booking._id.slice(-6).toUpperCase()}</span>
        </div>

        {booking.roomId?.location && (
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            {booking.roomId.location}
          </div>
        )}

        <div className="flex items-center text-gray-600 text-sm mb-2">
          <Calendar className="w-4 h-4 mr-1" />
          {formatDate(booking.bookingDate)}
          {isToday() && <span className="ml-2 text-blue-600 font-medium">(Today)</span>}
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-2">
          <Clock className="w-4 h-4 mr-1" />
          {formatTimeRange(booking.bookingDate, booking.startTime, booking.endTime)}
          ({calculateDuration(booking.startTime, booking.endTime)})
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-3">
          <Users className="w-4 h-4 mr-1" />
          {booking.attendees || 1} people (Capacity: {booking.roomId?.capacity || 'N/A'})
        </div>

        {booking.purpose && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Purpose:</span> {booking.purpose}
            </p>
          </div>
        )}

        {booking.requestedEquipment?.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Equipment:</span> {booking.requestedEquipment.map((item, index) => {
                const name = item.name || 'Unknown';
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

        <div className="flex justify-between items-center">
          <button
            onClick={() => onManage(booking)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200"
          >
            View Details
          </button>

          <div className="flex space-x-2">
            {canEdit && (
              <button
                onClick={() => onEdit(booking)}
                className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 flex items-center"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => onCancel(booking)}
                className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600"
              >
                Cancel
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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        let endpoint = '/bookings/me';

        // Use history endpoint when history tab is selected
        if (activeFilter === 'history') {
          endpoint = '/bookings/me/history';
        }

        const response = await api.get(endpoint);
        setBookings(response.data.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        Swal.fire('Error', 'Failed to load bookings', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Update availability status every minute
    const interval = setInterval(fetchBookings, 60000);

    return () => clearInterval(interval);
  }, [activeFilter]);

  const handleManage = (booking) => {
    Swal.fire({
      title: 'Booking Details',
      html: `
      <div class="text-left">
        <p><strong>Room:</strong> ${booking.roomId?.name || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
        <p><strong>Purpose:</strong> ${booking.purpose || 'Not specified'}</p>
        ${booking.requestedEquipment?.length ? `
          <p><strong>Requested Equipment:</strong></p>
          <ul class="list-disc pl-5">
            ${booking.requestedEquipment.map(item => {
              const name = item.name || 'Unknown';
              const quantity = item.quantity || item.requestedQuantity || 1;
              return `<li>${name} (${quantity})</li>`;
            }).join('')}
          </ul>
        ` : '<p>No equipment requested</p>'}
        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
      </div>
      `,
      confirmButtonText: 'Close'
    });
  };

  const handleEdit = (booking) => {
    // When navigating to edit, pass the room's actual equipment
    navigate(`/bookings/edit/${booking._id}`, {
      state: {
        room: booking.roomId,
        booking: booking
      }
    });

    // You can remove this Swal.fire, as the navigation handles the action
    // Swal.fire({
    //   title: 'Edit Booking',
    //   text: 'Edit functionality would open a form to modify this booking',
    //   icon: 'info',
    //   confirmButtonText: 'OK'
    // });
  };

  const handleCancel = async (booking) => {
    const result = await Swal.fire({
      title: `Cancel Booking #${booking._id.slice(-6).toUpperCase()}?`,
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, cancel it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/bookings/${booking._id}`);

        setBookings(prev => prev.map(b =>
          b._id === booking._id ? { ...b, status: 'cancelled' } : b
        ));

        Swal.fire('Cancelled!', 'Your booking has been cancelled.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Failed to cancel booking.', 'error');
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const searchMatch =
      (booking.roomId?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.roomId?.location?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking._id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.purpose?.toLowerCase().includes(searchQuery.toLowerCase()));

    // For history tab, we don't need additional filtering since the API returns only history
    if (activeFilter === 'history') return searchMatch;

    // For all bookings, filter by search only
    return searchMatch;
  });

  const filterTabs = [
    { key: 'all', label: 'All Bookings' },
    { key: 'history', label: 'History' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col"> {/* Added flex flex-col for sticky header/footer */}
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4 text-center max-w-5xl mx-auto"> {/* Added max-w-5xl and mx-auto */}
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex space-x-2 overflow-x-auto sticky top-[72px] z-30 max-w-5xl mx-auto w-full"> {/* Adjusted top and added max-w-5xl, mx-auto, w-full */}
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === tab.key ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-[128px] z-20 max-w-5xl mx-auto w-full"> {/* Adjusted top and added max-w-5xl, mx-auto, w-full */}
        <input
          type="text"
          placeholder="Search bookings by room, location, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 rounded-full text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Booking Cards Grid */}
      <div className="flex-1 px-4 py-4 w-full max-w-5xl mx-auto"> {/* Added flex-1, max-w-5xl, and mx-auto */}
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Calendar className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-semibold">No Bookings Found</h3>
            <p>{searchQuery ? 'Try a different search term.' : 'You have no bookings yet.'}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4"> {/* Increased mb for better spacing with grid */}
              Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Responsive grid */}
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