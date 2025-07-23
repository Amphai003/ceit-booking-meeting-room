import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Star, 
  History,
  User,
  ArrowLeft,
  Send,
  ChevronDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotificationScreen = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'all',
    specificUsers: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [userList, setUserList] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetchingUsers(true);
      try {
        const response = await api.get('/users');
        setUserList(response.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        Swal.fire({
          title: t('adminBookingsApp.errorTitle'),
          text: t('notificationScreen.failedToLoadUserList'),
          icon: 'error',
          confirmButtonText: t('bookingScreen.okButton'),
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
      } finally {
        setIsFetchingUsers(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    if (name === 'target') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        specificUsers: [] // Reset specific users when target changes
      }));
      setIsTargetDropdownOpen(false);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUserSelection = (userId) => {
    setFormData(prev => {
      const isSelected = prev.specificUsers.includes(userId);
      const newSelection = isSelected 
        ? prev.specificUsers.filter(id => id !== userId)
        : [...prev.specificUsers, userId];
      
      return { ...prev, specificUsers: newSelection };
    });
  };

  const showSuccessAlert = () => {
    Swal.fire({
      title: t('notificationScreen.successTitle'),
      text: t('notificationScreen.notificationSentSuccessfully'),
      icon: 'success',
      confirmButtonText: t('bookingScreen.okButton'),
      customClass: {
        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
      }
    });
  };

  const preparePayload = () => {
    const basePayload = {
      title: formData.title,
      message: formData.message
    };

    if (formData.target === 'specific') {
      return {
        ...basePayload,
        target: 'specific',
        userIds: formData.specificUsers
      };
    }

    return {
      ...basePayload,
      target: formData.target
    };
  };

  const getTargetDisplayText = () => {
    if (formData.target === 'specific') {
      return t('notificationScreen.selectedUsers', { count: formData.specificUsers.length });
    }
    return t(`notificationScreen.${formData.target.charAt(0).toLowerCase() + formData.target.slice(1)}Users`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.message.trim()) {
      Swal.fire({
        title: t('notificationScreen.validationError'),
        text: t('notificationScreen.fillAllRequiredFields'),
        icon: 'warning',
        confirmButtonText: t('bookingScreen.okButton'),
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
      return;
    }

    if (formData.target === 'specific' && formData.specificUsers.length === 0) {
      Swal.fire({
        title: t('notificationScreen.validationError'),
        text: t('notificationScreen.selectAtLeastOneUser'),
        icon: 'warning',
        confirmButtonText: t('bookingScreen.okButton'),
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
      return;
    }
    
    const { value: isConfirmed } = await Swal.fire({
      title: t('notificationScreen.confirmNotification'),
      html: `
        <div class="text-left ${i18n.language === 'lo' ? 'font-lao' : ''}">
          <p class="mb-3">${t('notificationScreen.areYouSureSend')}</p>
          <div class="mt-2 p-3 bg-gray-50 rounded-lg border">
            <p class="font-semibold text-gray-800 mb-2">${formData.title}</p>
            <p class="text-sm text-gray-600 mb-2">${formData.message}</p>
            <p class="text-xs text-gray-500">
              <strong>${t('notificationScreen.target')}</strong> ${getTargetDisplayText()}
            </p>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: t('notificationScreen.yesSendIt'),
      cancelButtonText: t('userHomeScreen.cancel'),
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      customClass: {
        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
        cancelButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
      }
    });

    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      const payload = preparePayload();
      await api.post('/notifications/announce', payload);
      
      showSuccessAlert();
      setSentNotifications(prev => [{
        title: formData.title,
        message: formData.message,
        target: getTargetDisplayText(),
        date: new Date().toLocaleString(i18n.language === 'lo' ? 'lo-LA' : 'en-US'),
        id: Date.now()
      }, ...prev.slice(0, 9)]); // Keep only last 10 notifications
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        target: 'all',
        specificUsers: []
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      Swal.fire({
        title: t('adminBookingsApp.errorTitle'),
        text: error.response?.data?.message || t('notificationScreen.failedToSendNotification'),
        icon: 'error',
        confirmButtonText: t('bookingScreen.okButton'),
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Update targetOptions to use translation
  const translatedTargetOptions = [
    { value: 'all', label: t('notificationScreen.allUsers') },
    { value: 'active', label: t('notificationScreen.activeUsers') },
    { value: 'inactive', label: t('notificationScreen.inactiveUsers') },
    { value: 'premium', label: t('notificationScreen.premiumUsers') },
    { value: 'specific', label: t('notificationScreen.specificUsers') }
  ];


  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={t('userManagementScreen.back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <h1 className={`text-xl sm:text-2xl font-bold text-gray-800 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('notificationScreen.sendNotification')}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Title Input */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                      {t('notificationScreen.notificationTitle')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder={t('notificationScreen.titlePlaceholder')}
                        required
                        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                      {t('notificationScreen.messageContent')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t('notificationScreen.messagePlaceholder')}
                      required
                      maxLength={500}
                      rows={4}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                    />
                    <div className={`mt-1 text-right text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                      {t('notificationScreen.characters', { count: formData.message.length })}
                    </div>
                  </div>

                  {/* Target Selection */}
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                      {t('notificationScreen.targetAudience')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
                        className={`w-full pl-10 pr-10 py-3 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-between ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {formData.target === 'all' && <Users className="w-4 h-4" />}
                          {formData.target === 'specific' && <User className="w-4 h-4 text-blue-500" />}
                          <span>{translatedTargetOptions.find(t => t.value === formData.target)?.label}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isTargetDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isTargetDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          {translatedTargetOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleSelectChange('target', option.value)}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                            >
                              {option.value === 'all' && <Users className="w-4 h-4" />}
                              {option.value === 'specific' && <User className="w-4 h-4 text-blue-500" />}
                              <span className="text-sm sm:text-base">{option.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specific Users Selection */}
                  {formData.target === 'specific' && (
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        {t('notificationScreen.selectSpecificUsers')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                          disabled={isFetchingUsers}
                          className={`w-full pl-10 pr-10 py-3 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-between disabled:opacity-50 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                        >
                          <span className="text-gray-500">
                            {isFetchingUsers ? t('notificationScreen.loadingUsers') : 
                              formData.specificUsers.length > 0 ? 
                                t('notificationScreen.selectedUsers', { count: formData.specificUsers.length }) : 
                                t('notificationScreen.chooseUsersToNotify')}
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isUserDropdownOpen && !isFetchingUsers && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {userList.map((user) => (
                              <button
                                key={user._id}
                                type="button"
                                onClick={() => handleUserSelection(user._id)}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 ${
                                  formData.specificUsers.includes(user._id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                } ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                              >
                                <div className={`w-4 h-4 border-2 rounded ${
                                  formData.specificUsers.includes(user._id) 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {formData.specificUsers.includes(user._id) && (
                                    <CheckCircle className="w-3 h-3 text-white m-0.5" />
                                  )}
                                </div>
                                <User className="w-4 h-4 text-gray-500" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{user.name}</span>
                                  <span className="text-xs text-gray-500">{user.email}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.target === 'specific' && formData.specificUsers.length > 0 && (
                    <div className={`p-3 bg-blue-50 rounded-lg border border-blue-200 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                      <p className="text-sm text-blue-700">
                        <strong>{formData.specificUsers.length}</strong> {t('notificationScreen.selectedUsers', { count: formData.specificUsers.length })}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className={`w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                    >
                      {t('notificationScreen.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.title.trim() || !formData.message.trim() || isLoading}
                      className={`w-full sm:flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t('notificationScreen.sending')}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t('notificationScreen.sendNotificationButton')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Recent Notifications Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6">
                <h2 className={`text-lg font-semibold flex items-center gap-2 mb-4 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                  <History className="w-5 h-5 text-gray-600" /> 
                  {t('notificationScreen.recentNotifications')}
                </h2>
                
                {sentNotifications.length === 0 ? (
                  <div className={`text-center py-8 text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">{t('notificationScreen.noNotificationsSentYet')}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {sentNotifications.map((notif) => (
                      <div key={notif.id} className={`p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-sm text-gray-800 truncate pr-2">{notif.title}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{notif.date}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{notif.target}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationScreen;
