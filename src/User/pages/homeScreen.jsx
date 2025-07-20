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
import { useTranslation } from 'react-i18next'; // Import useTranslation

const UserHomeScreen = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Initialize translation hook

  const [activeTab, setActiveTab] = useState(t('userHomeScreen.allRoomTab')); // Use translation key for initial state
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteLoading, setFavoriteLoading] = useState({}); // Track loading state for individual rooms
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term
  const roomsPerPage = 6;

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rooms');

      let roomsData = [];
      if (response && response.data && response.data.data) {
        roomsData = response.data.data;
      } else if (Array.isArray(response)) {
        roomsData = response;
      } else if (response && Array.isArray(response.rooms)) {
        roomsData = response.rooms;
      }

      setRooms(roomsData);
      setError(null);

      if (roomsData && roomsData.length > 0) {
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
      console.error('Error fetching rooms:', err);

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
          fetchRooms();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(room => {
    // Filter by active tab (All Rooms or Available Rooms)
    if (activeTab === t('userHomeScreen.availableRoomTab') && room.status !== 'available') {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const nameMatch = room.name?.toLowerCase().includes(lowerCaseSearchTerm);
      const locationMatch = room.location?.toLowerCase().includes(lowerCaseSearchTerm);
      const capacityMatch = room.capacity?.toString().includes(lowerCaseSearchTerm); // Convert capacity to string for search

      return nameMatch || locationMatch || capacityMatch;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const startIndex = (currentPage - 1) * roomsPerPage;
  const endIndex = startIndex + roomsPerPage;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const toggleFavorite = async (room, e) => {
    e.stopPropagation(); // Prevent triggering the room click

    const roomId = room.id || room._id;
    const newFavoriteStatus = !room.isFavorite;

    // Set loading state for this specific room
    setFavoriteLoading(prev => ({ ...prev, [roomId]: true }));

    try {
      if (newFavoriteStatus) {
        // Add to favorites
        await api.post('/favorite-rooms', {
          roomId: roomId
        });
      } else {
        // Remove from favorites
        await api.delete('/favorite-rooms', {
          data: {
            roomId: roomId
          }
        });
      }

      // Update the room's favorite status in the local state
      setRooms(prevRooms =>
        prevRooms.map(r =>
          (r.id || r._id) === roomId
            ? { ...r, isFavorite: newFavoriteStatus }
            : r
        )
      );

      // Show success message
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

      // Show error message
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
      // Remove loading state for this room
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
    const lowerName = (name || '').toLowerCase(); // Add fallback for undefined name
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('userHomeScreen.loadingRooms')}</p>
        </div>
      </div>
    );
  }

  if (error) {
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
                  fetchRooms();
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
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
          {/* Filter button - functionality not implemented in this update */}
          <button className={`absolute right-2 top-2 bg-blue-600 text-white rounded-full px-4 py-2 flex items-center space-x-1 hover:bg-blue-700 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">{t('userHomeScreen.filterButton')}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-4 w-full max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-2">
          {[t('userHomeScreen.allRoomTab'), t('userHomeScreen.availableRoomTab')].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
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
                    fetchRooms();
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
                          className={`w-5 h-5 ${room.isFavorited // Use room.isFavorited here
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400 hover:text-red-500'
                            }`}
                        />
                      )}
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold text-lg truncate ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{room.name || t('userHomeScreen.unnamedRoom')}</h3>
                      <div className={`flex items-center space-x-1 mb-3`}>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(room.status).split(' ')[1]}`}></div>
                        <span className={`text-sm ${getStatusColor(room.status).split(' ')[0]} ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                          {getStatusText(room.status)}
                        </span>
                      </div>
                    </div>

                    <div className={`flex items-center space-x-2 text-sm text-gray-600 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                      <span>{room.roomType || t('userHomeScreen.roomTypeDefault')}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{room.location || t('userHomeScreen.locationDefault')}</span>
                      </div>
                    </div>

                    <div className={`flex items-center space-x-2 mb-3 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{room.capacity || 0} {t('userHomeScreen.capacityUnit')}</span>
                      </div>
                    </div>

                    <div className={`text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                      {room.equipment?.length > 0 && (
                        <div>
                          {t('userHomeScreen.equipmentLabel')} {room.equipment.map((item, index) => {
                            const name = item.equipment?.name || 'Unknown';
                            return (
                              <span key={`eq-${index}`}>
                                {index > 0 && ', '}
                                {name} ({item.quantity})
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {room.note && (
                      <p className={`text-sm text-gray-600 leading-relaxed line-clamp-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
                        {t('userHomeScreen.noteLabel')} {room.note}
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
        {filteredRooms.length > 0 && (
          <div className={`text-center text-sm text-gray-500 pb-6 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            {t('userHomeScreen.showingRoomsSummary', {
              start: startIndex + 1,
              end: Math.min(endIndex, filteredRooms.length),
              total: filteredRooms.length
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHomeScreen;