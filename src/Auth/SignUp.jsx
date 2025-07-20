import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import ceitLogo from '/src/assets/ceit-logo.png';
import api from '../api';
import Swal from 'sweetalert2';

const SignUp = () => {
    // Initialize translation hook
    const { t, i18n } = useTranslation();

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
            setError(t('signUp.allFieldsRequired'));
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError(t('signUp.passwordsDoNotMatch'));
            return false;
        }
        if (formData.password.length < 3) {
            setError(t('signUp.passwordLengthError'));
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

            // Show success notification with customClass for font-lao
            await Swal.fire({
                icon: 'success',
                title: t('signUp.registrationSuccessfulTitle'),
                text: t('signUp.registrationSuccessfulText'),
                confirmButtonText: t('signUp.goToLoginButton'),
                confirmButtonColor: '#2563eb', // Tailwind's blue-600
                customClass: {
                    title: i18n.language === 'lo' ? 'font-lao' : '',
                    htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
                    confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
                }
            });

            // Navigate to login page
            navigate('/login');

        } catch (error) {
            console.error('Registration error:', error);

            let errorMessage = t('signUp.registrationFailedText');

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 400) {
                errorMessage = t('signUp.invalidRegistrationData');
            } else if (error.response?.status === 409) {
                errorMessage = t('signUp.emailExists');
            }

            // Show error notification with customClass for font-lao
            await Swal.fire({
                icon: 'error',
                title: t('signUp.registrationFailedTitle'),
                text: errorMessage,
                confirmButtonText: t('signUp.tryAgainButton'),
                confirmButtonColor: '#dc2626',
                customClass: {
                    title: i18n.language === 'lo' ? 'font-lao' : '',
                    htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
                    confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
                }
            });

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to change language
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 lg:p-10">
                                       {/* Logo Section */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <img src={ceitLogo} alt="Meeting Room Booking" className="h-12 sm:h-16 lg:h-20 w-auto" />
                        </div>
                        <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-wide ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                            {t('common.ceitBooking')}
                        </h1>
                    </div>

                    {/* Sign Up Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="text-center">
                            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                {t('signUp.title')}
                            </h2>
                            <p className={`text-sm sm:text-base text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                {t('signUp.subtitle')}
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className={`bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                {error}
                            </div>
                        )}

                        <div className="space-y-3 sm:space-y-4">
                            {/* First Name Input */}
                            <div>
                                <label htmlFor="firstName" className="sr-only">
                                    {t('signUp.firstNamePlaceholder')}
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    placeholder={t('signUp.firstNamePlaceholder')}
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-blue-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                    required
                                />
                            </div>

                            {/* Last Name Input */}
                            <div>
                                <label htmlFor="lastName" className="sr-only">
                                    {t('signUp.lastNamePlaceholder')}
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    placeholder={t('signUp.lastNamePlaceholder')}
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-blue-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                    required
                                />
                            </div>

                            {/* Department Input */}
                            <div>
                                <label htmlFor="department" className="sr-only">
                                    {t('signUp.departmentPlaceholder')}
                                </label>
                                <select
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-blue-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-300 text-sm sm:text-base text-gray-700 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                    required
                                >
                                    <option value="" className={i18n.language === 'lo' ? 'font-lao' : ''}>{t('signUp.departmentPlaceholder')}</option>
                                    <option value="teacher" className={i18n.language === 'lo' ? 'font-lao' : ''}>{t('signUp.teacherOption')}</option>
                                    <option value="student" className={i18n.language === 'lo' ? 'font-lao' : ''}>{t('signUp.studentOption')}</option>
                                    <option value="staff" className={i18n.language === 'lo' ? 'font-lao' : ''}>{t('signUp.staffOption')}</option>
                                </select>
                            </div>

                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    {t('signUp.emailPlaceholder')}
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder={t('signUp.emailPlaceholder')}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-blue-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative">
                                <label htmlFor="password" className="sr-only">
                                    {t('signUp.passwordPlaceholder')}
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={t('signUp.passwordPlaceholder')}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-blue-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500 pr-10 sm:pr-12 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                                    aria-label={showPassword ? t('signUp.hidePassword') : t('signUp.showPassword')}
                                >
                                    {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                                </button>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="relative">
                                <label htmlFor="confirmPassword" className="sr-only">
                                    {t('signUp.confirmPasswordPlaceholder')}
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder={t('signUp.confirmPasswordPlaceholder')}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 bg-blue-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-300 text-sm sm:text-base placeholder-gray-500 pr-10 sm:pr-12 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                                    aria-label={showConfirmPassword ? t('signUp.hidePassword') : t('signUp.showPassword')}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                                </button>
                            </div>

                            {/* Sign Up Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                            >
                                {isLoading ? t('signUp.creatingAccountButton') : t('signUp.signUpButton')}
                            </button>
                        </div>

                        <div className="text-center mt-6">
                            <p className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                {t('signUp.alreadyHaveAccount')}{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className={`text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 underline underline-offset-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                >
                                    {t('signUp.backToLogin')}
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
