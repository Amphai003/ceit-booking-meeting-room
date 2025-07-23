import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Loader, AlertCircle, Search, Filter } from 'lucide-react'; // Added Search and Filter
import api from '../../api';
import RoomList from './room/room_list';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const RoomManagement = () => {
  const { t, i18n } = useTranslation(); // Initialize translation hook

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [limit] = useState(10);
  const [roomTypeOptions, setRoomTypeOptions] = useState([]);

  const navigate = useNavigate();

  const fetchRooms = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);

      const response = await api.get(`/rooms?${params.toString()}`);

      if (response && response.data) {
        const roomsData = response.data.data || response.data.rooms || response.data || [];
        const pagination = response.data.pagination || {};

        setRooms(roomsData);
        setCurrentPage(pagination.currentPage || page);
        setTotalPages(pagination.totalPages || Math.ceil((pagination.total || roomsData.length) / limit));
        setTotalRooms(pagination.total || roomsData.length);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(t('roomManagementScreen.failedToLoadRooms'));
      await Swal.fire({
        icon: 'error',
        title: t('roomManagementScreen.errorLoadingRooms'),
        text: t('roomManagementScreen.failedToLoadRooms'),
        confirmButtonColor: '#3B82F6',
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

  useEffect(() => {
    fetchRooms(currentPage, searchTerm, statusFilter);
  }, [currentPage]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentPage === 1) {
        fetchRooms(1, searchTerm, statusFilter);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    if (currentPage === 1) {
      fetchRooms(1, searchTerm, status);
    } else {
      setCurrentPage(1);
    }
  };

  useEffect(() => {
  const fetchRoomTypes = async () => {
    try {
      const res = await api.get('/room-types');
      setRoomTypeOptions(res.data);
    } catch (err) {
      console.error('Failed to load room types:', err);
    }
  };

  fetchRoomTypes();
}, []);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleEdit = (room) => {
    navigate(`/rooms/edit/${room._id || room.id}`);
  };

  const handleDelete = async (room) => {
    const result = await Swal.fire({
      title: t('roomManagementScreen.deleteRoomConfirmationTitle'),
      text: t('roomManagementScreen.deleteRoomConfirmationText', { roomName: room.name }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: t('roomManagementScreen.yesDeleteIt'),
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
        await api.delete(`/rooms/${room._id || room.id}`);
        await Swal.fire({
          icon: 'success',
          title: t('roomManagementScreen.deleted'),
          text: t('roomManagementScreen.roomDeleted', { roomName: room.name }),
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          customClass: {
            popup: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            title: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            htmlContainer: `${i18n.language === 'lo' ? 'font-lao' : ''}`,
            confirmButton: `${i18n.language === 'lo' ? 'font-lao' : ''}`
          }
        });
        await fetchRooms(currentPage, searchTerm, statusFilter);
      } catch (err) {
        console.error('Error deleting room:', err);
        await Swal.fire({
          icon: 'error',
          title: t('roomManagementScreen.errorDeletingRoom'),
          text: t('roomManagementScreen.failedToDeleteRoom'),
          confirmButtonColor: '#3B82F6',
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

  if (loading && rooms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin" size={24} />
          <span className={`${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('roomManagementScreen.loadingRooms')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-3xl font-bold text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('roomManagementScreen.roomManagement')}</h1>
          </div>
          <div className="flex justify-between items-center">
            <p className={`text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('roomManagementScreen.manageOfficeSpaces')}</p>
            <button
              onClick={() => navigate('/rooms/new')}
              className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              <Plus size={20} />
              {t('roomManagementScreen.addRoom')}
            </button>
          </div>
        </div>
      </div>

      <RoomList
        rooms={rooms}
        loading={loading}
        error={error}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default RoomManagement;
