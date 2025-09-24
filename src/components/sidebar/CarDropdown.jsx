import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info, LockIcon } from "lucide-react";
import { defaultVehicleOptions } from "../../data/data.jsx";
import { useNavigate } from "react-router-dom";
import { all } from "axios";


const CarDropdown = ({
  vehicleOptions = [],
  selectedOption = null,
  isFixedPrice,
  onOptionSelect = () => { },
  title = "More vehicle/service options",
  label,
  isLuggageModal,
  changeVehicleText,
  onVehicleDetailOpenChange,
  allFares = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();


  const options = vehicleOptions.length > 0 ? vehicleOptions : defaultVehicleOptions;

  const currentSelection = selectedOption
    ? options.find((o) => o.id === selectedOption.id) ?? selectedOption
    : options[0];

  const toggleDropdown = () => setIsOpen(v => !v);

  const handleSelect = (option) => {
    onOptionSelect(option);
    setIsOpen(false);
  };

  // inside CarDropdown component (above return)
  const getFareFor = (option) => {
    if (!allFares || allFares.length === 0) return null;
    // prefer matching by id
    const byId = allFares.find(f => f && (f.id === option.id));
    if (byId) return byId.price;
    // fallback: try matching by name (case-insensitive)
    const byName = allFares.find(f => f && f.name && option.name && f.name.toLowerCase() === option.name.toLowerCase());
    if (byName) return byName.price;
    return null;
  };

const renderFare = (val, fallback, isFixedPrice = true) => {
  if (val === null || val === undefined || val == []) return fallback ?? "";

  if (typeof val === "number") {
    if (isFixedPrice) {
      return `$${val.toFixed(2)}`; // keep decimals for fixed price
    } else {
      const min = Math.round(val - 5);
      const max = Math.round(val + 15);
      return `$${min} - $${max}`; // no decimals for range
    }
  }

  return String(val);
};




  const handleInfoClick = (e, id) => {
    e.stopPropagation();
    onVehicleDetailOpenChange(true)
    if (id === "maxi-taxi") {
      isLuggageModal(true);
    }
    console.log("id:", id)
    switch (id) {
      case "Next-Available":
        changeVehicleText("Next Available")
        break;
      case "silver-service":
        changeVehicleText("Silver Service")
        break;
      case "suv":
        changeVehicleText("Suv")
        break;
      case "maxi-taxi":
        changeVehicleText("Maxi Taxi")
        break;
    }
  };

  return (
    <div className={`w-full  bg-white rounded-lg shadow-lg mt-4`}>
      {/* Header (clickable) */}
      <button
        type="button"
        onClick={toggleDropdown}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDropdown(); }}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 rounded-t-lg border-b hover:bg-gray-100 transition-colors"
      >
        <span className="text-gray-700 font-medium">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* WHEN CLOSED: show selected card (highlighted) */}
      {!isOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={toggleDropdown}
          className="relative px-2 py-4 cursor-pointer bg-orange-50"
        >
          {/* left strip (overlay, doesn’t shift content) */}
          <div className="absolute top-0 left-0 h-full w-2 bg-orange-500" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentSelection?.image && (
                <img src={currentSelection.image} alt={currentSelection.name} className="h-10" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-sm text-gray-800">{currentSelection?.name}</h3>
                  <Info
                    className="w-4 h-4 text-gray-400"
                    onClick={(e) => handleInfoClick(e, currentSelection?.id)}
                  />
                </div>
                <p className="text-sm text-gray-600">{currentSelection?.passengers}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">
                {isFixedPrice ? "Fixed Price" : currentSelection?.fareEstimate}
              </p>
              <p className="text-sm flex items-center text-gray-600">{isFixedPrice ? <> <LockIcon className="mr-1" color="orange" size={12} />  {label} </> : label}</p>
            </div>
          </div>
        </div>
      )}

      {/* WHEN OPEN: show all options in sequence, highlight selected */}
      {isOpen && (
        <div>
          {options.map((option, idx) => {
            const isSelected = option.id === currentSelection?.id;
            const isSUV = option.name?.toLowerCase() === "suv";
            const isMaxiTaxi = option.name?.toUpperCase() === "MAXI TAXI";

            return (
              <button
                type="button"
                key={option.id}
                onClick={() => {
                  if (isSUV) {
                    changeVehicleText("Suv")
                  } else if (isMaxiTaxi) {
                    changeVehicleText("Maxi Taxi")
                  } else {
                    handleSelect(option);
                  }
                }}
                className={`relative w-full px-2 py-4 text-left transition border-b border-gray-200
            ${idx === options.length - 1 ? "last:border-b-0 rounded-b-lg" : ""}
            ${isSelected
                    ? "bg-orange-50" // keep selected highlighted
                    : "hover:bg-orange-100" // new hover tint for others
                  }`}
              >
                {/* overlay strip only if selected */}
                {isSelected && <div className="absolute top-0 left-0 h-full w-2 bg-orange-500" />}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {option.image && (
                      <img src={option.image} alt={option.name} className="h-10 w-18" />
                    )}
                    <div className="text-left">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-sm text-gray-800">{option.name}</h3>
                        <Info
                          className="w-4 h-4 text-gray-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInfoClick(e, option.id);
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{option.passengers}</p>
                    </div>
                  </div>
                  {/* {console.log("All Fares" , allFares && allFares.length > 0)} */}
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {isFixedPrice ? "Fixed Price" : option.fareEstimate}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      {isFixedPrice ? (
                        <>
                          <LockIcon className="mr-1" color="orange" size={12} />
                          {renderFare(getFareFor(option), option.destRequired)}
                        </>
                      ) : (
                        renderFare(getFareFor(option), option.destRequired, isFixedPrice = false)
                      )}
                    </p>

                  </div>

                </div>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default CarDropdown;
