import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { defaultPaymentOptions } from '../../data/data.jsx';

const PaymentDropdown = ({ 
  paymentOptions = [], 
  selectedOption = null, 
  onOptionSelect = () => {},
  title = "Payment method",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = paymentOptions.length > 0 ? paymentOptions : defaultPaymentOptions;
  const currentSelection = selectedOption || options[0];

  const handleOptionSelect = (option) => {
    onOptionSelect(option);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`w-full mx-auto bg-white rounded-lg shadow-lg ${className}`}>
      {/* Dropdown Header */}
      <button type="button"
        onClick={toggleDropdown}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 rounded-t-lg border-b hover:bg-gray-100 transition-colors"
      >
        <span className="text-gray-700 font-medium">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {/* Selected Option (when closed) */}
      {!isOpen && currentSelection && (
        <div className={`px-4 py-4 ${currentSelection.color || 'bg-gray-50'} rounded-b-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">{currentSelection.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-800">{currentSelection.name}</h3>
                <p className="text-sm text-gray-600">{currentSelection.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{currentSelection.type}</p>
              <p className="text-sm text-gray-600">{currentSelection.status}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Options */}
      {isOpen && (
        <div className="max-h-80 overflow-y-auto">
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
                  <div className="flex-shrink-0">{option.icon}</div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{option.name}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{option.type}</p>
                  <p className="text-sm text-gray-600">{option.status}</p>
                  {currentSelection && currentSelection.id === option.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto"></div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentDropdown;