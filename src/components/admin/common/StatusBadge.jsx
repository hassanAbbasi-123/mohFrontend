// src/components/admin/common/StatusBadge.jsx
const StatusBadge = ({ status }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    refunded: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        statusColors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
