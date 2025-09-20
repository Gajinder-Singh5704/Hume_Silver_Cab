import { X } from "lucide-react";

export default function Modal({ onClose }) {
  const handleClose = () => {
    onClose();
  };

  return (
    <div>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-none z-40"></div>

      {/* Modal box */}
      <div className="fixed inset-0 flex items-center justify-center z-50 ">
        <div className="bg-white rounded-lg shadow-lg w-[500px] max-w-[90%] p-10 relative">
          {/* Close button */}
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            onClick={handleClose}
          >
            <X size={20} />
          </button>

          {/* Modal content */}
          <h2 className="text-2xl text-semibold text-center mb-4">
            Which city content do you want to see?
          </h2>

          <input
            type="text"
            placeholder="Enter the location"
            className="
              w-full
              px-4 py-2
              border border-gray-300
              rounded-md
              focus:outline-none focus:border-blue-500
              mb-4
            "
          />

          <p className="text-md text-center">
            Please enter your location or the city you are interested in to help
            us display more relevant information to you.
          </p>
        </div>
      </div>
    </div>
  );
}
