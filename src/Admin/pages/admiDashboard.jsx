import React, { useState } from 'react';
import Dashboard from '../component/admin_dashboard_component/dashboard';
import RoomsManagement from '../component/admin_dashboard_component/roomManagement';
import SettingsPanel from '../component/admin_dashboard_component/setting';
import Sidebar from '../component/admin_dashboard_component/sidebar';
import Header from '../component/admin_dashboard_component/header';


const MeetingRoomDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sample data
  const rooms = [
    { 
      id: 1, 
      name: 'Conference Room A', 
      capacity: 12, 
      status: 'available', 
      equipment: ['Projector', 'Whiteboard', 'Video Conf'],
      location: 'Floor 2',
      nextMeeting: '2:00 PM - Team Standup'
    },
    // ... other rooms
  ];

  const upcomingMeetings = [
    { id: 1, title: 'Team Standup', room: 'Conference Room A', time: '2:00 PM', attendees: 8 },
    // ... other meetings
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return '🟢';
      case 'occupied': return '🔴';
      case 'maintenance': return '🟡';
      default: return '⚪';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            rooms={rooms}
            upcomingMeetings={upcomingMeetings}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        );
      case 'rooms':
        return <RoomsManagement rooms={rooms} getStatusColor={getStatusColor} />;
      case 'bookings':
        return <PlaceholderContent title="Bookings Management" message="Booking management features coming soon..." />;
      case 'users':
        return <PlaceholderContent title="User Management" message="User management features coming soon..." />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return (
          <Dashboard
            rooms={rooms}
            upcomingMeetings={upcomingMeetings}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MeetingRoomDashboard;