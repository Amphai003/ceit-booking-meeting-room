import React, { useState, useEffect,  } from 'react';
import Dashboard from '../component/admin_dashboard_component/dashboard';
// import RoomsManagement from '../component/admin_dashboard_component/roomManagement';
import SettingsPanel from '../component/admin_dashboard_component/setting';
import Sidebar from '../component/admin_dashboard_component/sidebar';
import Header from '../component/admin_dashboard_component/header';
import api from '../../api';

import { useNavigate } from 'react-router-dom';


const MeetingRoomDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch rooms data
        const roomsResponse = await api.get('/rooms?limit=10');
        const roomsData = roomsResponse.data.data.map(room => ({
          id: room._id,
          name: room.name,
          capacity: room.capacity,
          status: room.status,
          equipment: room.equipment.map(eq => `${eq.name} (${eq.quantity})`),
          location: room.location,
          photo: room.photo,
          note: room.note,
          currentMeeting: room.status === 'occupied' ? 'Meeting in progress' : null,
          nextMeeting: room.status === 'available' ? 'Next meeting at 2:00 PM' : null
        }));
        setRooms(roomsData);

        // Fetch bookings data
        const bookingsResponse = await api.get('/bookings?limit=10');
        const bookingsData = bookingsResponse.data.data.map(booking => ({
          id: booking._id,
          title: booking.purpose,
          room: booking.roomId.name,
          time: `${booking.startTime} - ${booking.endTime}`,
          attendees: booking.requestedEquipment.length, // Or another attendee count if available
          status: booking.status,
          bookingDate: booking.bookingDate
        }));
        setUpcomingMeetings(bookingsData);

        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'available': return '🟢';
      case 'occupied': return '🔴';
      case 'maintenance': return '🟡';
      case 'pending': return '🟣';
      default: return '⚪';
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        api.get('/rooms?limit=10'),
        api.get('/bookings?limit=10')
      ]);

      setRooms(roomsRes.data.data.map(room => ({
        id: room._id,
        name: room.name,
        capacity: room.capacity,
        status: room.status,
        equipment: room.equipment.map(eq => `${eq.name} (${eq.quantity})`),
        location: room.location,
        photo: room.photo
      })));

      setUpcomingMeetings(bookingsRes.data.data.map(booking => ({
        id: booking._id,
        title: booking.purpose,
        room: booking.roomId.name,
        time: `${booking.startTime} - ${booking.endTime}`,
        attendees: booking.requestedEquipment.length,
        status: booking.status
      })));
    } catch (err) {
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error: {error}</p>
          <button
            onClick={refreshData}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            rooms={rooms}
            upcomingMeetings={upcomingMeetings}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            refreshData={refreshData}
             navigate={navigate} 
          />
        );
      case 'rooms':
        return <RoomsManagement rooms={rooms} getStatusColor={getStatusColor} refreshData={refreshData} />;
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
            refreshData={refreshData}
            navigate={navigate}  // Pass navigate function
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