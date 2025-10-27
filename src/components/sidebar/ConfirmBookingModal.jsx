import React from "react";

const EstimatedFareModal = ({ fare = 40, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-80 p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-800">Estimated Fare</h2>

        <p className="text-gray-600 mt-2">
          Your estimated fare for this trip is
        </p>

        <p className="text-5xl font-bold text-gray-900 mt-3">${fare}</p>

        <p className="text-gray-600 mt-4 text-sm leading-relaxed">
          Since this is a short-distance ride, our minimum fare of{" "}
          <span className="font-semibold">${fare}</span> applies. This covers
          driver availability and service charges.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="bg-orange-500 hover:bg-orange-50 hover:text-orange-600 border border-orange-500 cursor-pointer text-white font-medium py-2.5 rounded-xl"
          >
            Confirm Booking
          </button>

          <button
            onClick={onCancel}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstimatedFareModal;
