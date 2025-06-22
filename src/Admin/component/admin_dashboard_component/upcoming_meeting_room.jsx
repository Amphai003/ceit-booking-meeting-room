import { Clock, Users } from 'lucide-react';

const UpcomingMeetings = ({ meetings }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Upcoming Meetings</h3>
      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="border-l-4 border-blue-500 pl-4 py-2">
            <h4 className="font-medium text-gray-900">{meeting.title}</h4>
            <p className="text-sm text-gray-600">{meeting.room}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {meeting.time}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {meeting.attendees}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
        View All Meetings
      </button>
    </div>
  );
};

export default UpcomingMeetings;