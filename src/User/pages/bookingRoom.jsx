import React, { useState } from 'react';
import { MapPin, Wifi, Car, Coffee, Utensils, Users, Monitor, Projector, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';

// Mock data for bookings
const mockBookings = [
  {
    id: 1,
    roomName: "iOURi Room",
    location: "Floor 45",
    date: "2025-06-22",
    time: "09:00 - 11:00",
    duration: "2 hours",
    capacity: 12,
    status: "confirmed",
    bookingId: "BK001",
    amenities: ['wifi', 'projector', 'coffee'],
    participants: 8
  },
  {
    id: 2,
    roomName: "Executive Conference Room",
    location: "Floor 32",
    date: "2025-06-25",
    time: "14:00 - 16:30",
    duration: "2.5 hours",
    capacity: 20,
    status: "pending",
    bookingId: "BK002",
    amenities: ['wifi', 'projector', 'monitor'],
    participants: 15
  },
  {
    id: 3,
    roomName: "Creative Meeting Studio",
    location: "Floor 12",
    date: "2025-06-20",
    time: "10:00 - 12:00",
    duration: "2 hours",
    capacity: 8,
    status: "completed",
    bookingId: "BK003",
    amenities: ['wifi', 'monitor'],
    participants: 6
  },
  {
    id: 4,
    roomName: "Boardroom Elite",
    location: "Floor 28",
    date: "2025-06-18",
    time: "13:00 - 17:00",
    duration: "4 hours",
    capacity: 16,
    status: "completed",
    bookingId: "BK004",
    amenities: ['wifi', 'projector', 'monitor', 'coffee'],
    participants: 12
  },
  {
    id: 5,
    roomName: "Innovation Hub",
    location: "Floor 15",
    date: "2025-06-15",
    time: "09:30 - 11:30",
    duration: "2 hours",
    capacity: 10,
    status: "cancelled",
    bookingId: "BK005",
    amenities: ['wifi', 'projector'],
    participants: 7
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

const StatusBadge = ({ status }) => {
  const statusConfig = {
    confirmed: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'Confirmed'
    },
    pending: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'Pending'
    },
    completed: {
      icon: CheckCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'Completed'
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'Cancelled'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg} ${config.border} border`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </div>
  );
};

const BookingCard = ({ booking, onManage, onCancel }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isUpcoming = booking.status === 'confirmed' || booking.status === 'pending';
  const canCancel = booking.status === 'confirmed' || booking.status === 'pending';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 relative overflow-hidden">
          {/* Simulated room image */}
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
        
        <div className="absolute top-3 right-3">
          <StatusBadge status={booking.status} />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900">{booking.roomName}</h3>
          <span className="text-sm text-gray-500">#{booking.bookingId}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{booking.location}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{formatDate(booking.date)}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <Clock className="w-4 h-4 mr-1" />
          <span>{booking.time} ({booking.duration})</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <Users className="w-4 h-4 mr-1" />
          <span>{booking.participants} people (Capacity: {booking.capacity})</span>
        </div>
        
        <div className="flex items-center space-x-3 mb-4">
          {booking.amenities.map((amenity, index) => (
            <AmenityIcon key={index} type={amenity} />
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={() => onManage(booking)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            View Details
          </button>
          
          {canCancel && (
            <button
              onClick={() => onCancel(booking)}
              className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const BookingScreen = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleManage = (booking) => {
    alert(`Managing booking: ${booking.bookingId} for ${booking.roomName}`);
  };

  const handleCancel = (booking) => {
    if (window.confirm(`Are you sure you want to cancel booking ${booking.bookingId}?`)) {
      alert(`Booking ${booking.bookingId} cancelled successfully`);
    }
  };

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'upcoming') return matchesSearch && (booking.status === 'confirmed' || booking.status === 'pending');
    if (activeFilter === 'history') return matchesSearch && (booking.status === 'completed' || booking.status === 'cancelled');
    
    return matchesSearch;
  });

  const filterButtons = [
    { key: 'all', label: 'All Bookings', count: mockBookings.length },
    { key: 'upcoming', label: 'Upcoming', count: mockBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length },
    { key: 'history', label: 'History', count: mockBookings.filter(b => b.status === 'completed' || b.status === 'cancelled').length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Bookings</h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex space-x-2 overflow-x-auto">
          {filterButtons.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 text-center">
              {searchQuery ? 'No bookings match your search.' : 'You haven\'t made any bookings yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
            </p>
            
            {filteredBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onManage={handleManage}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingScreen;