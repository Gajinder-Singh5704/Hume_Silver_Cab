import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Package } from 'lucide-react';

const CarDropdown = ({ 
  vehicleOptions = [], 
  selectedOption = null, 
  onOptionSelect = () => {},
  title = "More vehicle/service options",
  className = "",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Default vehicle options if none provided
  const defaultVehicleOptions = [
    {
      id: 'next-available',
      name: 'Next Available',
      passengers: '1 - 4 passengers',
      image: 'https://book-13cabs-cyhdf8encdbmgmgs.z01.azurefd.net/Vehicles/Sedan.png',
      fareEstimate: 'Fare Estimate',
      destRequired: 'Dest required',
      color: 'bg-orange-100'
    },
    {
      id: 'silver-service',
      name: 'Silver Service',
      passengers: '1 - 4 passengers',
      image: 'https://book-13cabs-cyhdf8encdbmgmgs.z01.azurefd.net/Vehicles/Silver.png',
      fareEstimate: 'Fare Estimate',
      destRequired: 'Dest required',
      color: 'bg-gray-100'
    },
    {
      id: 'sedan',
      name: 'Sedan',
      passengers: '1 - 4 passengers',
      image: 'https://book-13cabs-cyhdf8encdbmgmgs.z01.azurefd.net/Vehicles/Sedan.png',
      fareEstimate: 'Fare Estimate',
      destRequired: 'Dest required',
      color: 'bg-gray-100'
    },
    {
      id: 'wheelchair',
      name: 'Wheelchair',
      passengers: 'Accessible Taxi',
      image: 'https://book-13cabs-cyhdf8encdbmgmgs.z01.azurefd.net/Vehicles/Wheelchair.png',
      fareEstimate: 'Fare Estimate',
      destRequired: 'Dest required',
      color: 'bg-blue-50'
    },
    {
      id: 'maxi-taxi',
      name: 'MAXI TAXI',
      passengers: '1 - 11 passengers',
      image: 'https://book-13cabs-cyhdf8encdbmgmgs.z01.azurefd.net/Vehicles/MAXI.png',
      fareEstimate: 'Fare Estimate',
      destRequired: 'Dest required',
      color: 'bg-gray-100'
    },
    {
      id: 'parcel-delivery',
      name: 'Parcel Delivery',
      passengers: 'Fits in a car',
      image: 'https://book-13cabs-cyhdf8encdbmgmgs.z01.azurefd.net/Vehicles/parcel-delivery.png',
      fareEstimate: 'Fare Estimate',
      destRequired: 'Dest required',
      color: 'bg-orange-50'
    }
  ];

  const options = vehicleOptions.length > 0 ? vehicleOptions : defaultVehicleOptions;
  
  // Use the first option as default if no selectedOption is provided
  const currentSelection = selectedOption || options[0];

  const handleOptionSelect = (option) => {
    onOptionSelect(option); // Notify parent component
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`w-full max-w-md mx-auto bg-white rounded-lg shadow-lg ${className}`}>
      {/* Dropdown Header */}
      <button
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