import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, User, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api';

const EditProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    photo: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await api.get('/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const userData = response.data.data || response.data;
      setUser({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        department: userData.department || '',
        photo: userData.photo || null
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        navigate('/login');
      } else {
        Swal.fire({
          title: t('editProfileScreen.errorTitle'),
          text: t('editProfileScreen.loadingErrorText'),
          icon: 'error',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: `rounded-xl font-medium px-6 py-3 ${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: i18n.language === 'lo' ? 'font-lao' : '',
            htmlContainer: i18n.language === 'lo' ? 'font-lao' : ''
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      Swal.fire({
        title: t('editProfileScreen.invalidFileTitle'),
        text: t('editProfileScreen.invalidFileText'),
        icon: 'error',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: `rounded-xl font-medium px-6 py-3 ${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: i18n.language === 'lo' ? 'font-lao' : '',
          htmlContainer: i18n.language === 'lo' ? 'font-lao' : ''
        }
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: t('editProfileScreen.fileTooLargeTitle'),
        text: t('editProfileScreen.fileTooLargeText'),
        icon: 'error',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: `rounded-xl font-medium px-6 py-3 ${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: i18n.language === 'lo' ? 'font-lao' : '',
          htmlContainer: i18n.language === 'lo' ? 'font-lao' : ''
        }
      });
      return;
    }

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      const imageUrl = uploadResponse.data.Location || 
                       uploadResponse.data.url || 
                       uploadResponse.data.imageUrl || 
                       uploadResponse.data;

      setUser(prev => ({
        ...prev,
        photo: imageUrl
      }));

      Swal.fire({
        title: t('editProfileScreen.uploadSuccessTitle'),
        text: t('editProfileScreen.uploadSuccessText'),
        icon: 'success',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: `rounded-xl font-medium px-6 py-3 ${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: i18n.language === 'lo' ? 'font-lao' : '',
          htmlContainer: i18n.language === 'lo' ? 'font-lao' : ''
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        title: t('editProfileScreen.uploadFailedTitle'),
        text: error.response?.data?.message || t('editProfileScreen.uploadFailedText'),
        icon: 'error',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: `rounded-xl font-medium px-6 py-3 ${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: i18n.language === 'lo' ? 'font-lao' : '',
          htmlContainer: i18n.language === 'lo' ? 'font-lao' : ''
        }
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const updateData = {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        department: user.department
      };

      if (user.photo) {
        updateData.photo = user.photo;
      }

      await api.patch('/users/updateMe', updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      Swal.fire({
        title: t('editProfileScreen.saveSuccessTitle'),
        text: t('editProfileScreen.saveSuccessText'),
        icon: 'success',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: `rounded-xl font-medium px-6 py-3 ${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: i18n.language === 'lo' ? 'font-lao' : '',
          htmlContainer: i18n.language === 'lo' ? 'font-lao' : ''
        }
      }).then(() => {
        navigate('/user-profile');
      });
    } catch (error) {
      console.error('Save error:', error);
      Swal.fire({
        title: t('editProfileScreen.saveFailedTitle'),
        text: error.response?.data?.message || t('editProfileScreen.saveFailedText'),
        icon: 'error',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: `rounded-xl font-medium px-6 py-3 ${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: i18n.language === 'lo' ? 'font-lao' : '',
          htmlContainer: i18n.language === 'lo' ? 'font-lao' : ''
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('editProfileScreen.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-10">
        <div className="px-4 py-4 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className={`p-2 hover:bg-gray-100 rounded-full transition-colors mr-3 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className={`text-2xl font-bold text-gray-900 flex-1 text-center mr-11 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('editProfileScreen.editProfileHeader')}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="px-4 py-4">
          <div className="max-w-md mx-auto w-full">
            {/* Profile Photo Section */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                    {user.photo ? (
                      <img 
                        src={user.photo} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                    {user.photo && (
                      <User className="w-12 h-12 text-white" style={{ display: 'none' }} />
                    )}
                  </div>
                  <button 
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md border-2 border-gray-100 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className={`text-sm text-gray-500 text-center ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('editProfileScreen.photoHelpText')}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('editProfileScreen.firstNameLabel')}</label>
                  <input
                    type="text"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                    placeholder={t('editProfileScreen.firstNamePlaceholder')}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('editProfileScreen.lastNameLabel')}</label>
                  <input
                    type="text"
                    name="lastName"
                    value={user.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                    placeholder={t('editProfileScreen.lastNamePlaceholder')}
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('editProfileScreen.emailLabel')}</label>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    disabled
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                    placeholder={t('editProfileScreen.emailPlaceholder')}
                  />
                  <p className={`text-xs text-gray-500 mt-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('editProfileScreen.emailHelpText')}</p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('editProfileScreen.phoneNumberLabel')}</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={user.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                    placeholder={t('editProfileScreen.phoneNumberPlaceholder')}
                  />
                </div>

                {/* Department */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('editProfileScreen.departmentLabel')}</label>
                  <input
                    type="text"
                    name="department"
                    value={user.department}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                    placeholder={t('editProfileScreen.departmentPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-4 flex items-center justify-center space-x-3 font-medium transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{isSaving ? t('editProfileScreen.savingButton') : t('editProfileScreen.saveChangesButton')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;