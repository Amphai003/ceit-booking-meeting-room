import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Validate inputs
    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill in all fields!',
      });
      setIsLoading(false);
      return;
    }

    // ✅ Make API call using axios with interceptor (api.js)
    const result = await api.post('/auth/login', { email, password });

    // ✅ Validate response (no .data here because interceptor already returned response.data)
    if (!result || !result.token || !result.user || !result.user.role) {
      throw new Error('Invalid login response from server');
    }

    const { token, user } = result;
    const role = user.role;

    // Store token + user info
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('loggedIn', 'true');

    await Swal.fire({
      icon: 'success',
      title: 'Login Successful!',
      showConfirmButton: false,
      timer: 1500
    });

    // Redirect by role
    if (role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/user-home');
    }

  } catch (error) {
    console.error('Login error:', error);

    let errorMessage = 'Login failed. Please try again.';
    if (error?.message) {
      errorMessage = error.message;
    }

    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: errorMessage,
    });
  } finally {
    setIsLoading(false);
  }
};


  const handleGoogleSignIn = () => {
    console.log('Google sign in clicked');
    Swal.fire({
      title: 'Coming Soon!',
      text: 'Google sign in will be available soon.',
      icon: 'info'
    });
  };

  const handleFacebookSignIn = () => {
    console.log('Facebook sign in clicked');
    Swal.fire({
      title: 'Coming Soon!',
      text: 'Facebook sign in will be available soon.',
      icon: 'info'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 lg:p-10">
          {/* Logo Section - Replace with your own logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <img src="/src/assets/ceit-logo.png" alt="Meeting Room Booking" className="h-12 sm:h-16 lg:h-20 w-auto" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-wide">
              Meeting Room  BOOKING
            </h1>
          </div>

          {/* Login Form */}
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
                Login to your Account
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Welcome back! Please enter your details.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email or Phone number
                </label>
                <input
                  id="email"
                  type="text"
                  placeholder="Email or Phone number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-gray-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-gray-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500 pr-10 sm:pr-12"
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

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3 sm:px-4 bg-white text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 group"
                aria-label="Sign in with Google"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform duration-200" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">
                  Google
                </span>
              </button>

              <button
                onClick={handleFacebookSignIn}
                className="flex items-center justify-center py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 group"
                aria-label="Sign in with Facebook"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:scale-105 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">
                  Facebook
                </span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
              <p className="text-xs sm:text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 underline underline-offset-2"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;