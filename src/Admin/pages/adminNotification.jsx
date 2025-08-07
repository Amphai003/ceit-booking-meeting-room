import { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Clock, ArrowLeft, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useNavigate } from'react-router-dom';
import api from '../../api';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const NotificationsScreen = () => {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showErrorToast(t('notificationsScreen.failedToLoadNotifications'));
    } finally {
      setLoading(false);
    }
  };

  const showErrorToast = (message) => {
    Swal.fire({
      icon: 'error',
      title: t('adminBookingsApp.errorTitle'),
      text: message,
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
      }
    });
  };

  const showSuccessToast = (message) => {
    Swal.fire({
      icon: 'success',
      title: message,
      timer: 1500,
      showConfirmButton: false,
      customClass: {
        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
      }
    });
  };

  const handleNotificationClick = (notification) => {
    // Navigate to bookings page when notification is clicked
    navigate('/bookings');
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  const markAsRead = async (id, preventNavigation = false) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => prev - 1);
      showSuccessToast(t('notificationsScreen.markAsReadTitle'));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showErrorToast(t('notificationsScreen.failedToMarkAsRead'));
    }
  };

  const markAllAsRead = async () => {
    const { isConfirmed } = await Swal.fire({
      title: t('notificationsScreen.markAllAsReadConfirmationTitle'),
      text: t('notificationsScreen.markAllAsReadConfirmationText'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('notificationsScreen.yesMarkAll'),
      customClass: {
        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        cancelButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
      }
    });

    if (!isConfirmed) return;

    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showSuccessToast(t('notificationsScreen.allMarkedAsRead'));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      showErrorToast(t('notificationsScreen.failedToMarkAllAsRead'));
    }
  };

  const clearAllNotifications = async () => {
    const { isConfirmed } = await Swal.fire({
      title: t('notificationsScreen.clearAllNotificationsConfirmationTitle'),
      text: t('notificationsScreen.clearAllNotificationsConfirmationText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('notificationsScreen.yesClearAll'),
      customClass: {
        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        cancelButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
      }
    });

    if (!isConfirmed) return;

    try {
      await api.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
      showSuccessToast(t('notificationsScreen.allCleared'));
    } catch (error) {
      console.error('Error clearing notifications:', error);
      showErrorToast(t('notificationsScreen.failedToClearNotifications'));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(i18n.language === 'lo' ? 'lo-LA' : 'en-US');
  };

  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with back button and actions */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className={`text-lg font-medium text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            {t('notificationsScreen.headerTitle')}
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-y-0.5 bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>

          <div className="flex space-x-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md"
                  title={t('notificationsScreen.markAllAsRead')}
                  disabled={unreadCount === 0}
                >
                  <Check className="h-5 w-5" />
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md"
                  title={t('notificationsScreen.clearAll')}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notification content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className={`ml-2 text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('notificationsScreen.loadingNotifications')}</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className={`mt-2 text-sm font-medium text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('notificationsScreen.noNotificationsTitle')}</h3>
            <p className={`mt-1 text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('notificationsScreen.allCaughtUpEmptyState')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  !notification.isRead 
                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        } ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-500 ml-2"></span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                      } ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs text-gray-400 mt-1 flex items-center ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification._id, true);
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                    aria-label={t('notificationsScreen.markAsReadTitle')}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;