import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Search, Filter, Eye, Edit, Trash2, UserCheck, UserX, Mail, Phone, Building, Loader2, MoreVertical } from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';


const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showActionMenu, setShowActionMenu] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // Show toast message
    const showToast = (type, message) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    // Fetch users from API
    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/users?page=${page}&limit=10`);

            if (response.status === 'success') {
                setUsers(response.data.data);
                setPagination(response.pagination);
            } else {
                setError('Failed to fetch users');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch users');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    // Handle back navigation
    const handleBack = () => {
        window.history.back();
    };

  const updateUserStatus = async (userId, status) => {
  try {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${status} this user?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${status}`,
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return; // User clicked cancel
    }

    setIsProcessing(true);
    
    const response = await api.patch(`/users/${userId}/status`, { 
      accessStatus: status 
    });
    
    if (response.status === 'success') {
      await Swal.fire({
        title: 'Success!',
        text: `User has been ${status}.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, accessStatus: status } : user
      ));
    } else {
      await Swal.fire({
        title: 'Error!',
        text: response.message || 'Failed to update user status',
        icon: 'success'
      });
    }
  } catch (err) {
    await Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to update user status',
      icon: 'error'
    });
    console.error('Error updating user status:', err);
  } finally {
    setIsProcessing(false);
    setShowActionMenu(null);
  }
};

    // Delete user
   const deleteUser = async (userId) => {
  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    setIsProcessing(true);
    const response = await api.delete(`/users/${userId}`);
    
    if (response.status === 'success') {
      await Swal.fire({
        title: 'Deleted!',
        text: 'User has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      setUsers(users.filter(user => user._id !== userId));
    } else {
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete user',
        icon: 'error'
      });
    }
  } catch (err) {
    await Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to delete user',
      icon: 'error'
    });
    console.error('Error deleting user:', err);
  } finally {
    setIsProcessing(false);
    setShowActionMenu(null);
  }
};

    // Toggle admin role
    const toggleAdminRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            setIsProcessing(true);
            const response = await api.patch(`/users/${userId}/role`, { role: newRole });

            if (response.status === 'success') {
                showToast('success', `User role updated to ${newRole}`);
                setUsers(users.map(user =>
                    user._id === userId ? { ...user, role: newRole } : user
                ));
            } else {
                showToast('error', 'Failed to update user role');
            }
        } catch (err) {
            showToast('error', err.message || 'Failed to update user role');
            console.error('Error updating user role:', err);
        } finally {
            setIsProcessing(false);
            setShowActionMenu(null);
        }
    };

    // Filter users based on search and filters
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.accessStatus === filterStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Get status badge color
    const getStatusBadge = (status) => {
        const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
        switch (status) {
            case 'approved':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'pending':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'rejected':
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    // Get role badge color
    const getRoleBadge = (role) => {
        const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
        switch (role) {
            case 'admin':
                return `${baseClasses} bg-purple-100 text-purple-800`;
            case 'user':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-md ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {toast.message}
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Users size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                                <p className="text-gray-600">Manage and monitor user accounts</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    {pagination && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="text-2xl font-bold text-blue-600">{pagination.totalUsers}</div>
                                <div className="text-sm text-gray-600">Total Users</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="text-2xl font-bold text-green-600">
                                    {users.filter(u => u.accessStatus === 'approved').length}
                                </div>
                                <div className="text-sm text-gray-600">Approved</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {users.filter(u => u.accessStatus === 'pending').length}
                                </div>
                                <div className="text-sm text-gray-600">Pending</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="text-2xl font-bold text-purple-600">
                                    {users.filter(u => u.role === 'admin').length}
                                </div>
                                <div className="text-sm text-gray-600">Admins</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 text-red-800">
                            <UserX size={20} />
                            <span>Error: {error}</span>
                        </div>
                        <button
                            onClick={() => fetchUsers(currentPage)}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={32} className="animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading users...</span>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {user.photo ? (
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={user.photo}
                                                                alt={`${user.firstName} ${user.lastName}`}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ${user.photo ? 'hidden' : ''}`}>
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {user.firstName[0]}{user.lastName[0]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    {user.phoneNumber && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Phone size={14} />
                                                            {user.phoneNumber}
                                                        </div>
                                                    )}
                                                    {user.department && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Building size={14} />
                                                            {user.department}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={getRoleBadge(user.role)}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={getStatusBadge(user.accessStatus)}>
                                                    {user.accessStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setShowActionMenu(showActionMenu === user._id ? null : user._id)}
                                                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                                            disabled={isProcessing}
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>

                                                        {showActionMenu === user._id && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedUser(user);
                                                                            // You can implement a modal for viewing user details here
                                                                        }}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                                    >
                                                                        <Eye size={14} className="mr-2" />
                                                                        View Details
                                                                    </button>
                                                                    <button
                                                                        onClick={() => toggleAdminRole(user._id, user.role)}
                                                                        disabled={isProcessing}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                                    >
                                                                        <Edit size={14} className="mr-2" />
                                                                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                                                    </button>
                                                                    
                                                                    {user.accessStatus !== 'approved' && (
                                                                        <button
                                                                            onClick={() => updateUserStatus(user._id, 'approved')}
                                                                            disabled={isProcessing}
                                                                            className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                                                                        >
                                                                            <UserCheck size={14} className="mr-2" />
                                                                            Approve
                                                                        </button>
                                                                    )}
                                                                    {user.accessStatus !== 'rejected' && (
                                                                        <button
                                                                            onClick={() => updateUserStatus(user._id, 'rejected')}
                                                                            disabled={isProcessing}
                                                                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                                                        >
                                                                            <UserX size={14} className="mr-2" />
                                                                            Reject
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden space-y-4">
                            {filteredUsers.map((user) => (
                                <div key={user._id} className="bg-white p-4 rounded-lg shadow-sm border">
                                    <div className="flex items-start gap-3">
                                        <div className="h-12 w-12 flex-shrink-0">
                                            {user.photo ? (
                                                <img
                                                    className="h-12 w-12 rounded-full object-cover"
                                                    src={user.photo}
                                                    alt={`${user.firstName} ${user.lastName}`}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center ${user.photo ? 'hidden' : ''}`}>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {user.firstName} {user.lastName}
                                                </h3>
                                                <div className="flex gap-2">
                                                    <span className={getRoleBadge(user.role)}>
                                                        {user.role}
                                                    </span>
                                                    <span className={getStatusBadge(user.accessStatus)}>
                                                        {user.accessStatus}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Mail size={14} />
                                                    {user.email}
                                                </div>
                                                {user.phoneNumber && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Phone size={14} />
                                                        {user.phoneNumber}
                                                    </div>
                                                )}
                                                {user.department && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Building size={14} />
                                                        {user.department}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Joined {formatDate(user.createdAt)}
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-3">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowActionMenu(showActionMenu === user._id ? null : user._id)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                                        disabled={isProcessing}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>

                                                    {showActionMenu === user._id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                            <div className="py-1">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        // You can implement a modal for viewing user details here
                                                                    }}
                                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                                >
                                                                    <Eye size={14} className="mr-2" />
                                                                    View Details
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleAdminRole(user._id, user.role)}
                                                                    disabled={isProcessing}
                                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                                >
                                                                    <Edit size={14} className="mr-2" />
                                                                    {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                                                </button>
                                                            
                                                                {user.accessStatus !== 'approved' && (
                                                                    <button
                                                                        onClick={() => updateUserStatus(user._id, 'approved')}
                                                                        disabled={isProcessing}
                                                                        className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                                                                    >
                                                                        <UserCheck size={14} className="mr-2" />
                                                                        Approve
                                                                    </button>
                                                                )}
                                                                {user.accessStatus !== 'rejected' && (
                                                                    <button
                                                                        onClick={() => updateUserStatus(user._id, 'rejected')}
                                                                        disabled={isProcessing}
                                                                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                                                    >
                                                                        <UserX size={14} className="mr-2" />
                                                                        Reject
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
                                    {Math.min(currentPage * pagination.limit, pagination.totalUsers)} of{' '}
                                    {pagination.totalUsers} results
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-2 text-sm bg-blue-50 border border-blue-200 rounded-lg">
                                        {currentPage} of {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                        disabled={currentPage === pagination.totalPages}
                                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UserManagement;