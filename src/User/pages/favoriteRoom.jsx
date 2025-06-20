import React, { useState } from 'react';
import { Heart, MapPin, Star, Wifi, Car, Coffee, Utensils, Users, Monitor, Projector } from 'lucide-react';

// Mock data for favorite meeting rooms
const initialFavoriteRooms = [
  {
    id: 1,
    name: "iOURi Room",
    location: "Hosting room 2hr+ • Floor 45",
    description: "This room is big room with all necessary equipment and services such as cooling temperature",
    image: "/api/placeholder/400/300",
    rating: 4.96,
    capacity: 12,
    amenities: ['wifi', 'projector', 'coffee', 'parking'],
    isFavorite: true
  },
  {
    id: 2,
    name: "Executive Conference Room",
    location: "Business District • Floor 32",
    description: "Premium conference room with panoramic city views and high-end presentation facilities",
    image: "/api/placeholder/400/300",
    rating: 4.88,
    capacity: 20,
    amenities: ['wifi', 'projector', 'coffee', 'monitor'],
    isFavorite: true
  },
  {
    id: 3,
    name: "Creative Meeting Studio",
    location: "Arts Quarter • Floor 12",
    description: "Inspiring meeting space with natural light and flexible layout for brainstorming sessions",
    image: "/api/placeholder/400/300",
    rating: 4.92,
    capacity: 8,
    amenities: ['wifi', 'monitor', 'coffee'],
    isFavorite: true
  },
  {
    id: 4,
    name: "Boardroom Elite",
    location: "Corporate Center • Floor 28",
    description: "Sophisticated boardroom with premium furnishing and advanced AV equipment for executive meetings",
    image: "/api/placeholder/400/300",
    rating: 4.95,
    capacity: 16,
    amenities: ['wifi', 'projector', 'monitor', 'coffee', 'parking'],
    isFavorite: true
  }
];

const AmenityIcon = ({ type }) => {
  const icons = {
    wifi: Wifi,
    parking: Car,
    coffee: Coffee,
    restaurant: Utensils,
    projector: Projector,
    monitor: Monitor
  };
  
  const Icon = icons[type];
  return Icon ? <Icon className="w-4 h-4 text-gray-600" /> : null;
};

const FavoriteRoomCard = ({ room, onToggleFavorite, onBook }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 relative overflow-hidden">
          {/* Simulated room image with curved windows */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex space-x-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-16 h-24 bg-white/10 backdrop-blur-sm rounded border border-white/20"></div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-12 bg-black/30 rounded-full"></div>
          </div>
        </div>
        
        <button
          onClick={() => onToggleFavorite(room.id)}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
        >
          <Heart 
            className={`w-4 h-4 ${room.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
          />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900">{room.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{room.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{room.location}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <Users className="w-4 h-4 mr-1" />
          <span>Up to {room.capacity} people</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {room.description}
        </p>
        
        <div className="flex items-center space-x-3 mb-4">
          {room.amenities.map((amenity, index) => (
            <AmenityIcon key={index} type={amenity} />
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={() => onBook(room)}
            className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

const FavoriteRoomsScreen = () => {
  const [favoriteRooms, setFavoriteRooms] = useState(initialFavoriteRooms);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleFavorite = (roomId) => {
    setFavoriteRooms(rooms => 
      rooms.map(room => 
        room.id === roomId 
          ? { ...room, isFavorite: !room.isFavorite }
          : room
      ).filter(room => room.isFavorite) // Remove from favorites if unfavorited
    );
  };

  const handleBook = (room) => {
    alert(`Booking ${room.name}...`);
  };

  const filteredRooms = favoriteRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Favorite</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search favorite meeting rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorite Meeting Rooms</h3>
            <p className="text-gray-600 text-center">
              {searchQuery ? 'No meeting rooms match your search.' : 'Start adding meeting rooms to your favorites to see them here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              {filteredRooms.length} favorite meeting room{filteredRooms.length !== 1 ? 's' : ''}
            </p>
            
            {filteredRooms.map(room => (
              <FavoriteRoomCard
                key={room.id}
                room={room}
                onToggleFavorite={handleToggleFavorite}
                onBook={handleBook}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteRoomsScreen;