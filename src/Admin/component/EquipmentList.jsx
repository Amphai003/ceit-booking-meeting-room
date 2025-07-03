import React from 'react';

const EquipmentList = ({ items, onEdit, onDelete }) => {
  if (!items.length) {
    return <p className="text-gray-500">No equipment found.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item._id}
          className="border p-4 rounded flex justify-between items-center"
        >
          <div>
            <h2 className="text-lg font-semibold">{item.name}</h2>
            <p className="text-sm text-gray-600">{item.description}</p>
            <p className="text-sm text-gray-700 font-medium">Quantity: {item.quantity}</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => onEdit(item)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EquipmentList;
