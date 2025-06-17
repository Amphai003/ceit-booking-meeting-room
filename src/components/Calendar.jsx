import React, { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay
} from "date-fns";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const today = new Date();

  const renderHeader = () => {
    const months = Array.from({ length: 12 }, (_, i) =>
      format(new Date(2000, i, 1), "MMMM")
    );
    const years = Array.from({ length: 50 }, (_, i) => 2000 + i); // ปี 2000 - 2049

    const handleMonthChange = (e) => {
      const newMonth = parseInt(e.target.value);
      const updatedDate = new Date(
        currentMonth.getFullYear(),
        newMonth,
        1
      );
      setCurrentMonth(updatedDate);
    };

    const handleYearChange = (e) => {
      const newYear = parseInt(e.target.value);
      const updatedDate = new Date(
        newYear,
        currentMonth.getMonth(),
        1
      );
      setCurrentMonth(updatedDate);
    };

    return (
      <div className="flex justify-center items-center mb-4 space-x-4">
        <div className="inline-block relative w-40">
          <select
            className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            value={currentMonth.getMonth()}
            onChange={handleMonthChange}
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </div>
        </div>

        <div className="inline-block relative w-24">
          <select
            className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            value={currentMonth.getFullYear()}
            onChange={handleYearChange}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "EEE";
    const days = [];
    const startDate = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-gray-600">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const clonedDay = day;
        const formattedDate = format(clonedDay, "d");
        const isToday = isSameDay(clonedDay, today);
        const isCurrentMonth = isSameMonth(clonedDay, monthStart);
        const isSelected = selectedDate && isSameDay(clonedDay, selectedDate);

        let cellClass = "text-center p-2 rounded-lg cursor-pointer ";
        if (isSelected) {
          cellClass += "bg-green-500 text-white font-bold ";
        } else if (isToday) {
          cellClass += "bg-blue-500 text-white font-bold ";
        } else if (!isCurrentMonth) {
          cellClass += "text-gray-400 ";
        } else {
          cellClass += "text-black ";
        }

        days.push(
          <div
            key={clonedDay.toISOString()}
            className={cellClass}
            onClick={() => setSelectedDate(clonedDay)}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-md">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {selectedDate && (
        <div className="mt-4 text-center text-sm text-gray-700">
          Selected Date: <strong>{format(selectedDate, "PPP")}</strong>
        </div>
      )}
    </div>
  );
};

export default Calendar;
