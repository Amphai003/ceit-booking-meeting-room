import React from 'react';
import { Edit2, Trash2, Users, Wifi, Tv, Coffee, Search, Filter } from 'lucide-react';

const RoomList = ({
  rooms,
  loading,
  error,
  handleEdit,
  handleDelete,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  currentPage,
  totalPages,
  handlePageChange
}) => {
  const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-200',
    occupied: 'bg-red-100 text-red-800 border-red-200',
    maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {rooms.map(room => (
          <RoomCard
            key={room._id || room.id}
            room={room}
            statusColors={statusColors}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4 flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            Previous
          </button>

          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const RoomCard = ({ room, statusColors, handleEdit, handleDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {room.photo && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={room.photo}
            alt={room.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{room.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{room.roomType}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[room.status]}`}>
              {room.status?.charAt(0).toUpperCase() + room.status?.slice(1)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(room)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(room)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={16} />
            <span>Capacity: {room.capacity} people</span>
          </div>
          <div className="text-gray-600">
            <span>Location: {room.location}</span>
          </div>
        </div>

        {room.note && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.note}</p>
        )}

        <div className="text-gray-600">
          <span>Equipment: </span>
          {room.equipment?.length > 0 ? (
            room.equipment.map((item, index) => {
              const name = item.equipment?.name || 'Unknown';
              return (
                <span key={`eq-${index}`}>
                  {index > 0 && ', '}
                  {name} ({item.quantity})
                </span>
              );
            })
          ) : (
            <span>None</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomList;