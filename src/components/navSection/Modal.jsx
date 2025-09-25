import { useState } from "react";
import { X } from "lucide-react";
import { getGeocode } from "../../hooks/map";

export default function Modal({ onClose , onPlaceSelect}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleClose = () => onClose();

  const handleChange = async (e) => {
  
  };

  const handlePlaceClick = async (s) => {
  setQuery(s.description);
  setSuggestions([]);
   
  try {
    const location = await getGeocode(s);
    if (location) {
      onPlaceSelect(location);
      onClose()
    }
  } catch (err) {
    console.error("Failed to get place details", err);
  }
   
};

  return (
    <div>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40"></div>

      {/* Modal box */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-[500px] max-w-[90%] p-10 relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            onClick={handleClose}
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-semibold text-center mb-4">
            Which city content do you want to see?
          </h2>

          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Enter the location"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-2"
          />

          {suggestions.length > 0 && (
            <ul className=" absolute border border-gray-200 rounded-md shadow-md bg-white mt-1 max-h-60 overflow-y-auto">
              {suggestions.map((s) => (
                <li
                  key={s.place_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handlePlaceClick(s)}
                >
                  <span className="font-medium">
                    {s.structured_formatting.main_text}
                  </span>
                  <span className="text-gray-500 ml-2 text-sm">
                    {s.structured_formatting.secondary_text}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p className="text-md text-center mt-4">
            Please enter your location or the city you are interested in to help
            us display more relevant information to you.
          </p>
        </div>
      </div>
    </div>
  );
}
