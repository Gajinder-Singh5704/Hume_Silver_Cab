import { useEffect, useRef, useState } from "react";
import { tolls, normalizeRoad, roadAliases } from "../../data/tollsData.js";
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
import ToggleSwitch from "./ToggleSwich.jsx";
import CarDropdown from "./CarDropdown.jsx";
import { getGeocode } from "../../hooks/map.js";
import PaymentDropdown from "./PaymentDropdown.jsx";
import LuggageModal from "./LuggageModal.jsx";
import { useOutletContext} from "react-router-dom";
import { useBooking } from "../../context/BookingContext";


const melbourneNow = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Australia/Melbourne" })
);

const SideBar = () => {

  const { onPickupSelect, onDestinationsSelect } = useOutletContext();
  const [show,setShow] = useState(true)

  // form fields
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  // const [destinations, setDestinations] = useState([""]);
  // const [passenger, setPassenger] = useState("");
  // const [contact, setContact] = useState("");
  // const [instruction, setInstruction] = useState("");
  const [isOn, setIsOn] = useState(true);
  const [selected, setSelected] = useState(null);
  // const [selectedPayment, setSelectedPayment] = useState(null);
  // const [tollPrice, setTollPrice] = useState(0);

  const [isLuggageModalOpen,setIsLuggageModalOpen] = useState(false)
  

  // const [pickup, setPickup] = useState("");
  const pickupInputRef = useRef(null);

  // const [pickupLoc, setPickupLoc] = useState(null);
  // const [destinationLocs, setDestinationLocs] = useState([]);

  const destinationRefs = useRef([]);

  // route & toll
  // const [distanceKm, setDistanceKm] = useState("");
  // const [hasToll, setHasToll] = useState(false);

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

  const [tempTime, setTempTime] = useState(
    `${hourVal.padStart(2, "0")}:${minuteVal.padStart(2, "0")}`
  );

  const { resetBooking, bookingData, setBookingData } = useBooking();

  // determine time type (helper stays the same)
  const determineTimeType = (dateObj) => {
    const day = dateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const hour24 = dateObj.getHours();
    const minute = dateObj.getMinutes();
    let timeType = 2; // default shoulder

    if (
      (day === 5 && hour24 >= 22) || // Friday 22:00–23:59
      (day === 6 && hour24 < 4) ||   // Saturday 00:00–03:59
      (day === 6 && hour24 >= 22) || // Saturday 22:00–23:59
      (day === 0 && hour24 < 4)      // Sunday 00:00–03:59
    ) {
      timeType = 3; // Overnight Weekend
    } else if (hour24 >= 9 && hour24 < 17) {
      timeType = 1; // Normal
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    console.log(
      `Calculated time type: ${timeType} | Day: ${dayNames[day]} | Time: ${hour24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
    );

    return timeType;
  };


  // set initial and later booking time type

  const calculateFare = () => {
    console.log("=== Fare Calculation Started ===");

    if (!bookingData.distanceKm) {
      console.log("❌ No distance available — aborting fare calculation.");
      return null;
    }

    const distance = parseInt(bookingData.distanceKm);
    console.log("📏 Distance (km):", distance);

    const tollCost = bookingData.hasToll ? parseFloat(bookingData.tollPrice) : 0;
    console.log("💰 Toll cost included:", tollCost);

    const bookingFees = 4;
    console.log("🧾 Booking fee:", bookingFees);

    const { name: vehicleName = "Sedan" } = selected ?? {};
    console.log("🚖 Selected vehicle:", vehicleName);

    // Vehicle surcharge
    let vehicleSurcharge = 0;
    switch (vehicleName) {
      case "Sedan":
        vehicleSurcharge = 0;
        break;
      case "Silver Service":
        vehicleSurcharge = 11;
        break;
      case "SUV":
      case "MAXI TAXI":
        vehicleSurcharge = 17.8;
        break;
    }
    console.log("🚘 Vehicle surcharge:", vehicleSurcharge);

    // Base fare calculation based on time type
    let base;
    if (timeType === 3) {
      base = 20 + distance * 2.493 + tollCost + 7.8;
      console.log(
        "⏰ Time type: Peak (3) → Base fare formula: 20 + distance*2.493 + toll + 7.8"
      );
    } else if (timeType === 2) {
      base = 13 + distance * 2.265 + tollCost + 6.55;
      console.log(
        "⏰ Time type: Shoulder (2) → Base fare formula: 13 + distance*2.265 + toll + 6.55"
      );
    } else {
      base = 8 + distance * 2.037 + tollCost + 5.25;
      console.log(
        "⏰ Time type: Off-Peak (else) → Base fare formula: 8 + distance*2.037 + toll + 5.25"
      );
    }
    console.log("📊 Base fare before minimum check:", base);

    // Apply minimum fare
    let fareValue = Math.max(base, 40);
    console.log("🔎 Applied minimum fare (40 if needed):", fareValue);

    // Add surcharges
    fareValue += vehicleSurcharge + bookingFees;
    console.log(`➕ After surcharges (vehicle + booking): ${fareValue}`);

    // Airport surcharge
    if (isAirportPickup(bookingData.pickup)) {
      fareValue += 4.68;
      console.log("🛫 Airport pickup detected — added airport surcharge: 4.68");
    }

    console.log("✅ Final fare calculated:", fareValue.toFixed(2));
    setFare(fareValue.toFixed(2));
  };

  const handleDeleteDestination = (index) => {
    // If this is the last remaining field, just clear it
    if (bookingData.destinations.length === 1) {
      const newDestinations = [""];
      setBookingData({ ...bookingData, destinations: newDestinations });

      const newLocs = []; // remove any location
      setBookingData({ ...bookingData, destinationLocs: newLocs });

      // Notify parent about updated destinations
      onDestinationsSelect(newLocs);

      // Update route with empty destinations
      updateRoute(pickupLoc, newLocs);
      return;
    }

    // Otherwise, remove the field normally
    const newDestinations = [...bookingData.destinations];
    newDestinations.splice(index, 1);
    setBookingData({ ...bookingData, destinations: newDestinations });

    const newLocs = [...bookingData.destinationLocs];
    newLocs.splice(index, 1);
    setBookingData({ ...bookingData, destinationLocs: newLocs });

    // Notify parent about updated destinations
    onDestinationsSelect(newLocs);

    updateRoute(pickupLoc, newLocs);
  };

  const handleDeletePickup = () => {
    setBookingData({ ...bookingData, pickup: "" }); // Clear pickup input
    setBookingData({ ...bookingData, pickupLoc: null }); // Clear location object
    setBookingData({ ...bookingData, pickupSuggestions: [] }); // Clear any autocomplete suggestions

    setBookingData({ ...bookingData, destinations: [""] });
    setBookingData({ ...bookingData, destinationLocs: null });

    // Notify parent that pickup is now empty
    setBookingData({ ...bookingData, destinations: [] });
    onPickupSelect(null);

    // Also reset route if needed
    updateRoute(null, null);
  };

  const handlePickupSelect = async (s) => {
    // setBookingData({ ...bookingData, pickup: s.description });
    // setBookingData({ ...bookingData, pickupSuggestions: [] });

    try {
       console.log("location pickup 1 ")
      const location = await getGeocode(s);
     
      if (location) {
        setBookingData({ ...bookingData, pickupLoc: location });
        onPickupSelect(location);
      }

      // All good — set pickup location and notify parent
      setPickupLoc(location);
      onPickupSelect(location);

      // Trigger route update if there are destinations already
      updateRoute(location, destinationLocs);
    } catch (err) {
      console.error("Failed to select pickup", err);
    }
  };


  // Handle when user selects a payment method
  const handlePaymentSelect = (paymentMethod) => {
    setBookingData({ ...bookingData, selectedPayment: paymentMethod });
    console.log("Selected payment:", paymentMethod);
  };

  const handleAdd = () => {
    if (
      bookingData.destinations.length < 4 &&
      typeof bookingData.destinations[bookingData.destinations.length - 1] === "string" &&
      bookingData.destinations[bookingData.destinations.length - 1].trim() !== ""
    ) {
      setBookingData({ ...bookingData, destinations: [...bookingData.destinations, ""] });
    }
  };

  const updateRoute = (pickup, dests) => {
    console.log("Calling calculate");
    if (!pickup || dests.length === 0) {
      setBookingData({ ...bookingData, distanceKm: "" });
      setBookingData({ ...bookingData, hasToll: false });
      setBookingData({ ...bookingData, fare: null });
      return;
    }

    setBookingData({ ...bookingData, hasToll: false });
    setBookingData({ ...bookingData, fare: null });

    const service = new window.google.maps.DirectionsService();

    service.route({
      origin: bookingData.pickup,
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
          setBookingData({ ...bookingData, distanceKm: km });

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

          setBookingData({ ...bookingData, hasToll: toll > 0 });
          setBookingData({ ...bookingData, tollPrice: toll });
          console.log("Toll Cost:", toll);
          calculateFare(); // If you already include tolls in fare calculation
        } else {
          console.error("Directions request failed:", status);
          setBookingData({ ...bookingData, distanceKm: "" });
          setBookingData({ ...bookingData, hasToll: false });
          setBookingData({ ...bookingData, fare: null });
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

    alert("Booking requested");
    console.log("Booking Data:", bookingData);

    // Reset all fields
    resetBooking();

    // Update route with empty destinations
    // updateRoute(pickupLoc, newLocs);
  };

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
            const auto = new window.google.maps.places.Autocomplete(input, options);

            auto.addListener("place_changed", async () => {
              const place = auto.getPlace();
              if (!place || !place.geometry) return;

              // Keep a friendly label immediately (optional)
              const formatted = place.formatted_address;
              const newDestinations = [...destinations];

              newDestinations[idx] = place.formatted_address;
              setBookingData({ ...bookingData, destinations: newDestinations });

              const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
              const newLocs = [...destinationLocs];
              newLocs[idx] = location;
              setBookingData({ ...bookingData, destinationLocs: newLocs });
              onDestinationsSelect(newLocs);

              try {
                // Validate destination is inside Victoria
                const insideVIC = await isInVictoria(location);
                if (!insideVIC) {
                  alert(`Destination ${idx + 1} must be within Victoria, Australia.`);
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


            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };


            try {
              // Validate using your helper
              const insideVIC = await isInVictoria(location);
              if (!insideVIC) {
                alert("Pickup must be within Victoria, Australia.");
                // revert the visible input (optional) so user knows selection failed
                setPickup("");
                return; // STOP: do not set pickupLoc, do not update route
              }

              // valid: set location and notify parent & map
              // setPickupLoc(location);
              onPickupSelect(location);

              // Update route now that pickup is valid
              // updateRoute(location, destinationLocs);
            } catch (err) {
              console.error("Failed to validate pickup location:", err);
              // optionally revert UI
              setPickup("");
            }
          });

        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [bookingData.destinations, bookingData.pickupLoc, bookingData.destinationLocs, onDestinationsSelect, onPickupSelect]);

  useEffect(() => {
    if (bookingData.distanceKm) calculateFare();
  }, [selected, bookingData.distanceKm, bookingData.hasToll, timeType]);

  useEffect(() => {
    let dateObj;

    if (bookingMode === "now") {
      dateObj = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Australia/Melbourne" })
      );
    } else if (bookingMode === "later" && dateVal) {
      const hour = parseInt(hourVal, 10);
      dateObj = new Date(`${dateVal}T${hour.toString().padStart(2, "0")}:${minuteVal}:00`);
    }


    if (dateObj) {
      setTimeType(determineTimeType(dateObj));
    }
  }, [bookingMode, dateVal, hourVal, minuteVal]);



// useEffect(() => {
//   setBookingData({ ...bookingData,
//     seatCount: bookingData.seatCount || 4

//   }); // ensure bookingData is defined

//   // if (bookingData) {
//   //   // restore other fields
//   //   setPickup(bookingData.pickup || "");
//   //   setPickupLoc(bookingData.pickupLoc || null);
//   //   setDestinations(bookingData.destinations || [""]);
//   //   setDestinationLocs(bookingData.destinationLocs || []);
//   //   setPassenger(bookingData.passenger || "");
//   //   setContact(bookingData.contact || "");
//   //   setInstruction(bookingData.instruction || "");
//   //   setSelectedPayment(bookingData.selectedPayment || null);
//   //   setIsOn(bookingData.isOn ?? true);
//   //   setSelected(bookingData.selectedCar || null);
//   //   setTollPrice(bookingData.tollPrice || 0);
    
//   // }

//   calculateFare()
  
// }, [bookingData]);




  return (
   <>
   {show &&  <section className=" w-full  h-[83.4vh] overflow-y-scroll">
      <form onSubmit={handleSubmit}>
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
              value={bookingData.pickup}
              onChange={(e) => setBookingData({...bookingData, pickup: e.target.value})} // update context
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {bookingData.pickup ? (
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

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {bookingData.destinations.map((destination, index) => (
              <div key={index} className="relative">
                <TextField
                  label={`Destination ${index + 1}`}
                  variant="outlined"
                  fullWidth
                  value={destination}
                  onChange={(e) => {
                    const newDestinations = [...bookingData.destinations, destination];
                    newDestinations[index] = e.target.value;
                    setBookingData({ ...bookingData, destinations: newDestinations });
                  }}
                  required
                  disabled={!bookingData.pickup}
                  inputRef={(el) => (destinationRefs.current[index] = el)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {bookingData.destinations[index] && (
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
                />
              </div>
            ))}

            <Button
              variant="outlined"
              onClick={handleAdd}
              disabled={
                bookingData.destinations.length >= 4 ||
                !bookingData.destinations[bookingData.destinations.length - 1] || // check for undefined/null
                bookingData.destinations[bookingData.destinations.length - 1].trim() === ""
              }
            >
              + Add Destination
            </Button>
          </Box>
        </div>

        {/* Booking now/later radio - controlled */}
        <div className="flex  gap-4 px-4 ml-3 md:ml-2 items-center">
          <RadioGroup
            row
            value={bookingMode}
            onChange={(e) => setBookingMode(e.target.value)}
            sx={{
              flexDirection: {
                xs: "column",
                md: "row",
              },
            }}
          >
            <FormControlLabel
              value="now"
              control={
                <Radio
                  sx={{
                    color: "black",
                    "&.Mui-checked": {
                      color: "green",
                    },
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
                    "&.Mui-checked": {
                      color: "green",
                    },
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
                  onChange={(e) => setBookingData({...bookingData, dateVal: e.target.value})}
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
                  value={`${hourVal.padStart(2, "0")}:${minuteVal.padStart(2, "0")}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(":");
                    setBookingData({...bookingData, hourVal: h, minuteVal: m});
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
              <LockIcon color="#145389" />
              <p className="text-xl text-[#145389] font-bold">Fixed Price</p>
            </div>

            <ToggleSwitch enabled={isOn} onToggle={setIsOn} />
          </div>

          <p className="mt-2">Lock in a price with no additional charges.</p>
        </div>
        <div className="w-full px-2">
          <CarDropdown
            selectedOption={selected}
            onOptionSelect={setSelected}
            isFixedPrice={isOn}
            label={
              fare
                ? isOn
                  ? `Fare: $${fare}`
                  : `Fare: $${(fare - 5).toFixed(2)} - $${(
                    parseFloat(fare) + 5
                  ).toFixed(2)}`
                : "Dest Required"
            }
            isLuggageModal={setIsLuggageModalOpen}
            className="w-full" // <- pass this down

            bookingData={bookingData}
            setBookingData={setBookingData}
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
              value={bookingData.passenger}
              onChange={(e) => setBookingData({...bookingData, passenger: e.target.value})}
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
                value={bookingData.contact}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setBookingData({...bookingData, contact: value});
                  if (value.length === 9 && value.startsWith("4")) {
                    setContactError("");
                  } else {
                    setContactError("Number must be 9 digits and start with 4");
                  }
                }}
                error={!!contactError}
              />
            </div>
          </div>

          {/* Shared error message below both fields */}
          {contactError && (
            <p className="text-red-600 text-sm mt-1">{contactError}</p>
          )}
        </div>

        {/* Step 3 Payment */}
        <div className="px-5 py-6" onClick={()=>setShow(false)}>
          <h3 className="text-sm mt-2 mb-4">
            {" "}
            Step 3 of 4 <b>Payment</b>
          </h3>

          <PaymentDropdown
            selectedOption={bookingData.selectedPayment}
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
              value={bookingData.instruction}
              onChange={(e) => {
                const value = e.target.value;
                setBookingData({ ...bookingData, instruction: value });
              }}
              placeholder="e.g. Unit, Gate and floor numbers"
            />
          </div>
        </div>

        <div className="mt-3">
          <button
            type="submit"
            className="w-[80%] ml-[10%] px-2 py-3 border border-gray-500 rounded-md cursor-pointer"
          >
            Request Booking
          </button>
        </div>
      </form>
    </section>} 
    {!show && <div onClick={()=> setShow(true)}>
      back
      </div>}
   </>
  );
};

export default SideBar;
