import React, { useState, useEffect } from 'react';
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
          // equipment: room.equipment.map(eq => `${eq.name} (${eq.quantity})`),
          equipment: room.equipment,
          location: room.location,
          photo: room.photo,
          note: room.note,
          currentMeeting: room.status === 'occupied' ? 'Meeting in progress' : null,
          nextMeeting: room.status === 'available' ? 'Next meeting at 2:00 PM' : null
        }));
        setRooms(roomsData);

        // Fetch bookings data
        const bookingsResponse = await api.get('/bookings?limit=10');
        const now = new Date();

        const filteredBookingsData = bookingsResponse.data.data
          .filter(booking => {
            const bookingDateTime = new Date(`${booking.bookingDate.split('T')[0]}T${booking.startTime}:00`);
            return booking.status !== 'history' && bookingDateTime >= now;
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.bookingDate.split('T')[0]}T${a.startTime}:00`);
            const dateB = new Date(`${b.bookingDate.split('T')[0]}T${b.startTime}:00`);
            return dateA - dateB;
          })
          .slice(0, 3)
          .map(booking => ({
            id: booking._id,
            title: booking.purpose,
            room: booking.roomId.name,
            time: `${booking.startTime} - ${booking.endTime}`,
            // IMPORTANT: Use 'numberOfAttendees' here to match the API and the UpcomingMeetings component
            numberOfAttendees: booking.numberOfAttendees,
            status: booking.status,
            bookingDate: booking.bookingDate
          }));
        setUpcomingMeetings(filteredBookingsData);

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
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'available': return '🟢';
      case 'occupied': return '🔴';
      case 'maintenance': return '🟡';
      case 'pending': return '🟣';
      case 'confirmed': return '✅';
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
        // equipment: room.equipment.map(eq => `${eq.name} (${eq.quantity})`),
        equipment: room.equipment,
        location: room.location,
        photo: room.photo
      })));

      const now = new Date();
      const filteredBookingsData = bookingsRes.data.data
        .filter(booking => {
          const bookingDateTime = new Date(`${booking.bookingDate.split('T')[0]}T${booking.startTime}:00`);
          return booking.status !== 'history' && bookingDateTime >= now;
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.bookingDate.split('T')[0]}T${a.startTime}:00`);
          const dateB = new Date(`${b.bookingDate.split('T')[0]}T${b.startTime}:00`);
          return dateA - dateB;
        })
        .slice(0, 3)
        .map(booking => ({
          id: booking._id,
          title: booking.purpose,
          room: booking.roomId.name,
          time: `${booking.startTime} - ${booking.endTime}`,
          // IMPORTANT: Use 'numberOfAttendees' here to match the API and the UpcomingMeetings component
          numberOfAttendees: booking.numberOfAttendees,
          status: booking.status
        }));
      setUpcomingMeetings(filteredBookingsData);

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

    // PlaceholderContent component (assuming it's defined elsewhere or will be defined)
    const PlaceholderContent = ({ title, message }) => (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h2>
        <p className="text-gray-500">{message}</p>
      </div>
    );

    // Conditionally import RoomsManagement to avoid "not defined" error if it's not used
    let RoomsManagement;
    try {
      RoomsManagement = require('../component/admin_dashboard_component/roomManagement').default;
    } catch (e) {
      console.warn("RoomsManagement component not found or could not be loaded.");
      // Define a fallback if RoomsManagement is truly optional and might not exist
      RoomsManagement = ({ rooms, getStatusColor, refreshData }) => (
        <PlaceholderContent title="Rooms Management" message="Room management features coming soon..." />
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
            navigate={navigate}
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