import { useEffect, useState, useRef } from "react";
import images from "../../assets/images.js";


const SeatDetails = ({ data, changeVehicleText, onSelect, onVehicleDetailOpenChange, changeIsLuggageModal }) => {
  const [seats, setSeats] = useState(6);
  const isShow = data.name == "SUV" || data.name == "Maxi Taxi";
  const topRef = useRef(null);

  // console.log(isShow, "isShow");
  const handleSeatsChange = (delta) => {
    setSeats((prev) => {
      let next = prev + delta;
      if (next < 1) next = 1;
      if (data.name == "SUV") {
        if (next > 6) next = 6;
        return next;
      }
      if (next > 11) next = 11;
      return next;
    });
  };

  const scrollToRef = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({
        behavior: "smooth", // smooth scroll
        block: "start", // align at top (use "center" or "end" if needed)
      });
    }
  };

  useEffect(()=>{
    scrollToRef(topRef)
  },[])

  const handleSelectService = () => {
    let id = null; switch (data.name) { case "Next Available": id = "Next-Available"; break; case "SUV": id = "Suv"; break; case "Maxi Taxi": id = "Maxi-Taxi"; break; case "Silver Service": id = "Silver-Service"; break; }
    // console.log("selectes id ",id)
    const carData = {
      id: id,
      name: data.name,
      passengers: isShow ? seats + " passengers" : "1 - 4 passengers",
      image: images[data.image],
      fareEstimate: "Fare Estimate",
      destRequired: "Dest required",
      color: "bg-gray-100",
      seatCount: isShow ? seats : 4
    };

    onSelect(carData)
    changeVehicleText("")
    onVehicleDetailOpenChange({ open: false })
    changeIsLuggageModal(false)
  };


  const handleBackClick = (e) => {
    e.preventDefault();
    changeVehicleText("")
    onVehicleDetailOpenChange({ open: false })
    changeIsLuggageModal(false)
  };

  return (
    <div className="md:static md:bg-transparent overflow-y-auto fixed inset-0 z-50 sm-w-sm md-w-md mx-auto bg-white md:min-h-fit min-h-screen flex flex-col justify-between p-2" ref={topRef}>
      {/* Header - Only show on mobile */}
      <div className="flex items-center px-4 py-3 border-b">
        <button
          className="mr-2 text-lg"
          aria-label="Back"
          onClick={handleBackClick}
        >
          &lt; Back
        </button>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pt-6">
        <h2 className="text-2xl font-bold mb-1 text-center">{data.name}</h2>
        <div className="text-gray-600 mb-4 text-center">{data.capacity}</div>
        <img
          src={images[data.image]}
          alt="Maxi Taxi"
          className="w-48 h-auto mb-4"
        />
        {isShow && (
          <>
            <div className="text-center font-semibold mb-2">
              Enter number of seats
            </div>
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
          </>
        )}
        <div className="bg-gray-50 p-3 rounded text-center text-sm text-gray-700 mb-2">
          {data.imageDecs}
        </div>
        <div className="w-full mt-2">
          <div className="bg-orange-50 p-3 rounded mb-2">
            <div className="font-semibold text-orange-600 mb-1">
              Fare Estimates*
            </div>
            <div className="text-xs text-gray-700">
              Prices given are an estimate only based on kilometres travelled.
              Actual fare may vary due to traffic conditions, alternate routes,
              weather and unforeseen circumstances. Estimated fares do not
              include road tolls, airport fees or public holiday surcharges.
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
      <div className="mb-60"></div>

    </div>
  );
};

export default SeatDetails;