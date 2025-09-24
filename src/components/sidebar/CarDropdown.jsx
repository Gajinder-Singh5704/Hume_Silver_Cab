import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info, Lock, LockIcon, Package } from "lucide-react";
import { defaultVehicleOptions } from "../../data/data.jsx";
import { useNavigate,useLocation } from "react-router-dom";
import { useBooking } from "../../context/BookingContext.jsx";

const CarDropdown = ({
  vehicleOptions = [],
  selectedOption = null,
  isFixedPrice,
  onOptionSelect = () => {},
  title = "More vehicle/service options",
  className = "",
  label,
  isLuggageModal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const {bookingData, setBookingData} = useBooking();

  const options =
    vehicleOptions.length > 0 ? vehicleOptions : defaultVehicleOptions;

  // Use the first option as default if no selectedOption is provided
  const currentSelection = selectedOption || options[0];

  const handleOptionSelect = (option) => {
    setBookingData({...bookingData, selectedCar: option});
    onOptionSelect(option); // Notify parent component
    // console.log("Option is : " + option.name)
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

 const handleInfoClick = (id) => {
  if (id == "maxi-taxi"){
    console.log("object")
    isLuggageModal(true)
  }
  console.log("Navigating to:", id);
  if (id) {
    navigate(`/${id}`);
  } else {
    console.warn("No route defined for this option");
  }
};

  return (
    <div
      className={`w-full  mx-auto bg-white rounded-lg shadow-lg ${className} mt-4`}
    >
      {/* Dropdown Header */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 rounded-t-lg border-b hover:bg-gray-100 transition-colors"
      >
        <span className="text-gray-700 font-medium">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Selected Option (when closed) */}
      {!isOpen && currentSelection && (
        <div
          className={`px-2 py-4 ${
            currentSelection.color || "bg-gray-50"
          } rounded-b-lg`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {typeof currentSelection.icon === "string" ? (
                  <img src={currentSelection.image} className="h-10" />
                ) : (
                  <img src={currentSelection.image} className="h-10" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-sm text-gray-800">
                    {currentSelection.name}
                  </h3>
                  <Info
                    className="w-4 h-4 text-gray-400"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent button click
                      handleInfoClick(currentSelection.id);
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {currentSelection.passengers}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">
                {isFixedPrice? "Fixed Price" : currentSelection.fareEstimate}
              </p>
              <p className="text-sm text-gray-600">{isFixedPrice ? <> <LockIcon color="orange" size={12}/>  {label} </> : label}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Options */}
      {isOpen && (
        <div className="">
          {options.map((option, index) => {
            const isSUV = option.name === "Suv";
            const isMaxiTaxi = option.name === "MAXI TAXI";
            return <button
              key={option.id}
              onClick={() => {
                if (isSUV) {
                  navigate(`/suv`, {
                    state: {
                      bookingData: {
                        ...bookingData, // previous booking info if any
                        selectedCar: option
                      },
                      vehicleData: option,
                    }
                  });
                }
                else if (isMaxiTaxi) {
                  navigate(`/maxi-taxi`, {
                    state: {
                      bookingData: {
                        ...bookingData, // previous booking info if any
                        selectedCar: option
                      },
                      vehicleData: option,
                    }
                  });
                }
                else {
                  handleOptionSelect(option)
                }
              }}
              className={`w-full px-2 py-4 ${
                option.color
              } hover:opacity-80 transition-opacity border-b border-gray-200 last:border-b-0 ${
                index === options.length - 1 ? "rounded-b-lg" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {typeof option.icon === "string" ? (
                      <img src={option.image} className="h-10 w-18" />
                    ) : (
                      <img src={option.image} className="h-10 w-18" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-sm text-gray-800">
                        {option.name}
                      </h3>
                      <Info
                        className="w-4 h-4 text-gray-400"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent button click
                          handleInfoClick(option.id);
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">{option.passengers}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    {isFixedPrice ? "Fixed Price" : option.fareEstimate}
                  </p>
                  <p className="text-sm text-gray-600">{isFixedPrice ?<> <LockIcon color="orange" size={12}/>  {option.destRequired} </> : option.destRequired}</p>
                </div>
              </div>
            </button>
        })}
        </div>
      )}
    </div>
  );
};

export default CarDropdown;
