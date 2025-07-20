import { Video, Clock, Users, Settings, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

import StatsCard from './statsCard';
import RoomCard from './room';
import UpcomingMeetings from './upcoming_meeting_room';

const Dashboard = ({ rooms, upcomingMeetings, getStatusColor, getStatusIcon ,navigate}) => {
  const { t, i18n } = useTranslation(); // Initialize translation hook

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('dashboardScreen.totalRooms')}
          value={rooms.length}
          icon={Video}
          color="blue"
        />
        <StatsCard
          title={t('dashboardScreen.availableNow')}
          value={rooms.filter(r => r.status === 'available').length}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title={t('dashboardScreen.inUse')}
          value={rooms.filter(r => r.status === 'occupied').length}
          icon={Users}
          color="red"
        />
        <StatsCard
          title={t('dashboardScreen.maintenance')}
          value={rooms.filter(r => r.status === 'maintenance').length}
          icon={Settings}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold text-gray-900 ${i18n.language === 'lo' ? 'font-lao' : ''}`}>{t('dashboardScreen.roomStatus')}</h3>
              <button
                onClick={() => navigate('/rooms/add')}
                className={`bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 ${i18n.language === 'lo' ? 'font-lao' : ''}`}
              >
                <Plus className="w-4 h-4" />
                <span>{t('dashboardScreen.addNewRoom')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>
        </div>

        <UpcomingMeetings meetings={upcomingMeetings} navigate={navigate} />
      </div>
    </div>
  );
};

export default Dashboard;