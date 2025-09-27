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
import { LockIcon } from "lucide-react";
import ToggleSwitch from "./ToggleSwich";
import CarDropdown from "./CarDropdown";
import { getGeocode } from "../../hooks/map.js";
import PaymentDropdown from "./PaymentDropdown.jsx";
import { seatDetails } from "../../data/data.jsx";
import SeatDetails from "./SeatDetails.jsx";
import LuggageModal from "./LuggageModal.jsx";
import { toast } from "react-hot-toast";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import images from "../../assets/images.js";

const SideBar = ({
  onPickupSelect,
  onDestinationSelect,
  onVehicleDetailOpenChange,
}) => {
  // ===== Places service (shared) =====
  const [placesReady, setPlacesReady] = useState(false);
  const serviceRef = useRef(null);
  const sessionTokenRef = useRef(null);

  const [calenderOpen, setCalenderOpen] = useState(false);

  const melbourneNow = SIDEBAR_CONSTANTS.getMelbourneNow();
  const roundedNow = new Date(melbourneNow);
  roundedNow.setSeconds(0, 0);

  // Melbourne "now"
  const melNow = () =>
    new Date(
      new Date().toLocaleString("en-US", { timeZone: "Australia/Melbourne" })
    );

  // max date = today + 15 days
  const maxBookingDate = () => {
    const d = melNow();
    d.setDate(d.getDate() + 15);
    return d;
  };

  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  // Check if date string is today
  const isToday = (yyyyMmDd) =>
    yyyyMmDd === melNow().toISOString().split("T")[0];

  // Return Melbourne now + 10 minutes
  const minLaterDate = () => {
    const n = melNow();
    n.setSeconds(0, 0);
    n.setMinutes(n.getMinutes() + 10);
    return n;
  };

  // Build minTime for TimePicker
  const buildMinTime = (yyyyMmDd) => {
    if (!isToday(yyyyMmDd)) return undefined;
    const min = minLaterDate();
    const base = new Date(`${yyyyMmDd}T00:00:00`);
    const sameDayMin = new Date(base);
    sameDayMin.setHours(min.getHours(), min.getMinutes(), 0, 0);

    // If it rolled into tomorrow (e.g. 23:55 + 10m = next day),
    // clamp to 23:59 so user must pick tomorrow
    if (sameDayMin.toDateString() !== base.toDateString()) {
      const endOfDay = new Date(base);
      endOfDay.setHours(23, 59, 0, 0);
      return endOfDay;
    }
    return sameDayMin;
  };

  // Clamp a chosen time to ≥ now+10m if it's today
  const clampToMinIfPast = (yyyyMmDd, h, m) => {
    if (!isToday(yyyyMmDd)) return [h, m];
    const sel = new Date(`${yyyyMmDd}T${h}:${m}:00`);
    const min = buildMinTime(yyyyMmDd);
    if (min && sel < min) {
      const hh = String(min.getHours()).padStart(2, "0");
      const mm = String(min.getMinutes()).padStart(2, "0");
      return [hh, mm];
    }
    return [h, m];
  };

  // AU bounds (rough): SW & NE corners (same as modal)
  const AU_BOUNDS = useRef({
    sw: { lat: -44.0, lng: 112.0 },
    ne: { lat: -10.0, lng: 154.0 },
  });

  const [pickerKey, setPickerKey] = useState(0);

  // debounce refs for pickup and per-destination
  const debouncePickupRef = useRef(null);
  const debounceDestRefs = useRef({}); // key: index -> timeout id

  // ===== form fields =====
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [allFares, setAllFares] = useState([]);

  // const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [passenger, setPassenger] = useState("");
  const [contact, setContact] = useState("");
  const [instruction, setInstruction] = useState("");
  const [isOn, setIsOn] = useState(true);
  const [selected, setSelected] = useState(defaultVehicleOptions[0]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [tollPrice, setTollPrice] = useState(0);
  const [isLuggageModalOpen, setIsLuggageModalOpen] = useState(false);
  const topRef = useRef(null);

  const [pickup, setPickup] = useState("");
  const pickupInputRef = useRef(null);
  const paymentDropdownRef = useRef(null);
  const [pickupLoc, setPickupLoc] = useState(null);
  const [destinationLoc, setDestinationLoc] = useState(null);

  const destinationRef = useRef();

  // route & toll
  const [distanceKm, setDistanceKm] = useState("");
  const [hasToll, setHasToll] = useState(false);
  const [error, setError] = useState("");
  // const [selectedPaymentMode, setSelectedPaymentMode] = useState(null)

  // booking time
  const [bookingMode, setBookingMode] = useState("now"); // "now" | "later"
  const [dateVal, setDateVal] = useState(
    melbourneNow.toISOString().split("T")[0] // yyyy-mm-dd
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

  const pickupAutoRef = useRef(null);
  const destinationAutoRef = useRef(null);


  // determine time type (helper stays the same)
  const determineTimeType = (dateObj) => {
    const day = dateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const hour24 = dateObj.getHours();
    const minute = dateObj.getMinutes();
    let timeType = 2; // default shoulder

    if (
      (day === 5 && hour24 >= 22) || // Friday 22:00–23:59
      (day === 6 && hour24 < 4) || // Saturday 00:00–03:59
      (day === 6 && hour24 >= 22) || // Saturday 22:00–23:59
      (day === 0 && hour24 < 4) // Sunday 00:00–03:59
    ) {
      timeType = 3; // Overnight Weekend
    } else if (hour24 >= 9 && hour24 < 17) {
      timeType = 1; // Normal
    }

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    // console.log(
    //   `Calculated time type: ${timeType} | Day: ${dayNames[day]
    //   } | Time: ${hour24.toString().padStart(2, "0")}:${minute
    //     .toString()
    //     .padStart(2, "0")}`
    // );

    return timeType;
  };

  // set initial and later booking time type

  const calculateFare = () => {
    // console.log("=== Fare Calculation Started ===");

    if (!distanceKm) {
      // console.log("❌ No distance available — aborting fare calculation.");
      setAllFares([]); // clear when no distance
      return null;
    }

    const distance = parseInt(distanceKm);
    const tollCost = hasToll ? parseFloat(tollPrice) : 0;
    const bookingFees = SIDEBAR_CONSTANTS.FEES.BOOKING_FEE;

    // helper to compute per-vehicle fare
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
        base =
          SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.OVERNIGHT_WEEKEND].baseFlat +
          distance *
          SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.OVERNIGHT_WEEKEND].perKm +
          tollCost +
          SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.OVERNIGHT_WEEKEND].flagFall;
      } else if (timeType === 2) {
        base =
          SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.SHOULDER].baseFlat +
          distance * SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.SHOULDER].perKm +
          tollCost +
          SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.SHOULDER].flagFall;
      } else {
        base =
          SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.NORMAL].baseFlat +
          distance * SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.NORMAL].perKm +
          tollCost +
          SIDEBAR_CONSTANTS.FARE_RATES[TIME_TYPE.NORMAL].flagFall;
      }

      let fareValue = Math.max(base, SIDEBAR_CONSTANTS.FEES.MIN_FARE);
      fareValue += vehicleSurcharge + bookingFees;

      if (isAirportPickup(pickup)) {
        fareValue += SIDEBAR_CONSTANTS.FEES.AIRPORT_SURCHARGE;
      }

      // return number (not string) so it's easier to format later if needed
      return Number(fareValue.toFixed(2));
    };

    // NOTE: use ids that match your options' ids (lowercase dashed form).
    // If your options use different ids, update these strings to match.
    const faresArray = [
      {
        id: "next-available",
        name: "Next Available",
        price: computeLocal("Sedan"),
      },
      {
        id: "silver-service",
        name: "Silver Service",
        price: computeLocal("Silver Service"),
      },
      { id: "suv", name: "SUV", price: computeLocal("SUV") },
      { id: "maxi-taxi", name: "Maxi Taxi", price: computeLocal("Maxi Taxi") },
    ];

    setAllFares(faresArray);
    // console.log("All fares:", faresArray);

    // also keep the current selected fare for UI
    const vehicleName = selected?.name || "Sedan";
    const selectedFare = computeLocal(vehicleName);
    setFare(selectedFare);
  };


  const handleDeleteDestination = () => {
    setDestination("");
    setDestinationLoc(null);
    setDestinationSuggestions([]);

    onDestinationSelect(null);

    updateRoute(pickupLoc, null);
  };

  const handleDestinationSelect = async (s) => {
    setDestination(s.description);
    setDestinationSuggestions([]);

    try {
      const location = await getGeocode(s);
      if (location) {
        setDestinationLoc(location);
        onDestinationSelect(location);
        updateRoute(pickupLoc, location)
        calculateFare()
      }
    } catch (err) {
      console.error("Failed to select destination", err);
    }
  };

  const handleDeletePickup = () => {
    setPickup("");
    setPickupLoc(null);
    setPickupSuggestions([]);

    setDestination("");
    setDestinationLoc([]);
    setDestinationSuggestions([]);

    // Notify parent that pickup is now empty
    onDestinationSelect(null);
    onPickupSelect(null);

    // Also reset route if neede
    // d
    updateRoute(null, []);
  };

  const handlePickupSelect = async (s) => {
    setPickup(s.description);
    setPickupSuggestions([]);

    try {
      const location = await getGeocode(s);
      if (location) {
        setPickupLoc(location);
        onPickupSelect(location);
      }
    } catch (err) {
      console.error("Failed to select pickup", err);
    }
  };

  // Handle when user selects a payment method
  const handlePaymentSelect = (paymentMethod) => {
    setSelectedPayment(paymentMethod);
    // console.log("Selected payment:", paymentMethod);
  };

  const updateRoute = (pickup, dest) => {
    // console.log("Calling calculate");
    // console.log("destination", dest);
    // console.log("pickup", pickup);
    if (!pickup || !dest) {
      setDistanceKm("");
      setHasToll(false);
      setFare(null);
      setAllFares([])
      return;
    }
    setHasToll(false);
    setFare(null);

    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin: pickup,
        destination: dest,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        // console.log("result", result)
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

          // --- DEBUG: log each instruction separately ---
          // console.log("Route Instructions:");
          leg.steps.forEach((step, idx) => {
            // console.log(`${idx + 1}. ${step.instructions}`);
          });

          const stepsText = leg.steps
            .map((s) => s.instructions.toLowerCase())
            .join(" ");

          // Determine toll road usage
          // ---- Toll calculation ---- //
          const toll = calculateToll(stepsText);

          setHasToll(toll > 0);
          setTollPrice(toll);
          // console.log("Toll Cost:", toll); // If you already include tolls in fare calculation
        } else {
          // console.error("Directions request failed:", status);
          setDistanceKm("");
          setHasToll(false);
          setFare(null);
        }
      }
    );
  };

  // ---- Helpers ---- //
  const calculateToll = (stepsText) => {
    let toll = 0;

    // Strip HTML tags and lowercase
    let plainText = stepsText.replace(/<[^>]*>?/gm, "").toLowerCase();

    // Normalize each known road alias inside the text
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

        // Track farthest exit match
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

  const isAirportPickup = (pickup) => {
    let pickupAddress = "";

    if (typeof pickup === "string") {
      pickupAddress = pickup;
    } else if (pickup?.description) {
      pickupAddress = pickup.description;
    } else if (pickup?.name) {
      pickupAddress = pickup.name;
    } else {
      console.warn("Pickup is not a string or place object:", pickup);
    }

    const lower = pickupAddress.toLowerCase();
    return (
      lower.includes("airport") ||
      lower.includes("intl") ||
      lower.includes("international") ||
      lower.includes("domestic terminal") ||
      lower.includes("terminal")
    );
  };

  const scrollToRef = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({
        behavior: "smooth", // smooth scroll
        block: "start", // align at top (use "center" or "end" if needed)
      });
    }
  };

  const scrollToTopOrNavbar = () => {
    const isLarge = window.matchMedia("(min-width: 768px)").matches; // Tailwind lg
    if (isLarge) {
      scrollToRef(topRef);
    } else {
      document.getElementById("navbar")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingTime = `${hourVal}:${minuteVal}`;
    const bookingDate = `${dateVal}`;
    const selectedCarData = {
      selectedCar: `${selected.name}`,
      passengers: `${selected.passengers}`,
    };
    if (!selectedPayment) {
      scrollToRef(paymentDropdownRef);
      setError("Please select a payment method *");
      return;
    } else {
      setError("");
      scrollToTopOrNavbar();
      // window.location.reload();
      // scrollToRef(topRef);
    }

    const formData = {
      pickup,
      destination,
      passenger,
      contact,
      bookingDate,
      bookingTime,
      selectedCarData,
      selectedPaymentMode: `${selectedPayment.name}`,
      distanceKm,
      instruction,
      fare,
    };

    toast.success("🎉 Booking Requested Successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
    console.log("Booking Data:", formData);

    // Reset all fields
    // Reset all fields
    setPickup("");
    setPickupLoc(null);
    setPickupSuggestions([]);
    setDestination("");
    setDestinationLoc(null);
    setPassenger("");
    setContact("");
    setInstruction("");
    setIsOn(true);
    setSelected(defaultVehicleOptions[0]);
    setSelectedPayment(null);

    // fresh Melbourne "now" at submit time
    const now = melNow();
    const todayStr = now.toISOString().split("T")[0];
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");

    // optionally hide the pickers again
    setBookingMode("now"); // pickers are inside bookingMode === "later"

    // reset picker-controlled values
    setDateVal(todayStr);
    setHourVal(hh);
    setMinuteVal(mm);

    // recalc picker minTime on next render & clear any internal input cache
    setPickerKey((k) => k + 1);

    setTimeType(2);
    setFare(null);
    setHasToll(false);
    setDistanceKm("");
    setContactError("");
    onPickupSelect(null);
    onDestinationSelect(null);
    setAllFares([]);
  };

  // console.log("pickup ", pickupLoc);

  // Validate if a place is in Victoria (AU)
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

          // Must be Victoria, Australia
          if (
            stateComp?.short_name === "VIC" &&
            countryComp?.short_name === "AU"
          ) {
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
    // Utility: move all pac containers into the provided wrapper element
    const movePacInto = (wrapperEl) => {
      if (!wrapperEl) return;
      const pacs = document.querySelectorAll(".pac-container");
      pacs.forEach((pac) => {
        if (!wrapperEl.contains(pac)) {
          try {
            wrapperEl.appendChild(pac);
            // also enforce style
            pac.style.position = "absolute";
            pac.style.top = "100%";
            pac.style.left = "0";
            pac.style.width = "100%";
            pac.style.zIndex = "2000";
          } catch (e) {
            console.warn("Failed to move pac-container:", e);
          }
        }
      });
    };

    // When an input is focused, move visible pac to its wrapper
    const onFocusHandler = (ev) => {
      const input = ev.target;
      if (!input) return;
      const wrapper = input.parentNode || input.closest(".relative");
      if (wrapper) movePacInto(wrapper);
    };

    // attach focus listeners
    if (pickupInputRef?.current) {
      pickupInputRef.current.addEventListener("focus", onFocusHandler);
    }
    if (destinationRef?.current) {
      destinationRef.current.addEventListener("focus", onFocusHandler);
    }

    // Move pacs immediately in case they already exist
    movePacInto(pickupInputRef?.current?.parentNode || pickupInputRef?.current?.closest?.(".relative"));
    movePacInto(destinationRef?.current?.parentNode || destinationRef?.current?.closest?.(".relative"));

    // Observe DOM additions (Google adds pac-container to body)
    const observer = new MutationObserver(() => {
      const active = document.activeElement;
      if (active && (active === pickupInputRef.current || active === destinationRef.current)) {
        const wrapper = active.parentNode || active.closest(".relative");
        movePacInto(wrapper);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (pickupInputRef?.current) {
        pickupInputRef.current.removeEventListener("focus", onFocusHandler);
      }
      if (destinationRef?.current) {
        destinationRef.current.removeEventListener("focus", onFocusHandler);
      }
    };
  }, []);

  useEffect(() => {
    let interval = setInterval(() => {
      if (window.google?.maps?.places && pickupInputRef.current && destinationRef.current) {
        clearInterval(interval);

        const options = SIDEBAR_CONSTANTS.AUTOCOMPLETE_OPTIONS;

        // Create ONCE
        pickupAutoRef.current = new window.google.maps.places.Autocomplete(
          pickupInputRef.current,
          options
        );
        destinationAutoRef.current = new window.google.maps.places.Autocomplete(
          destinationRef.current,
          options
        );

        // PICKUP listener
        pickupAutoRef.current.addListener("place_changed", async () => {
          const place = pickupAutoRef.current.getPlace();
          if (!place?.geometry) return;

          const formatted = place.formatted_address || place.name || "";
          setPickup(formatted);

          const loc = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          const insideVIC = await isInVictoria(loc);
          if (!insideVIC) {
            setIsNoServiceOpen(true);
            setPickup("");
            return;
          }

          setPickupLoc(loc);
          onPickupSelect(loc);
          updateRoute(loc, destinationLoc);
        });

        // DESTINATION listener
        destinationAutoRef.current.addListener("place_changed", async () => {
          const place = destinationAutoRef.current.getPlace();
          if (!place?.geometry) return;

          const formatted = place.formatted_address || place.name || "";
          setDestination(formatted);

          const loc = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          const insideVIC = await isInVictoria(loc);
          if (!insideVIC) {
            setIsNoServiceOpen(true);
            setDestination("");
            return;
          }

          setDestinationLoc(loc);
          onDestinationSelect(loc);
          updateRoute(pickupLoc, loc);
        });
      }
    }, 200);

    return () => {
      clearInterval(interval);
      if (pickupAutoRef.current) {
        window.google.maps.event.clearInstanceListeners(pickupAutoRef.current);
        pickupAutoRef.current = null;
      }
      if (destinationAutoRef.current) {
        window.google.maps.event.clearInstanceListeners(destinationAutoRef.current);
        destinationAutoRef.current = null;
      }
      // Safety: remove extra pacs on unmount
      const pacs = document.querySelectorAll(".pac-container");
      pacs.forEach((el, idx) => idx > 0 && el.remove());
    };
  }, []); // <- IMPORTANT: run once

  useEffect(() => {
    updateRoute(pickupLoc, destinationLoc);
  }, [pickupLoc, destinationLoc]);

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

  useEffect(() => {
    updateRoute(pickupLoc, destinationLoc);
  }, [pickup, destinationLoc]);

  return (
    <>
      {!vehicleText && (
        <section className=" w-full scroll-container" ref={topRef}>
          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Step 1 */}
            <div className="px-5 py-6">
              <h3 className="text-sm mb-4">
                Step 1 of 4 - <b> Booking details</b>
              </h3>

              {/* <h2 className="md:hidden text-2xl text-bold mb-2">
                Fare Estimates Calculator
              </h2>
              <h3 className="md:hidden mb-4 text-sm">
                Please enter a valid pickup and destination{" "}
              </h3> */}

              <div className="mb-4 relative ">
                <TextField
                  
                  inputRef={pickupInputRef} // attach ref here
                  label="Add pickup (required)"
                  variant="outlined"
                  fullWidth
                  required
                  placeholder="Add your pickup location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)} // just update local state
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {pickup ? (
                          <IconButton size="small">
                            <span
                              onClick={handleDeletePickup}
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

                {pickupSuggestions.length > 0 && (
                  <ul className="absolute z-50 bg-white border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto w-full">
                    {pickupSuggestions.map((s) => (
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
              {/* show modal — pass open and onClose */}
              <CabUnavailableModal
                open={isNoServiceOpen}
                onClose={() => setIsNoServiceOpen(false)}
              />

              <div className="mb-0 relative">
                <TextField
                  inputRef={destinationRef}
                  label="Add Destination (required)"
                  variant="outlined"
                  fullWidth
                  required
                  placeholder="Add your Destination location"
                  value={destination}
                  disabled={pickupLoc ? false : true}
                  onChange={(e) => setDestination(e.target.value)} // just update local state
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {destination ? (
                          <IconButton size="small">
                            <span
                              onClick={handleDeleteDestination}
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

                {destinationSuggestions.length > 0 && (
                  <ul className="absolute z-50 bg-white border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto w-full">
                    {destinationSuggestions.map((s) => (
                      <li
                        key={s.place_id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleDestinationSelect(s)}
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
            </div>

            {/* Booking now/later radio - controlled */}
            <div className=" mb-4 flex  justify-around ml-6 w-full  items-center ">
              <RadioGroup
                row
                value={bookingMode}
                onChange={(e) => setBookingMode(e.target.value)}
                sx={{ "& .MuiFormControlLabel-root": { mr: 6 } }} // spacing between radios
              >
                <FormControlLabel
                  value="now"
                  control={
                    <Radio
                      sx={{
                        color: "black",
                        "&.Mui-checked": { color: "#f4b20bff" },
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
                        "&.Mui-checked": { color: "#f4b20bff" },
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
                <div className="flex flex-col md:flex-col gap-4">
                  <div className="flex-1">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        key={`date-${pickerKey}`}
                        label="Pickup date"
                        open={dateOpen}
                        onOpen={() => setDateOpen(true)}
                        onClose={() => setDateOpen(false)}
                        value={dateVal ? new Date(dateVal) : null}
                        onChange={(newVal) => {
                          if (!newVal) return;
                          const y = newVal.getFullYear();
                          const m = String(newVal.getMonth() + 1).padStart(2, "0");
                          const d = String(newVal.getDate()).padStart(2, "0");
                          const next = `${y}-${m}-${d}`;
                          setDateVal(next);

                          if (isToday(next)) {
                            const [h, mi] = clampToMinIfPast(next, hourVal, minuteVal);
                            setHourVal(h);
                            setMinuteVal(mi);
                          }
                        }}
                        desktopModeMediaQuery="@media (max-width: 0px)"
                        maxDate={maxBookingDate()}
                        disablePast
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: false,
                            required: false,
                            onClick: () => setDateOpen(true),               // open on click anywhere
                            onKeyDown: (e) => {
                              // allow Tab for accessibility, Block other keys from editing
                              if (e.key !== "Tab") e.preventDefault();
                              // open on Enter/Space if focused
                              if (e.key === "Enter" || e.key === " ") setDateOpen(true);
                            },
                            onPaste: (e) => e.preventDefault(),
                            onFocus: (e) => e.target.blur(),
                            inputProps: {
                              readOnly: true,                               // block manual typing
                              inputMode: "none",                            // suppress mobile keyboards
                              tabIndex: 0,
                            },
                            sx: {
                              cursor: "pointer",
                              "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: fixedColor },
                              "& label.Mui-focused": { color: "gray" },
                            },
                          },
                          openPickerButton: {
                            onClick: () => setDateOpen(true),
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>

                  <div className="flex-1">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        key={`time-${pickerKey}`}
                        label="Pickup time"
                        open={timeOpen}
                        onOpen={() => setTimeOpen(true)}
                        onClose={() => setTimeOpen(false)}
                        desktopModeMediaQuery="@media (max-width: 0px)"

                        value={
                          hourVal && minuteVal
                            ? new Date(`${dateVal}T${hourVal.padStart(2, "0")}:${minuteVal.padStart(2, "0")}:00`)
                            : null
                        }
                        onChange={(newVal) => {
                          if (!newVal) return;
                          let h = String(newVal.getHours()).padStart(2, "0");
                          let m = String(newVal.getMinutes()).padStart(2, "0");
                          [h, m] = clampToMinIfPast(dateVal, h, m);
                          setHourVal(h);
                          setMinuteVal(m);
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            onClick: () => setTimeOpen(true),
                            onFocus: (e) => e.target.blur(),   // ← stops Android keyboard
                            onKeyDown: (e) => {
                              if (e.key !== "Tab") e.preventDefault();
                              if (e.key === "Enter" || e.key === " ") setTimeOpen(true);
                            },
                            onPaste: (e) => e.preventDefault(),
                            inputProps: {
                              readOnly: true,
                              inputMode: "none",
                              tabIndex: 0,
                            },
                            sx: {
                              cursor: "pointer",
                              "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: fixedColor },
                              "& label.Mui-focused": { color: "gray" },
                            },
                          },
                          openPickerButton: {
                            onClick: () => setTimeOpen(true),
                          },
                          actionBar: { actions: ["accept", "cancel"] },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              </div>
            )}


            {/* // ...existing code... */}

            {/* Fixed Price block */}
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

              <p className="mt-2">
                Lock in a price with no additional charges.
              </p>
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

            {/* Step 2 */}
            <div className="px-5 py-6">
              <h3 className="text-sm mt-4 mb-4">
                Step 2 of 4 - <b>Contact details</b>
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
                      "&.Mui-focused fieldset": {
                        borderColor: `${fixedColor}`, // outline color on focus
                      },
                    },
                    "& label.Mui-focused": {
                      color: "gray", // label color on focus
                    },
                  }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 w-full">
                <div className={`w-[20%] border border-gray-300  rounded-sm h-14 flex items-center justify-center gap-1`} >
                  <img
                    className="h-5"
                    src={images.aus}
                    alt="AU"
                  />
                  {SIDEBAR_CONSTANTS.CONTACT.AU_PHONE_PREFIX}
                </div>
                <div className="flex-grow">
                  <TextField
                    label="Contact Number"
                    variant="outlined"
                    fullWidth
                    required
                    type="tel"
                    inputProps={{
                      pattern: "[0-9]{9}",
                      maxLength: 9,
                    }}
                    value={contact}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setContact(value);
                      if (value.length === 9 && value.startsWith("4")) {
                        setContactError("");
                      } else {
                        setContactError(
                          "Number must be 9 digits and start with 4"
                        );
                      }
                    }}
                    error={!!contactError}
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
                </div>
              </div>

              {/* Shared error message below both fields */}
              {contactError && (
                <p className="text-red-600 text-sm mt-1">{contactError}</p>
              )}
            </div>

            {/* Step 3 Payment */}
            <div className="px-5 py-3">
              <h3 className="text-sm mt-2 mb-4">
                Step 3 of 4 - <b>Payment</b>
              </h3>

              <PaymentDropdown
                selectedOption={selectedPayment}
                onOptionSelect={handlePaymentSelect}
                ref={paymentDropdownRef}
                title="Select payment method"
                className="mb-0"
                required
              />
            </div>

            {!selectedPayment && <p className="text-red-500 text-sm ml-5 mb-3">{error}</p>}

            {/* Step 4 Driver Instruction */}
            <div className="px-5 py-6">
              <h3 className="text-sm mb-4">
                Step 4 of 4 - <b> Driver Instruction</b>
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
                      "&.Mui-focused fieldset": {
                        borderColor: `${fixedColor}`,
                      },
                    },
                    "& label.Mui-focused": { color: "gray" },
                  }}
                />
              </div>

              {/* Request Booking Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-md bg-orange-500 text-white font-semibold transition-colors hover:bg-orange-50 hover:text-orange-600 border border-orange-500 cursor-pointer"
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
      {/* show modal — pass open and onClose */}
      <CabUnavailableModal
        open={isNoServiceOpen}
        onClose={() => setIsNoServiceOpen(false)}
      />
    </>
  );
};

export default SideBar;
