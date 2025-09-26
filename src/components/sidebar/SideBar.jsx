import { useEffect, useRef, useState } from "react";
import { tolls, normalizeRoad, roadAliases } from "../../data/tollsData.js";
import CabUnavailableModal from "./NoServiceModal.jsx";
import SIDEBAR_CONSTANTS, { TIME_TYPE } from "../../constants/constants.js";
import { defaultVehicleOptions } from "../../data/data.jsx";
import {
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { LockIcon, XIcon as XLucide } from "lucide-react";
import ToggleSwitch from "./ToggleSwich";
import CarDropdown from "./CarDropdown";
import { getGeocode } from "../../hooks/map.js";
import PaymentDropdown from "./PaymentDropdown.jsx";
import { seatDetails } from "../../data/data.jsx";
import SeatDetails from "./SeatDetails.jsx";
import LuggageModal from "./LuggageModal.jsx";
import { toast } from "react-toastify";

const melbourneNow = SIDEBAR_CONSTANTS.getMelbourneNow()

const SideBar = ({
  onPickupSelect,
  onDestinationsSelect,
  onVehicleDetailOpenChange,
}) => {
  // ===== Places service (shared) =====
  const [placesReady, setPlacesReady] = useState(false);
  const serviceRef = useRef(null);
  const sessionTokenRef = useRef(null);

  // AU bounds (rough): SW & NE corners (same as modal)
  const AU_BOUNDS = useRef({
    sw: { lat: -44.0, lng: 112.0 },
    ne: { lat: -10.0, lng: 154.0 },
  });

  // debounce refs for pickup and per-destination
  const debouncePickupRef = useRef(null);
  const debounceDestRefs = useRef({}); // key: index -> timeout id

  // ===== form fields =====
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [allFares, setAllFares] = useState([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState([false]);

  const [destinations, setDestinations] = useState([""]);
  const [passenger, setPassenger] = useState("");
  const [contact, setContact] = useState("");
  const [instruction, setInstruction] = useState("");
  const [isOn, setIsOn] = useState(true);
  const [selected, setSelected] = useState(defaultVehicleOptions[0]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [tollPrice, setTollPrice] = useState(0);
  const [isLuggageModalOpen, setIsLuggageModalOpen] = useState(false);

  const [pickup, setPickup] = useState("");
  const pickupInputRef = useRef(null);

  const [pickupLoc, setPickupLoc] = useState(null);
  const [destinationLocs, setDestinationLocs] = useState([]);

  // suggestions per destination index
  const [destinationSuggestions, setDestinationSuggestions] = useState([[]]);

  // route & toll
  const [distanceKm, setDistanceKm] = useState("");
  const [hasToll, setHasToll] = useState(false);

  // booking time
  const [bookingMode, setBookingMode] = useState("now"); // "now" | "later"
  const [dateVal, setDateVal] = useState(
    melbourneNow.toISOString().split("T")[0]
  );
  const [hourVal, setHourVal] = useState(
    melbourneNow.getHours().toString().padStart(2, "0")
  );
  const [minuteVal, setMinuteVal] = useState(
    melbourneNow.getMinutes().toString().padStart(2, "0")
  );

  const [timeType, setTimeType] = useState(2); // number-3
  const [fare, setFare] = useState(null);
  const [contactError, setContactError] = useState("");

  const [vehicleText, setVehicleText] = useState("");
  const [isNoServiceOpen, setIsNoServiceOpen] = useState(false);

  const fixedColor = SIDEBAR_CONSTANTS.COLORS.FIXED_ORANGE; // orange-500
  const [showDone, setShowDone] = useState(false);
  const timeInputRef = useRef(null);

  // ===== Places init (shared AutocompleteService + session token) =====
  useEffect(() => {
    const init = () => {
      if (window.google?.maps?.places) {
        try {
          serviceRef.current = new window.google.maps.places.AutocompleteService();
          sessionTokenRef.current =
            new window.google.maps.places.AutocompleteSessionToken();
          setPlacesReady(true);
        } catch { /* noop */ }
      }
    };
    init();
    const id = setInterval(() => {
      if (!placesReady) init();
      else clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [placesReady]);

  const resetSession = () => {
    if (window.google?.maps?.places) {
      sessionTokenRef.current =
        new window.google.maps.places.AutocompleteSessionToken();
    }
  };

  // ===== Helpers to build AU-biased options (like modal) =====
  const buildOptions = (input) => {
    const { sw, ne } = AU_BOUNDS.current;
    let locationBias;
    try {
      const swLL = new window.google.maps.LatLng(sw.lat, sw.lng);
      const neLL = new window.google.maps.LatLng(ne.lat, ne.lng);
      locationBias = new window.google.maps.LatLngBounds(swLL, neLL);
    } catch {
      locationBias = undefined;
    }
    return {
      input,
      sessionToken: sessionTokenRef.current,
      componentRestrictions: { country: "au" },
      ...(locationBias ? { locationBias } : {}),
    };
  };

  // ====== PICKUP: search-as-you-type (modal-like) ======
  const handlePickupInputChange = (e) => {
    const value = e.target.value;
    setPickup(value);
    setPickupLoc(null);
    setPickupSuggestions([]);

    if (!value.trim()) {
      resetSession();
      return;
    }
    if (!placesReady || !serviceRef.current) return;

    clearTimeout(debouncePickupRef.current);
    debouncePickupRef.current = setTimeout(() => {
      setLoadingPickup(true);  // 🚀 start
      serviceRef.current.getPlacePredictions(
        buildOptions(value),
        (predictions, status) => {
          setLoadingPickup(false); // ✅ stop
          const ok = window.google.maps.places.PlacesServiceStatus.OK;
          if (status !== ok || !predictions?.length) {
            setPickupSuggestions([]);
            return;
          }
          setPickupSuggestions(predictions);
        }
      );
    }, 200);
  };


  const handlePickupPredictionClick = async (s) => {
    setPickup(s.description);
    setPickupSuggestions([]);

    try {
      const location = await getGeocode({
        ...s,
        sessionToken: sessionTokenRef.current,
      });
      if (!location) return;

      // Validate VIC
      const insideVIC = await isInVictoria(location);
      if (!insideVIC) {
        setIsNoServiceOpen(true);
        setPickup("");
        resetSession();
        return;
      }

      setPickupLoc(location);
      onPickupSelect(location);
      updateRoute(location, destinationLocs);
    } catch (err) {
      console.error("Failed to get pickup details", err);
    } finally {
      resetSession();
    }
  };

  // ====== DESTINATIONS: search-as-you-type (modal-like) ======
  const ensureDestSuggestionsSize = (len) => {
    setDestinationSuggestions((prev) => {
      const next = prev.slice();
      while (next.length < len) next.push([]);
      while (next.length > len) next.pop();
      return next;
    });
  };

  useEffect(() => {
    // keep suggestions array in sync with inputs
    ensureDestSuggestionsSize(destinations.length);
  }, [destinations.length]);

  const handleDestinationInputChange = (index, value) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);

    const newLocs = [...destinationLocs];
    newLocs[index] = undefined;
    setDestinationLocs(newLocs);

    setDestinationSuggestions((prev) => {
      const next = [...prev];
      next[index] = [];
      return next;
    });

    if (!value.trim()) {
      resetSession();
      return;
    }
    if (!placesReady || !serviceRef.current) return;

    if (debounceDestRefs.current[index]) {
      clearTimeout(debounceDestRefs.current[index]);
    }
    debounceDestRefs.current[index] = setTimeout(() => {
      setLoadingDestinations((prev) => {
        const next = [...prev];
        next[index] = true;    // 🚀 start
        return next;
      });

      serviceRef.current.getPlacePredictions(
        buildOptions(value),
        (predictions, status) => {
          setLoadingDestinations((prev) => {
            const next = [...prev];
            next[index] = false;  // ✅ stop
            return next;
          });

          const ok = window.google.maps.places.PlacesServiceStatus.OK;
          const list = status === ok && predictions?.length ? predictions : [];
          setDestinationSuggestions((prev) => {
            const next = [...prev];
            next[index] = list;
            return next;
          });
        }
      );
    }, 200);
  };


  const handleDestinationPredictionClick = async (index, s) => {
    // set visible text
    const newDestinations = [...destinations];
    newDestinations[index] = s.description;
    setDestinations(newDestinations);

    // clear suggestions
    setDestinationSuggestions((prev) => {
      const next = [...prev];
      next[index] = [];
      return next;
    });

    try {
      const location = await getGeocode({
        ...s,
        sessionToken: sessionTokenRef.current,
      });
      if (!location) return;

      // VIC validation
      const insideVIC = await isInVictoria(location);
      if (!insideVIC) {
        setIsNoServiceOpen(true);
        const reverted = [...destinations];
        reverted[index] = "";
        setDestinations(reverted);
        resetSession();
        return;
      }

      const newLocs = [...destinationLocs];
      newLocs[index] = location;
      setDestinationLocs(newLocs);
      onDestinationsSelect(newLocs);

      updateRoute(pickupLoc, newLocs);
    } catch (err) {
      console.error("Failed to get destination details", err);
      const reverted = [...destinations];
      reverted[index] = "";
      setDestinations(reverted);
    } finally {
      resetSession();
    }
  };

  // ===== Delete / Add inputs (unchanged except suggestions sync) =====
  const handleDeleteDestination = (index) => {
    if (destinations.length === 1) {
      setDestinations([""]);
      setDestinationLocs([]);
      setAllFares([]);
      onDestinationsSelect([]);
      updateRoute(pickupLoc, []);
      setDestinationSuggestions([[]]);
      return;
    }
    const newDestinations = [...destinations];
    newDestinations.splice(index, 1);
    setDestinations(newDestinations);

    const newLocs = [...destinationLocs];
    newLocs.splice(index, 1);
    setDestinationLocs(newLocs);
    onDestinationsSelect(newLocs);
    updateRoute(pickupLoc, newLocs);

    setDestinationSuggestions((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next.length ? next : [[]];
    });
  };

  const handleDeletePickup = () => {
    setPickup("");
    setPickupLoc(null);
    setPickupSuggestions([]);

    setDestinations([""]);
    setDestinationLocs([]);
    setDestinationSuggestions([[]]);

    onDestinationsSelect([]);
    onPickupSelect(null);
    setAllFares([]);
    updateRoute(null, []);
  };

  // ===== Payment select (unchanged) =====
  const handlePaymentSelect = (paymentMethod) => {
    setSelectedPayment(paymentMethod);
    // console.log("Selected payment:", paymentMethod);
  };

  const handleAdd = () => {
    if (
      destinations.length < SIDEBAR_CONSTANTS.LIMITS.MAX_DESTINATIONS &&
      typeof destinations[destinations.length - 1] === "string" &&
      destinations[destinations.length - 1].trim() !== ""
    ) {
      setDestinations([...destinations, ""]);
      setDestinationSuggestions((prev) => [...prev, []]);
    }
  };

  // ===== Route & fare logic (unchanged) =====
  const updateRoute = (pickup, dests) => {
    // console.log("Calling calculate");
    if (!pickup || dests.length === 0) {
      setDistanceKm("");
      setHasToll(false);
      setFare(null);
      return;
    }

    setHasToll(false);
    setFare(null);

    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin: pickup,
        destination: dests[dests.length - 1],
        waypoints: dests.slice(0, -1).map((loc) => ({
          location: loc,
          stopover: true,
        })),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result.routes.length > 0) {
          const leg = result.routes[0].legs.reduce(
            (acc, l) => {
              acc.distance += l.distance.value;
              acc.steps.push(...l.steps);
              return acc;
            },
            { distance: 0, steps: [] }
          );

          const km = (leg.distance / 1000).toFixed(1);
          setDistanceKm(km);

          // console.log("Route Instructions:");
          leg.steps.forEach((step, idx) => {
            // console.log(`${idx + 1}. ${step.instructions}`);
          });

          const stepsText = leg.steps
            .map((s) => s.instructions.toLowerCase())
            .join(" ");

          const toll = calculateToll(stepsText);

          setHasToll(toll > 0);
          setTollPrice(toll);
          // console.log("Toll Cost:", toll);
          calculateFare();
        } else {
          console.error("Directions request failed:", status);
          setDistanceKm("");
          setHasToll(false);
          setFare(null);
        }
      }
    );
  };

  const calculateToll = (stepsText) => {
    let toll = 0;
    let plainText = stepsText.replace(/<[^>]*>?/gm, "").toLowerCase();

    Object.keys(roadAliases).forEach((alias) => {
      if (plainText.includes(alias)) {
        // console.log(
        //   `Alias matched: replacing "${alias}" → "${roadAliases[alias]}"`
        // );
        plainText = plainText.replaceAll(alias, roadAliases[alias]);
      }
    });

    // console.log("=== Toll Calculation ===");
    // console.log("Normalized steps text:", plainText);

    tolls.forEach((entry) => {
      const normalizedEntry = normalizeRoad(entry.entryPoint);
      const entryIndex = plainText.indexOf(normalizedEntry);

      if (entryIndex !== -1) {
        // console.log(
        //   `✅ Entry point found: ${normalizedEntry} (index ${entryIndex})`
        // );

        let farthestExit = null;
        let farthestExitIndex = -1;

        entry.exits.forEach((exit) => {
          const normalizedExit = normalizeRoad(exit.exitPoint);
          const exitIndex = plainText.indexOf(normalizedExit);

          if (exitIndex !== -1 && exitIndex > entryIndex) {
            // console.log(
            //   `   ↳ Exit matched: ${normalizedExit} (index ${exitIndex}), price: ${exit.price}`
            // );
            if (exitIndex > farthestExitIndex) {
              farthestExitIndex = exitIndex;
              farthestExit = exit;
            }
          }
        });

        if (farthestExit) {
          // console.log(
          //   `   ✅ Farthest exit: ${farthestExit.exitPoint}, price: ${farthestExit.price}`
          // );
          toll = Math.max(toll, farthestExit.price);
        } else {
          // console.log(
          //   `   ⚠ No exits matched after entry point: ${normalizedEntry}`
          // );
        }
      } else {
        // console.log(`❌ Entry point NOT found: ${entry.entryPoint}`);
      }
    });

    // console.log("💰 Final calculated toll:", toll);
    return toll;
  };

  const determineTimeType = (dateObj) => {
    const day = dateObj.getDay();
    const hour24 = dateObj.getHours();
    const minute = dateObj.getMinutes();
    let timeType = 2;

    if (
      (day === 5 && hour24 >= 22) ||
      (day === 6 && hour24 < 4) ||
      (day === 6 && hour24 >= 22) ||
      (day === 0 && hour24 < 4)
    ) {
      timeType = 3;
    } else if (hour24 >= 9 && hour24 < 17) {
      timeType = 1;
    }

    // console.log(
    //   `Calculated time type: ${timeType}`
    // );

    return timeType;
  };

  const calculateFare = () => {
    if (!distanceKm) {
      setAllFares([]);
      return null;
    }

    const distance = parseInt(distanceKm);
    const tollCost = hasToll ? parseFloat(tollPrice) : 0;
    const bookingFees = SIDEBAR_CONSTANTS.FEES.BOOKING_FEE;

    const computeLocal = (vehicleName) => {
      let vehicleSurcharge = 0;
      switch (vehicleName) {
        case "Sedan":
          vehicleSurcharge = SIDEBAR_CONSTANTS.VEHICLE_SURCHARGES.Sedan;
          break;
        case "Silver Service":
          vehicleSurcharge = SIDEBAR_CONSTANTS.VEHICLE_SURCHARGES.SilverService;
          break;
        case "SUV":
          vehicleSurcharge = SIDEBAR_CONSTANTS.VEHICLE_SURCHARGES.SUV;
          break;
        case "Maxi Taxi":
          vehicleSurcharge = SIDEBAR_CONSTANTS.VEHICLE_SURCHARGES.MaxiTaxi;
          break;
      }

      let base;
      if (timeType === 3) {
        base = SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.OVERNIGHT_WEEKEND].baseFlat
          + distance
          * SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.OVERNIGHT_WEEKEND].perKm
          + tollCost
          + SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.OVERNIGHT_WEEKEND].flagFall;
      } else if (timeType === 2) {
        base = SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.SHOULDER].baseFlat
          + distance
          * SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.SHOULDER].perKm
          + tollCost
          + SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.SHOULDER].flagFall;
      } else {
        base = SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.NORMAL].baseFlat
          + distance
          * SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.NORMAL].perKm
          + tollCost
          + SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.NORMAL].flagFall;
      }

      let fareValue = Math.max(base, SIDEBAR_CONSTANTS.FEES.MIN_FARE);
      fareValue += vehicleSurcharge + bookingFees;

      if (isAirportPickup(pickup)) {
        fareValue += SIDEBAR_CONSTANTS.FEES.AIRPORT_SURCHARGE;
      }

      return Number(fareValue.toFixed(2));
    };

    const faresArray = [
      { id: "next-available", name: "Next Available", price: computeLocal("Sedan") },
      { id: "silver-service", name: "Silver Service", price: computeLocal("Silver Service") },
      { id: "suv", name: "SUV", price: computeLocal("SUV") },
      { id: "maxi-taxi", name: "Maxi Taxi", price: computeLocal("Maxi Taxi") },
    ];

    setAllFares(faresArray);

    const vehicleName = selected?.name || "Sedan";
    const selectedFare = computeLocal(vehicleName);
    setFare(selectedFare);
  };

  const isAirportPickup = (pickupVal) => {
    let pickupAddress = "";

    if (typeof pickupVal === "string") pickupAddress = pickupVal;
    else if (pickupVal?.description) pickupAddress = pickupVal.description;
    else if (pickupVal?.name) pickupAddress = pickupVal.name;

    const lower = pickupAddress.toLowerCase();
    return (
      lower.includes("airport") ||
      lower.includes("intl") ||
      lower.includes("international") ||
      lower.includes("domestic terminal") ||
      lower.includes("terminal")
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      pickup,
      pickupLoc,
      destinations,
      destinationLocs,
      passenger,
      contact,
      instruction,
      isOn,
      selected,
      selectedPayment,
      bookingMode,
      dateVal,
      hourVal,
      minuteVal,
      timeType,
      fare,
      hasToll,
      distanceKm,
    };

    toast.success("🎉 Booking Requested Successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
    console.log("Booking Data:", formData);

    // Reset all fields
    setPickup("");
    setPickupLoc(null);
    setPickupSuggestions([]);
    setDestinations([""]);
    setDestinationLocs([]);
    setDestinationSuggestions([[]]);
    setPassenger("");
    setContact("");
    setInstruction("");
    setIsOn(true);
    setSelected(defaultVehicleOptions[0]);
    setSelectedPayment(null);
    setBookingMode("now");
    setDateVal(melbourneNow.toISOString().split("T")[0]);
    setHourVal(melbourneNow.getHours().toString().padStart(2, "0"));
    setMinuteVal(melbourneNow.getMinutes().toString().padStart(2, "0"));
    setTimeType(2);
    setFare(null);
    setHasToll(false);
    setDistanceKm("");
    setContactError("");
    onPickupSelect(null);          // ✅
    onDestinationsSelect([])
    setAllFares([]);
  };

  // ===== VIC validator (unchanged) =====
  const isInVictoria = async (location) => {
    return new Promise((resolve) => {
      if (!window.google || !window.google.maps) {
        console.warn("Google Maps not loaded yet");
        return resolve(false);
      }

      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ location }, (results, status) => {
        if (status === "OK" && results[0]) {
          const addressComponents = results[0].address_components;
          const stateComp = addressComponents.find((c) =>
            c.types.includes("administrative_area_level_1")
          );
          const countryComp = addressComponents.find((c) =>
            c.types.includes("country")
          );

          if (stateComp?.short_name === "VIC" && countryComp?.short_name === "AU") {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          console.error("Geocode failed:", status);
          resolve(false);
        }
      });
    });
  };

  useEffect(() => {
    if (distanceKm) calculateFare();
  }, [selected, distanceKm, hasToll, timeType]);

  useEffect(() => {
    let dateObj;

    if (bookingMode === "now") {
      dateObj = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Australia/Melbourne" })
      );
    } else if (bookingMode === "later" && dateVal) {
      const hour = parseInt(hourVal, 10);
      dateObj = new Date(
        `${dateVal}T${hour.toString().padStart(2, "0")}:${minuteVal}:00`
      );
    }

    if (dateObj) {
      setTimeType(determineTimeType(dateObj));
    }
  }, [bookingMode, dateVal, hourVal, minuteVal]);

  return (
    <>
      {!vehicleText && (
        <section className=" w-full scroll-container">
          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Step 1 */}
            <div className="px-5 py-6">
              <h3 className="text-sm mb-4 hidden md:flex">
                Step 1 of 4 <b className="ml-2"> Booking details</b>
              </h3>

              <h2 className="md:hidden text-2xl text-bold mb-2">
                Fare Estimates Calculator
              </h2>
              <h3 className="md:hidden mb-4 text-sm">
                Please enter a valid pickup and destination{" "}
              </h3>

              {/* PICKUP */}
              <div className="mb-4 relative">
                <TextField
                  autoComplete="off"
                  spellCheck={false}
                  inputRef={pickupInputRef}
                  label="Add pickup (required)"
                  variant="outlined"
                  fullWidth
                  required
                  placeholder="Add your pickup location"
                  value={pickup}
                  onChange={handlePickupInputChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {pickup ? (
                          <IconButton size="small" onClick={handleDeletePickup}>
                            <span style={{ fontSize: 16 }}>✖</span>
                          </IconButton>
                        ) : null}
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: `${fixedColor}`,
                      },
                    },
                    "& label.Mui-focused": { color: "gray" },
                  }}
                />

                {(loadingPickup || pickupSuggestions.length > 0) && (
                  <ul className="absolute z-50 bg-white border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto w-full">
                    {loadingPickup && (
                      <li className="p-2 text-sm text-gray-500">Searching…</li>
                    )}
                    {!loadingPickup &&
                      pickupSuggestions.map((s) => (
                        <li
                          key={s.place_id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handlePickupPredictionClick(s)}
                        >
                          <span className="font-medium">
                            {s.structured_formatting?.main_text || s.description}
                          </span>
                          {s.structured_formatting?.secondary_text && (
                            <span className="text-gray-500 ml-2 text-sm">
                              {s.structured_formatting.secondary_text}
                            </span>
                          )}
                        </li>
                      ))}
                    {!loadingPickup && pickupSuggestions.length === 0 && (
                      <li className="p-2 text-sm text-gray-500">No results</li>
                    )}
                  </ul>
                )}

              </div>

              {/* No service modal */}
              <CabUnavailableModal
                open={isNoServiceOpen}
                onClose={() => setIsNoServiceOpen(false)}
              />

              {/* DESTINATIONS */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {destinations.map((destination, index) => (
                  <div key={index} className="relative">
                    <TextField
                      label={`Destination ${index + 1}`}
                      variant="outlined"
                      fullWidth
                      value={destination}
                      onChange={(e) =>
                        handleDestinationInputChange(index, e.target.value)
                      }
                      required
                      disabled={!pickup}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {destination && (
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDestination(index)}
                              >
                                <span style={{ fontSize: 16 }}>✖</span>
                              </IconButton>
                            )}
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": {
                            borderColor: `${fixedColor}`,
                          },
                        },
                        "& label.Mui-focused": { color: "gray" },
                      }}
                    />

                    {(loadingDestinations[index] || destinationSuggestions[index]?.length > 0) && (
                      <ul className="absolute z-50 bg-white border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto w-full">
                        {loadingDestinations[index] && (
                          <li className="p-2 text-sm text-gray-500">Searching…</li>
                        )}
                        {!loadingDestinations[index] &&
                          destinationSuggestions[index].map((s) => (
                            <li
                              key={s.place_id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleDestinationPredictionClick(index, s)}
                            >
                              <span className="font-medium">
                                {s.structured_formatting?.main_text || s.description}
                              </span>
                              {s.structured_formatting?.secondary_text && (
                                <span className="text-gray-500 ml-2 text-sm">
                                  {s.structured_formatting.secondary_text}
                                </span>
                              )}
                            </li>
                          ))}
                        {!loadingDestinations[index] &&
                          destinationSuggestions[index].length === 0 && (
                            <li className="p-2 text-sm text-gray-500">No results</li>
                          )}
                      </ul>
                    )}

                  </div>
                ))}

                <Button
                  variant="outlined"
                  onClick={handleAdd}
                  disabled={
                    destinations.length >= 4 ||
                    !destinations[destinations.length - 1] ||
                    destinations[destinations.length - 1].trim() === ""
                  }
                >
                  + Add Destination
                </Button>
              </Box>
            </div>

            {/* Booking now/later radio */}
            <div className="flex  justify-around ml-6 w-full  items-center">
              <RadioGroup
                row
                value={bookingMode}
                onChange={(e) => setBookingMode(e.target.value)}
                sx={{ "& .MuiFormControlLabel-root": { mr: 6 } }}
              >
                <FormControlLabel
                  value="now"
                  control={
                    <Radio
                      sx={{
                        color: "black",
                        "&.Mui-checked": { color: "green" },
                        p: 1,
                      }}
                    />
                  }
                  label="Book for now"
                />
                <FormControlLabel
                  value="later"
                  control={
                    <Radio
                      sx={{
                        color: "black",
                        "&.Mui-checked": { color: "green" },
                        p: 1,
                      }}
                    />
                  }
                  label="Book for later"
                />
              </RadioGroup>
            </div>

            {bookingMode === "later" && (
              <div className="px-3 py-2">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm mb-1 font-medium">Pickup date</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2"
                      value={dateVal}
                      onChange={(e) => setDateVal(e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm mb-1 font-medium">Pickup time</label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={timeInputRef}
                        type="time"
                        className="w-full border rounded px-3 py-2"
                        value={`${hourVal.padStart(2, "0")}:${minuteVal.padStart(2, "0")}`}
                        onFocus={(e) => {
                          setShowDone(true);
                          e.target.showPicker?.();
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowDone(false), 150);
                        }}
                        onChange={(e) => {
                          const [h, m] = e.target.value.split(":");
                          setHourVal(h);
                          setMinuteVal(m);
                        }}
                        required
                        step="60"
                        min={
                          dateVal === new Date().toISOString().split("T")[0]
                            ? new Date().toTimeString().slice(0, 5)
                            : "00:00"
                        }
                      />
                      {showDone && (
                        <button
                          type="button"
                          onClick={() => {
                            timeInputRef.current?.blur();
                            setShowDone(false);
                          }}
                          className="px-3 py-2 rounded bg-blue-500 text-white text-sm"
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fixed Price */}
            <div className="w-full bg-[#F8F6F2] px-4 py-5">
              <div className="flex items-center w-full justify-between">
                <div className="flex gap-3 items-center">
                  <LockIcon color={fixedColor} />
                  <span
                    style={{ color: fixedColor }}
                    className={`text-xl font-bold`}
                  >
                    Fixed Price
                  </span>
                </div>
                <ToggleSwitch enabled={isOn} onToggle={setIsOn} />
              </div>
              <p className="mt-2">Lock in a price with no additional charges.</p>
            </div>

            <div className="w-full ">
              <CarDropdown
                selectedOption={selected}
                onOptionSelect={setSelected}
                label={
                  fare
                    ? isOn
                      ? `$${fare}`
                      : `$${Math.round(fare - 5)} - $${Math.round(fare - -15)}`
                    : "Dest required"
                }
                allFares={allFares}
                changeVehicleText={setVehicleText}
                isLuggageModal={setIsLuggageModalOpen}
                isFixedPrice={isOn}
                onVehicleDetailOpenChange={onVehicleDetailOpenChange}
              />
            </div>

            {/* Step 2 Contact */}
            <div className="px-5 py-6">
              <h3 className="text-sm mt-4 mb-4">
                Step 2 of 4 <b>Contact details</b>
              </h3>

              <div className="mb-4">
                <TextField
                  label="Passenger Name"
                  variant="outlined"
                  fullWidth
                  required
                  placeholder="Passenger name"
                  value={passenger}
                  onChange={(e) => setPassenger(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": { borderColor: `${fixedColor}` },
                    },
                    "& label.Mui-focused": { color: "gray" },
                  }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 w-full">
                <div className="w-[20%] border rounded-sm h-14 flex items-center justify-center gap-1">
                  <img className="h-5" src="https://flagsapi.com/AU/flat/64.png" alt="AU" />
                  {SIDEBAR_CONSTANTS.CONTACT.AU_PHONE_PREFIX}
                </div>
                <div className="flex-grow">
                  <TextField
                    label="Contact Number"
                    variant="outlined"
                    fullWidth
                    required
                    type="tel"
                    inputProps={{ pattern: "[0-9]{9}", maxLength: 9 }}
                    value={contact}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setContact(value);
                      if (value.length === 9 && value.startsWith("4")) {
                        setContactError("");
                      } else {
                        setContactError("Number must be 9 digits and start with 4");
                      }
                    }}
                    error={!!contactError}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": { borderColor: `${fixedColor}` },
                      },
                      "& label.Mui-focused": { color: "gray" },
                    }}
                  />
                </div>
              </div>

              {contactError && (
                <p className="text-red-600 text-sm mt-1">{contactError}</p>
              )}
            </div>

            {/* Step 3 Payment */}
            <div className="px-5 py-6">
              <h3 className="text-sm mt-2 mb-4">
                Step 3 of 4 <b>Payment</b>
              </h3>
              <PaymentDropdown
                selectedOption={selectedPayment}
                onOptionSelect={handlePaymentSelect}
                title="Select payment method"
                className="mb-4"
              />
            </div>

            {/* Step 4 Driver Instruction */}
            <div className="px-5 py-6">
              <h3 className="text-sm mb-4">
                Step 4 of 4 <b>Driver Instruction</b>
              </h3>

              <div className="mb-4">
                <TextField
                  label="Notes for driver"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  inputProps={{ maxLength: 350 }}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="e.g. Unit, Gate and floor numbers"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": { borderColor: `${fixedColor}` },
                    },
                    "& label.Mui-focused": { color: "gray" },
                  }}
                />
              </div>
            </div>

            <div className="mt-3">
              <button
                type="submit"
                className="w-[80%] ml-[10%] px-2 py-3 border border-gray-500 rounded-md cursor-pointer mb-4"
              >
                Request Booking
              </button>
            </div>
          </form>
        </section>
      )}
      {vehicleText === "Next Available" && (
        <SeatDetails
          data={seatDetails["Next Available"]}
          changeVehicleText={setVehicleText}
          onSelect={setSelected}
          onVehicleDetailOpenChange={onVehicleDetailOpenChange}
          changeIsLuggageModal={setIsLuggageModalOpen}
        />
      )}
      {vehicleText === "Silver Service" && (
        <SeatDetails
          data={seatDetails["Silver Service"]}
          changeVehicleText={setVehicleText}
          onSelect={setSelected}
          onVehicleDetailOpenChange={onVehicleDetailOpenChange}
          changeIsLuggageModal={setIsLuggageModalOpen}
        />
      )}
      {vehicleText === "Suv" && (
        <SeatDetails
          data={seatDetails["Suv"]}
          changeVehicleText={setVehicleText}
          onSelect={setSelected}
          onVehicleDetailOpenChange={onVehicleDetailOpenChange}
          changeIsLuggageModal={setIsLuggageModalOpen}
        />
      )}
      {vehicleText === "Maxi Taxi" && (
        <SeatDetails
          data={seatDetails["Maxi Taxi"]}
          changeVehicleText={setVehicleText}
          onSelect={setSelected}
          onVehicleDetailOpenChange={onVehicleDetailOpenChange}
          changeIsLuggageModal={setIsLuggageModalOpen}
        />
      )}

      {isLuggageModalOpen && <LuggageModal />}

      <CabUnavailableModal
        open={isNoServiceOpen}
        onClose={() => setIsNoServiceOpen(false)}
      />
    </>
  );
};

export default SideBar;
