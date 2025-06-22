import { Video, Clock, Users, Settings, Plus } from 'lucide-react';


import StatsCard from './statsCard';
import RoomCard from './room';
import UpcomingMeetings from './upcoming_meeting_room';

const Dashboard = ({ rooms, upcomingMeetings, getStatusColor, getStatusIcon }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Rooms"
          value={rooms.length}
          icon={Video}
          color="blue"
        />
        <StatsCard
          title="Available Now"
          value={rooms.filter(r => r.status === 'available').length}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="In Use"
          value={rooms.filter(r => r.status === 'occupied').length}
          icon={Users}
          color="red"
        />
        <StatsCard
          title="Maintenance"
          value={rooms.filter(r => r.status === 'maintenance').length}
          icon={Settings}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Room Status</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Room
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>
          </div>
        </div>
        
        <UpcomingMeetings meetings={upcomingMeetings} />
      </div>
    </div>
  );
};

export default Dashboard;