import { useState } from "react";

const LuggageModal = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-none z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
        {/* Heading */}
        <h2 className="text-xl font-semibold text-orange-600 mb-2">
          Travelling with luggage?
        </h2>
        <p className="text-xl font-semibold text-orange-600 mb-4">
          Add extra seats to avoid insufficient capacity
        </p>

        {/* Example text */}
        <p className="text-gray-700 mb-6">
          Example: <span className="font-medium">4 passengers</span> travelling
          with <span className="font-medium">4 check-in luggage</span>, then
          select <span className="font-medium">8 seats</span>.
        </p>

        {/* OK button */}
        <button
          onClick={() => setIsOpen(false)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-md w-full transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default LuggageModal;
