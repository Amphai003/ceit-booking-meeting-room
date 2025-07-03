import React, { useState, useRef, useEffect } from 'react';
import { User, Edit, Shield, FileText, Globe, Lock, LogOut, Camera } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const ProfileScreen = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    photo: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  // const [selectedLanguage, setSelectedLanguage] = useState('English'); // This state is not used

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
        // Token is invalid, redirect to login
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        navigate('/login');
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Failed to load profile data',
          icon: 'error',
          confirmButtonColor: '#2563EB', // Changed to blue
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

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type and size
    if (!file.type.match('image.*')) {
      Swal.fire({
        title: 'Invalid File',
        text: 'Please select an image file (JPEG, PNG, etc.)',
        icon: 'error',
        confirmButtonColor: '#2563EB', // Changed to blue
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
        }
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      Swal.fire({
        title: 'File Too Large',
        text: 'Please select an image smaller than 5MB',
        icon: 'error',
        confirmButtonColor: '#2563EB', // Changed to blue
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

      // Create FormData and append the file
      const formData = new FormData();
      formData.append('image', file);

      // Upload the image
      const uploadResponse = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Extract the image URL from the upload response
      const imageUrl = uploadResponse.data.Location ||
        uploadResponse.data.url ||
        uploadResponse.data.imageUrl ||
        uploadResponse.data;

      // Update user profile with new photo
      const updateResponse = await api.patch('/users/updateMe', {
        photo: imageUrl
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Update local state
      setUser(prev => ({
        ...prev,
        photo: imageUrl
      }));

      Swal.fire({
        title: 'Success!',
        text: 'Profile picture updated successfully',
        icon: 'success',
        confirmButtonColor: '#2563EB', // Changed to blue
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
        confirmButtonColor: '#2563EB', // Changed to blue
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
    navigate('/edit-profile-user')
  };

  const handlePrivacyPolicy = () => {
    navigate('/privacy-policy')
  };

  const handleTermsConditions = () => {
    navigate('/term-condition')
  };

  const handleChangeLanguage = () => {
    navigate('/change-language')
  };

  const handleChangePassword = () => {
    navigate('/change-password')
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account. You'll need to sign in again to access your profile.",
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

        Swal.fire({
          title: 'Logged out!',
          text: 'You have been successfully logged out and your session has been cleared.',
          icon: 'success',
          confirmButtonColor: '#2563EB', // Changed to blue
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl font-medium px-6 py-3'
          }
        }).then(() => {
          navigate('/login');
        });
      }
    });
  };

  const buttons = [
    { icon: Edit, label: 'Edit Profile', onClick: handleEditProfile, color: 'bg-blue-600 hover:bg-blue-700', isLogout: false }, // Changed to blue
    { icon: Shield, label: 'Privacy Policy', onClick: handlePrivacyPolicy, color: 'bg-blue-600 hover:bg-blue-700', isLogout: false }, // Changed to blue
    { icon: FileText, label: 'Terms & Conditions', onClick: handleTermsConditions, color: 'bg-blue-600 hover:bg-blue-700', isLogout: false }, // Changed to blue
    { icon: Globe, label: 'Change Language', onClick: handleChangeLanguage, color: 'bg-blue-600 hover:bg-blue-700', isLogout: false }, // Changed to blue
    { icon: Lock, label: 'Change Password', onClick: handleChangePassword, color: 'bg-blue-600 hover:bg-blue-700', isLogout: false }, // Changed to blue
    { icon: LogOut, label: 'Logout', onClick: handleLogout, color: 'bg-red-500 hover:bg-red-600', isLogout: true }
  ];

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Helper function to get full name
  const getFullName = () => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Profile</h1>
        </div>
      </div>

      {/* Main Content with top padding for fixed header */}
      <div className="pt-20 pb-8">
        <div className="px-4 py-4">
          <div className="max-w-md mx-auto w-full">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden"> {/* Changed gradient to blue */}
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
                    className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md border-2 border-gray-100 hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                {user.email && (
                  <p className="text-gray-600 mb-2">{user.email}</p>
                )}
                {user.phoneNumber && (
                  <p className="text-gray-600 mb-2">{user.phoneNumber}</p>
                )}
                {user.department && (
                  <p className="text-gray-700 text-center text-sm leading-relaxed">{user.department}</p>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"> {/* Changed to blue */}
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div> {/* Changed to blue */}
                  Active
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {buttons.map((button, index) => {
                const IconComponent = button.icon;
                return (
                  <button
                    key={index}
                    onClick={button.onClick}
                    className={`w-full ${button.color} text-white rounded-xl py-3 px-4 flex items-center ${button.isLogout ? 'justify-center' : 'justify-left'} space-x-3 font-medium transition-all duration-200 hover:shadow-md active:scale-95`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{button.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;