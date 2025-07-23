import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Search, Filter, Eye, Edit, Trash2, UserCheck, UserX, Mail, Phone, Building, Loader2, MoreVertical } from 'lucide-react';
import api from '../../api'; // Assuming this path is correct in your project
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react'; // Import Floating UI hooks
import UserDetailsModal from '../component/userDetailModal';

const UserManagement = () => {
  const { t, i18n } = useTranslation(); // Initialize translation hook

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null); // Stores the _id of the user whose menu is open
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Floating UI hook for positioning the action menu
  const { x, y, refs, strategy } = useFloating({
    open: showActionMenu !== null, // Only open when showActionMenu has a user ID
    placement: 'bottom-end', // Prefer bottom-right placement
    middleware: [
      offset(8), // Add an 8px offset from the reference element
      flip(),    // Flip to top-end if there's not enough space at the bottom
      shift(),   // Shift horizontally/vertically to keep it within the viewport
    ],
    whileElementsMounted: autoUpdate, // Automatically update position on scroll/resize
  });

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
        setError(t('userManagementScreen.failedFetchUsers'));
      }
    } catch (err) {
      setError(err.message || t('userManagementScreen.failedFetchUsers'));
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
        title: t('userManagementScreen.areYouSure'),
        text: t('userManagementScreen.confirmUserStatusChange', { status: status }),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('userManagementScreen.yesConfirm', { status: status }),
        cancelButtonText: t('userHomeScreen.cancel'),
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          cancelButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
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
          title: t('userManagementScreen.success'),
          text: t('userManagementScreen.userStatusUpdated', { status: status }),
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });

        setUsers(users.map(user =>
          user._id === userId ? { ...user, accessStatus: status } : user
        ));
      } else {
        await Swal.fire({
          title: t('userManagementScreen.error'),
          text: response.message || t('userManagementScreen.failedUpdateUserStatus'),
          icon: 'error',
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
      }
    } catch (err) {
      await Swal.fire({
        title: t('userManagementScreen.error'),
        text: err.message || t('userManagementScreen.errorUpdatingUserStatus'),
        icon: 'error',
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
      console.error('Error updating user status:', err);
    } finally {
      setIsProcessing(false);
      setShowActionMenu(null); // Close the menu after action
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      const result = await Swal.fire({
        title: t('userManagementScreen.areYouSure'),
        text: t('userManagementScreen.deleteUserConfirmation'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('userManagementScreen.yesDeleteIt'),
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          cancelButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });

      if (!result.isConfirmed) return;

      setIsProcessing(true);
      const response = await api.delete(`/users/${userId}`);

      if (response.status === 'success') {
        await Swal.fire({
          title: t('userManagementScreen.deleted'),
          text: t('userManagementScreen.userDeleted'),
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
        setUsers(users.filter(user => user._id !== userId));
      } else {
        await Swal.fire({
          title: t('userManagementScreen.error'),
          text: t('userManagementScreen.failedDeleteUser'),
          icon: 'error',
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
      }
    } catch (err) {
      await Swal.fire({
        title: t('userManagementScreen.error'),
        text: err.message || t('userManagementScreen.errorDeletingUser'),
        icon: 'error',
        customClass: {
          popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
          confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
        }
      });
      console.error('Error deleting user:', err);
    } finally {
      setIsProcessing(false);
      setShowActionMenu(null); // Close the menu after action
    }
  };

  // Toggle admin role
  const toggleAdminRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      setIsProcessing(true);
      const response = await api.patch(`/users/${userId}/role`, { role: newRole });

      if (response.status === 'success') {
        showToast('success', t('userManagementScreen.userRoleUpdated', { newRole: newRole }));
        setUsers(users.map(user =>
          user._id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        showToast('error', t('userManagementScreen.failedUpdateUserRole'));
      }
    } catch (err) {
      showToast('error', err.message || t('userManagementScreen.errorUpdatingUserRole'));
      console.error('Error updating user role:', err);
    } finally {
      setIsProcessing(false);
      setShowActionMenu(null); // Close the menu after action
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
    return new Date(dateString).toLocaleDateString(i18n.language === 'lo' ? 'lo-LA' : 'en-US', {
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
          } ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBack}
              className={`flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">{t('userManagementScreen.back')}</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('userManagementScreen.userManagement')}</h1>
                <p className={`text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('userManagementScreen.manageMonitorAccounts')}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          {pagination && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className={`text-2xl font-bold text-blue-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{pagination.totalUsers}</div>
                <div className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('userManagementScreen.totalUsers')}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className={`text-2xl font-bold text-green-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                  {users.filter(u => u.accessStatus === 'approved').length}
                </div>
                <div className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('userManagementScreen.approved')}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className={`text-2xl font-bold text-yellow-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                  {users.filter(u => u.accessStatus === 'pending').length}
                </div>
                <div className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('userManagementScreen.pending')}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className={`text-2xl font-bold text-purple-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className={`text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('userManagementScreen.admins')}</div>
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
                  placeholder={t('userManagementScreen.searchUsers')}
                  className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">{t('userManagementScreen.allRoles')}</option>
                <option value="admin">{t('userManagementScreen.admin')}</option>
                <option value="user">{t('userManagementScreen.user')}</option>
              </select>
              <select
                className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">{t('userManagementScreen.allStatus')}</option>
                <option value="approved">{t('userManagementScreen.approved')}</option>
                <option value="pending">{t('userManagementScreen.pending')}</option>
                <option value="rejected">{t('userManagementScreen.rejected')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className={`flex items-center gap-2 text-red-800 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              <UserX size={20} />
              <span>{t('userManagementScreen.error')} {error}</span>
            </div>
            <button
              onClick={() => fetchUsers(currentPage)}
              className={`mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              {t('userManagementScreen.retry')}
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <span className={`ml-2 text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('userManagementScreen.loadingUsers')}</span>
          </div>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <div className={`text-center text-gray-600 py-12 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {t('userManagementScreen.noUsersFound')}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                          {t('userManagementScreen.user')}
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                          {t('userManagementScreen.contact')}
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                          {t('userManagementScreen.role')}
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                          {t('userManagementScreen.status')}
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                          {t('userManagementScreen.joined')}
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                          {t('userManagementScreen.actions')}
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
                                  <span className={`text-sm font-medium text-gray-700 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                    {user.firstName[0]}{user.lastName[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className={`text-sm font-medium text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className={`text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {user.phoneNumber && (
                                <div className={`flex items-center gap-1 text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                  <Phone size={14} />
                                  {user.phoneNumber}
                                </div>
                              )}
                              {user.department && (
                                <div className={`flex items-center gap-1 text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                  <Building size={14} />
                                  {user.department}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`${getRoleBadge(user.role)} ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`${getStatusBadge(user.accessStatus)} ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                              {user.accessStatus}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-sm text-gray-500 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <button
                                  // Set the reference element for Floating UI
                                  ref={showActionMenu === user._id ? refs.setReference : null}
                                  onClick={() => setShowActionMenu(showActionMenu === user._id ? null : user._id)}
                                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                  disabled={isProcessing}
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {showActionMenu === user._id && (
                                  <div
                                    // Set the floating element for Floating UI
                                    ref={refs.setFloating}
                                    style={{
                                      position: strategy,
                                      top: y ?? 0, // Use y from Floating UI
                                      left: x ?? 0, // Use x from Floating UI
                                      width: '12rem', // Equivalent to w-48
                                      zIndex: 20, // Ensure it's above other content
                                    }}
                                    className="bg-white rounded-md shadow-lg border border-gray-200"
                                  >
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          setSelectedUser(user);
                                          // You can implement a modal for viewing user details here
                                          setShowActionMenu(null); // Close menu after action
                                        }}
                                        className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                      >
                                        <Eye size={14} className="mr-2" />
                                        {t('userManagementScreen.viewDetails')}
                                      </button>
                                      {/* <button
                                        onClick={() => toggleAdminRole(user._id, user.role)}
                                        disabled={isProcessing}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                      >
                                        <Edit size={14} className="mr-2" />
                                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                      </button> */}

                                      {user.accessStatus !== 'approved' && (
                                        <button
                                          onClick={() => {
                                            updateUserStatus(user._id, 'approved');
                                            setShowActionMenu(null); // Close menu after action
                                          }}
                                          disabled={isProcessing}
                                          className={`flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                        >
                                          <UserCheck size={14} className="mr-2" />
                                          {t('userManagementScreen.approve')}
                                        </button>
                                      )}
                                      {user.accessStatus !== 'rejected' && (
                                        <button
                                          onClick={() => {
                                            updateUserStatus(user._id, 'rejected');
                                            setShowActionMenu(null); // Close menu after action
                                          }}
                                          disabled={isProcessing}
                                          className={`flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                        >
                                          <UserX size={14} className="mr-2" />
                                          {t('userManagementScreen.reject')}
                                        </button>
                                      )}
                                      {/* <button
                                        onClick={() => deleteUser(user._id)}
                                        disabled={isProcessing}
                                        className={`flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                      >
                                        <Trash2 size={14} className="mr-2" />
                                        {t('userManagementScreen.deleteUser')}
                                      </button> */}
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
                {selectedUser && (
                  <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                  />
                )}

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
                            <span className={`text-sm font-medium text-gray-700 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-sm font-medium text-gray-900 truncate ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                              {user.firstName} {user.lastName}
                            </h3>
                            <div className="flex gap-2">
                              <span className={`${getRoleBadge(user.role)} ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                {user.role}
                              </span>
                              <span className={`${getStatusBadge(user.accessStatus)} ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                {user.accessStatus}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className={`flex items-center gap-1 text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                              <Mail size={14} />
                              {user.email}
                            </div>
                            {user.phoneNumber && (
                              <div className={`flex items-center gap-1 text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                <Phone size={14} />
                                {user.phoneNumber}
                              </div>
                            )}
                            {user.department && (
                              <div className={`flex items-center gap-1 text-sm text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                                <Building size={14} />
                                {user.department}
                              </div>
                            )}
                            <div className={`text-xs text-gray-500 mt-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                              {t('userManagementScreen.joined')} {formatDate(user.createdAt)}
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-3">
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
                                      className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                    >
                                      <Eye size={14} className="mr-2" />
                                      {t('userManagementScreen.viewDetails')}
                                    </button>
                                    {/* <button
                                      onClick={() => toggleAdminRole(user._id, user.role)}
                                      disabled={isProcessing}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <Edit size={14} className="mr-2" />
                                      {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                    </button> */}

                                    {user.accessStatus !== 'approved' && (
                                      <button
                                        onClick={() => updateUserStatus(user._id, 'approved')}
                                        disabled={isProcessing}
                                        className={`flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                      >
                                        <UserCheck size={14} className="mr-2" />
                                        {t('userManagementScreen.approve')}
                                      </button>
                                    )}
                                    {user.accessStatus !== 'rejected' && (
                                      <button
                                        onClick={() => updateUserStatus(user._id, 'rejected')}
                                        disabled={isProcessing}
                                        className={`flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                      >
                                        <UserX size={14} className="mr-2" />
                                        {t('userManagementScreen.reject')}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteUser(user._id)}
                                      disabled={isProcessing}
                                      className={`flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                                    >
                                      <Trash2 size={14} className="mr-2" />
                                      {t('userManagementScreen.deleteUser')}
                                    </button>
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
              </>
            )}
          </>
        )}

        {/* Pagination */}
        {pagination && filteredUsers.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              Previous
            </button>
            <span className={`text-gray-700 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages || loading}
              className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;