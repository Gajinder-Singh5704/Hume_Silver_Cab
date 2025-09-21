import { useState } from "react";
import { BsTelephone } from "react-icons/bs";
import { PiPencilSimpleLineLight } from "react-icons/pi";
import { FaMap } from "react-icons/fa";
import Modal from "./Modal";

const NavSection = ({onPlaceSelect}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Map View");
  const [selectedPlace, setSelectedPlace] = useState(""); 

  const items = [{ label: "Map View", icon: FaMap }];

  const handleClick = () => setIsOpen(!isOpen);

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place.description); 
    setIsOpen(false); 
    onPlaceSelect(place)
  };

  return (
    <div className="hidden md:flex items-center bg-[#4a4a4a] h-12 px-4 relative">
      {/* Left side */}
      <div className="flex items-center space-x-4 absolute left-4">
        <BsTelephone className="text-white" />
        <p className="text-white text-xl font-medium">133 100</p>

        {/* ✅ input field */}
        <div className="relative">
          <input
            type="text"
            value={selectedPlace}
            readOnly
            placeholder="Select a place"
            className="rounded-sm bg-white w-[200px] md:w-[280px] h-[30px] pl-2 pr-8 cursor-pointer"
            onClick={handleClick}
          />
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <PiPencilSimpleLineLight size={20} />
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
