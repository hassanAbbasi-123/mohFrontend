// src/components/chat/ChatWidget.jsx
const ChatWidget = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white shadow-lg rounded-lg border flex flex-col z-50">
      {/* Chat content */}
    </div>
  );
};