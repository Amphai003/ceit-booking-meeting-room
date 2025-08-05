import { Clock, Users } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Ensure this component receives the 'navigate' prop from its parent (Dashboard)
const UpcomingMeetings = ({ meetings, navigate }) => {
  const { t } = useTranslation();

  const handleViewAllClick = () => {
    // Navigate to the '/bookings' route when the button is clicked
    if (navigate) {
      navigate('/bookings');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 font-lao">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('upcomingMeetings.title')}</h3>
      <div className="space-y-4">
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <div key={meeting.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-medium text-gray-900">{meeting.title}</h4>
              <p className="text-sm text-gray-600">{t('upcomingMeetings.room', { room: meeting.room })}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {meeting.time}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {t('upcomingMeetings.attendees', { numberOfAttendees: meeting.numberOfAttendees })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">{t('upcomingMeetings.noMeetings')}</p>
        )}
      </div>

      <button
        onClick={handleViewAllClick}
        className="w-full mt-6 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {t('upcomingMeetings.viewAll')}
      </button>
    </div>
  );
};

export default UpcomingMeetings;