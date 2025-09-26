import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { defaultPaymentOptions } from '../../data/data.jsx';

const PaymentDropdown = forwardRef(({
  paymentOptions = [],
  selectedOption = null,
  onOptionSelect = () => {},
  title = "Payment method",
  className = "",
  inputRef // <-- optional legacy prop
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const options = paymentOptions.length > 0 ? paymentOptions : defaultPaymentOptions;
  const currentSelection = selectedOption || null;
  const hasValue = currentSelection !== null;

  const handleOptionSelect = (option) => {
    onOptionSelect(option);
    setIsOpen(false);
    setIsFocused(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setIsFocused(!isOpen);
  };

  return (
    // Attach whichever ref is provided: forwarded ref has priority
    <div ref={ref || inputRef} className={`relative w-full ${className}`}>
      {/* Floating Label - hide completely when value is selected */}
      {!hasValue && (
        <label
          className={`absolute left-3 transition-all duration-200 pointer-events-none ${
            isFocused || isOpen
              ? '-top-2 text-xs bg-white px-1 text-gray-500 z-10'
              : 'top-4 text-base text-gray-500'
          }`}
        >
          {title}
        </label>
      )}

      {/* Main Select Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => !isOpen && setIsFocused(false)}
        className={`w-full min-h-[56px] px-3 pt-2 pb-2 border rounded-md text-left bg-white transition-all duration-200 focus:outline-none ${
          isFocused || isOpen
            ? 'border-orange-500 border-2'
            : 'border-gray-300 hover:border-orange-500'
        }`}
      >
        <div className="flex items-center justify-between min-h-[40px]">
          {hasValue ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {currentSelection.icon}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 truncate">
                  {currentSelection.name}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 mt-2"></div>
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-500 ml-2 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setIsFocused(false);
            }}
          />

          {/* Options Container */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-80 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                className={`w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  index === 0 ? 'rounded-t-lg' : ''
                } ${index === options.length - 1 ? 'rounded-b-lg' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {option.icon}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {option.name}
                        </h3>
                        {currentSelection?.id === option.id && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default PaymentDropdown;
