import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        console.log('Sign up attempt:', { email, password });
    };

    const handleGoogleSignUp = () => {
        console.log('Google sign up clicked');
    };

    const handleFacebookSignUp = () => {
        console.log('Facebook sign up clicked');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 lg:p-10">
                    {/* Logo Section - Replace with your own logo */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="flex justify-center mb-4 sm:mb-6">
                            {/* Replace this div with your logo image */}
                            {/* Example: <img src="/your-logo.png" alt="Q Booking" className="h-12 sm:h-16 lg:h-20 w-auto" /> */}
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl shadow-lg">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border-2 border-white rounded transform rotate-45"></div>
                            </div>
                        </div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-wide">
                            Q BOOKING
                        </h1>
                    </div>

                    {/* Sign Up Form */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
                                Create your Account
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                Join us today! Please fill in your details.
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

                            {/* Confirm Password Input */}
                            <div className="relative">
                                <label htmlFor="confirmPassword" className="sr-only">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-gray-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500 pr-10 sm:pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                                </button>
                            </div>

                            {/* Sign Up Button */}
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Sign Up
                            </button>
                        </div>
                         <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                          
                            <button
                                onClick={() => navigate('/login')}
                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 underline underline-offset-2"
                            >
                                Back to Login
                            </button>
                        </p>
                    </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;