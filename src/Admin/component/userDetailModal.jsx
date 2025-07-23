import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, CreditCard, User, Mail, Phone, Building, Loader2, ClipboardList } from 'lucide-react'; // Added ClipboardList for equipment
import api from '../../api';
import { useTranslation } from 'react-i18next';

const UserDetailsModal = ({ user, onClose }) => {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0
  });

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch bookings for the specific user.
        // It's highly recommended to have an API endpoint that fetches bookings for a given userId
        // e.g., `/bookings?userId=${user._id}` for better efficiency.
        // If your backend supports this, change the API call below.
        // For now, we'll fetch all and filter client-side as per the initial approach.
        const response = await api.get('/bookings?limit=1000'); // Increase limit or implement pagination if many bookings

        // Filter bookings for this specific user
        const userBookings = response.data.data.filter(booking =>
          booking.userId && booking.userId._id === user._id
        );

        setBookings(userBookings);

        // Calculate stats
        const now = new Date();
        const statsData = {
          totalBookings: userBookings.length,
          upcomingBookings: userBookings.filter(b => {
            // Combine bookingDate and startTime to create a full Date object
            const startDate = new Date(`${b.bookingDate.split('T')[0]}T${b.startTime}`);
            return startDate > now && b.status === 'confirmed';
          }).length,
          completedBookings: userBookings.filter(b => {
            // Combine bookingDate and endTime to create a full Date object
            const endDate = new Date(`${b.bookingDate.split('T')[0]}T${b.endTime}`);
            return endDate < now && b.status === 'confirmed';
          }).length,
          cancelledBookings: userBookings.filter(b => b.status === 'cancelled').length
        };

        setStats(statsData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.response?.data?.message || err.message || t('userDetails.failedToFetchBookings'));
      } finally {
        setLoading(false);
      }
    };

    if (user && user._id) { // Ensure user and user._id are available before fetching
      fetchUserBookings();
    }
  }, [user, t]); // Depend on user and t for translation changes

  const formatDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return t('userDetails.invalidDateTime');
    try {
      // Combine date part (YYYY-MM-DD) and time (HH:MM) to create a valid ISO 8601 string
      const dateTime = new Date(`${dateString.split('T')[0]}T${timeString}`);
      return dateTime.toLocaleDateString(i18n.language === 'lo' ? 'lo-LA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting date/time:", e);
      return t('userDetails.invalidDateTime');
    }
  };

  const formatTimeOnly = (timeString) => {
    if (!timeString) return '';
    try {
      // Create a dummy date to parse the time correctly
      const dummyDate = new Date(`2000-01-01T${timeString}`);
      return dummyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Error formatting time:", e);
      return '';
    }
  };


  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'rejected': // Assuming a rejected status might exist
        return `${baseClasses} bg-gray-200 text-gray-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="border-b p-4 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className={`text-xl font-bold ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            {t('userDetails.userDetails')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* User Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="col-span-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 flex-shrink-0">
                  {user.photo ? (
                    <img
                      className="h-16 w-16 rounded-full object-cover"
                      src={user.photo}
                      alt={`${user.firstName} ${user.lastName}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center ${user.photo ? 'hidden' : ''}`}>
                    <span className={`text-lg font-medium text-gray-700 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                      {user.firstName ? user.firstName[0] : ''}{user.lastName ? user.lastName[0] : ''}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    {user.role}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                  <Mail size={16} className="text-gray-500" />
                  <span>{user.email}</span>
                </div>
                {user.phoneNumber && (
                  <div className={`flex items-center gap-2 text-sm ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    <Phone size={16} className="text-gray-500" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
                {user.department && (
                  <div className={`flex items-center gap-2 text-sm ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    <Building size={16} className="text-gray-500" />
                    <span>{user.department}</span>
                  </div>
                )}
                <div className={`flex items-center gap-2 text-sm ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                  <Calendar size={16} className="text-gray-500" />
                  <span>{t('userDetails.joined')} {new Date(user.createdAt).toLocaleDateString(i18n.language === 'lo' ? 'lo-LA' : 'en-US')}</span>
                </div>
              </div>
            </div>

            {/* Booking Stats */}
            <div className="col-span-1 md:col-span-2">
              <h3 className={`text-lg font-bold mb-4 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {t('userDetails.bookingStatistics')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className={`text-2xl font-bold text-blue-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    {stats.totalBookings}
                  </div>
                  <div className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    {t('userDetails.totalBookings')}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className={`text-2xl font-bold text-green-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    {stats.upcomingBookings}
                  </div>
                  <div className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    {t('userDetails.upcomingBookings')}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className={`text-2xl font-bold text-purple-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    {stats.completedBookings}
                  </div>
                  <div className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    {t('userDetails.completedBookings')}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className={`text-2xl font-bold text-red-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    {stats.cancelledBookings}
                  </div>
                  <div className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    {t('userDetails.cancelledBookings')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking History */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('userDetails.bookingHistory')}
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className={`ml-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                  {t('userDetails.loadingBookings')}
                </span>
              </div>
            ) : error ? (
              <div className={`bg-red-50 p-4 rounded-lg text-red-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {error}
              </div>
            ) : bookings.length === 0 ? (
              <div className={`text-center py-8 text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {t('userDetails.noBookingsFound')}
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-medium ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        {booking.roomId?.name || t('userDetails.unknownRoom')}
                      </h4>
                      <span className={`${getStatusBadge(booking.status)} ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className={`flex items-center gap-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        <Calendar size={16} className="text-gray-500" />
                        <span>{formatDateTime(booking.bookingDate, booking.startTime)}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        <Clock size={16} className="text-gray-500" />
                        <span>
                          {formatTimeOnly(booking.startTime)} -{' '}
                          {formatTimeOnly(booking.endTime)}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        <MapPin size={16} className="text-gray-500" />
                        <span>{booking.roomId?.location || t('userDetails.unknownLocation')}</span>
                      </div>
                    </div>

                    {booking.purpose && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p className={`${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                          <span className="font-medium">{t('userDetails.purpose')}:</span> {booking.purpose}
                        </p>
                      </div>
                    )}

                    {booking.numberOfAttendees > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p className={`${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                          <span className="font-medium">{t('userDetails.attendees')}:</span> {booking.numberOfAttendees}
                        </p>
                      </div>
                    )}

                    {booking.requestedEquipment && booking.requestedEquipment.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p className={`font-medium mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                          <ClipboardList size={16} className="inline-block mr-1 text-gray-500" />
                          {t('userDetails.requestedEquipment')}:
                        </p>
                        <ul className="list-disc list-inside ml-4">
                          {booking.requestedEquipment.map((eq, index) => (
                            <li key={index} className={`${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                              {eq.name} (x{eq.requestedQuantity})
                            </li>
                          ))}
                        </ul>
                        {booking.equipmentNotes && (
                          <p className={`mt-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                            <span className="font-medium">{t('userDetails.equipmentNotes')}:</span> {booking.equipmentNotes}
                          </p>
                        )}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;