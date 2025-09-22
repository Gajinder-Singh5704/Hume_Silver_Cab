import { useEffect, useRef, useState } from "react";
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
import { LockIcon} from "lucide-react";
import ToggleSwitch from "./ToggleSwich";
import CarDropdown from "./CarDropdown";
import { getPlaces, getGeocode, attachPlacesAutocomplete } from "../hooks/map";
import PaymentDropdown from "./PaymentDropdown";

const SideBar = ({ onPickupSelect, onDestinationsSelect }) => {
  // form fields
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  // const [pickup, setPickup] = useState("");
  const [destinations, setDestinations] = useState([""]);
  const [passenger, setPassenger] = useState("");
  const [contact, setContact] = useState("");
  const [instruction, setInstruction] = useState("");
  const [isOn, setIsOn] = useState(true);
  const [selected, setSelected] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [pickup, setPickup] = useState("");
  const pickupInputRef = useRef(null);

useEffect(() => {
  const interval = setInterval(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      clearInterval(interval);

      if (pickupInputRef.current) {
        const options = {
          componentRestrictions: { country: "au" },
          fields: ["formatted_address", "geometry"],
        };

        const pickupAuto = new window.google.maps.places.Autocomplete(
          pickupInputRef.current,
          options
        );

        pickupAuto.addListener("place_changed", () => {
          const place = pickupAuto.getPlace();
          if (!place || !place.geometry) return;

          setPickup(place.formatted_address);

          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setPickupLoc(location);
          onPickupSelect(location);
        });
      }
    }
  }, 300);

  return () => clearInterval(interval);
}, [onPickupSelect]);


  const [pickupLoc, setPickupLoc] = useState(null);
  const [destinationLocs, setDestinationLocs] = useState([]);

  // Attach Google Autocomplete once Maps API is ready
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        clearInterval(interval);

        if (pickupInputRef.current) {
          attachPlacesAutocomplete(pickupInputRef.current, async (place) => {
            setPickup(place.formatted_address);

            const location = place.geometry?.location
              ? {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                }
              : await getGeocode(place);

            if (location) {
              setPickupLoc(location);
              onPickupSelect(location);
            }
          });
        }
      }
    }, 300);

    return () => clearInterval(interval); 
  }, [onPickupSelect]);


  const destinationRefs = useRef([]);

useEffect(() => {
  const interval = setInterval(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      clearInterval(interval);

      destinationRefs.current.forEach((input, idx) => {
        if (input) {
          const options = {
            componentRestrictions: { country: "au" },
            fields: ["formatted_address", "geometry"],
          };
          const auto = new window.google.maps.places.Autocomplete(input, options);

          auto.addListener("place_changed", () => {
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
            setDestinationLocs(newLocs);
            onDestinationsSelect(newLocs);

            updateRoute(pickupLoc, newLocs);
          });
        }
      });
    }
  }, 300);

  return () => clearInterval(interval);
}, [destinations, pickupLoc, destinationLocs, onDestinationsSelect]);

  // route & toll
  const [distanceKm, setDistanceKm] = useState("");
  const [hasToll, setHasToll] = useState(false);

  // booking time
  const [bookingMode, setBookingMode] = useState("now"); // "now" | "later"
  const [dateVal, setDateVal] = useState(""); // yyyy-mm-dd (native date input)
  const [hourVal, setHourVal] = useState("9");
  const [minuteVal, setMinuteVal] = useState("00");
  const [ampmVal, setAmpmVal] = useState("am");
  const [timeType, setTimeType] = useState(2); // number-3
  const [fare, setFare] = useState(null);
  const [contactError, setContactError] = useState("");

  const [tempHour, setTempHour] = useState(hourVal);
  const [tempMinute, setTempMinute] = useState(minuteVal);
  const [tempAmPm, setTempAmPm] = useState(ampmVal);
  const [tempTime, setTempTime] = useState(
    `${hourVal.padStart(2, "0")}:${minuteVal.padStart(2, "0")}`
  );

  const [destinationSuggestions, setDestinationSuggestions] = useState({});

  // refs for hidden inputs used by external Forminator code
  const distanceRef = useRef(null);
  const tollRef = useRef(null);
  const timeTypeRef = useRef(null);

  // determine time type (helper stays the same)
function determineTimeType(dateObj) {
  const day = dateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const hour24 = dateObj.getHours();
  const minute = dateObj.getMinutes();
  let timeType = 2; // default off-peak

  // Convert to 12-hour format for logging
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const ampm = hour24 >= 12 ? "PM" : "AM";

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
    `Calculated time type: ${timeType} | Day: ${dayNames[day]} | Time: ${hour12}:${minute
      .toString()
      .padStart(2, "0")} ${ampm}`
  );

  return timeType;
}


  // set initial and later booking time type
  useEffect(() => {
    let dateObj;

    if (bookingMode === "now") {
      dateObj = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Australia/Melbourne" })
      );
    } else if (bookingMode === "later" && dateVal) {
      const hour = (parseInt(hourVal, 10) % 12) + (ampmVal === "pm" ? 12 : 0);
      dateObj = new Date(`${dateVal}T${hour}:${minuteVal}:00`);
    }

    if (dateObj) {
      setTimeType(determineTimeType(dateObj));
    }
  }, [bookingMode, dateVal, hourVal, minuteVal, ampmVal]);

  const melbourneNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Australia/Melbourne" })
  );

