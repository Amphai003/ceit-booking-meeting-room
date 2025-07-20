import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2'; // Import SweetAlert2

const RoomCalendarModal = ({ room, initialSelectedDate, onClose, onTimeSelect }) => {
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate || new Date());
  const [dailyBookings, setDailyBookings] = useState([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [calendarError, setCalendarError] = useState(null);

  const formatTime = (time) => time.padStart(2, '0');

  const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchDailyBookings = async () => {
      if (!room || !selectedDate) {
        setIsLoadingCalendar(false);
        return;
      }

      setIsLoadingCalendar(true);
      setCalendarError(null);
      try {
        const formattedDate = getFormattedDate(selectedDate);
        console.log('Fetching bookings for date:', formattedDate);
        console.log('Room ID:', room._id);
        
        const response = await api.get(`/bookings?roomId=${room._id}&bookingDate=${formattedDate}`);
        console.log('Full API Response:', response);
        console.log('Response data:', response.data);
        console.log('Response data keys:', Object.keys(response.data));
        
        // Fix the data path - based on your JSON structure, it should be response.data.data
        let bookingsData = [];
        if (response.data && response.data.data) {
          console.log('Found response.data.data:', response.data.data);
          console.log('Is response.data.data an array?', Array.isArray(response.data.data));
          
          if (Array.isArray(response.data.data.data)) {
            // If the structure is response.data.data.data
            bookingsData = response.data.data.data;
            console.log('Using response.data.data.data');
          } else if (Array.isArray(response.data.data)) {
            // If the structure is response.data.data
            bookingsData = response.data.data;
            console.log('Using response.data.data');
          }
        }
        console.log('Final processed bookings:', bookingsData);
        
        setDailyBookings(bookingsData);
      } catch (err) {
        console.error('Failed to fetch daily bookings:', err);
        setCalendarError('Failed to load bookings for this date.');
        setDailyBookings([]);
      } finally {
        setIsLoadingCalendar(false);
      }
    };

    fetchDailyBookings();
  }, [room, selectedDate]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 5; hour < 24; hour++) {
      const time = `${formatTime(hour.toString())}:00`;
      slots.push(time);
    }
    return slots;
  };

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getTimeSlotInfo = (slotStartTime) => {
    // Debug logging
    console.log('Checking slot:', slotStartTime);
    console.log('Daily bookings:', dailyBookings);
    
    if (!Array.isArray(dailyBookings) || dailyBookings.length === 0) {
      console.log('No bookings found or not array');
      return { status: null, bookingInfo: null };
    }

    // Convert slot time to minutes for easier comparison
    const slotStartMinutes = timeToMinutes(slotStartTime);
    const slotEndMinutes = slotStartMinutes + 60; // Each slot is 1 hour
    
    console.log(`Slot ${slotStartTime}: ${slotStartMinutes} - ${slotEndMinutes} minutes`);

    for (const booking of dailyBookings) {
      console.log('Checking booking:', {
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status
      });
      
      // Convert booking times to minutes
      const bookingStartMinutes = timeToMinutes(booking.startTime);
      const bookingEndMinutes = timeToMinutes(booking.endTime);
      
      console.log(`Booking: ${bookingStartMinutes} - ${bookingEndMinutes} minutes`);

      // Check for overlap: booking overlaps with slot if:
      // 1. Booking starts before slot ends AND booking ends after slot starts (standard overlap)
      // 2. OR booking ends exactly at slot start time (to handle end-time edge case)
      const standardOverlap = bookingStartMinutes < slotEndMinutes && bookingEndMinutes > slotStartMinutes;
      const endTimeOverlap = bookingEndMinutes === slotStartMinutes;
      const hasOverlap = standardOverlap || endTimeOverlap;
      
      console.log('Overlap check:', hasOverlap);

      if (hasOverlap) {
        console.log('Found overlap! Returning booking info');
        return {
          status: booking.status,
          bookingInfo: {
            userName: `${booking.userId.firstName} ${booking.userId.lastName}`,
            purpose: booking.purpose,
            time: `${booking.startTime} - ${booking.endTime}`,
            status: booking.status,
          },
        };
      }
    }
    console.log('No overlap found for slot:', slotStartTime);
    return { status: null, bookingInfo: null }; // No overlap found
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSlotClick = (slot, bookingStatus, bookingInfo) => {
    const now = new Date();
    const selectedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      parseInt(slot.split(':')[0]),
      parseInt(slot.split(':')[1])
    );

    // Prioritize booking status over 'past time' for display/click handling.
    // If there's an active booking, it should be treated as booked.
    // If no booking AND it's a past time, then it's unavailable.

    if (bookingStatus) { // Slot is booked (pending, approved, etc.)
      Swal.fire({
        title: 'Room Occupied',
        html: `
          <p>This time slot is booked by <strong>${bookingInfo.userName}</strong>.</p>
          <p><strong>Purpose:</strong> ${bookingInfo.purpose}</p>
          <p><strong>Time:</strong> ${bookingInfo.time}</p>
          <p><strong>Status:</strong> <span style="font-weight: bold; color: ${bookingInfo.status === 'pending' ? '#eab308' : bookingInfo.status === 'approved' ? '#3b82f6' : '#ef4444'}">${bookingInfo.status.toUpperCase()}</span></p>
        `,
        icon: bookingInfo.status === 'pending' ? 'info' : 'warning',
        confirmButtonText: 'Got It',
      });
    } else if (selectedDateTime <= now) { // Slot is NOT booked, but it's in the past or current minute
      Swal.fire({
        title: 'Time Slot Unavailable',
        text: 'This time slot is in the past or too close to the current time to be booked.',
        icon: 'info',
        confirmButtonText: 'Got It',
      });
    } else { // Slot is available and in the future
      onTimeSelect(slot);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">
          Availability for {room.name}
        </h2>

        <div className="mb-4 flex items-center space-x-2">
          <label className="block text-sm font-medium text-gray-700">Select Date:</label>
          <div className="relative">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minDate={new Date()} // Disallow selecting past dates completely
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            />
            <CalendarIcon className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        {isLoadingCalendar ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        ) : calendarError ? (
          <p className="text-red-500 text-center py-8">{calendarError}</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-80 overflow-y-auto pr-2">
            {timeSlots.map((slot, index) => {
              const { status: bookingStatus, bookingInfo } = getTimeSlotInfo(slot);
              const now = new Date();
              const selectedDateTime = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                parseInt(slot.split(':')[0]),
                parseInt(slot.split(':')[1])
              );

              let buttonClasses = 'p-2 rounded-md text-sm font-medium transition-colors';
              let isDisabled = false;

              // Logic for coloring and disabling:
              // 1. If there's any booking (regardless of past/future relative to *now*)
              if (bookingStatus === 'approved') {
                buttonClasses += ' bg-blue-500 text-white cursor-not-allowed';
                isDisabled = true;
              } else if (bookingStatus === 'pending') {
                buttonClasses += ' bg-yellow-500 text-white cursor-not-allowed';
                isDisabled = true;
              } else if (['rejected', 'cancelled', 'history'].includes(bookingStatus)) {
                  // These are usually 'unavailable' or 'history'. You might want to make 'rejected'/'cancelled' available.
                  // For now, sticking to 'Occupied/Unavailable' for these too, as per your legend.
                buttonClasses += ' bg-red-500 text-white cursor-not-allowed';
                isDisabled = true;
              }
              // 2. If NO booking, check if it's a past time.
              else if (selectedDateTime <= now) {
                buttonClasses += ' bg-gray-200 text-gray-500 cursor-not-allowed';
                isDisabled = true;
              }
              // 3. Otherwise, it's available.
              else {
                buttonClasses += ' bg-green-100 text-green-700 hover:bg-green-200';
                isDisabled = false;
              }

              return (
                <button
                  key={index}
                  className={buttonClasses}
                  disabled={isDisabled} // Now isDisabled is correctly set by the above logic
                  onClick={() => handleTimeSlotClick(slot, bookingStatus, bookingInfo)}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <p><span className="inline-block w-3 h-3 bg-green-100 rounded-sm mr-1"></span> Available</p>
          <p><span className="inline-block w-3 h-3 bg-blue-500 rounded-sm mr-1"></span> Approved</p>
          <p><span className="inline-block w-3 h-3 bg-yellow-500 rounded-sm mr-1"></span> Pending</p>
          <p><span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-1"></span> Occupied/Unavailable</p>
        </div>
      </div>
    </div>
  );
};

export default RoomCalendarModal;