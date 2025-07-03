import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, AlertCircle, Trash2, Settings } from 'lucide-react';
import api from '../../api'; 

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Access the 'data' property from the API response
      const response = await api.get('/notifications');
      setNotifications(response.data); 
    } catch (err) {
      setError(err.message || "Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approved':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      // Add a case for 'booking_status' as seen in your API response
      case 'booking_status': 
        return <Bell className="w-5 h-5 text-blue-600" />; // Or another appropriate icon
      case 'admin_alert':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'cancelled':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      // Add a case for 'booking_status' and 'admin_alert'
      case 'booking_status':
        return 'bg-blue-50 border-blue-200'; 
      case 'admin_alert':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Ensure that the 'read' property is accessed as 'isRead'
  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.isRead; 
    return notification.type === selectedFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length; 

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n 
      ));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id)); 
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true }))); 
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-8 h-8 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
            {/* <Settings className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" /> */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading && <p className="text-center text-gray-600">Loading notifications...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'approved', label: 'Approved', count: notifications.filter(n => n.type === 'approved').length },
                { key: 'cancelled', label: 'Cancelled', count: notifications.filter(n => n.type === 'cancelled').length },
                { key: 'pending', label: 'Pending', count: notifications.filter(n => n.type === 'pending').length },
                // Add new filters for types in your API response
                { key: 'booking_status', label: 'Bookings', count: notifications.filter(n => n.type === 'booking_status').length },
                { key: 'admin_alert', label: 'Alerts', count: notifications.filter(n => n.type === 'admin_alert').length },
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedFilter === filter.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filter.label} {filter.count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      selectedFilter === filter.key ? 'bg-blue-200' : 'bg-gray-200'
                    }`}>
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            {notifications.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Mark All as Read
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification._id} // <--- CHANGE THIS TO notification._id
                    className={`bg-white rounded-xl border-2 p-4 md:p-6 transition-all duration-200 hover:shadow-md ${
                      getNotificationBg(notification.type)
                    } ${!notification.isRead ? 'ring-2 ring-blue-100' : ''}`} 
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl border-2 border-white shadow-sm">
                            {/* You might want to display something more meaningful here if `avatar` isn't a direct character */}
                            {notification.avatar || getNotificationIcon(notification.type)} 
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getNotificationIcon(notification.type)}
                            <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                              {notification.title}
                            </h3>
                            {!notification.isRead && ( // <--- CHANGE notification.read to notification.isRead
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                            )}
                          </div>

                          <p className="text-gray-700 text-sm md:text-base mb-3 leading-relaxed">
                            {notification.message}
                          </p>

                          {/* Room Details (Assuming these fields exist in your API response) */}
                          {/* Parse date and time from message if not provided as separate fields */}
                          {notification.type === 'booking_status' && ( // Only show for booking_status type
                            <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                {/* You'll need to parse these from the message or have your API send them */}
                                <div>
                                  <span className="font-medium text-gray-600">Date:</span>
                                  <span className="ml-2 text-gray-900">
                                    {/* Example of parsing date from message, adjust regex as needed */}
                                    {notification.message.match(/for (.*?) GMT/)?.[1]?.split(' ')[0] + ' ' + notification.message.match(/for (.*?) GMT/)?.[1]?.split(' ')[1] + ' ' + notification.message.match(/for (.*?) GMT/)?.[1]?.split(' ')[2]}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Time:</span>
                                  <span className="ml-2 text-gray-900">
                                    {/* Example of parsing time from message, adjust regex as needed */}
                                    {notification.message.match(/(\d{2}:\d{2}:\d{2}) GMT/)?.[1]}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Status:</span>
                                  <span className="ml-2 text-gray-900">
                                    {notification.title.includes("Approved") ? "Approved" : "Pending"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p> {/* <--- Use createdAt for time */}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {!notification.isRead && ( // <--- CHANGE notification.read to notification.isRead
                          <button
                            onClick={() => markAsRead(notification._id)} // <--- CHANGE notification.id to notification._id
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)} // <--- CHANGE notification.id to notification._id
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* Empty State */
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedFilter === 'all' ? "No notifications" : `No ${selectedFilter} notifications`}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {selectedFilter === 'all'
                      ? "You're all caught up! New notifications will appear here when they arrive."
                      : `You don't have any ${selectedFilter} notifications at the moment.`
                    }
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;