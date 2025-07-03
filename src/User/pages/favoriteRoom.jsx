import React, { useState, useEffect,useCallback } from 'react'; // Added useCallback
import { Heart, MapPin, Users, Loader2, ServerCrash, Search, Wifi, Monitor, Mic } from 'lucide-react'; // Added equipment icons
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const FavoriteRoomCard = ({ room, onToggleFavorite, onBook }) => {
  const [imageError, setImageError] = useState(false);

  // Function to get room photo URL, similar to UserHomeScreen
  const getRoomPhotoUrl = useCallback(() => { // Memoize with useCallback
    if (room.photos && Array.isArray(room.photos) && room.photos.length > 0) {
      return room.photos[0];
    }
    if (room.photo) {
      return room.photo;
    }
    if (room.image) {
      return room.image;
    }
    if (room.images && Array.isArray(room.images) && room.images.length > 0) {
      return room.images[0];
    }
    return null;
  }, [room]); // Depend on room for photo URL changes

  const photoUrl = getRoomPhotoUrl();

  // --- New: Utility function for getting equipment icon (copied from UserHomeScreen) ---
  const getEquipmentIcon = useCallback((name) => {
    const lowerName = (name || '').toLowerCase();
    if (lowerName.includes('tv') || lowerName.includes('monitor') || lowerName.includes('projector')) {
      return <Monitor className="w-3 h-3 text-gray-500" />;
    } else if (lowerName.includes('mic') || lowerName.includes('microphone')) {
      return <Mic className="w-3 h-3 text-gray-500" />;
    } else if (lowerName.includes('wifi') || lowerName.includes('internet')) {
      return <Wifi className="w-3 h-3 text-gray-500" />;
    } else {
      return null; // Return null if no specific icon
    }
  }, []);
  // --- End New ---

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {photoUrl && !imageError ? (
          <img
            src={photoUrl}
            alt={room.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl font-bold text-gray-600">
              {room.name ? room.name.substring(0, 2).toUpperCase() : 'RM'}
            </div>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card click
            onToggleFavorite(room);
          }}
          className="absolute top-3 right-3 p-2 rounded-full transition-colors backdrop-blur-sm bg-blue-600/20 hover:bg-white/20"
        >
          <Heart className="w-5 h-5 fill-red-500 text-red-500" /> {/* Always filled as it's a favorite */}
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg truncate">{room.name || 'Unnamed Room'}</h3>
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
            <span className="text-sm text-gray-600">{room.capacity || 0} capacity</span>
          </div>
        </div>

        <div className="text-gray-600">
          {room.equipment?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Equipment:</p> {/* Added a heading */}
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm"> {/* Using ul for list */}
                {room.equipment.map((item, index) => {
                  const equipmentName = item.equipment?.name || item.name || 'Unknown'; // Prioritize nested name
                  const quantity = item.quantity || 0;
                  const icon = getEquipmentIcon(equipmentName);

                  return (
                    <li key={`eq-${index}`} className="flex items-center space-x-1">
                      {icon}
                      <span>{equipmentName} ({quantity})</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {room.note && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mt-2">
            <span className="font-medium">Note:</span> {room.note}
          </p>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook(room);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// --- FavoriteRoomsScreen component remains the same as before, no changes needed here directly ---
const FavoriteRoomsScreen = () => {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchFavoriteRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/favorite-rooms');
      // Ensure the room object itself is spread, and isFavorite is explicitly set
      const transformedData = (response.data || []).map(item => ({
        ...item.room, // This ensures all room properties are at the top level
        isFavorite: true // This is crucial for consistency with UserHomeScreen's favorite state
      }));
      setFavoriteItems(transformedData);
    } catch (err) {
      console.error("Failed to fetch favorite rooms:", err);
      setError(err.message || "Could not load your favorite rooms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavoriteRooms();
  }, [fetchFavoriteRooms]);

  const handleToggleFavorite = async (roomToRemove) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Remove "${roomToRemove.name}" from your favorites?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete('/favorite-rooms', {
          data: { roomId: roomToRemove._id }
        });
        setFavoriteItems(currentItems =>
          currentItems.filter(room => room._id !== roomToRemove._id)
        );
        Swal.fire(
          'Removed!',
          `"${roomToRemove.name}" has been removed from your favorites.`,
          'success'
        );
      } catch (err) {
        console.error("Failed to unfavorite room:", err);
        Swal.fire(
          'Error!',
          'Could not remove the room. Please try again.',
          'error'
        );
        fetchFavoriteRooms(); // Re-fetch to ensure state is accurate
      }
    }
  };

  const handleBook = (room) => {
    if (room.status === 'available') {
      navigate('/booking', { state: { room } });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Room Not Available',
        text: 'This room is currently not available for booking',
        confirmButtonColor: '#2563EB'
      });
    }
  };

  const filteredItems = favoriteItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading Favorites...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ServerCrash className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFavoriteRooms}
            className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorite Rooms</h3>
          <p className="text-gray-600 text-center">
            {searchQuery ? 'No rooms match your search.' : 'Start adding rooms to your favorites to see them here.'}
          </p>
        </div>
      );
    }

    return (
      <>
        <p className="text-gray-600 text-sm mb-4">
          {filteredItems.length} favorite meeting room{filteredItems.length !== 1 ? 's' : ''}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(room => (
            <FavoriteRoomCard
              key={room._id}
              room={room}
              onToggleFavorite={handleToggleFavorite}
              onBook={handleBook}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">Favorite Rooms</h1>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-[72px] z-30 max-w-5xl mx-auto w-full">
        <div className="relative">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search in your favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-gray-600 placeholder-gray-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content Area (Favorite Room Cards) */}
      <div className="flex-1 px-4 py-4 w-full max-w-5xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default FavoriteRoomsScreen;