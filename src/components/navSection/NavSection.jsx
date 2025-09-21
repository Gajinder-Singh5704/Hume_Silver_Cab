import { useState } from "react";
import { BsTelephone } from "react-icons/bs";
import { PiPencilSimpleLineLight } from "react-icons/pi";
import { FiZap } from "react-icons/fi"; // lightning icon
import { FaMap } from "react-icons/fa";
import { MdWindow } from "react-icons/md";
import Modal from "./Modal";

const NavSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Map View");

  const items = [
    { label: "Map View", icon: FaMap },
  ];

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="hidden md:flex items-center bg-[#4a4a4a] h-12 px-4 relative">
      {/* Left side */}
      <div className="flex items-center space-x-4 absolute left-4">
        <BsTelephone className="text-white" />
        <p className="text-white text-xl font-medium">133 100</p>
        <div
          className="relative rounded-sm bg-white w-[200px] md:w-[280px] h-[30px] cursor-pointer"
          onClick={handleClick}
        >
          <span className="absolute right-2">
            <PiPencilSimpleLineLight size={24} />
          </span>
        </div>
      </div>

      {/* Middle menu (centered) */}
      <div className="flex text-white items-center space-x-10 mx-auto">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isSelected = selected === item.label;

          return (
            <div
              key={index}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => setSelected(item.label)}
            >
              <div className="flex items-center space-x-2">
                <Icon />
                <p className="text-sm md:text-base">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* What's New (right side)
      <div className="flex items-center gap-3 absolute right-4">
        <FiZap size={20} className="text-white" />
        <span className="font-medium text-white text-sm md:text-base">
          What's New
        </span>
      </div> */}

      {/* Modal */}
      {isOpen && <Modal onClose={handleClick} />}
    </div>
  );
};

export default NavSection;
