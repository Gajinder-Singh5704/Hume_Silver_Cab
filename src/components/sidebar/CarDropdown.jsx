import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Package } from 'lucide-react';
import { defaultVehicleOptions } from '../../data/data.js';

const CarDropdown = ({ 
  vehicleOptions = [], 
  selectedOption = null, 
  onOptionSelect = () => {},
  title = "More vehicle/service options",
  className = "",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = vehicleOptions.length > 0 ? vehicleOptions : defaultVehicleOptions;
  
  // Use the first option as default if no selectedOption is provided
  const currentSelection = selectedOption || options[0];

  const handleOptionSelect = (option) => {
    onOptionSelect(option); // Notify parent component
    // console.log("Option is : " + option.name)
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  

  return (
    <div className={`w-full  mx-auto bg-white rounded-lg shadow-lg ${className} mt-4`}>
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
        <div className={`px-4 py-4 ${currentSelection.color || 'bg-gray-50'} rounded-b-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {typeof currentSelection.icon === 'string' ? <img src={currentSelection.image} className='h-10'/> : <img src={currentSelection.image} className='h-10'/>}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-800">{currentSelection.name}</h3>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">{currentSelection.passengers}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{currentSelection.fareEstimate}</p>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Options */}
      {isOpen && (
        <div className="">
          {options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option)}
              className={`w-full px-4 py-4 ${option.color} hover:opacity-80 transition-opacity border-b border-gray-200 last:border-b-0 ${
                index === options.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {typeof option.icon === 'string' ? <img src={option.image} className='h-10'/> : <img src={option.image} className='h-10'/>}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-800">{option.name}</h3>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">{option.passengers}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{option.fareEstimate}</p>
                  <p className="text-sm text-gray-600">{option.destRequired}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarDropdown;