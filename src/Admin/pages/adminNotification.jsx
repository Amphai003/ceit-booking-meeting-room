import { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Clock, ArrowLeft } from 'lucide-react';
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
      Swal.fire({
        icon: 'error',
        title: t('adminBookingsApp.errorTitle'),
        text: t('notificationsScreen.failedToLoadNotifications'),
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => prev - 1);
      Swal.fire({
        icon: 'success',
        title: t('notificationsScreen.markAsReadTitle'),
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Swal.fire({
        icon: 'error',
        title: t('adminBookingsApp.errorTitle'),
        text: t('notificationsScreen.failedToMarkAllAsRead'),
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
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
      Swal.fire({
        icon: 'success',
        title: t('notificationsScreen.allMarkedAsRead'),
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      Swal.fire({
        icon: 'error',
        title: t('adminBookingsApp.errorTitle'),
        text: t('notificationsScreen.failedToMarkAllAsRead'),
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
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
      Swal.fire({
        icon: 'success',
        title: t('notificationsScreen.allCleared'),
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      Swal.fire({
        icon: 'error',
        title: t('adminBookingsApp.errorTitle'),
        text: t('notificationsScreen.failedToClearNotifications'),
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(i18n.language === 'lo' ? 'lo-LA' : 'en-US');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with back button and actions */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className={`text-lg font-medium text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('notificationsScreen.headerTitle')}</h1>

          <div className="flex space-x-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md"
                  title={t('notificationsScreen.markAllAsRead')}
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
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
              >
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      {!notification.isRead ? <Bell className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{notification.title}</p>
                      <p className={`text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{notification.message}</p>
                      <p className={`text-xs text-gray-400 mt-1 flex items-center ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={t('notificationsScreen.markAsReadTitle')}
                  >
                    <X className="w-5 h-5" />
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