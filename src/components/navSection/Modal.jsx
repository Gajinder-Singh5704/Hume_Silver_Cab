import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getGeocode } from "../../hooks/map";

export default function Modal({ onClose, onPlaceSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [loading, setLoading] = useState(false);

  const serviceRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  // AU bounds (rough): SW & NE corners
  const AU_BOUNDS = useRef({
    sw: { lat: -44.0, lng: 112.0 },
    ne: { lat: -10.0, lng: 154.0 },
  });

  useEffect(() => {
    const init = () => {
      if (window.google?.maps?.places) {
        serviceRef.current = new window.google.maps.places.AutocompleteService();
        sessionTokenRef.current =
          new window.google.maps.places.AutocompleteSessionToken();
        setIsReady(true);
      }
    };
    init();
    const id = setInterval(() => {
      if (!isReady) init();
      else clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [isReady]);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const resetSession = () => {
    if (window.google?.maps?.places) {
      sessionTokenRef.current =
        new window.google.maps.places.AutocompleteSessionToken();
    }
  };

  const handleClose = () => {
    setSuggestions([]);
    onClose();
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setHighlight(-1);

    if (!value.trim()) {
      setSuggestions([]);
      resetSession();
      return;
    }
    if (!isReady || !serviceRef.current) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);

      // Build AU-biased options (closest to Google’s default feel)
      const { sw, ne } = AU_BOUNDS.current;
      let locationBias;
      try {
        // Prefer LatLngBounds bias if available (Places JS v3)
        const swLL = new window.google.maps.LatLng(sw.lat, sw.lng);
        const neLL = new window.google.maps.LatLng(ne.lat, ne.lng);
        locationBias = new window.google.maps.LatLngBounds(swLL, neLL);
      } catch {
        locationBias = undefined; // fallback if not supported
      }

      const options = {
        input: value,
        sessionToken: sessionTokenRef.current,
        // Don’t restrict to a type; leaving this open feels like Google’s box (addresses, regions, businesses)
        componentRestrictions: { country: "au" }, // hard AU bias
        ...(locationBias ? { locationBias } : {}),
      };

      serviceRef.current.getPlacePredictions(options, (predictions, status) => {
        const ok = window.google.maps.places.PlacesServiceStatus.OK;
        if (status !== ok || !predictions?.length) {
          setSuggestions([]);
          setLoading(false);
          return;
        }
        setSuggestions(predictions);
        setLoading(false);
      });
    }, 200); // a bit snappier than 250
  };

  const handlePlaceClick = async (s) => {
    setQuery(s.description);
    setSuggestions([]);

    try {
      const location = await getGeocode({
        ...s,
        sessionToken: sessionTokenRef.current,
      });
      if (location) {
        onPlaceSelect(location);
        handleClose();
      }
    } catch (err) {
      console.error("Failed to get place details", err);
    } finally {
      resetSession(); // end session after selection
    }
  };

  // Keyboard UX: arrows + enter/escape
  const handleKeyDown = (e) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (highlight >= 0) {
        e.preventDefault();
        handlePlaceClick(suggestions[highlight]);
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  // Bold the matched substrings like Google
  const renderMainText = (s) => {
    const fmt = s.structured_formatting;
    const text = fmt?.main_text || s.description;
    const matches = fmt?.main_text_matched_substrings || [];

    if (!matches.length) return <span className="font-medium">{text}</span>;

    const parts = [];
    let lastIndex = 0;
    matches.forEach(({ offset, length }, idx) => {
      if (offset > lastIndex) {
        parts.push(
          <span key={`n-${idx}-${lastIndex}`}>{text.slice(lastIndex, offset)}</span>
        );
      }
      parts.push(
        <strong key={`b-${idx}-${offset}`}>
          {text.slice(offset, offset + length)}
        </strong>
      );
      lastIndex = offset + length;
    });
    if (lastIndex < text.length) {
      parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }
    return <span className="font-medium">{parts}</span>;
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
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-semibold text-center mb-4">
            Which city content do you want to see?
          </h2>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter a city, suburb, or address in Australia"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-2"
              aria-autocomplete="list"
              aria-expanded={suggestions.length > 0}
              aria-controls="places-suggestions"
            />

            {/* Results */}
            {(suggestions.length > 0 || loading) && (
              <ul
                id="places-suggestions"
                className="absolute left-0 right-0 border border-gray-200 rounded-md shadow-md bg-white max-h-60 overflow-y-auto z-10"
              >
                {loading && (
                  <li className="p-2 text-sm text-gray-500">Searching…</li>
                )}

                {!loading && suggestions.map((s, idx) => (
                  <li
                    key={s.place_id}
                    className={`p-2 cursor-pointer flex flex-col ${
                      idx === highlight ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setHighlight(idx)}
                    onMouseLeave={() => setHighlight(-1)}
                    onClick={() => handlePlaceClick(s)}
                  >
                    <div>{renderMainText(s)}</div>
                    {s.structured_formatting?.secondary_text && (
                      <div className="text-gray-500 text-sm">
                        {s.structured_formatting.secondary_text}
                      </div>
                    )}
                  </li>
                ))}

                {!loading && suggestions.length === 0 && (
                  <li className="p-2 text-sm text-gray-500">No results</li>
                )}
              </ul>
            )}

            {/* Powered by Google (required) */}
            {/* <div className="flex justify-end mt-1">
              <img
                src="https://developers.google.com/maps/documentation/images/powered_by_google_on_white.png"
                alt="Powered by Google"
                className="h-4"
              />
            </div> */}
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