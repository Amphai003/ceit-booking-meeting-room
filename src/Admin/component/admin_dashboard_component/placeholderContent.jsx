const PlaceholderContent = ({ title, message }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default PlaceholderContent;