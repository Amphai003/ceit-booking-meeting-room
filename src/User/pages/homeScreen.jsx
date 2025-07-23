import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Heart,
  Home,
  Calendar,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Wifi,
  Monitor,
  Mic
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UserHomeScreen = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState(t('userHomeScreen.allRoomTab'));
  const [rooms, setRooms] = useState([]); // This will hold the currently displayed rooms
  const [allRoomsData, setAllRoomsData] = useState([]); // This will hold all rooms initially fetched
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteLoading, setFavoriteLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState(''); // Search term from the main input
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Filter state for the modal, independent of the main search input
  const [filterCriteria, setFilterCriteria] = useState({
    roomType: '',
    capacity: {
      min: '',
      max: ''
    },
    equipment: [],
    status: '',
    location: ''
  });

  const roomsPerPage = 6;

  // --- Initial Fetch: Gets all rooms when the component mounts ---
  const fetchAllRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rooms'); // Fetch all rooms initially

      let roomsData = [];
      if (response?.data?.data) {
        roomsData = response.data.data;
      } else if (Array.isArray(response)) {
        roomsData = response;
      } else if (response?.rooms) {
        roomsData = response.rooms;
      }

      setAllRoomsData(roomsData); // Store all rooms
      setRooms(roomsData); // Initially display all rooms
      setError(null);

      if (roomsData.length > 0) {
        Swal.fire({
          icon: 'success',
          title: t('userHomeScreen.roomsLoadedTitle'),
          text: t('userHomeScreen.roomsLoadedText', { count: roomsData.length }),
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: {
            title: i18n.language === 'lo' ? 'font-lao' : '',
            htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
            confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
          }
        });
      }
    } catch (err) {
      setError(err.message || t('userHomeScreen.failedToFetchRooms'));
      console.error('Error fetching all rooms:', err);

      Swal.fire({
        icon: 'error',
        title: t('userHomeScreen.failedToFetchRooms'),
        text: err.message || t('userHomeScreen.unableToFetchRoomsFromServer'),
        confirmButtonText: t('userHomeScreen.tryAgain'),
        confirmButtonColor: '#2563EB',
        customClass: {
          title: i18n.language === 'lo' ? 'font-lao' : '',
          htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
          confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
        }
      }).then((result) => {
        if (result.isConfirmed) {
          fetchAllRooms();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRooms(); // Fetch all rooms only once on component mount
  }, []);

  // --- Handle Search and Tab Changes (Client-side filtering for these) ---
  useEffect(() => {
    let currentFilteredRooms = [...allRoomsData]; // Start with all rooms
    setCurrentPage(1); // Reset to first page on search/tab change

    // Apply search term filter (client-side)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFilteredRooms = currentFilteredRooms.filter(room => {
        const nameMatch = room.name?.toLowerCase().includes(lowerCaseSearchTerm);
        const locationMatch = room.location?.toLowerCase().includes(lowerCaseSearchTerm);
        const capacityMatch = room.capacity?.toString().includes(lowerCaseSearchTerm);
        return nameMatch || locationMatch || capacityMatch;
      });
    }

    // Apply active tab filter (client-side)
    if (activeTab === t('userHomeScreen.availableRoomTab')) {
      currentFilteredRooms = currentFilteredRooms.filter(room => room.status === 'available');
    }

    setRooms(currentFilteredRooms); // Update rooms to display based on client-side filters
  }, [searchTerm, activeTab, allRoomsData]); // Depend on searchTerm, activeTab, and the original allRoomsData


  // --- New Function: Handle applying filters from the modal (Server-side search) ---
  const handleApplyFilters = async () => {
    setIsFilterModalOpen(false); // Close the modal immediately

    try {
      setLoading(true);
      setCurrentPage(1); // Reset to first page on applying new filters

      const payload = {
        searchTerm: searchTerm || undefined, // Include the current search bar term
        searchFilter: {
          roomType: filterCriteria.roomType || undefined,
          capacity: (filterCriteria.capacity.min || filterCriteria.capacity.max) ? {
            min: filterCriteria.capacity.min ? Number(filterCriteria.capacity.min) : undefined,
            max: filterCriteria.capacity.max ? Number(filterCriteria.capacity.max) : undefined,
          } : undefined,
          equipment: filterCriteria.equipment.length > 0 ? filterCriteria.equipment : undefined,
          status: filterCriteria.status || undefined,
          location: filterCriteria.location || undefined,
        },
      };

      // Clean up payload by removing undefined or empty values
      Object.keys(payload.searchFilter).forEach(key => {
        if (payload.searchFilter[key] === undefined || (Array.isArray(payload.searchFilter[key]) && payload.searchFilter[key].length === 0)) {
          delete payload.searchFilter[key];
        }
      });
      if (Object.keys(payload.searchFilter).length === 0) {
        delete payload.searchFilter;
      }
      if (!payload.searchTerm) {
          delete payload.searchTerm;
      }

      console.log('Sending filter search payload:', payload);

      const response = await api.post('/search', payload);

      let filteredRoomsData = [];
      if (response?.data?.data) {
        filteredRoomsData = response.data.data;
      } else if (Array.isArray(response)) {
        filteredRoomsData = response;
      } else if (response?.rooms) {
        filteredRoomsData = response.rooms;
      }

      setRooms(filteredRoomsData); // Update the displayed rooms with the search results
      setError(null);

      if (filteredRoomsData.length > 0) {
        Swal.fire({
          icon: 'success',
          title: t('userHomeScreen.filterAppliedTitle'),
          text: t('userHomeScreen.filterAppliedText', { count: filteredRoomsData.length }),
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: {
            title: i18n.language === 'lo' ? 'font-lao' : '',
            htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
            confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
          }
        });
      } else {
         Swal.fire({
          icon: 'info',
          title: t('userHomeScreen.noRoomsFound'),
          text: t('userHomeScreen.noMatchingRoomsFound'),
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          customClass: {
            title: i18n.language === 'lo' ? 'font-lao' : '',
            htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
            confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
          }
        });
      }
    } catch (err) {
      setError(err.message || t('userHomeScreen.failedToApplyFilters'));
      console.error('Error applying filters:', err);
      Swal.fire({
        icon: 'error',
        title: t('userHomeScreen.failedToApplyFilters'),
        text: err.message || t('userHomeScreen.unableToFetchRoomsWithFilters'),
        confirmButtonText: t('userHomeScreen.tryAgain'),
        confirmButtonColor: '#2563EB',
        customClass: {
          title: i18n.language === 'lo' ? 'font-lao' : '',
          htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
          confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Reset Filters: Clears modal filter state and re-fetches all rooms ---
  const resetFilters = () => {
    setFilterCriteria({
      roomType: '',
      capacity: {
        min: '',
        max: ''
      },
      equipment: [],
      status: '',
      location: ''
    });
    setSearchTerm(''); // Also clear the main search bar term
    fetchAllRooms(); // Go back to showing all rooms initially
    setIsFilterModalOpen(false); // Close the modal
  };

  const totalPages = Math.ceil(rooms.length / roomsPerPage); // Use `rooms` for pagination
  const startIndex = (currentPage - 1) * roomsPerPage;
  const endIndex = startIndex + roomsPerPage;
  const currentRooms = rooms.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const toggleFavorite = async (room, e) => {
    e.stopPropagation();

    const roomId = room.id || room._id;
    const newFavoriteStatus = !room.isFavorited;

    setFavoriteLoading(prev => ({ ...prev, [roomId]: true }));

    try {
      if (newFavoriteStatus) {
        await api.post('/favorite-rooms', {
          roomId: roomId
        });
      } else {
        await api.delete('/favorite-rooms', {
          data: {
            roomId: roomId
          }
        });
      }

      setRooms(prevRooms =>
        prevRooms.map(r =>
          (r.id || r._id) === roomId
            ? { ...r, isFavorited: newFavoriteStatus }
            : r
        )
      );
      // Also update allRoomsData if it contains the favorite status
      setAllRoomsData(prevAllRooms =>
        prevAllRooms.map(r =>
          (r.id || r._id) === roomId
            ? { ...r, isFavorited: newFavoriteStatus }
            : r
        )
      );

      Swal.fire({
        icon: 'success',
        title: newFavoriteStatus ? t('userHomeScreen.addedToFavoritesTitle') : t('userHomeScreen.removedFromFavoritesTitle'),
        text: newFavoriteStatus ? t('userHomeScreen.addedToFavoritesText', { roomName: room.name }) : t('userHomeScreen.removedFromFavoritesText', { roomName: room.name }),
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: {
          title: i18n.language === 'lo' ? 'font-lao' : '',
          htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
          confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
        }
      });

    } catch (error) {
      console.error('Error toggling favorite:', error);

      Swal.fire({
        icon: 'error',
        title: t('userHomeScreen.errorTitle'),
        text: newFavoriteStatus ? t('userHomeScreen.failedAddToFavorites') : t('userHomeScreen.failedRemoveFromFavorites'),
        confirmButtonColor: '#2563EB',
        customClass: {
          title: i18n.language === 'lo' ? 'font-lao' : '',
          htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
          confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
        }
      });
    } finally {
      setFavoriteLoading(prev => {
        const newState = { ...prev };
        delete newState[roomId];
        return newState;
      });
    }
  };

  const handleRoomClick = (room) => {
    if (room.status === 'available') {
      navigate('/booking', { state: { room } });
    } else {
      Swal.fire({
        icon: 'info',
        title: t('userHomeScreen.roomNotAvailableTitle'),
        text: t('userHomeScreen.roomNotAvailableText'),
        confirmButtonColor: '#2563EB',
        customClass: {
          title: i18n.language === 'lo' ? 'font-lao' : '',
          htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
          confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
        }
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'text-green-500 bg-green-500';
      case 'occupied':
        return 'text-red-500 bg-red-500';
      case 'maintenance':
        return 'text-yellow-500 bg-yellow-500';
      default:
        return 'text-gray-500 bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return t('userHomeScreen.availableNow');
      case 'occupied':
        return t('userHomeScreen.unavailableNow');
      case 'maintenance':
        return t('userHomeScreen.underMaintenance');
      default:
        return t('userHomeScreen.unknownStatus');
    }
  };

  const getEquipmentIcon = (name) => {
    const lowerName = (name || '').toLowerCase();
    if (lowerName.includes('tv') || lowerName.includes('monitor') || lowerName.includes('projector')) {
      return <Monitor className="w-3 h-3" />;
    } else if (lowerName.includes('mic') || lowerName.includes('microphone')) {
      return <Mic className="w-3 h-3" />;
    } else if (lowerName.includes('wifi')) {
      return <Wifi className="w-3 h-3" />;
    } else {
      return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  if (loading && allRoomsData.length === 0) { // Show full loading only if no data has been fetched yet
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('userHomeScreen.loadingRooms')}</p>
        </div>
      </div>
    );
  }

  if (error && allRoomsData.length === 0) { // Show full error only if no data has been fetched yet
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <p className={`text-red-600 mb-4 text-lg ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('userHomeScreen.errorLoadingRooms')}</p>
          <p className={`text-gray-600 mb-6 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{error}</p>
          <button
            onClick={() => {
              Swal.fire({
                title: t('userHomeScreen.retryLoadingRoomsQuestion'),
                text: t('userHomeScreen.reloadRoomsFromServerText'),
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#2563EB',
                cancelButtonColor: '#6B7280',
                confirmButtonText: t('userHomeScreen.yesRetry'),
                cancelButtonText: t('userHomeScreen.cancel'),
                customClass: {
                  title: i18n.language === 'lo' ? 'font-lao' : '',
                  htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
                  confirmButton: i18n.language === 'lo' ? 'font-lao' : '',
                  cancelButton: i18n.language === 'lo' ? 'font-lao' : ''
                }
              }).then((result) => {
                if (result.isConfirmed) {
                  fetchAllRooms();
                }
              });
            }}
            className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}
          >
            {t('userHomeScreen.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Search Bar */}
      <div className="px-4 py-3 w-full max-w-5xl mx-auto">
        <div className="relative">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder={t('userHomeScreen.searchPlaceholder')}
              className={`flex-1 bg-transparent text-gray-600 placeholder-gray-400 outline-none ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Filtering based on searchTerm is now handled by the useEffect for client-side filtering
              }}
            />
          </div>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className={`absolute right-2 top-2 bg-blue-600 text-white rounded-full px-4 py-2 flex items-center space-x-1 hover:bg-blue-700 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">{t('userHomeScreen.filterButton')}</span>
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
            <h2 className={`text-xl font-bold mb-4 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {t('userHomeScreen.filterOptions')}
            </h2>

            {/* Room Type Filter */}
            <div className="mb-4">
              <label htmlFor="roomType" className={`block text-gray-700 text-sm font-bold mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {t('userHomeScreen.roomTypeFilterLabel')}
              </label>
              <input
                type="text"
                id="roomType"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                value={filterCriteria.roomType}
                onChange={(e) => setFilterCriteria({ ...filterCriteria, roomType: e.target.value })}
                placeholder={t('userHomeScreen.roomTypePlaceholder')}
              />
            </div>

            {/* Capacity Filter */}
            <div className="mb-4">
              <label className={`block text-gray-700 text-sm font-bold mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {t('userHomeScreen.capacityFilterLabel')}
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder={t('userHomeScreen.minCapacityPlaceholder')}
                  className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                  value={filterCriteria.capacity.min}
                  onChange={(e) => setFilterCriteria({ ...filterCriteria, capacity: { ...filterCriteria.capacity, min: e.target.value } })}
                />
                <input
                  type="number"
                  placeholder={t('userHomeScreen.maxCapacityPlaceholder')}
                  className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                  value={filterCriteria.capacity.max}
                  onChange={(e) => setFilterCriteria({ ...filterCriteria, capacity: { ...filterCriteria.capacity, max: e.target.value } })}
                />
              </div>
            </div>

            {/* Equipment Filter (Multiple Select) */}
            <div className="mb-4">
              <label htmlFor="equipment" className={`block text-gray-700 text-sm font-bold mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {t('userHomeScreen.equipmentFilterLabel')}
              </label>
              <select
                id="equipment"
                multiple
                className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                value={filterCriteria.equipment}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  setFilterCriteria({ ...filterCriteria, equipment: selectedOptions });
                }}
              >
                {/* Replace with actual equipment IDs and names from your backend/data */}
                <option value="507f191e810c19729de860ea">{t('userHomeScreen.equipmentOption1')}</option>
                <option value="507f191e810c19729de860eb">{t('userHomeScreen.equipmentOption2')}</option>
                <option value="someOtherEquipmentId">{t('userHomeScreen.equipmentOption3')}</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="mb-4">
              <label htmlFor="status" className={`block text-gray-700 text-sm font-bold mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {t('userHomeScreen.statusFilterLabel')}
              </label>
              <select
                id="status"
                className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                value={filterCriteria.status}
                onChange={(e) => setFilterCriteria({ ...filterCriteria, status: e.target.value })}
              >
                <option value="">{t('userHomeScreen.allStatuses')}</option>
                <option value="available">{t('userHomeScreen.available')}</option>
                <option value="occupied">{t('userHomeScreen.occupied')}</option>
                <option value="maintenance">{t('userHomeScreen.maintenance')}</option>
              </select>
            </div>

            {/* Location Filter */}
            <div className="mb-6">
              <label htmlFor="location" className={`block text-gray-700 text-sm font-bold mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                {t('userHomeScreen.locationFilterLabel')}
              </label>
              <input
                type="text"
                id="location"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                value={filterCriteria.location}
                onChange={(e) => setFilterCriteria({ ...filterCriteria, location: e.target.value })}
                placeholder={t('userHomeScreen.locationPlaceholder')}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={resetFilters}
                className={`bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              >
                {t('userHomeScreen.clearFilters')}
              </button>
              <button
                onClick={handleApplyFilters} // Call the new function for server-side search
                className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              >
                {t('userHomeScreen.applyFilters')}
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className={`bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              >
                {t('userHomeScreen.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-4 mb-4 w-full max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-2">
          {[t('userHomeScreen.allRoomTab'), t('userHomeScreen.availableRoomTab')].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                // Filtering based on activeTab is now handled by the useEffect for client-side filtering
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Room Cards */}
      <div className="flex-1 px-4 w-full max-w-5xl mx-auto">
        {currentRooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <p className={`text-gray-500 text-lg mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('userHomeScreen.noRoomsFound')}</p>
            <p className={`text-gray-400 text-sm ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {activeTab === t('userHomeScreen.availableRoomTab')
                ? t('userHomeScreen.noAvailableRoomsMoment')
                : t('userHomeScreen.noRoomsToDisplay')}
            </p>
            <button
              onClick={() => {
                Swal.fire({
                  title: t('userHomeScreen.refreshRoomListQuestion'),
                  text: t('userHomeScreen.reloadRoomsFromServerText'),
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#2563EB',
                  cancelButtonColor: '#6B7280',
                  confirmButtonText: t('userHomeScreen.yesRefresh'),
                  cancelButtonText: t('userHomeScreen.cancel'),
                  customClass: {
                    title: i18n.language === 'lo' ? 'font-lao' : '',
                    htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
                    confirmButton: i18n.language === 'lo' ? 'font-lao' : '',
                    cancelButton: i18n.language === 'lo' ? 'font-lao' : ''
                  }
                }).then((result) => {
                  if (result.isConfirmed) {
                    fetchAllRooms(); // Re-fetch all rooms from the server
                  }
                });
              }}
              className={`mt-4 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              {t('userHomeScreen.refreshButton')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentRooms.map((room) => {
              const roomId = room.id || room._id;
              const isLoading = favoriteLoading[roomId];

              return (
                <div
                  key={roomId}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleRoomClick(room)}
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {room.photo ? (
                      <img
                        src={room.photo}
                        alt={room.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl font-bold text-gray-600">
                          {room.name ? room.name.substring(0, 2).toUpperCase() : 'RM'}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={(e) => toggleFavorite(room, e)}
                      disabled={isLoading}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-colors backdrop-blur-sm ${isLoading
                        ? 'bg-gray-300/50 cursor-not-allowed'
                        : 'hover:bg-white/20 bg-blue-600/20'
                        }`}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Heart
                          className={`w-5 h-5 ${room.isFavorited
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400 hover:text-red-500'
                            }`}
                        />
                      )}
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold text-lg truncate ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        {room.name || t('roomCard.unnamedRoom')}
                      </h3>
                      <div className={`flex items-center space-x-1`}>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(room.status).split(' ')[1]}`}></div>
                        <span className={`text-sm ${getStatusColor(room.status).split(' ')[0]} ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                          {getStatusText(room.status)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                      {/* Room Type */}
                      <div className={`flex items-center ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        <span className="font-medium text-gray-700 mr-1">{t('roomCard.typeLabel')}:</span>
                        <span>{room.roomType?.typeName || t('userHomeScreen.roomTypeDefault')}</span>
                      </div>

                      {/* Location */}
                      <div className={`flex items-center ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        <MapPin className="w-3.5 h-3.5 text-gray-500 mr-1" />
                        <span>{room.location || t('roomCard.locationDefault')}</span>
                      </div>

                      {/* Capacity */}
                      <div className={`flex items-center ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        <Users className="w-3.5 h-3.5 text-gray-500 mr-1" />
                        <span>{room.capacity || 0} {t('roomCard.capacityUnit')}</span>
                      </div>

                      {/* Equipment List */}
                      {room.equipment?.length > 0 && (
                        <div>
                          <p className={`text-sm font-medium text-gray-700 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                            {t('roomCard.equipmentLabel')}
                          </p>
                          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            {room.equipment.map((item, index) => {
                              const equipmentName = item.equipment?.name || item.name || t('roomCard.unknownEquipment');
                              const quantity = item.quantity || 0;
                              const icon = getEquipmentIcon(equipmentName);

                              return (
                                <li key={`eq-${index}`} className="flex items-center space-x-1">
                                  {icon}
                                  <span className={i18n.language === 'lo' ? 'font-lao' : ''}>
                                    {equipmentName} {quantity > 1 ? `(${quantity})` : ''}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Note */}
                    {room.note && (
                      <p className={`text-sm text-gray-600 leading-relaxed line-clamp-2 mt-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        <span className="font-medium text-gray-700">{t('roomCard.noteLabel')}:</span> {room.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 py-6">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('userHomeScreen.previousPage')}</span>
            </button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg transition-colors ${currentPage === pageNum
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${i18n.language === 'lo' ? 'font-lao' : ''}`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              <span>{t('userHomeScreen.nextPage')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Results Summary */}
        {rooms.length > 0 && ( // Use `rooms` length for summary
          <div className={`text-center text-sm text-gray-500 pb-6 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            {t('userHomeScreen.showingRoomsSummary', {
              start: startIndex + 1,
              end: Math.min(endIndex, rooms.length),
              total: rooms.length
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHomeScreen;