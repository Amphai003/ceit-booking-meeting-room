import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, User, MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw, Filter, ArrowLeft, Trash2 } from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const AdminBookingsApp = () => {
    const { t, i18n } = useTranslation();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/bookings?limit=50');
            const bookingsData = response?.data?.data || response?.data || response || [];

            // Get current user's ID to check if they've already approved
            const userResponse = await api.get('/users/me');
            const currentUserId = userResponse?.data?.data?._id || userResponse?.data?._id;

            const bookingsWithApprovalStatus = Array.isArray(bookingsData)
                ? bookingsData
                    .filter(booking => booking && typeof booking === 'object')
                    .map(booking => ({
                        ...booking,
                        approvalStatus: booking.approvalStatus || {
                            admin1Approved: false,
                            admin2Approved: false,
                            admin1Id: null,
                            admin2Id: null
                        },
                        // Add a flag to check if current user has approved
                        currentUserHasApproved:
                            currentUserId && (
                                booking.approvalStatus?.admin1Id === currentUserId ||
                                booking.approvalStatus?.admin2Id === currentUserId
                            )
                    }))
                : [];

            setBookings(bookingsWithApprovalStatus);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookings([]);
            await Swal.fire({
                title: t('adminBookingsApp.errorTitle'),
                text: t('adminBookingsApp.failedToFetchBookings'),
                icon: 'error',
                confirmButtonText: t('bookingScreen.okButton'),
                customClass: {
                    popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                    title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                    htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                    confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (bookingId) => {
        const result = await Swal.fire({
            title: t('adminBookingsApp.approveBooking'),
            text: t('adminBookingsApp.areYouSureApprove'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: t('adminBookingsApp.yesApprove'),
            cancelButtonText: t('userHomeScreen.cancel'),
            customClass: {
                popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                cancelButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
            }
        });

        if (result.isConfirmed) {
            try {
                const response = await api.patch(`/bookings/${bookingId}/approve`);

                if (response.data.success === false) {
                    await Swal.fire({
                        title: t('adminBookingsApp.alreadyApproved'),
                        text: response.data.message || t('adminBookingsApp.youHaveAlreadyApproved'),
                        icon: 'info',
                        confirmButtonText: t('bookingScreen.okButton'),
                        customClass: {
                            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
                        }
                    });
                } else {
                    // FIX: Handle API response that might not have a nested `data` object
                    const updatedBookingData = response.data.data || response.data;

                    setBookings(prev =>
                        prev.map(booking =>
                            booking._id === bookingId
                                ? {
                                    ...booking,
                                    status: updatedBookingData.status || 'pending',
                                    approvalStatus: updatedBookingData.approvalStatus || {
                                        admin1Approved: true,
                                        admin2Approved: booking.approvalStatus?.admin2Approved || false
                                    }
                                }
                                : booking
                        )
                    );
                    await Swal.fire({
                        title: updatedBookingData.status === 'approved'
                            ? t('adminBookingsApp.bookingApproved')
                            : t('adminBookingsApp.approvalRecorded'),
                        text: updatedBookingData.status === 'approved'
                            ? t('adminBookingsApp.bookingFullyApproved')
                            : t('adminBookingsApp.approvalRecorded'),
                        icon: 'success',
                        confirmButtonText: t('bookingScreen.okButton'),
                        customClass: {
                            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
                        }
                    });
                }
            } catch (error) {
                console.error('Error approving booking:', error);
                let errorMessage = t('adminBookingsApp.failedToApproveBooking');

                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }

                await Swal.fire({
                    title: t('adminBookingsApp.errorTitle'),
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: t('bookingScreen.okButton'),
                    customClass: {
                        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
                    }
                });
            }
        }
    };

    const handleReject = async (bookingId) => {
        const result = await Swal.fire({
            title: t('adminBookingsApp.rejectBooking'),
            text: t('adminBookingsApp.areYouSureReject'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: t('adminBookingsApp.yesReject'),
            cancelButtonText: t('userHomeScreen.cancel'),
            customClass: {
                popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                cancelButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
            }
        });

        if (result.isConfirmed) {
            try {
                await api.patch(`/bookings/${bookingId}/reject`);
                setBookings(prev =>
                    prev.map(booking =>
                        booking._id === bookingId
                            ? { ...booking, status: 'rejected' }
                            : booking
                    )
                );
                await Swal.fire({
                    title: t('profileScreen.successTitle'),
                    text: t('adminBookingsApp.bookingRejectedSuccessfully'),
                    icon: 'success',
                    confirmButtonText: t('bookingScreen.okButton'),
                    customClass: {
                        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
                    }
                });
            } catch (error) {
                console.error('Error rejecting booking:', error);
                await Swal.fire({
                    title: t('adminBookingsApp.errorTitle'),
                    text: t('adminBookingsApp.failedToRejectBooking'),
                    icon: 'error',
                    confirmButtonText: t('bookingScreen.okButton'),
                    customClass: {
                        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
                    }
                });
            }
        }
    };

    const handleDelete = async (bookingId, status) => {
        const result = await Swal.fire({
            title: t('adminBookingsApp.deleteBooking'),
            text: t('adminBookingsApp.areYouSureDelete'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: t('adminBookingsApp.yesDelete'),
            cancelButtonText: t('userHomeScreen.cancel'),
            customClass: {
                popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                cancelButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
            }
        });

        if (result.isConfirmed) {
            try {
                if (status === 'history') {
                    await api.delete(`/bookings/history/${bookingId}`);
                } else {
                    await api.delete(`/bookings/${bookingId}`);
                }

                setBookings(prev => prev.filter(booking => booking._id !== bookingId));

                await Swal.fire({
                    title: t('adminBookingsApp.deleted'),
                    text: t('adminBookingsApp.bookingDeletedSuccessfully'),
                    icon: 'success',
                    confirmButtonText: t('bookingScreen.okButton'),
                    customClass: {
                        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
                    }
                });
            } catch (error) {
                console.error('Error deleting booking:', error);
                let msg = t('adminBookingsApp.failedToDeleteBooking');
                if (error?.response?.data?.message) {
                    msg = error.response.data.message;
                }

                await Swal.fire({
                    title: t('adminBookingsApp.errorTitle'),
                    text: msg,
                    icon: 'error',
                    confirmButtonText: t('bookingScreen.okButton'),
                    customClass: {
                        popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
                        confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
                    }
                });
            }
        }
    };


    const handleGoBack = () => {
        window.history.back();
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchBookings();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const filteredBookings = Array.isArray(bookings) ? bookings.filter(booking => {
        const roomName = booking.roomId?.name || t('adminBookingsApp.noRoomAssigned');
        const userName = `${booking.userId?.firstName || ''} ${booking.userId?.lastName || ''}`.trim();
        const userEmail = booking.userId?.email || '';
        const purpose = booking.purpose || '';

        const matchesSearch =
            roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            purpose.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    }) : [];

    const getStatusColor = (status, approvalStatus = {}) => {
        if (approvalStatus.admin1Approved && status === 'pending') {
            return 'bg-blue-100 text-blue-800 border-blue-200';
        }

        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status, approvalStatus = {}) => {
        if (approvalStatus.admin1Approved && status === 'pending') {
            return t('adminBookingsApp.waitingForAdmin2Approval');
        }
        return t(`adminBookingsApp.${status}`);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            case 'pending':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const formatDateTime = (bookingDate, time) => {
        const date = new Date(bookingDate);
        return {
            date: date.toLocaleDateString(i18n.language === 'lo' ? 'lo-LA' : 'en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            time: time || 'N/A'
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <span className={`text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('adminBookingsApp.loadingBookings')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleGoBack}
                                    className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div>
                                    <h1 className={`text-2xl font-bold text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('adminBookingsApp.bookingManagement')}</h1>
                                    <p className={`mt-1 text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                        {t('adminBookingsApp.manageReservations')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                    {t('adminBookingsApp.refresh')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6 p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder={t('adminBookingsApp.searchPlaceholder')}
                                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="sm:w-48">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">{t('adminBookingsApp.allStatus')}</option>
                                    <option value="pending">{t('adminBookingsApp.pending')}</option>
                                    <option value="approved">{t('adminBookingsApp.approved')}</option>
                                    <option value="rejected">{t('adminBookingsApp.rejected')}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {['all', 'pending', 'approved', 'rejected'].map(status => {
                        const count = status === 'all'
                            ? (Array.isArray(bookings) ? bookings.length : 0)
                            : (Array.isArray(bookings) ? bookings.filter(b => b.status === status).length : 0);

                        return (
                            <div key={status} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        {getStatusIcon(status) || <Calendar className="w-6 h-6 text-gray-600" />}
                                    </div>
                                    <div className="ml-3">
                                        <p className={`text-sm font-medium text-gray-500 capitalize ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                            {status === 'all' ? t('adminBookingsApp.total') : t(`adminBookingsApp.${status}`)}
                                        </p>
                                        <p className={`text-2xl font-semibold text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{count}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bookings List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className={`mt-2 text-sm font-medium text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('adminBookingsApp.noBookingsFound')}</h3>
                            <p className={`mt-1 text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                {searchTerm || statusFilter !== 'all'
                                    ? t('adminBookingsApp.adjustSearchFilter')
                                    : t('adminBookingsApp.noBookingsMadeYet')}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                            {t('adminBookingsApp.room')}
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                            {t('adminBookingsApp.user')}
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                            {t('adminBookingsApp.dateTime')}
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                            {t('adminBookingsApp.purpose')}
                                        </th>
                                        {/* NEW: Attendees Header */}
                                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                            {t('adminBookingsApp.attendees')}
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                            {t('adminBookingsApp.status')}
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                            {t('adminBookingsApp.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBookings.map((booking) => {
                                        const startDateTime = formatDateTime(booking.bookingDate, booking.startTime);
                                        const endTime = booking.endTime;
                                        const roomName = booking.roomId?.name || t('adminBookingsApp.noRoomAssigned');
                                        const roomType = booking.roomId?.roomType || 'N/A';
                                        const userName = `${booking.userId?.firstName || ''} ${booking.userId?.lastName || ''}`.trim();
                                        const userEmail = booking.userId?.email || 'N/A';

                                        return (
                                            <tr key={booking._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                        <div>
                                                            <div className={`text-sm font-medium text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                                                {roomName}
                                                            </div>
                                                            <div className={`text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                                                {roomType} • {booking.roomId?.capacity ?
                                                                    `${booking.roomId.capacity} ${t('roomCard.capacityUnit')}` : 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 text-gray-400 mr-2" />
                                                        <div>
                                                            <div className={`text-sm font-medium text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                                                {userName || t('adminBookingsApp.noUserAssigned')}
                                                            </div>
                                                            <div className={`text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                                                {userEmail}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                        <div>
                                                            <div className={`text-sm font-medium text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                                                {startDateTime.date}
                                                            </div>
                                                            <div className={`text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                                                {startDateTime.time} - {endTime}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`text-sm text-gray-900 max-w-xs ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                                        <div className="truncate">{booking.purpose}</div>
                                                        {booking.requestedEquipment?.length > 0 && (
                                                            <div className={`text-xs text-gray-500 mt-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                                                {t('adminBookingsApp.equipment')} {booking.requestedEquipment.map(eq => `${eq.name} (${eq.quantity})`).join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                {/* NEW: Attendees Data Cell */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                                        {booking.numberOfAttendees || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status, booking.approvalStatus)} ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                                        {getStatusIcon(booking.status)}
                                                        <span className="ml-1 capitalize">
                                                            {getStatusText(booking.status, booking.approvalStatus)}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        {booking.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(booking._id)}
                                                                    disabled={booking.currentUserHasApproved}
                                                                    className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white ${booking.currentUserHasApproved ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                                                >
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    {t('adminBookingsApp.approve')}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(booking._id)}
                                                                    className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                                                >
                                                                    <XCircle className="w-3 h-3 mr-1" />
                                                                    {t('adminBookingsApp.reject')}
                                                                </button>
                                                            </>
                                                        )}
                                                        {booking.status !== 'pending' && (
                                                            <button
                                                                onClick={() => handleDelete(booking._id, booking.status)}
                                                                className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                                            >
                                                                <Trash2 className="w-3 h-3 mr-1" />
                                                                {t('adminBookingsApp.delete')}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminBookingsApp;