import React, { useState } from "react";

export default function MaxiTaxi() {
  const [seats, setSeats] = useState(6);

  const handleSeatsChange = (delta) => {
    setSeats((prev) => {
      let next = prev + delta;
      if (next < 1) next = 1;
      if (next > 11) next = 11;
      return next;
    });
  };

  const handleSelectService = () => {
    const bookingData = {
      vehicle: "MAXI TAXI",
      seats,
      // Add other relevant data here if needed
    };
    console.log("Booking Data:", bookingData);
    alert("Booking requested");
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b">
        <button className="mr-2 text-lg" aria-label="Back">&lt; Back</button>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pt-6">
        <h2 className="text-2xl font-bold mb-1 text-center">MAXI TAXI</h2>
        <div className="text-gray-600 mb-4 text-center">1 - 11 passengers</div>
        <img
          src="https://www.13cabs.com.au/wp-content/uploads/2022/09/maxi-taxi-1.png"
          alt="Maxi Taxi"
          className="w-48 h-auto mb-4"
        />
        <div className="text-center font-semibold mb-2">Enter number of seats</div>
        <div className="flex items-center justify-center mb-6">
          <button
            className="border rounded-l w-10 h-10 flex items-center justify-center text-2xl bg-gray-50"
            onClick={() => handleSeatsChange(-1)}
            disabled={seats <= 1}
          >
            –
          </button>
          <div className="border-t border-b w-14 h-10 flex items-center justify-center text-xl font-bold bg-white">
            {seats}
          </div>
          <button
            className="border rounded-r w-10 h-10 flex items-center justify-center text-2xl bg-gray-50"
            onClick={() => handleSeatsChange(1)}
            disabled={seats >= 11}
          >
            +
          </button>
        </div>
        <div className="bg-gray-50 p-3 rounded text-center text-sm text-gray-700 mb-2">
          Traveling in a group? We'll get you there.<br />
          Our fleet of MAXI TAXIS are the perfect option.
        </div>
        <div className="w-full mt-2">
          <div className="bg-orange-50 p-3 rounded mb-2">
            <div className="font-semibold text-orange-600 mb-1">Fare Estimates*</div>
            <div className="text-xs text-gray-700">
              Prices given are an estimate only based on kilometres travelled. Actual fare may vary due to traffic conditions, alternate routes, weather and unforeseen circumstances. Estimated fares do not include road tolls, airport fees or public holiday surcharges.
            </div>
          </div>
          <button
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded text-lg"
            onClick={handleSelectService}
          >
            Select This Service
          </button>
        </div>
      </div>
      {/* Footer (optional) */}
      <div className="h-6"></div>
    </div>
  );
}