const calculateFare = () => {
  console.log("=== 🟡 Fare Calculation Started ===");

  if (!distanceKm) {
    console.warn("⛔ No distance available. Cannot calculate fare.");
    return null;
  }

  const distance = parseInt(distanceKm);
  console.log(`📏 Distance (km): ${distance} km`);

  const tolls = hasToll ? 1 : 0;
  console.log(`🚧 Toll Detected: ${hasToll ? "YES" : "NO"} | Toll count used in calculation: ${tolls}`);

  const bookingFees = 4;
  console.log(`💰 Booking Fees: $${bookingFees}`);

  // Extract selected vehicle safely with fallback
  const { name: vehicleName = "Sedan" } = selected ?? {};
  console.log(`🚖 Selected Vehicle: ${vehicleName}`);

  // Calculate vehicle surcharge
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
  console.log(`➕ Vehicle Surcharge: $${vehicleSurcharge}`);

  // Calculate base fare based on timeType
  let base;
  if (timeType === 3) {
    base = 20 + distance * 2.493 + tolls * 17.46 + 7.8;
    console.log(
      `⏰ Time Type: Overnight Weekend (3) | Formula: 20 + (${distance} × 2.493) + (${tolls} × 17.46) + 7.8 = $${base.toFixed(
        2
      )}`
    );
  } else if (timeType === 2) {
    base = 13 + distance * 2.265 + tolls * 17.46 + 6.55;
    console.log(
      `⏰ Time Type: Off-Peak (2) | Formula: 13 + (${distance} × 2.265) + (${tolls} × 17.46) + 6.55 = $${base.toFixed(
        2
      )}`
    );
  } else {
    base = 8 + distance * 2.037 + tolls * 17.46 + 5.25;
    console.log(
      `⏰ Time Type: Normal (1) | Formula: 8 + (${distance} × 2.037) + (${tolls} × 17.46) + 5.25 = $${base.toFixed(
        2
      )}`
    );
  }

  // Apply minimum fare
  let minApplied = base < 40;
  let fareValue = Math.max(base, 40);
  console.log(
    minApplied
      ? `⚠️ Base fare $${base.toFixed(2)} is below minimum $40. Using minimum fare: $40.00`
      : `✅ Base fare above minimum. Using calculated fare: $${fareValue.toFixed(2)}`
  );

  // Add vehicle surcharge and booking fees
  fareValue += vehicleSurcharge;
  console.log(`➕ Adding Vehicle Surcharge: +$${vehicleSurcharge} → $${fareValue.toFixed(2)}`);

  fareValue += bookingFees;
  console.log(`➕ Adding Booking Fees: +$${bookingFees} → $${fareValue.toFixed(2)}`);

  // Airport surcharge
  if (isAirportPickup(pickup)) {
    fareValue += 4.68;
    console.log(`🛫 Airport Pickup: +$4.68 → $${fareValue.toFixed(2)}`);
  } else {
    console.log("🛫 Airport Pickup: NO extra charge applied.");
  }

  console.log("✅ === FINAL FARE CALCULATED ===");
  console.log(`💵 Final Fare: $${fareValue.toFixed(2)}`);

  setFare(fareValue.toFixed(2));
};





  // ---- Autocomplete / places handling (using your existing getPlaces/getGeocode hooks) ----
  const handlePickupChange = async (e) => {
    const value = e.target.value;
    setPickup(value);
    setPickupLoc(null); // reset loc until picked

    if (!value) {
      setPickupSuggestions([]);
      return;
    }

    try {
      const data = await getPlaces(value);
      if (data?.predictions) setPickupSuggestions(data.predictions);
    } catch (err) {
      console.error("Error fetching pickup places:", err);
      setPickupSuggestions([]);
    }
  };

  const handleDestinationChange = async (e, index) => {
    const value = e.target.value;
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);

    if (!value) {
      setDestinationSuggestions((prev) => ({ ...prev, [index]: [] }));
      return;
    }

    try {
      const data = await getPlaces(value);
      if (data?.predictions) {
        setDestinationSuggestions((prev) => ({
          ...prev,
          [index]: data.predictions,
        }));
      }
    } catch (err) {
      console.error("Error fetching destination places:", err);
      setDestinationSuggestions((prev) => ({ ...prev, [index]: [] }));
    }
  };

  const handleDestinationSelect = async (s, index) => {
    const newDestinations = [...destinations];
    newDestinations[index] = s.description;
    setDestinations(newDestinations);

    setDestinationSuggestions((prev) => ({ ...prev, [index]: [] }));

    try {
      const location = await getGeocode(s);
      if (location) {
        const newLocs = [...destinationLocs];
        newLocs[index] = location;
        setDestinationLocs(newLocs);

        // ✅ send all updated destination locations to parent
        onDestinationsSelect(newLocs);
        updateRoute(pickupLoc, newLocs);
      }
    } catch (err) {
      console.error("Failed to select destination", err);
    }
  };

  const handleDeleteDestination = (index) => {
    // If this is the last remaining field, just clear it
    if (destinations.length === 1) {
      const newDestinations = [""];
      setDestinations(newDestinations);

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
    setPickup("");          // Clear pickup input
    setPickupLoc(null);     // Clear location object
    setPickupSuggestions([]); // Clear any autocomplete suggestions

    // Notify parent that pickup is now empty
    onPickupSelect(null);

    // Also reset route if neede
    // d
    updateRoute(null, destinationLocs);
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

  const handleChange = (index, value) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);
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

          const stepsText = leg.steps
            .map((s) => s.instructions.toLowerCase())
            .join(" ");
          const summary = (result.routes[0].summary || "").toLowerCase();

          let pickupAddress = "";

          // If pickup is string
          if (typeof pickup === "string") {
            pickupAddress = pickup;
          }
          // If pickup is a Google Places Autocomplete result
          else if (pickup?.description) {
            pickupAddress = pickup.description;
          }
          // If pickup is an object with `name`
          else if (pickup?.name) {
            pickupAddress = pickup.name;
          }
          // Otherwise fallback to empty string
          else {
            console.warn("Pickup is not a string or place object:", pickup);
          }

          const toll =
            stepsText.includes("citylink") ||
            stepsText.includes("eastlink") ||
            stepsText.includes("tullamarine fwy") ||
            stepsText.includes("tollway") ||
            summary.includes("citylink") ||
            summary.includes("eastlink") ||
            summary.includes("tullamarine");
          setHasToll(toll);
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

  useEffect(() => {
    if (distanceKm) calculateFare();
  }, [selected, distanceKm, hasToll, timeType]);

  // ...existing code...
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
      ampmVal,
      timeType,
      fare,
      hasToll,
      distanceKm,
    };

    alert("Booking requested");
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
    setAmpmVal("am");
    setTimeType(2);
    setFare(null);
    setHasToll(false);
    setDistanceKm("");
    setContactError("");
    setDestinationSuggestions({});

    onPickupSelect(setPickupLoc)
    onDestinationsSelect(setDestinationLocs)

      // Update route with empty destinations
      // updateRoute(pickupLoc, newLocs);

   };
  // ...existing code...

  return (
    <section className=" w-full  h-[83.4vh] overflow-y-scroll">
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
                      <IconButton size="small" >
                        <span onClick={handleDeletePickup} style={{ fontSize: 16 }}>✖</span>
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
                  min={new Date().toISOString().split("T")[0]}
                  max={
                    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  required
                />
              </div>
              {/* Pickup Time */}
              {/* Pickup Time */}
              <div className="flex-1 relative">
                <label className="block text-sm mb-1 font-medium">
                  Pickup time
                </label>
                <input
                  type="time"
                  className="w-full border rounded px-3 py-2"
                  value={
                    tempTime ||
                    (hourVal && minuteVal
                      ? `${hourVal.padStart(2, "0")}:${minuteVal.padStart(
                          2,
                          "0"
                        )}`
                      : "")
                  }
                  onChange={(e) => setTempTime(e.target.value)}
                  required
                  min={
                    dateVal === new Date().toISOString().split("T")[0]
                      ? new Date().toTimeString().slice(0, 5)
                      : "00:00"
                  }
                />

                {/* Done button (only visible if tempTime not yet saved) */}
                {tempTime &&
                  tempTime !==
                    `${hourVal.padStart(2, "0")}:${minuteVal.padStart(
                      2,
                      "0"
                    )}` && (
                    <button
                      type="button"
                      onClick={() => {
                        const [h, m] = tempTime.split(":");
                        let newHour = parseInt(h, 10);
                        let newAmPm = newHour >= 12 ? "pm" : "am";

                        // convert to 12hr format
                        if (newHour === 0) {
                          newHour = 12;
                        } else if (newHour > 12) {
                          newHour = newHour - 12;
                        }

                        setHourVal(String(newHour));
                        setMinuteVal(m);
                        setAmpmVal(newAmPm);
                        setTempTime(""); 
                        calculateFare()
                      }}
                      className="absolute right-2 top-7.5 px-2 py-1 text-sm bg-green-600 text-white rounded"
                    >
                      Done
                    </button>
                  )}
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
        <div className="w-full px-5">
          <CarDropdown
            selectedOption={selected}
            onOptionSelect={setSelected}
            label={
              fare
                ? isOn
                  ? `Fare: $${fare}`
                  : `Fare: $${(fare - 5).toFixed(2)} - $${(
                      parseFloat(fare) + 5
                    ).toFixed(2)}`
                : "Dest Required"
            }
            className="w-full" // <- pass this down
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
            />
          </div>
        </div>

        <div className="mt-3">
          <button type="submit" className="w-[80%] ml-[10%] px-2 py-3 border border-gray-500 rounded-md cursor-pointer">
            Request Booking
          </button>
        </div>
      </form>
    </section>
  );
};

export default SideBar;
