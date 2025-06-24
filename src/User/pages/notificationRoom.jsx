import React, { useState } from 'react';
import { Bell, Check, X, Clock, AlertCircle, Trash2, Settings } from 'lucide-react';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'approved',
      title: 'Room Booking Confirmed',
      message: 'Your booking for Conference Room A has been approved by admin.',
      time: '2 min ago',
      roomName: 'Conference Room A',
      date: 'June 21, 2025',
      timeSlot: '2:00 PM - 4:00 PM',
      read: false,
      avatar: '🏢'
    },
    {
      id: 2,
      type: 'cancelled',
      title: 'Room Booking Cancelled',
      message: 'Your booking for Meeting Room B has been cancelled due to maintenance.',
      time: '15 min ago',
      roomName: 'Meeting Room B',
      date: 'June 22, 2025',
      timeSlot: '10:00 AM - 12:00 PM',
      read: false,
      avatar: '🔧'
    },
    {
      id: 3,
      type: 'pending',
      title: 'Booking Under Review',
      message: 'Your room booking request is being reviewed by admin.',
      time: '1 hour ago',
      roomName: 'Executive Suite',
      date: 'June 23, 2025',
      timeSlot: '9:00 AM - 11:00 AM',
      read: true,
      avatar: '⏳'
    },
    {
      id: 4,
      type: 'approved',
      title: 'Room Booking Confirmed',
      message: 'Your booking for Training Room C has been approved.',
      time: '3 hours ago',
      roomName: 'Training Room C',
      date: 'June 24, 2025',
      timeSlot: '1:00 PM - 3:00 PM',
      read: true,
      avatar: '📚'
    },
    {
      id: 5,
      type: 'cancelled',
      title: 'Room Booking Cancelled',
      message: 'Your booking has been cancelled due to schedule conflict.',
      time: '1 day ago',
      roomName: 'Board Room',
      date: 'June 25, 2025',
      timeSlot: '3:00 PM - 5:00 PM',
      read: true,
      avatar: '⚠️'
    }
  ]);

  const [selectedFilter, setSelectedFilter] = useState('all');

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approved':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
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
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.read;
    return notification.type === selectedFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
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
            <Settings className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'approved', label: 'Approved', count: notifications.filter(n => n.type === 'approved').length },
            { key: 'cancelled', label: 'Cancelled', count: notifications.filter(n => n.type === 'cancelled').length },
            { key: 'pending', label: 'Pending', count: notifications.filter(n => n.type === 'pending').length }
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
                key={notification.id}
                className={`bg-white rounded-xl border-2 p-4 md:p-6 transition-all duration-200 hover:shadow-md ${
                  getNotificationBg(notification.type)
                } ${!notification.read ? 'ring-2 ring-blue-100' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl border-2 border-white shadow-sm">
                        {notification.avatar}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getNotificationIcon(notification.type)}
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 text-sm md:text-base mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      {/* Room Details */}
                      <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Room:</span>
                            <span className="ml-2 text-gray-900">{notification.roomName}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Date:</span>
                            <span className="ml-2 text-gray-900">{notification.date}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Time:</span>
                            <span className="ml-2 text-gray-900">{notification.timeSlot}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
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
      </div>
    </div>
  );
};

export default NotificationsScreen;