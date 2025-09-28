import { useState } from "react";
import { BsTelephone } from "react-icons/bs";
import { PiPencilSimpleLineLight } from "react-icons/pi";
import { FaMap } from "react-icons/fa";
import Modal from "./Modal";

const NavSection = ({onPlaceSelect}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(""); 

  const items = [{ label: "Map View", icon: FaMap }];

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place.description); 
    setIsOpen(false); 
    onPlaceSelect(place)
  };

  return (
    <div className="flex items-center bg-[#4a4a4a] h-auto min-h-12 px-2 sm:px-4 py-2 sm:py-0">
      {/* Left side */}
      <div className="flex flex-wrap items-center md:justify-normal justify-between gap-2 sm:gap-4 w-full">
        {/* Phone */}
        <div className="flex items-center gap-2">
          <BsTelephone className="text-white text-sm sm:text-base" />
          <a
            href="tel:+61490092704"
            className="text-white text-sm sm:text-xl font-medium"
          >
            0490092704
          </a>
        </div>

        {/* Input field */}
        <div className="relative">
          <input
            type="text"
            value={selectedPlace}
            readOnly
            placeholder="Melbourne VIC, Australia"
            className="rounded-sm bg-white h-8 sm:h-9 pl-2 pr-8 cursor-pointer text-sm sm:text-base
                      w-[180px] sm:w-[220px] md:w-[280px]" // ✅ responsive fixed widths
            onClick={handleClick}
          />
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600 hover:text-black"
            onClick={handleClick}
          >
            <PiPencilSimpleLineLight size={18} />
          </span>
        </div>

      </div>

      {/* Modal */}
      {isOpen && (
        <Modal onClose={handleClick} onPlaceSelect={handlePlaceSelect} />
      )}
    </div>
  );

};

export default NavSection;
