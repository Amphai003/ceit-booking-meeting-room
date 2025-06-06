import React, { useState } from 'react';

const Timestamp = () => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const handleStartChange = (e) => {
    const value = e.target.value;
    setStartTime(value);

    if (endTime && value > endTime) {
      setError('Start time must be before end time.');
    } else {
      setError('');
    }
  };

  const handleEndChange = (e) => {
    const value = e.target.value;
    setEndTime(value);

    if (startTime && value < startTime) {
      setError('End time must be after start time.');
    } else {
      setError('');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
        <input
          type="time"
          value={startTime}
          onChange={handleStartChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
        <input
          type="time"
          value={endTime}
          onChange={handleEndChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="text-sm text-gray-600">
        <strong>Selected Time:</strong><br />
        {startTime && <span>Start: {startTime}</span>}<br />
        {endTime && <span>End: {endTime}</span>}
      </div>
    </div>
  );
};

export default Timestamp;
