import React, { useState } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api';

const ChangePasswordScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  const checkPasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    setPasswordStrength({
      score,
      requirements
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score < 2) return 'bg-red-500';
    if (passwordStrength.score < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score < 2) return 'Weak';
    if (passwordStrength.score < 4) return 'Medium';
    return 'Strong';
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please enter your current password',
        icon: 'warning',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
        }
      });
      return false;
    }

    if (!formData.newPassword) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please enter a new password',
        icon: 'warning',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
        }
      });
      return false;
    }

    if (passwordStrength.score < 4) {
      Swal.fire({
        title: 'Weak Password',
        text: 'Please choose a stronger password that meets all requirements',
        icon: 'warning',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
        }
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire({
        title: 'Password Mismatch',
        text: 'New password and confirmation password do not match',
        icon: 'error',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
        }
      });
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      Swal.fire({
        title: 'Same Password',
        text: 'New password must be different from your current password',
        icon: 'warning',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
        }
      });
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await api.patch('/users/updatePassword', {
        passwordCurrent: formData.currentPassword,
        password: formData.newPassword,
        passwordConfirm: formData.confirmPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      Swal.fire({
        title: 'Success!',
        text: 'Your password has been changed successfully',
        icon: 'success',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
        }
      }).then(() => {
        navigate('/user-profile');
      });
    } catch (error) {
      console.error('Password change error:', error);
      Swal.fire({
        title: 'Change Failed',
        text: error.response?.data?.message || 'Failed to change password. Please check your current password.',
        icon: 'error',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl font-medium px-6 py-3'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requirements = [
    { key: 'length', text: 'At least 8 characters' },
    { key: 'uppercase', text: 'One uppercase letter' },
    { key: 'lowercase', text: 'One lowercase letter' },
    { key: 'number', text: 'One number' },
    { key: 'special', text: 'One special character' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-10">
        <div className="px-4 py-4 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1 text-center mr-11">Change Password</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="px-4 py-4">
          <div className="max-w-md mx-auto w-full">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Update Password</h2>
              <p className="text-gray-600 text-center text-sm leading-relaxed">
                Create a strong password to keep your account secure. Your password should be unique and not used elsewhere.
              </p>
            </div>

            {/* Password Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">Password Strength</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.score < 2 ? 'text-red-600' :
                          passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 text-blue-600 mr-2" />
                  Password Requirements
                </h3>
                <div className="space-y-2">
                  {requirements.map((req) => (
                    <div key={req.key} className="flex items-center space-x-3">
                      {passwordStrength.requirements[req.key] ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${
                        passwordStrength.requirements[req.key] ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                Security Tips
              </h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-800">Use a unique password that you don't use elsewhere</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-800">Consider using a password manager</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-800">Avoid using personal information in passwords</p>
                </div>
              </div>
            </div>

            {/* Change Password Button */}
            <button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 px-4 flex items-center justify-center space-x-3 font-medium transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Lock className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Changing Password...' : 'Change Password'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordScreen;