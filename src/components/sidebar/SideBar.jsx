import { useEffect, useRef, useState } from "react";
import { tolls, normalizeRoad, roadAliases } from "../../data/tollsData.js";
import CabUnavailableModal from "./NoServiceModal.jsx";
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
import { toast } from "react-toastify";

const melbourneNow = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Australia/Melbourne" })
);

const SideBar = ({
  onPickupSelect,
  onDestinationsSelect,
  onVehicleDetailOpenChange,
}) => {
  // form fields
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [allFares, setAllFares] = useState([]);

  // const [pickup, setPickup] = useState("");
  const [destinations, setDestinations] = useState([""]);
  const [passenger, setPassenger] = useState("");
  const [contact, setContact] = useState("");
  const [instruction, setInstruction] = useState("");
  const [isOn, setIsOn] = useState(true);
  const [selected, setSelected] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [tollPrice, setTollPrice] = useState(0);
  const [isLuggageModalOpen, setIsLuggageModalOpen] = useState(false);

  const [pickup, setPickup] = useState("");
  const pickupInputRef = useRef(null);

  const [pickupLoc, setPickupLoc] = useState(null);
  const [destinationLocs, setDestinationLocs] = useState([]);

  const destinationRefs = useRef([]);

  // route & toll
  const [distanceKm, setDistanceKm] = useState("");
  const [hasToll, setHasToll] = useState(false);

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

  const fixedColor = "#f97316"; // orange-500

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
    console.log(
      `Calculated time type: ${timeType} | Day: ${
        dayNames[day]
      } | Time: ${hour24.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`
    );

    return timeType;
  };

  // set initial and later booking time type

  const calculateFare = () => {
    console.log("=== Fare Calculation Started ===");

    if (!distanceKm) {
      console.log("❌ No distance available — aborting fare calculation.");
      setAllFares([]); // clear when no distance
      return null;
    }

    const distance = parseInt(distanceKm);
    const tollCost = hasToll ? parseFloat(tollPrice) : 0;
    const bookingFees = 4;

    // helper to compute per-vehicle fare
    const computeLocal = (vehicleName) => {
      let vehicleSurcharge = 0;
      switch (vehicleName) {
        case "Sedan":
          vehicleSurcharge = 0;
          break;
        case "Silver Service":
          vehicleSurcharge = 11;
          break;
        case "SUV":
        case "Maxi Taxi":
          vehicleSurcharge = 17.8;
          break;
      }

      let base;
      if (timeType === 3) {
        base = 20 + distance * 2.493 + tollCost + 7.8;
      } else if (timeType === 2) {
        base = 13 + distance * 2.265 + tollCost + 6.55;
      } else {
        base = 8 + distance * 2.037 + tollCost + 5.25;
      }

      let fareValue = Math.max(base, 40);
      fareValue += vehicleSurcharge + bookingFees;

      if (isAirportPickup(pickup)) {
        fareValue += 4.68;
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
    console.log("All fares:", faresArray);

    // also keep the current selected fare for UI
    const vehicleName = selected?.name || "Sedan";
    const selectedFare = computeLocal(vehicleName);
    setFare(selectedFare);
  };

  // const calculateFare = () => {
  //   console.log("=== Fare Calculation Started ===");

  //   if (!distanceKm) {
  //     console.log("❌ No distance available — aborting fare calculation.");
  //     return null;
  //   }

  //   const distance = parseInt(distanceKm);
  //   console.log("📏 Distance (km):", distance);

  //   const tollCost = hasToll ? parseFloat(tollPrice) : 0;
  //   console.log("💰 Toll cost included:", tollCost);

  //   const bookingFees = 4;
  //   console.log("🧾 Booking fee:", bookingFees);

  //   const { name: vehicleName = "Sedan" } = selected ?? {};
  //   console.log("🚖 Selected vehicle:", vehicleName);

  //   // Vehicle surcharge
  //   let vehicleSurcharge = 0;
  //   switch (vehicleName) {
  //     case "Sedan":
  //       vehicleSurcharge = 0;
  //       break;
  //     case "Silver Service":
  //       vehicleSurcharge = 11;
  //       break;
  //     case "SUV":
  //       vehicleSurcharge = 17.80
  //       break;
  //     case "MAXI TAXI":
  //       vehicleSurcharge = 17.80;
  //       break;
  //   }
  //   console.log("🚘 Vehicle surcharge:", vehicleSurcharge);

  //   // Base fare calculation based on time type
  //   let base;
  //   if (timeType === 3) {
  //     base = 20 + distance * 2.493 + tollCost + 7.8;
  //     console.log(
  //       "⏰ Time type: Peak (3) → Base fare formula: 20 + distance*2.493 + toll + 7.8"
  //     );
  //   } else if (timeType === 2) {
  //     base = 13 + distance * 2.265 + tollCost + 6.55;
  //     console.log(
  //       "⏰ Time type: Shoulder (2) → Base fare formula: 13 + distance*2.265 + toll + 6.55"
  //     );
  //   } else {
  //     base = 8 + distance * 2.037 + tollCost + 5.25;
  //     console.log(
  //       "⏰ Time type: Off-Peak (else) → Base fare formula: 8 + distance*2.037 + toll + 5.25"
  //     );
  //   }
  //   console.log("📊 Base fare before minimum check:", base);

  //   // Apply minimum fare
  //   let fareValue = Math.max(base, 40);
  //   console.log("🔎 Applied minimum fare (40 if needed):", fareValue);

  //   // Add surcharges
  //   fareValue += vehicleSurcharge + bookingFees;
  //   console.log(`➕ After surcharges (vehicle + booking): ${fareValue}`);

  //   // Airport surcharge
  //   if (isAirportPickup(pickup)) {
  //     fareValue += 4.68;
  //     console.log("🛫 Airport pickup detected — added airport surcharge: 4.68");
  //   }

  //   console.log("✅ Final fare calculated:", fareValue.toFixed(2));
  //   setFare(fareValue.toFixed(2));
  // };

  const handleDeleteDestination = (index) => {
    // If this is the last remaining field, just clear it
    if (destinations.length === 1) {
      const newDestinations = [""];
      setDestinations(newDestinations);
      setAllFares([]);
      const newLocs = []; // remove any location
      setDestinationLocs(newLocs);

      // Notify parent about updated destinations
      onDestinationsSelect(newLocs);

      // Update route with empty destinations
      updateRoute(pickupLoc, newLocs);
      return;
    }

    // Otherwise, remove the field normally
    const newDestinations = [...destinations];
    newDestinations.splice(index, 1);
    setDestinations(newDestinations);

    const newLocs = [...destinationLocs];
    newLocs.splice(index, 1);
    setDestinationLocs(newLocs);

    // Notify parent about updated destinations
    onDestinationsSelect(newLocs);

    updateRoute(pickupLoc, newLocs);
  };

  const handleDeletePickup = () => {
    setPickup(""); // Clear pickup input
    setPickupLoc(null); // Clear location object
    setPickupSuggestions([]); // Clear any autocomplete suggestions

    setDestinations([""]);
    setDestinationLocs([]);

    // Notify parent that pickup is now empty
    onDestinationsSelect([]);
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
    console.log("Selected payment:", paymentMethod);
  };

  const handleAdd = () => {
    if (
      destinations.length < 4 &&
      typeof destinations[destinations.length - 1] === "string" &&
      destinations[destinations.length - 1].trim() !== ""
    ) {
      setDestinations([...destinations, ""]);
    }
  };

  const updateRoute = (pickup, dests) => {
    console.log("Calling calculate");
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

          // --- DEBUG: log each instruction separately ---
          console.log("Route Instructions:");
          leg.steps.forEach((step, idx) => {
            console.log(`${idx + 1}. ${step.instructions}`);
          });

          const stepsText = leg.steps
            .map((s) => s.instructions.toLowerCase())
            .join(" ");

          // Determine toll road usage
          // ---- Toll calculation ---- //
          const toll = calculateToll(stepsText);

          setHasToll(toll > 0);
          setTollPrice(toll);
          console.log("Toll Cost:", toll);
          calculateFare(); // If you already include tolls in fare calculation
        } else {
          console.error("Directions request failed:", status);
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
        console.log(
          `Alias matched: replacing "${alias}" → "${roadAliases[alias]}"`
        );
        plainText = plainText.replaceAll(alias, roadAliases[alias]);
      }
    });

    console.log("=== Toll Calculation ===");
    console.log("Normalized steps text:", plainText);

    tolls.forEach((entry) => {
      const normalizedEntry = normalizeRoad(entry.entryPoint);
      const entryIndex = plainText.indexOf(normalizedEntry);

      if (entryIndex !== -1) {
        console.log(
          `✅ Entry point found: ${normalizedEntry} (index ${entryIndex})`
        );

        // Track farthest exit match
        let farthestExit = null;
        let farthestExitIndex = -1;

        entry.exits.forEach((exit) => {
          const normalizedExit = normalizeRoad(exit.exitPoint);
          const exitIndex = plainText.indexOf(normalizedExit);

          if (exitIndex !== -1 && exitIndex > entryIndex) {
            console.log(
              `   ↳ Exit matched: ${normalizedExit} (index ${exitIndex}), price: ${exit.price}`
            );
            if (exitIndex > farthestExitIndex) {
              farthestExitIndex = exitIndex;
              farthestExit = exit;
            }
          }
        });

        if (farthestExit) {
          console.log(
            `   ✅ Farthest exit: ${farthestExit.exitPoint}, price: ${farthestExit.price}`
          );
          toll = Math.max(toll, farthestExit.price);
        } else {
          console.log(
            `   ⚠ No exits matched after entry point: ${normalizedEntry}`
          );
        }
      } else {
        console.log(`❌ Entry point NOT found: ${entry.entryPoint}`);
      }
    });

    console.log("💰 Final calculated toll:", toll);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Gather all form data
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
    setPassenger("");
    setContact("");
    setInstruction("");
    setIsOn(true);
    setSelected(null);
    setSelectedPayment(null);
    setBookingMode("now");
    setDateVal("");
    setHourVal("9");
    setMinuteVal("00");
    setTimeType(2);
    setFare(null);
    setHasToll(false);
    setDistanceKm("");
    setContactError("");
    onPickupSelect(setPickupLoc);
    onDestinationsSelect(setDestinationLocs);
  };

  console.log("luggage modal ",isLuggageModalOpen)

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
            // also enforce style (CSS above will help too)
            pac.style.position = "absolute";
            pac.style.top = "100%";
            pac.style.left = "0";
            pac.style.width = "100%";
            pac.style.zIndex = "2000";
          } catch (e) {
            // ignore if DOM move fails for any reason
          }
        }
      });
    };

    // When an input is focused, move visible pac to its wrapper
    const onFocusHandler = (ev) => {
      const input = ev.target;
      if (!input) return;
      // prefer the immediate parent wrapper; adjust if you use another wrapper structure
      const wrapper = input.parentNode || input.closest(".relative");
      if (wrapper) movePacInto(wrapper);
    };

    // attach focus listeners to current inputs
    const attachFocusListeners = () => {
      if (pickupInputRef?.current) {
        pickupInputRef.current.addEventListener("focus", onFocusHandler);
      }
      // destinationRefs is dynamic; attach listeners to any existing refs
      destinationRefs.current.forEach((el) => {
        if (el) el.addEventListener("focus", onFocusHandler);
      });
    };

    // detach helper
    const detachFocusListeners = () => {
      if (pickupInputRef?.current) {
        pickupInputRef.current.removeEventListener("focus", onFocusHandler);
      }
      destinationRefs.current.forEach((el) => {
        if (el) el.removeEventListener("focus", onFocusHandler);
      });
    };

    // Move pacs immediately in case they already exist
    movePacInto(
      pickupInputRef?.current?.parentNode ||
        pickupInputRef?.current?.closest?.(".relative")
    );

    // Attach focus listeners
    attachFocusListeners();

    // Observe DOM additions (Google adds pac-container to body). When added, move it into the currently focused input wrapper.
    const observer = new MutationObserver((mutations) => {
      // if an input is focused, move pac(s) into its wrapper
      const active = document.activeElement;
      if (
        active &&
        (active === pickupInputRef.current ||
          destinationRefs.current.includes(active))
      ) {
        const wrapper = active.parentNode || active.closest(".relative");
        movePacInto(wrapper);
      } else {
        // fallback: ensure pickup wrapper contains pacs
        movePacInto(
          pickupInputRef?.current?.parentNode ||
            pickupInputRef?.current?.closest?.(".relative")
        );
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      detachFocusListeners();
    };
    // Re-run when destinationRefs array or pickup ref changes
  }, [
    /* re-run when your destination inputs change length */ destinations.length,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        clearInterval(interval);

        // Attach destination autocomplete
        destinationRefs.current.forEach((input, idx) => {
          if (input) {
            const options = {
              componentRestrictions: { country: "au" },
              fields: ["formatted_address", "geometry"],
            };
            const auto = new window.google.maps.places.Autocomplete(
              input,
              options
            );

            auto.addListener("place_changed", async () => {
              const place = auto.getPlace();
              if (!place || !place.geometry) return;

              const newDestinations = [...destinations];
              newDestinations[idx] = place.formatted_address;
              setDestinations(newDestinations);

              const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
              const newLocs = [...destinationLocs];
              newLocs[idx] = location;
              // setDestinationLocs(newLocs);
              // onDestinationsSelect(newLocs);
              try {
                // Validate destination is inside Victoria
                const insideVIC = await isInVictoria(location);
                if (!insideVIC) {
                  setIsNoServiceOpen(true);
                  // alert(`Destination ${idx + 1} must be within Victoria, Australia.`);
                  // revert the visible label (optional)
                  const reverted = [...destinations];
                  reverted[idx] = "";
                  setDestinations(reverted);
                  return; // STOP further processing for this destination
                }

                // valid: save location and notify parent
                const newLocs = [...destinationLocs];
                newLocs[idx] = location;
                setDestinationLocs(newLocs);
                onDestinationsSelect(newLocs);

                // Update route now that we have a valid destination
                updateRoute(pickupLoc, newLocs);
              } catch (err) {
                console.error("Failed to validate destination:", err);
                // revert label on error
                const reverted = [...destinations];
                reverted[idx] = "";
                setDestinations(reverted);
              }
              updateRoute(pickupLoc, newLocs);
            });
          }
        });

        // Attach pickup autocomplete
        if (pickupInputRef.current) {
          const options = {
            componentRestrictions: { country: "au" },
            fields: ["formatted_address", "geometry"],
          };
          const autoPickup = new window.google.maps.places.Autocomplete(
            pickupInputRef.current,
            options
          );

          autoPickup.addListener("place_changed", async () => {
            const place = autoPickup.getPlace();
            if (!place || !place.geometry) return;

            setPickup(place.formatted_address);

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
              setPickupLoc(location);
              onPickupSelect(location);

              // Update route now that pickup is valid
              updateRoute(location, destinationLocs);
            } catch (err) {
              console.error("Failed to validate pickup location:", err);
              // optionally revert UI
              setPickup("");
            }
            // ✅ Make behavior consistent: trigger route update
            updateRoute(location, destinationLocs);
          });
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [
    destinations,
    pickupLoc,
    destinationLocs,
    onDestinationsSelect,
    onPickupSelect,
  ]);

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
          <form onSubmit={handleSubmit}>
            {/* Step 1 */}

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

              <div className="mb-4 relative">
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

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {destinations.map((destination, index) => (
                  <div key={index} className="relative">
                    <TextField
                      label={`Destination ${index + 1}`}
                      variant="outlined"
                      fullWidth
                      value={destination}
                      onChange={(e) => {
                        const newDestinations = [...destinations];
                        newDestinations[index] = e.target.value;
                        setDestinations(newDestinations);
                      }}
                      required
                      disabled={!pickup}
                      inputRef={(el) => (destinationRefs.current[index] = el)}
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
                            borderColor: `${fixedColor}`, // outline color on focus
                          },
                        },
                        "& label.Mui-focused": {
                          color: "gray", // label color on focus
                        },
                      }}
                    />
                  </div>
                ))}

                <Button
                  variant="outlined"
                  onClick={handleAdd}
                  disabled={
                    destinations.length >= 4 ||
                    !destinations[destinations.length - 1] || // check for undefined/null
                    destinations[destinations.length - 1].trim() === ""
                  }
                >
                  + Add Destination
                </Button>
              </Box>
            </div>

            {/* Booking now/later radio - controlled */}
            <div className="flex  justify-around ml-6 w-full  items-center">
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

            {/* If "later", show date/time selects (keeps style minimal) */}
            {/* // ...existing code... */}
            {bookingMode === "later" && (
              <div className="px-3 py-2">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Pickup Date */}
                  <div className="flex-1">
                    <label className="block text-sm mb-1 font-medium">
                      Pickup date
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2"
                      value={dateVal}
                      onChange={(e) => setDateVal(e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  {/* Pickup Time */}
                  <div className="flex-1">
                    <label className="block text-sm mb-1 font-medium">
                      Pickup time
                    </label>
                    <input
                      type="time"
                      className="w-full border rounded px-3 py-2"
                      value={`${hourVal.padStart(2, "0")}:${minuteVal.padStart(
                        2,
                        "0"
                      )}`}
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(":");
                        setHourVal(h);
                        setMinuteVal(m);
                      }}
                      required
                      step="60" // optional
                      min={
                        dateVal === new Date().toISOString().split("T")[0]
                          ? new Date().toTimeString().slice(0, 5) // current local time
                          : "00:00"
                      }
                    />
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
                {" "}
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
                <div className="w-[20%] border rounded-sm h-14 flex items-center justify-center gap-1">
                  <img
                    className="h-5"
                    src="https://flagsapi.com/AU/flat/64.png"
                    alt="AU"
                  />
                  +61
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
            <div className="px-5 py-6">
              <h3 className="text-sm mt-2 mb-4">
                {" "}
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
                {" "}
                Step 4 of 4 <b>Driver Instruction</b>
              </h3>

              <div className="mb-4">
                <TextField
                  label="Notes for driver"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  inputProps={{
                    maxLength: 350,
                  }}
                  value={instruction}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInstruction(value);
                  }}
                  placeholder="e.g. Unit, Gate and floor numbers"
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
          changeIsLuggageModal = {setIsLuggageModalOpen}
        />
      )}
      {vehicleText === "Silver Service" && (
        <SeatDetails
          data={seatDetails["Silver Service"]}
          changeVehicleText={setVehicleText}
          onSelect={setSelected}
          onVehicleDetailOpenChange={onVehicleDetailOpenChange}
          changeIsLuggageModal = {setIsLuggageModalOpen}
        />
      )}
      {vehicleText === "Suv" && (
        <SeatDetails
          data={seatDetails["Suv"]}
          changeVehicleText={setVehicleText}
          onSelect={setSelected}
          onVehicleDetailOpenChange={onVehicleDetailOpenChange}
          changeIsLuggageModal = {setIsLuggageModalOpen}
        />
      )}
      {vehicleText === "Maxi Taxi" && (
        <SeatDetails
          data={seatDetails["Maxi Taxi"]}
          changeVehicleText={setVehicleText}
          onSelect={setSelected}
          onVehicleDetailOpenChange={onVehicleDetailOpenChange}
          changeIsLuggageModal = {setIsLuggageModalOpen}
        />
      )}

      {isLuggageModalOpen && <LuggageModal /> }
      {/* show modal — pass open and onClose */}
      <CabUnavailableModal
        open={isNoServiceOpen}
        onClose={() => setIsNoServiceOpen(false)}
      />
    </>
  );
};

export default SideBar;
