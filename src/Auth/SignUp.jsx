import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ceitLogo from '/src/assets/ceit-logo.png';
import api from '../api';
import Swal from 'sweetalert2';

const SignUp = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        department: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.department) {
            setError('All fields are required');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 3) {
            setError('Password must be at least 3 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            const requestData = {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                department: formData.department
            };

            const response = await api.post('/auth/register', requestData);
            
            // Handle successful registration
            console.log('Registration successful:', response.data);
            
            // Show success notification
            await Swal.fire({
                icon: 'success',
                title: 'Registration Successful!',
                text: 'Your account has been created successfully. Please login.',
                confirmButtonText: 'Go to Login',
                confirmButtonColor: '#1f2937'
            });
            
            // Navigate to login page
            navigate('/login');
            
        } catch (error) {
            console.error('Registration error:', error);
            
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 400) {
                errorMessage = 'Invalid registration data. Please check your inputs.';
            } else if (error.response?.status === 409) {
                errorMessage = 'Email already exists. Please use a different email.';
            }
            
            // Show error notification
            await Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: errorMessage,
                confirmButtonText: 'Try Again',
                confirmButtonColor: '#dc2626'
            });
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        console.log('Google sign up clicked');
        // Implement Google OAuth if needed
    };

    const handleFacebookSignUp = () => {
        console.log('Facebook sign up clicked');
        // Implement Facebook OAuth if needed
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 lg:p-10">
                    {/* Logo Section */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <img src={ceitLogo} alt="Meeting Room Booking" className="h-12 sm:h-16 lg:h-20 w-auto" />
                        </div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-wide">
                            CEIT BOOKING
                        </h1>
                    </div>

                    {/* Sign Up Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
                                Create your Account
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                Join us today! Please fill in your details.
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3 sm:space-y-4">
                            {/* First Name Input */}
                            <div>
                                <label htmlFor="firstName" className="sr-only">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-gray-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500"
                                    required
                                />
                            </div>

                            {/* Last Name Input */}
                            <div>
                                <label htmlFor="lastName" className="sr-only">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-gray-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500"
                                    required
                                />
                            </div>

                            {/* Department Input */}
                            <div>
                                <label htmlFor="department" className="sr-only">
                                    Department
                                </label>
                                <select
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-gray-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all duration-300 text-sm sm:text-base text-gray-700"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="student">Student</option>
                                    <option value="staff">Staff</option>
                                    {/* <option value="admin">Admin</option> */}
                                </select>
                            </div>

                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-gray-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative">
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-gray-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500 pr-10 sm:pr-12"
                                    required
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
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-gray-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500 pr-10 sm:pr-12"
                                    required
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
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 underline underline-offset-2"
                                >
                                    Back to Login
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;