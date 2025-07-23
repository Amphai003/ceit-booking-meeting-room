import React from 'react';
import { Edit2, Trash2, Users, Search, Filter, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();

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
            <span className={i18n.language === 'lo' ? 'font-lao' : ''}>{t('roomList.errorMessage')}: {error}</span>
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
                placeholder={t('roomList.searchRooms')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${i18n.language === 'lo' ? 'font-lao' : ''}`}
            >
              <option value="all">{t('roomList.allStatus')}</option>
              <option value="available">{t('roomList.available')}</option>
              <option value="occupied">{t('roomList.occupied')}</option>
              <option value="maintenance">{t('roomList.maintenance')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {rooms.length > 0 ? (
          rooms.map(room => (
            <RoomCard
              key={room._id || room.id}
              room={room}
              statusColors={statusColors}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          ))
        ) : (
          !loading && <p className={`text-center text-gray-600 col-span-full ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('roomList.noRoomsFound')}</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4 flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className={`px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors flex items-center gap-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
          >
            {t('roomList.previous')}
          </button>

          <span className={`text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            {t('roomList.page')} {currentPage} {t('roomList.of')} {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className={`px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors flex items-center gap-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
          >
            {t('roomList.next')}
          </button>
        </div>
      )}
    </div>
  );
};

const RoomCard = ({ room, statusColors, handleEdit, handleDelete }) => {
  const { t, i18n } = useTranslation();

  // Safely access roomType.typeName or fallback to the ID if not populated, or a default string
  const roomTypeName = room.roomType?.typeName || room.roomType || t('roomList.unknownRoomType');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {room.photo && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={room.photo}
            alt={room.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'; // Hide broken image icon
              // Optionally display a fallback icon or text
              // e.target.closest('div').innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={48} /></div>`;
            }}
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={`text-xl font-semibold text-gray-900 mb-1 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{room.name}</h3>
            {/* Use the safely accessed roomTypeName here */}
            <p className={`text-sm text-gray-500 mb-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{roomTypeName}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[room.status]} ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
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
          <div className={`flex items-center gap-2 text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            <Users size={16} />
            <span>{t('roomList.capacity', { capacity: room.capacity })}</span>
          </div>
          <div className={`text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
            <span>{t('roomList.location', { location: room.location })}</span>
          </div>
        </div>

        {room.note && (
          <p className={`text-gray-600 text-sm mb-4 line-clamp-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{room.note}</p>
        )}

        <div className={`text-gray-600 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>
          <span>{t('roomList.equipment')} </span>
          {room.equipment?.length > 0 ? (
            room.equipment.map((item, index) => {
              // Ensure item.equipment is an object with a 'name' property
              const name = item.equipment?.name || t('roomList.unknownEquipment');
              return (
                <span key={`eq-${index}`} className={i18n.language === 'lo' ? 'font-lao' : ''}>
                  {index > 0 && ', '}
                  {name} ({item.quantity})
                </span>
              );
            })
          ) : (
            <span className={i18n.language === 'lo' ? 'font-lao' : ''}>{t('roomList.none')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomList;