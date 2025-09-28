import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { Phone, PencilLine, MapPin } from "lucide-react"; // lighter than react-icons
const Modal = lazy(() => import("./Modal")); // code-split

const NavSection = ({ onPlaceSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState("");

  const handleToggle = useCallback(() => setIsOpen(v => !v), []);
  const handlePlaceSelect = useCallback((place) => {
    setSelectedPlace(place?.description ?? "");
    setIsOpen(false);
    onPlaceSelect?.(place);
  }, [onPlaceSelect]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  return (
    <div className="flex items-center bg-[#4a4a4a] h-auto min-h-12 px-2 sm:px-4 py-2 sm:py-0">
      <div className="flex flex-wrap items-center md:justify-normal justify-between gap-2 sm:gap-4 w-full">
        {/* Phone */}
        <div className="flex items-center gap-2">
          <Phone className="text-white w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
          <a
            href="tel:+61490092704"
            className="text-white text-sm sm:text-xl font-medium"
          >
            0490092704
          </a>
        </div>

        {/* Location quick-edit */}
        <div className="relative">
          {/* Use button for accessibility instead of readOnly input trap */}
          <button
            type="button"
            onClick={handleToggle}
            className="rounded-sm bg-white h-8 sm:h-9 pl-2 pr-8 cursor-pointer text-left text-sm sm:text-base
                       w-[180px] sm:w-[220px] md:w-[280px] border border-transparent hover:border-gray-300"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            title="Change city / area"
          >
            <span className="inline-flex items-center gap-2 text-gray-700 overflow-hidden">
              <MapPin className="w-4 h-4" aria-hidden />
              {selectedPlace || "Melbourne VIC"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleToggle}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200"
            aria-label="Edit location"
            title="Edit location"
          >
            <PencilLine className="w-4 h-4 text-gray-600" aria-hidden />
          </button>
        </div>
      </div>

      {/* Modal (code-split) */}
      {isOpen && (
        <Suspense fallback={null}>
          <Modal onClose={handleToggle} onPlaceSelect={handlePlaceSelect} />
        </Suspense>
      )}
    </div>
  );
};

export default NavSection;
