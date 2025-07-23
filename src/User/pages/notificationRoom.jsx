import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, AlertCircle, Trash2, Settings } from 'lucide-react';
import api from '../../api';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const NotificationsScreen = () => {
  const { t, i18n } = useTranslation(); // Initialize translation hook

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      setError(err.message || t('notificationsScreen.failedToLoadNotifications'));
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
      case 'booking_status':
        return <Bell className="w-5 h-5 text-blue-600" />;
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
      case 'booking_status':
        return 'bg-blue-50 border-blue-200';
      case 'admin_alert':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

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
                <h1 className={`text-2xl font-bold text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('notificationsScreen.headerTitle')}</h1>
                <p className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                  {unreadCount > 0 ? t('notificationsScreen.unreadCountMessage', { count: unreadCount, count_plural: unreadCount !== 1 ? '_plural' : '' }) : t('notificationsScreen.allCaughtUpMessage')}
                </p>
              </div>
            </div>
            {/* <Settings className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" /> */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading && <p className={`text-center text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('notificationsScreen.loadingNotifications')}</p>}
        {error && <p className={`text-center text-red-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{error}</p>}

        {!loading && !error && (
          <>
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: 'all', label: t('notificationsScreen.filterAll'), count: notifications.length },
                { key: 'unread', label: t('notificationsScreen.filterUnread'), count: unreadCount },
                { key: 'approved', label: t('notificationsScreen.filterApproved'), count: notifications.filter(n => n.type === 'approved').length },
                { key: 'cancelled', label: t('notificationsScreen.filterCancelled'), count: notifications.filter(n => n.type === 'cancelled').length },
                { key: 'pending', label: t('notificationsScreen.filterPending'), count: notifications.filter(n => n.type === 'pending').length },
                { key: 'booking_status', label: t('notificationsScreen.filterBookings'), count: notifications.filter(n => n.type === 'booking_status').length },
                { key: 'admin_alert', label: t('notificationsScreen.filterAlerts'), count: notifications.filter(n => n.type === 'admin_alert').length },
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedFilter === filter.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  } ${i18n.language === 'lo' ? 'font-lao' : ''}`}
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
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                  >
                    {t('notificationsScreen.markAllAsRead')}
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className={`px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                >
                  <Trash2 className="w-4 h-4" />
                  {t('notificationsScreen.clearAll')}
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`bg-white rounded-xl border-2 p-4 md:p-6 transition-all duration-200 hover:shadow-md ${
                      getNotificationBg(notification.type)
                    } ${!notification.isRead ? 'ring-2 ring-blue-100' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl border-2 border-white shadow-sm">
                            {notification.avatar || getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getNotificationIcon(notification.type)}
                            <h3 className={`font-semibold text-gray-900 text-sm md:text-base ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                            )}
                          </div>

                          <p className={`text-gray-700 text-sm md:text-base mb-3 leading-relaxed ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                            {notification.message}
                          </p>

                          {/* Room Details (Assuming these fields exist in your API response) */}
                          {notification.type === 'booking_status' && (
                            <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className={`font-medium text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('notificationsScreen.dateLabel')}</span>
                                  <span className={`ml-2 text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                    {notification.message.match(/for (.*?) GMT/)?.[1]?.split(' ')[0] + ' ' + notification.message.match(/for (.*?) GMT/)?.[1]?.split(' ')[1] + ' ' + notification.message.match(/for (.*?) GMT/)?.[1]?.split(' ')[2]}
                                  </span>
                                </div>
                                <div>
                                  <span className={`font-medium text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('notificationsScreen.timeLabel')}</span>
                                  <span className={`ml-2 text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                    {notification.message.match(/(\d{2}:\d{2}:\d{2}) GMT/)?.[1]}
                                  </span>
                                </div>
                                <div>
                                  <span className={`font-medium text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('notificationsScreen.statusLabel')}</span>
                                  <span className={`ml-2 text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                    {notification.title.includes("Approved") ? t('notificationsScreen.approved') : t('notificationsScreen.pending')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <p className={`text-xs text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{new Date(notification.createdAt).toLocaleString(i18n.language === 'lo' ? 'lo-LA' : 'en-US')}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title={t('notificationsScreen.markAsReadTitle')}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title={t('notificationsScreen.deleteNotificationTitle')}
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
                  <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    {selectedFilter === 'all' ? t('notificationsScreen.noNotificationsTitle') : t('notificationsScreen.noFilteredNotificationsTitle', { filter: t(`notificationsScreen.filter${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}`) })}
                  </h3>
                  <p className={`text-gray-600 max-w-md mx-auto ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    {selectedFilter === 'all'
                      ? t('notificationsScreen.allCaughtUpEmptyState')
                      : t('notificationsScreen.filteredEmptyState', { filter: t(`notificationsScreen.filter${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}`) })
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
