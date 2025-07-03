import { Users, MapPin, Edit } from 'lucide-react';

const RoomCard = ({ room, getStatusColor, getStatusIcon, navigate }) => {
  const handleViewDetails = () => {
    navigate(`/rooms/${room.id}`); // Navigates to a specific room detail page
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

      {/* Display Room Photo if available */}
      {room.photo && (
        <div className="mb-3">
          <img
            src={room.photo}
            alt={`Photo of ${room.name}`}
            className="w-full h-32 object-cover rounded-md" // Tailwind classes for styling
          />
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          Capacity: {room.capacity} people
        </div>

        {/* Display Detailed Equipment List */}
        {room.equipment && room.equipment.length > 0 && (
          <div className="mt-2">
            <p className="font-medium text-gray-700 mb-1">Equipment:</p>
            <div className="flex flex-wrap gap-1">
              {room.equipment.map((eq, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {/* Corrected: Access name from eq.equipment.name */}
                  {eq.equipment.name} ({eq.quantity})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Display Note if available */}
        {room.note && (
          <p className="text-sm text-gray-500 italic mt-2">Note: {room.note}</p>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleViewDetails}
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => navigate(`/rooms/edit/${room.id}`)} // Assuming an edit route
          className="px-3 py-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
          title="Edit Room"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RoomCard;