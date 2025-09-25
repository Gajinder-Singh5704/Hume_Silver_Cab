import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getGeocode } from "../../hooks/map";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import SIDEBAR_CONSTANTS from "../../constants/constants";

export default function Modal({ onClose , onPlaceSelect}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [select,setSelect] = useState("")
   const selectInputRef = useRef(null);

   const fixedColor = SIDEBAR_CONSTANTS.COLORS.FIXED_ORANGE;

  const handleClose = () => onClose();

  const handleChange = async (e) => {
  
  };

  const handlePlaceClick = async (s) => {
  setQuery(s.description);
  setSuggestions([]);
   
};

useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        clearInterval(interval);

        // Attach select autocomplete
        if (selectInputRef.current) {
          const options = {
            componentRestrictions: { country: "au" },
            fields: ["formatted_address", "geometry"],
          };
          const autoPickup = new window.google.maps.places.Autocomplete(
            selectInputRef.current,
            options
          );

          autoPickup.addListener("place_changed", async () => {
            const place = autoPickup.getPlace();
            if (!place || !place.geometry) return;

            setSelect(place.formatted_address);

            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            try {
              // Validate using your helper
              const insideVIC = await isInVictoria(location);
              if (!insideVIC) {
                setIsNoServiceOpen(true);
                console.log("No Service Open is : " + isNoServiceOpen);
                // alert("Pickup must be within Victoria, Australia.");
                // revert the visible input (optional) so user knows selection failed
                setPickup("");
                return; // STOP: do not set pickupLoc, do not update route
              }

              // valid: set location and notify parent & map
              // setPickupLoc(location);
              // onPickupSelect(location);

              // Update route now that pickup is valid
              // updateRoute(location, destinationLocs);
            } catch (err) {
              console.error("Failed to validate pickup location:", err);
              // optionally revert UI
              // setPickup("");
            }
           
          });
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [
    select
  ]);

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

         <div className="mb-4 relative">
                <TextField
                  inputRef={selectInputRef} 
                  label="Add pickup (required)"
                  variant="outlined"
                  fullWidth
                  required
                  placeholder="Add your pickup location"
                  value={select}
                  onChange={(e) => setSelect(e.target.value)} 
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {select ? (
                          <IconButton size="small">
                            <span
                              // onClick={handleDeletePickup}
                              style={{ fontSize: 16 }}
                            >
                              ✖
                            </span>
                          </IconButton>
                        ) : null}
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: `${fixedColor}`, // outline color on focus
                      },
                    },
                    "& label.Mui-focused": {
                      color: "gray", // label color on focus
                    },
                  }}
                />

                {suggestions.length > 0 && (
                  <ul className="absolute z-50 bg-white border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto w-full">
                    {suggestions.map((s) => (
                      <li
                        key={s.place_id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handlePickupSelect(s)}
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
              </div>

          <p className="text-md text-center mt-4">
            Please enter your location or the city you are interested in to help
            us display more relevant information to you.
          </p>
        </div>
      </div>
    </div>
  );
}
