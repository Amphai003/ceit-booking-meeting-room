import React, { useState, useEffect, useRef } from 'react';
import { User, Edit, Shield, FileText, Globe, Lock, LogOut, ArrowLeft, Camera, Loader, Save } from 'lucide-react'; // Added Save import
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import api from '../../api'; // Assuming 'api' is configured for your backend calls

// AdminSettings Component
const AdminSettings = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    photo: null, // Stores URL or null
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
          // If no token, redirect to login
          navigate('/login');
          return;
        }

        const response = await api.get('/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const userData = response.data.data || response.data; // Handle common API response structures
        
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
        // Handle token expiration or invalid token
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          navigate('/login');
        } else {
          // Generic error for other fetch failures
          Swal.fire({
            title: 'Error',
            text: 'Failed to load profile data. Please try again.',
            icon: 'error',
            confirmButtonColor: '#3b82f6', // Keep this blue for SweetAlert
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
  }, [navigate]); // Depend on navigate to avoid lint warnings

  // Trigger file input click
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic client-side file validation
    if (!file.type.match('image.*')) {
      Swal.fire({
        title: 'Invalid File',
        text: 'Please select an image file (e.g., JPEG, PNG, GIF).',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
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
        text: 'Please select an image smaller than 5MB.',
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
      formData.append('image', file); // 'image' should match your backend's expected field name for file upload

      // Step 1: Upload the image file
      const uploadResponse = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Extract the image URL from the upload response, handle various possible response keys
      const imageUrl = uploadResponse.data.Location || 
                         uploadResponse.data.url || 
                         uploadResponse.data.imageUrl || 
                         uploadResponse.data.data?.url || // Added data.url if backend nests it
                         uploadResponse.data; // Fallback to direct data if it's just the URL

      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Upload successful but no valid image URL was returned.');
      }

      // Step 2: Update the user's profile with the new photo URL
      await api.patch('/users/updateMe', {
        photo: imageUrl
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Update local state with the new photo URL
      setUser(prev => ({
        ...prev,
        photo: imageUrl
      }));

      Swal.fire({
        title: 'Success!',
        text: 'Profile picture updated successfully.',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
        }
      });
    } catch (error) {
      console.error('Upload or update error:', error);
      Swal.fire({
        title: 'Upload Failed',
        text: error.response?.data?.message || 'Failed to update profile picture. Please try again.',
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

  // Navigation handlers
  const handleEditProfile = () => navigate('/admin-edit-profile');
  const handlePrivacyPolicy = () => navigate('/privacy-policy');
  // const handleTermsConditions = () => navigate('/term-condition'); // Commented out
  // const handleChangeLanguage = () => navigate('/change-language'); // Commented out
  const handleChangePassword = () => navigate('/change-password');

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // Red for destructive action
      cancelButtonColor: '#6b7280', // Gray for cancel
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      reverseButtons: true, // Puts confirm on the right
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl font-medium px-6 py-3',
        cancelButton: 'rounded-xl font-medium px-6 py-3'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear(); // Clear all local storage items
        sessionStorage.clear(); // Clear all session storage items
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-md">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Helper to get full name, fallback to 'User'
  const getFullName = () => {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  };

  // Define setting options with icons and actions
  const settingOptions = [
    { 
      icon: Edit, 
      label: 'Edit Profile', 
      onClick: handleEditProfile, 
      color: 'bg-blue-500 hover:bg-blue-600' // Lighter blue
    },
    // { // Commented out as requested
    //   icon: Globe, 
    //   label: 'Change Language', 
    //   onClick: handleChangeLanguage, 
    //   color: 'bg-blue-500 hover:bg-blue-600' 
    // },
    { 
      icon: Lock, 
      label: 'Change Password', 
      onClick: handleChangePassword, 
      color: 'bg-blue-500 hover:bg-blue-600' 
    },
    { 
      icon: Shield, 
      label: 'Privacy Policy', 
      onClick: handlePrivacyPolicy, 
      color: 'bg-blue-500 hover:bg-blue-600' 
    },
    // { // Commented out as requested
    //   icon: FileText, 
    //   label: 'Terms & Conditions', 
    //   onClick: handleTermsConditions, 
    //   color: 'bg-blue-500 hover:bg-blue-600' 
    // },
    { 
      icon: LogOut, 
      label: 'Logout', 
      onClick: handleLogout, 
      color: 'bg-red-500 hover:bg-red-600' // Stays red for importance
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* Fixed Header with Back Button */}
      <div className="fixed top-0 left-0 right-0 bg-white text-gray-900 z-20 shadow-md"> {/* Changed to white background, dark text */}
        <div className="px-4 py-4 flex items-center max-w-2xl mx-auto"> {/* Centered header content */}
          <button 
            onClick={handleNavigateBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" /> {/* Darker icon */}
          </button>
          <h1 className="text-xl sm:text-2xl font-bold flex-grow text-center pr-10">Admin Settings</h1> {/* Increased pr for centering */}
        </div>
      </div>

      {/* Main Content Area - Padding to account for fixed header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8"> {/* Increased pt, added horizontal padding */}
        <div className="max-w-md mx-auto w-full"> {/* Ensures content is centered and max-width */}
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6"> {/* Softened border, increased shadow */}
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group"> {/* Added group for hover effect */}
                <div className="w-28 h-28 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-xl overflow-hidden border-4 border-white transition-all duration-300 group-hover:scale-105"> {/* Softened gradient, larger avatar, strong shadow, border */}
                  {user.photo ? (
                    <img 
                      src={user.photo} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.target.style.display = 'none';
                        e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
                      }}
                    />
                  ) : (
                    <User className="w-14 h-14 text-white fallback-icon" />
                  )}
                  {/* Fallback icon container (initially hidden if photo exists) */}
                  {user.photo && ( // Only render if photo exists to handle initial state
                    <User className="w-14 h-14 text-white fallback-icon" style={{ display: 'none' }} />
                  )}
                </div>
                <button 
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute -bottom-1 -right-1 bg-white rounded-full p-3 shadow-md border border-gray-200 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Change profile photo"
                >
                  {isUploading ? (
                    <Loader className="w-5 h-5 text-blue-500 animate-spin" /> 
                  ) : (
                    <Camera className="w-5 h-5 text-blue-600" />
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
              <h2 className="text-3xl font-extrabold text-gray-900 mt-2 mb-1">{getFullName()}</h2>
              <p className="text-gray-600 text-lg mb-2">{user.email}</p>
              {user.phoneNumber && (
                <p className="text-gray-600 text-base mb-2">Phone: {user.phoneNumber}</p>
              )}
              {user.department && (
                <p className="text-gray-700 text-center text-sm leading-relaxed px-4">Department: {user.department}</p>
              )}
              {user.role === 'admin' && (
                <span className="mt-3 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 shadow-sm">
                  <Shield className="w-4 h-4 mr-2" /> Administrator
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4"> {/* Increased space-y */}
            {settingOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.onClick}
                className={`w-full ${option.color} text-white rounded-xl py-4 px-6 flex items-center space-x-4 text-lg font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300`} 
              >
                <option.icon className="w-6 h-6 flex-shrink-0" /> {/* Larger icons */}
                <span className="flex-grow text-left">{option.label}</span> {/* Ensures text aligns left */}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default AdminSettings;