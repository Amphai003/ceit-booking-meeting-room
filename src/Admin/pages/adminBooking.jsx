import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, User, MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw, Filter, ArrowLeft, Trash2 } from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

const AdminBookingsApp = () => {
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
                title: 'Error',
                text: 'Failed to fetch bookings. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (bookingId) => {
        const result = await Swal.fire({
            title: 'Approve Booking',
            text: 'Are you sure you want to approve this booking?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.patch(`/bookings/${bookingId}/approve`);

                if (response.data.success === false) {
                    await Swal.fire({
                        title: 'Already Approved',
                        text: response.data.message || 'You have already approved this booking',
                        icon: 'info',
                        confirmButtonText: 'OK'
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
                            ? 'Booking Approved'
                            : 'Approval Recorded',
                        text: updatedBookingData.status === 'approved'
                            ? 'Booking has been fully approved by both admins!'
                            : 'Your approval has been recorded. Waiting for second admin approval.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                console.error('Error approving booking:', error);
                let errorMessage = 'Failed to approve booking. Please try again.';

                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }

                await Swal.fire({
                    title: 'Error',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const handleReject = async (bookingId) => {
        const result = await Swal.fire({
            title: 'Reject Booking',
            text: 'Are you sure you want to reject this booking?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Reject',
            cancelButtonText: 'Cancel'
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
                    title: 'Success',
                    text: 'Booking rejected successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } catch (error) {
                console.error('Error rejecting booking:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'Failed to reject booking. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const handleDelete = async (bookingId, status) => {
        const result = await Swal.fire({
            title: 'Delete Booking',
            text: 'Are you sure you want to delete this booking? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
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
                    title: 'Deleted',
                    text: 'Booking deleted successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } catch (error) {
                console.error('Error deleting booking:', error);
                let msg = 'Failed to delete booking. Please try again.';
                if (error?.response?.data?.message) {
                    msg = error.response.data.message;
                }

                await Swal.fire({
                    title: 'Error',
                    text: msg,
                    icon: 'error',
                    confirmButtonText: 'OK'
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
        const roomName = booking.roomId?.name || 'No Room Assigned';
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
            return 'Waiting for Admin 2 Approval';
        }
        return status;
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
            date: date.toLocaleDateString('en-US', {
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
                    <span className="text-gray-600">Loading bookings...</span>
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
                                    <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage room bookings and reservations
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh
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
                                    placeholder="Search by room, user, email, or purpose..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
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
                                        <p className="text-sm font-medium text-gray-500 capitalize">
                                            {status === 'all' ? 'Total' : status}
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">{count}</p>
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
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'No bookings have been made yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Room
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Purpose
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBookings.map((booking) => {
                                        const startDateTime = formatDateTime(booking.bookingDate, booking.startTime);
                                        const endTime = booking.endTime;
                                        const roomName = booking.roomId?.name || 'No Room Assigned';
                                        const roomType = booking.roomId?.roomType || 'N/A';
                                        const userName = `${booking.userId?.firstName || ''} ${booking.userId?.lastName || ''}`.trim();
                                        const userEmail = booking.userId?.email || 'N/A';

                                        return (
                                            <tr key={booking._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {roomName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {roomType} • {booking.roomId?.capacity ? `${booking.roomId.capacity} people` : 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 text-gray-400 mr-2" />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {userName || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {userEmail}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {startDateTime.date}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {startDateTime.time} - {endTime}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs">
                                                        <div className="truncate">{booking.purpose}</div>
                                                        {booking.requestedEquipment?.length > 0 && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Equipment: {booking.requestedEquipment.map(eq => `${eq.name} (${eq.quantity})`).join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status, booking.approvalStatus)}`}>
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
                                                                    disabled={booking.approvalStatus?.admin1Approved}
                                                                    className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white ${booking.approvalStatus?.admin1Approved ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                                                                >
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    {booking.approvalStatus?.admin1Approved ? 'Approved' : 'Approve'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(booking._id)}
                                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                                >
                                                                    <XCircle className="w-3 h-3 mr-1" />
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(booking._id, booking.status)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                                        >
                                                            <Trash2 className="w-3 h-3 mr-1" />
                                                            Delete
                                                        </button>
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