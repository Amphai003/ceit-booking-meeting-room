import { Users, MapPin, Edit } from 'lucide-react';

const RoomCard = ({ room, getStatusColor, getStatusIcon, navigate }) => {
  const handleViewDetails = () => {
    navigate(`/rooms/${room.id}`);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{room.name}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4" />
            {room.location}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
          {getStatusIcon(room.status)} {room.status}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          Capacity: {room.capacity} people
        </div>
        
        <div className="flex flex-wrap gap-1">
          {room.equipment.map((eq, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {eq}
            </span>
          ))}
        </div>
        
        {room.status === 'occupied' && room.currentMeeting && (
          <div className="text-red-600 font-medium">
            {room.currentMeeting}
          </div>
        )}
        
        {room.status === 'available' && room.nextMeeting && (
          <div className="text-green-600">
            Next: {room.nextMeeting}
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-4">
        <button 
          onClick={handleViewDetails}
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
        >
          View Details
        </button>
        <button className="px-3 py-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors">
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RoomCard;