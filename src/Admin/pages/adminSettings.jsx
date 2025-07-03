import React, { useState, useEffect, useRef } from 'react';
import { User, Edit, Shield, FileText, Globe, Lock, LogOut, ArrowLeft, Camera } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AdminSettings = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    photo: null,
    role: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
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
          photo: userData.photo || null,
          role: userData.role || ''
        });

      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          navigate('/login');
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Failed to load profile data',
            icon: 'error',
            confirmButtonColor: '#3b82f6',
            customClass: {
              popup: 'rounded-2xl',
              confirmButton: 'rounded-xl font-medium px-6 py-3'
            }
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      Swal.fire({
        title: 'Invalid File',
        text: 'Please select an image file (JPEG, PNG, etc.)',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
        }
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: 'File Too Large',
        text: 'Please select an image smaller than 5MB',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
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

      const updateResponse = await api.patch('/users/updateMe', {
        photo: imageUrl
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setUser(prev => ({
        ...prev,
        photo: imageUrl
      }));

      Swal.fire({
        title: 'Success!',
        text: 'Profile picture updated successfully',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        title: 'Upload Failed',
        text: error.response?.data?.message || 'Failed to upload profile picture',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
        }
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handlePrivacyPolicy = () => {
    navigate('/privacy-policy');
  };

  const handleTermsConditions = () => {
    navigate('/term-condition');
  };

  const handleChangeLanguage = () => {
    navigate('/change-language');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl font-medium px-6 py-3',
        cancelButton: 'rounded-xl font-medium px-6 py-3'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
      }
    });
  };

  const handleNavigateBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getFullName = () => {
    return `${user.firstName} ${user.lastName}`.trim() || 'User';
  };

  const settingOptions = [
    { 
      icon: Edit, 
      label: 'Edit Profile', 
      onClick: handleEditProfile, 
      color: 'bg-blue-600 hover:bg-blue-700' 
    },
    { 
      icon: Globe, 
      label: 'Change Language', 
      onClick: handleChangeLanguage, 
      color: 'bg-blue-600 hover:bg-blue-700' 
    },
    { 
      icon: Lock, 
      label: 'Change Password', 
      onClick: handleChangePassword, 
      color: 'bg-blue-600 hover:bg-blue-700' 
    },
    { 
      icon: Shield, 
      label: 'Privacy Policy', 
      onClick: handlePrivacyPolicy, 
      color: 'bg-blue-600 hover:bg-blue-700' 
    },
    { 
      icon: FileText, 
      label: 'Terms & Conditions', 
      onClick: handleTermsConditions, 
      color: 'bg-blue-600 hover:bg-blue-700' 
    },
    { 
      icon: LogOut, 
      label: 'Logout', 
      onClick: handleLogout, 
      color: 'bg-red-500 hover:bg-red-600' 
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Fixed Header with Back Button */}
      <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white z-10">
        <div className="px-4 py-4 flex items-center">
          <button 
            onClick={handleNavigateBack}
            className="mr-4 p-1 rounded-full hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-center flex-grow">Admin Settings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="px-4 py-4">
          <div className="max-w-md mx-auto w-full">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 mb-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden">
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
                    {/* Fallback icon if image fails to load */}
                    {user.photo && (
                      <User className="w-12 h-12 text-white" style={{ display: 'none' }} />
                    )}
                  </div>
                  <button 
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md border-2 border-blue-100 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-4 h-4 text-blue-600" />
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

                {/* User Info */}
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{getFullName()}</h2>
                <p className="text-gray-600 mb-2">{user.email}</p>
                {user.phoneNumber && (
                  <p className="text-gray-600 mb-2">{user.phoneNumber}</p>
                )}
                {user.department && (
                  <p className="text-gray-700 text-center text-sm leading-relaxed">{user.department}</p>
                )}
                {user.role === 'admin' && (
                  <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Administrator
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {settingOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.onClick}
                  className={`w-full ${option.color} text-white rounded-xl py-3 px-4 flex items-center space-x-3 font-medium transition-all duration-200 hover:shadow-md active:scale-95`}
                >
                  <option.icon className="w-5 h-5" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;