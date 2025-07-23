import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MapPin, Users, Loader2, ServerCrash, Search, Wifi, Monitor, Mic } from 'lucide-react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Reusing the RoomCard component for displaying favorite rooms
const FavoriteRoomCard = ({ room, onToggleFavorite, onBook }) => {
  const [imageError, setImageError] = useState(false);
  const { t, i18n } = useTranslation(); // Initialize translation hook

  const getRoomPhotoUrl = useCallback(() => {
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
  }, [room]);

  const photoUrl = getRoomPhotoUrl();

  const getEquipmentIcon = useCallback((name) => {
    const lowerName = (name || '').toLowerCase();
    if (lowerName.includes('tv') || lowerName.includes('monitor') || lowerName.includes('projector')) {
      return <Monitor className="w-3 h-3 text-gray-500" />;
    } else if (lowerName.includes('mic') || lowerName.includes('microphone')) {
      return <Mic className="w-3 h-3 text-gray-500" />;
    } else if (lowerName.includes('wifi') || lowerName.includes('internet')) {
      return <Wifi className="w-3 h-3 text-gray-500" />;
    } else {
      return null;
    }
  }, []);
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {photoUrl && !imageError ? (
          <img
            src={photoUrl}
            alt={room.name || t('roomCard.unnamedRoom')}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`text-4xl font-bold text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {room.name ? room.name.substring(0, 2).toUpperCase() : 'RM'}
            </div>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(room);
          }}
          className="absolute top-3 right-3 p-2 rounded-full transition-colors backdrop-blur-sm bg-blue-600/20 hover:bg-white/20"
        >
          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-semibold text-lg truncate ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            {room.name || t('roomCard.unnamedRoom')}
          </h3>
          {/* Status display - assuming this is correctly placed next to the title */}
          {/* Note: This block was missing in your provided snippet, so I added it here for completeness */}
          <div className={`flex items-center space-x-1`}>
            <div className={`w-2 h-2 rounded-full ${room.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${room.status === 'available' ? 'text-green-500' : 'text-red-500'} ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
              {room.status === 'available' ? t('userHomeScreen.availableNow') : t('userHomeScreen.unavailableNow')}
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
            <span className="text-sm text-gray-600">{room.capacity || 0} {t('roomCard.capacityUnit')}</span>
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

        {room.note && (
          <p className={`text-sm text-gray-600 leading-relaxed line-clamp-2 mt-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            <span className="font-medium text-gray-700">{t('roomCard.noteLabel')}:</span> {room.note}
          </p>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook(room);
            }}
            className={`bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}
          >
            {t('roomCard.bookNowButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

const FavoriteRoomsScreen = () => {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Initialize translation hook

  const fetchFavoriteRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/favorite-rooms');
      const transformedData = (response.data || []).map(item => ({
        ...item.room,
        isFavorite: true
      }));
      setFavoriteItems(transformedData);
    } catch (err) {
      console.error("Failed to fetch favorite rooms:", err);
      setError(err.message || t('favoriteRoomsScreen.couldNotLoadFavorites'));
    } finally {
      setLoading(false);
    }
  }, [t]); // Add t to useCallback dependencies

  useEffect(() => {
    fetchFavoriteRooms();
  }, [fetchFavoriteRooms]);

  const handleToggleFavorite = async (roomToRemove) => {
    const result = await Swal.fire({
      title: t('favoriteRoomsScreen.areYouSure'),
      text: t('favoriteRoomsScreen.removeFavoriteConfirmation', { roomName: roomToRemove.name }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#d33',
      confirmButtonText: t('favoriteRoomsScreen.yesRemoveIt'),
      cancelButtonText: t('userHomeScreen.cancel'), // Reusing cancel from userHomeScreen
      customClass: {
        title: i18n.language === 'lo' ? 'font-lao' : '',
        htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
        confirmButton: i18n.language === 'lo' ? 'font-lao' : '',
        cancelButton: i18n.language === 'lo' ? 'font-lao' : ''
      }
    });

    if (result.isConfirmed) {
      try {
        await api.delete('/favorite-rooms', {
          data: { roomId: roomToRemove._id }
        });
        setFavoriteItems(currentItems =>
          currentItems.filter(room => room._id !== roomToRemove._id)
        );
        Swal.fire({
          title: t('favoriteRoomsScreen.removedTitle'),
          text: t('favoriteRoomsScreen.removedSuccessText', { roomName: roomToRemove.name }),
          icon: 'success',
          customClass: {
            title: i18n.language === 'lo' ? 'font-lao' : '',
            htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
            confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
          }
        });
      } catch (err) {
        console.error("Failed to unfavorite room:", err);
        Swal.fire({
          title: t('favoriteRoomsScreen.errorRemovingTitle'),
          text: t('favoriteRoomsScreen.errorRemovingText'),
          icon: 'error',
          customClass: {
            title: i18n.language === 'lo' ? 'font-lao' : '',
            htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
            confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
          }
        });
        fetchFavoriteRooms();
      }
    }
  };

  const handleBook = (room) => {
    if (room.status === 'available') {
      navigate('/booking', { state: { room } });
    } else {
      Swal.fire({
        icon: 'info',
        title: t('userHomeScreen.roomNotAvailableTitle'), // Reusing translation from UserHomeScreen
        text: t('userHomeScreen.roomNotAvailableText'), // Reusing translation from UserHomeScreen
        confirmButtonColor: '#2563EB',
        customClass: {
          title: i18n.language === 'lo' ? 'font-lao' : '',
          htmlContainer: i18n.language === 'lo' ? 'font-lao' : '',
          confirmButton: i18n.language === 'lo' ? 'font-lao' : ''
        }
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
          <p className={`text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('favoriteRoomsScreen.loadingFavorites')}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ServerCrash className="w-16 h-16 text-red-400 mb-4" />
          <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('favoriteRoomsScreen.somethingWentWrong')}</h3>
          <p className={`text-gray-600 mb-4 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{error}</p>
          <button
            onClick={fetchFavoriteRooms}
            className={`bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors ${i18n.language === 'lo' ? 'font-lao' : ''}`}
          >
            {t('userHomeScreen.tryAgain')}
          </button>
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Heart className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('favoriteRoomsScreen.noFavoriteRooms')}</h3>
          <p className={`text-gray-600 text-center ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            {searchQuery ? t('favoriteRoomsScreen.noRoomsMatchSearch') : t('favoriteRoomsScreen.startAddingFavorites')}
          </p>
        </div>
      );
    }

    return (
      <>
        <p className={`text-gray-600 text-sm mb-4 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
          {t('favoriteRoomsScreen.favoriteRoomsCount', { count: filteredItems.length, count_plural: filteredItems.length !== 1 ? 's' : '' })}
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
          <h1 className={`text-2xl font-bold text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('favoriteRoomsScreen.headerTitle')}</h1>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-[72px] z-30 max-w-5xl mx-auto w-full">
        <div className="relative">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder={t('favoriteRoomsScreen.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent text-gray-600 placeholder-gray-400 outline-none ${i18n.language === 'lo' ? 'font-lao' : ''}`}
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
