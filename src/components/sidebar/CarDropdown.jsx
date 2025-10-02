import { useState } from "react";
import { ChevronDown, ChevronUp, Info, LockIcon } from "lucide-react";
import { defaultVehicleOptions } from "../../data/data.jsx";

const CarDropdown = ({
  vehicleOptions = [],
  selectedOption = null,
  isFixedPrice = true,
  onOptionSelect = () => { },
  title = "More vehicle/service options",
  label,
  isLuggageModal,
  changeVehicleText = () => { },
  onVehicleDetailOpenChange = () => { },
  allFares = []
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = vehicleOptions.length > 0 ? vehicleOptions : defaultVehicleOptions;

  const currentSelection = selectedOption
    ? options.find((o) => o.id === selectedOption.id) ?? selectedOption
    : options[0];

  // console.log("current Selected Car ",currentSelection)

  const toggleDropdown = () => setIsOpen(v => !v);

  const handleSelect = (option) => {
    onOptionSelect(option);
    setIsOpen(false);
  };

  // getFareFor - tries id then name match
  const getFareFor = (option) => {
    if (!allFares || allFares.length === 0) return null;
    const byId = allFares.find(f => f && (f.id === option.id));
    if (byId) return byId.price;
    const byName = allFares.find(f => f && f.name && option.name && f.name.toLowerCase() === option.name.toLowerCase());
    if (byName) return byName.price;
    return null;
  };

  const renderFare = (val, fallback, fixedPrice = true) => {
    if (val === null || val === undefined || val === "") return fallback ?? "";
    if (typeof val === "number") {
      if (isFixedPrice) {
        return `$${val.toFixed(2)}`; // keep decimals for fixed price
      } else {
        const min = Math.round(val - 5);
        const max = Math.round(val + 20);
        return `$${min} - $${max}`; // no decimals for range
      }
    }

    // if it's a string or object, stringify lightly
    return String(val);
  };

  const handleInfoClick = (e, id) => {
    e.stopPropagation();
    const elementTop = e.currentTarget.getBoundingClientRect().top + window.scrollY;
    toggleDropdown()
    onVehicleDetailOpenChange({ open: true, scrollY: elementTop });
    if (id === "maxi-taxi" && typeof isLuggageModal === "function") {
      isLuggageModal(true);
    }
    // set changeVehicleText defensively
    switch (id) {
      case "Next-Available":
        changeVehicleText("Next Available");
        break;
      case "silver-service":
        changeVehicleText("Silver Service");
        break;
      case "suv":
        changeVehicleText("Suv");
        break;
      case "maxi-taxi":
        changeVehicleText("Maxi Taxi");
        break;
      default:
        break;
    }
  };

  return (
    <div className={`w-full bg-white rounded-lg shadow-lg mt-4`}>
      {/* Header (clickable) */}
      <button
        type="button"
        onClick={toggleDropdown}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDropdown(); }}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 rounded-t-lg border-b hover:bg-gray-100 transition-colors cursor-pointer"
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
          className="relative px-2 py-4 cursor-pointer bg-orange-50 border-b  border-black"
        >
          <div className="absolute top-0 left-0 h-full w-2 bg-orange-500 " />

          <div className="flex items-center justify-between ">
            <div className="flex items-center space-x-3 ">
              {currentSelection?.image && (
                <img src={currentSelection.image} alt={currentSelection.name} className="h-14 w-20" />
              )}
              <div>
                <div className="flex items-center space-x-2 ">
                  <h3 className="font-semibold text-sm text-gray-800 ">{currentSelection?.name}</h3>
                  <Info
                    className="w-4 h-4 text-gray-400 "
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
              <p className="text-sm flex items-center text-gray-600">
                {isFixedPrice ? (
                  <>
                    <LockIcon className="mr-1" color="orange" size={12} />
                    <span className="font-bold">
                      {renderFare(getFareFor(currentSelection), currentSelection?.destRequired)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold">
                    {renderFare(getFareFor(currentSelection), currentSelection?.destRequired)}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}


      {/* WHEN OPEN: show all options */}
      {isOpen && (
        <div>
          {options.map((option, idx) => {
            const isSelected = (option.id)?.toLowerCase() === (currentSelection?.id)?.toLowerCase();
            const isSUV = option.name?.toLowerCase() === "suv";
            const isMaxiTaxi = option.name?.toUpperCase() === "MAXI TAXI";

            return (
              <button
                type="button"
                key={option.id ?? idx}
                onClick={(e) => {
                  if (isSUV) {
                    handleInfoClick(e, option.id);
                  } else if (isMaxiTaxi) {
                    handleInfoClick(e, option.id);
                  } else {
                    handleSelect(option);
                  }
                }}
                className={`relative w-full px-2 py-4 text-left transition border-b border-gray-200 cursor-pointer
                  ${idx === options.length - 1 ? "last:border-b-0 rounded-b-lg" : ""}
                  ${isSelected ? "bg-orange-50" : "hover:bg-orange-100"}`}
              >
                {isSelected && <div className="absolute top-0 left-0 h-full w-2 bg-orange-500" />}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {option.image && (
                      <img src={option.image} alt={option.name} className="h-14 w-20" />
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

                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {isFixedPrice ? "Fixed Price" : option.fareEstimate}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      {isFixedPrice ? (
                        <>
                          <LockIcon className="mr-1" color="orange" size={12} />
                          <span className="font-bold"> {renderFare(getFareFor(option), option.destRequired)}</span>
                        </>
                      ) : (
                        <span className="font-bold">{renderFare(getFareFor(option), option.destRequired)}</span>
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