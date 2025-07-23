import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api';
import { useAuth } from '../Auth/authContext';
import { useTranslation } from 'react-i18next';

import ceitLogo from '/src/assets/ceit-logo.png';
import googleLogo from '/assets/google.png';
import facebookLogo from '/assets/facebook.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, i18n } = useTranslation();

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        Swal.fire({
          icon: 'error',
          title: t('login_failed'),
          text: t('fill_fields'),
          customClass: {
            title: 'font-lao',
            htmlContainer: 'font-lao',
            confirmButton: 'font-lao',
          },
        });
        setIsLoading(false);
        return;
      }

      const result = await api.post('/auth/login', { email, password });

      if (!result || !result.token || !result.user || !result.user.role) {
        throw new Error(t('login_failed_msg'));
      }

      const { token, user } = result;
      const role = user.role;

      const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tokenExpiry', expirationTime.toString());
      localStorage.setItem('loggedIn', 'true');

      login();

      await Swal.fire({
        icon: 'success',
        title: t('login_success'),
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          title: 'font-lao',
          htmlContainer: 'font-lao',
        },
      });

      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-home');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('login_failed'),
        text: error?.response?.data?.message || error?.message || t('login_failed_msg'),
        customClass: {
          title: 'font-lao',
          htmlContainer: 'font-lao',
          confirmButton: 'font-lao',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };
  const handleGoogleSignIn = () => { /* ... */ };
  const handleFacebookSignIn = () => { /* ... */ };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 lg:p-10 font-lao">
          <div className="flex justify-end mb-2">
            <button onClick={() => switchLanguage('en')} className="text-sm px-3 py-1 border border-gray-300 rounded-l hover:bg-gray-100">EN</button>
            <button onClick={() => switchLanguage('lo')} className="text-sm px-3 py-1 border border-gray-300 rounded-r hover:bg-gray-100">ລາວ</button>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <img src={ceitLogo} alt="Meeting Room Booking" className="h-12 sm:h-16 lg:h-20 w-auto" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-wide">
              {t('meeting_booking')}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
                {t('login_title')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {t('login_subtitle')}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <input
                  id="email"
                  type="text"
                  placeholder={t('email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-blue-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500"
                />
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password_placeholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-blue-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500 pr-10 sm:pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                </button>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                >
                  {t('forgot_password')}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('signing_in')}
                  </span>
                ) : (
                  t('sign_in')
                )}
              </button>
            </div>
          </form>

          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-3 sm:px-4 bg-white text-gray-500 font-medium">
                {t('or_continue')}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <img
                src={googleLogo}
                alt="Google"
                className="h-5 w-5 sm:h-6 sm:w-6"
              />
              <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">
                {t('google')}
              </span>
            </button>

            <button
              onClick={handleFacebookSignIn}
              className="flex items-center justify-center py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <img
                src={facebookLogo}
                alt="Facebook"
                className="h-5 w-5 sm:h-6 sm:w-6"
              />
              <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">
                {t('facebook')}
              </span>
            </button>
          </div>

          <div className="text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600">
              {t('no_account')}{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 underline underline-offset-2"
              >
                {t('sign_up')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;