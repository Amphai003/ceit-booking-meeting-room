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

const UserHomeScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All room');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteLoading, setFavoriteLoading] = useState({}); // Track loading state for individual rooms
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
          title: 'Rooms Loaded!',
          text: `Successfully loaded ${roomsData.length} rooms`,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch rooms');
      console.error('Error fetching rooms:', err);

      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Rooms',
        text: err.message || 'Unable to fetch rooms from server',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#2563EB' // Changed from #000000 to blue
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
    if (activeTab === 'Available room') {
      return room.status === 'available';
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
        title: newFavoriteStatus ? 'Added to Favorites!' : 'Removed from Favorites!',
        text: `"${room.name}" has been ${newFavoriteStatus ? 'added to' : 'removed from'} your favorites`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (error) {
      console.error('Error toggling favorite:', error);

      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${newFavoriteStatus ? 'add to' : 'remove from'} favorites. Please try again.`,
        confirmButtonColor: '#2563EB' // Changed from #000000 to blue
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
        title: 'Room Not Available',
        text: 'This room is currently not available for booking',
        confirmButtonColor: '#2563EB' // Changed from #000000 to blue
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
        return 'Available Now';
      case 'occupied':
        return 'Unavailable Now';
      case 'maintenance':
        return 'Under Maintenance';
      default:
        return 'Unknown Status';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div> {/* Changed to blue-500 */}
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4 text-lg">Error loading rooms</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              Swal.fire({
                title: 'Retry Loading Rooms?',
                text: 'This will attempt to fetch rooms from the server again.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#2563EB', // Changed to blue
                cancelButtonColor: '#6B7280',
                confirmButtonText: 'Yes, retry!',
                cancelButtonText: 'Cancel'
              }).then((result) => {
                if (result.isConfirmed) {
                  fetchRooms();
                }
              });
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors" // Changed to blue
          >
            Try Again
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
              placeholder="Where are you going?"
              className="flex-1 bg-transparent text-gray-600 placeholder-gray-400 outline-none"
            />
          </div>
          <button className="absolute right-2 top-2 bg-blue-600 text-white rounded-full px-4 py-2 flex items-center space-x-1 hover:bg-blue-700"> {/* Changed to blue */}
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">Filter</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-4 w-full max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-2">
          {['All room', 'Available room'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab
                ? 'bg-blue-600 text-white hover:bg-blue-700' // Changed to blue
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
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
            <p className="text-gray-500 text-lg mb-2">No rooms found</p>
            <p className="text-gray-400 text-sm">
              {activeTab === 'Available room'
                ? 'No available rooms at the moment'
                : 'No rooms to display'}
            </p>
            <button
              onClick={() => {
                Swal.fire({
                  title: 'Refresh Room List?',
                  text: 'This will reload all rooms from the server.',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#2563EB', // Changed to blue
                  cancelButtonColor: '#6B7280',
                  confirmButtonText: 'Yes, refresh!',
                  cancelButtonText: 'Cancel'
                }).then((result) => {
                  if (result.isConfirmed) {
                    fetchRooms();
                  }
                });
              }}
              className="mt-4 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
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
                        : 'hover:bg-white/20 bg-blue-600/20' // Changed to blue
                        }`}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Heart
                          className={`w-5 h-5 ${room.isFavorite
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400 hover:text-red-500'
                            }`}
                        />
                      )}
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg truncate">{room.name || 'Unnamed Room'}</h3>
                      <div className={`flex items-center space-x-1 mb-3`}>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(room.status).split(' ')[1]}`}></div>
                        <span className={`text-sm ${getStatusColor(room.status).split(' ')[0]}`}>
                          {getStatusText(room.status)}
                        </span>
                      </div>

                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <span>{room.roomType || 'Room'}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{room.location || 'Location'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{room.capacity || 0} people</span>
                      </div>
                    </div>

                    <div className="text-gray-600">

                      {room.equipment?.length > 0 && (
                        <div>
                          Equipment: {room.equipment.map((item, index) => {
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
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        Note: {room.note}
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
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg transition-colors ${currentPage === pageNum
                    ? 'bg-blue-600 text-white hover:bg-blue-700' // Changed to blue
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
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
                }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Results Summary */}
        {filteredRooms.length > 0 && (
          <div className="text-center text-sm text-gray-500 pb-6">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredRooms.length)} of {filteredRooms.length} rooms
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHomeScreen;