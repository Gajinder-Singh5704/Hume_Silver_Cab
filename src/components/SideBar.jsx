import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  ToggleButton,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { CheckIcon, CrossIcon, LockIcon, LockOpen } from "lucide-react";
import { IoAddCircle } from "react-icons/io5";
import ToggleSwitch from "./ToggleSwich";
import CarDropdown from "./CarDropdown";
import { getPlaces, getGeocode } from "../hooks/map";
import PaymentDropdown from "./PaymentDropdown";

const SideBar = ({ onPickupSelect, onDestinationsSelect }) => {
  // form fields
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [pickup, setPickup] = useState("");
  const [destinations, setDestinations] = useState([""]);
  const [passenger, setPassenger] = useState("");
  const [contact, setContact] = useState("");
  const [instruction, setInstruction] = useState("");
  const [isOn, setIsOn] = useState(true);
  const [selected, setSelected] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // add new state for map overlays
  const [destinationLocs, setDestinationLocs] = useState([]); // array of {lat, lng}
  const mapRef = useRef(null); // Google Map reference
  const directionsRendererRef = useRef(null);

  // internal geo selections
  const [pickupLoc, setPickupLoc] = useState(null); // {lat, lng}
  // const [destinationLoc, setDestinationLoc] = useState(null);

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

  const [destinationSuggestions, setDestinationSuggestions] = useState({});

  // refs for hidden inputs used by external Forminator code
  const distanceRef = useRef(null);
  const tollRef = useRef(null);
  const timeTypeRef = useRef(null);

  const calculateFare = () => {
    if (!distanceKm) return null;

    const baseFare = 5; // $5
    const perKmRate = 2; // $2 per km
    const tollCharge = hasToll ? 3 : 0; // $3 if toll exists
    const vehicleMultiplier = selected === "Premium" ? 1.5 : 1;

    // Time type multiplier: 1 = normal, 2 = peak, 3 = overnight weekend
    let timeMultiplier = 1;
    if (timeType === 2) timeMultiplier = 1.2;
    if (timeType === 3) timeMultiplier = 1.5;

    const totalFare =
      (baseFare + perKmRate * parseFloat(distanceKm) + tollCharge) *
      vehicleMultiplier *
      timeMultiplier;

    setFare(totalFare.toFixed(2));
  };

  // polling for google availability
  const directionsServiceRef = useRef(null);
  useEffect(() => {
    let poll = setInterval(() => {
      if (
        typeof window !== "undefined" &&
        window.google &&
        window.google.maps &&
        window.google.maps.DirectionsService
      ) {
        directionsServiceRef.current =
          new window.google.maps.DirectionsService();
        directionsRendererRef.current =
          new window.google.maps.DirectionsRenderer({
            suppressMarkers: true, // we’ll use custom markers
          });
        // attach renderer to your map (make sure mapRef is passed from parent or global)
        if (mapRef.current) {
          directionsRendererRef.current.setMap(mapRef.current);
        }
        clearInterval(poll);
      }
    }, 500);

    return () => clearInterval(poll);
  }, []);

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

        if (mapRef.current) {
          new window.google.maps.Marker({
            position: location,
            map: mapRef.current,
            icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          });
        }

        updateRoute(pickupLoc, newLocs);
      }
    } catch (err) {
      console.error("Failed to select destination", err);
    }
  };

  const handleDeleteDestination = (index) => {
    // Remove the destination
    const newDestinations = [...destinations];
    newDestinations.splice(index, 1);
    setDestinations(newDestinations);

    // Remove the corresponding location
    const newLocs = [...destinationLocs];
    newLocs.splice(index, 1);
    setDestinationLocs(newLocs);

    // Notify parent about updated destinations
    onDestinationsSelect(newLocs);

    // Optionally, remove marker from map
    // Since we are creating new markers each time, the removed marker will disappear on next route update
    updateRoute(pickupLoc, newLocs);
  };

  const handlePickupSelect = async (s) => {
    setPickup(s.description);
    setPickupSuggestions([]);

    try {
      const location = await getGeocode(s);
      if (location) {
        setPickupLoc(location);
        onPickupSelect(location);

        if (mapRef.current) {
          new window.google.maps.Marker({
            position: location,
            map: mapRef.current,
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          });
        }

        updateRoute(location, destinationLocs);
      }
    } catch (err) {
      console.error("Failed to select pickup", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log()
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
      destinations[destinations.length - 1].trim() !== ""
    ) {
      setDestinations([...destinations, ""]);
    }
  };

  const updateRoute = (pickup, dests) => {
    if (!pickup || dests.length === 0 || !directionsServiceRef.current) return;

    const waypoints = dests.slice(0, -1).map((loc) => ({
      location: loc,
      stopover: true,
    }));

    directionsServiceRef.current.route(
      {
        origin: pickup,
        destination: dests[dests.length - 1],
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && directionsRendererRef.current) {
          directionsRendererRef.current.setDirections(result);

          const leg = result.routes[0].legs[0];
          const km = (leg.distance.value / 1000).toFixed(1);
          setDistanceKm(km);

          const stepsText = leg.steps
            .map((s) => s.instructions.toLowerCase())
            .join(" ");
          const summary = (result.routes[0].summary || "").toLowerCase();

          const toll =
            stepsText.includes("citylink") ||
            stepsText.includes("eastlink") ||
            stepsText.includes("tullamarine fwy") ||
            stepsText.includes("tollway") ||
            summary.includes("citylink") ||
            summary.includes("eastlink") ||
            summary.includes("tullamarine");

          setHasToll(toll);

          // --- Calculate fare ---
          calculateFare();

          console.log("📏 Distance:", km, "km | Toll:", toll ? "Yes" : "No");
        } else {
          console.error("Directions request failed:", status);
          setDistanceKm("");
          setHasToll(false);
          setFare(null);
        }
      }
    );
  };

  useEffect(() => {
    if (distanceKm) calculateFare();
  }, [selected, distanceKm, hasToll]);

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
              label="Add pickup (required)"
              variant="outlined"
              fullWidth
              required
              placeholder="Add your pickup location"
              value={pickup}
              onChange={handlePickupChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {pickup ? (
                      <IconButton size="small">
                        <span style={{ fontSize: 16 }}>✖</span>
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
                  onChange={(e) => handleDestinationChange(e, index)}
                  required
                  disabled={!pickup}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {destination && (
                          <IconButton
                            size="small"
                            onClick={() => handleChange(index, "")} // clear input but keep field
                          >
                            <span style={{ fontSize: 16 }}>✖</span>
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Delete button for the entire field */}
                {destinations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDestination(index)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                )}

                {destinationSuggestions[index]?.length > 0 && (
                  <ul className="absolute z-50 bg-white border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto w-full">
                    {destinationSuggestions[index].map((s) => (
                      <li
                        key={s.place_id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleDestinationSelect(s, index)}
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
            ))}

            <Button
              variant="outlined"
              onClick={handleAdd}
              disabled={
                destinations.length >= 4 ||
                destinations[destinations.length - 1].trim() === ""
              }
            >
              + Add Destination
            </Button>
          </Box>
        </div>

        {/* Booking now/later radio - controlled */}
        <div className="flex  gap-4 px-4 ml-4 md:ml-0 items-center md:justify-center">
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
        {bookingMode === "later" && (
          <div className="px-5 py-2">
            <div className="mb-3">
              <label className="block text-sm mb-1">Select date</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="w-full border rounded px-3 py-2"
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={hourVal}
                onChange={(e) => setHourVal(e.target.value)}
                className="border rounded p-2"
              >
                {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(
                  (h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  )
                )}
              </select>

              <select
                value={minuteVal}
                onChange={(e) => setMinuteVal(e.target.value)}
                className="border rounded p-2"
              >
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={ampmVal}
                onChange={(e) => setAmpmVal(e.target.value)}
                className="border rounded p-2"
              >
                <option value="am">am</option>
                <option value="pm">pm</option>
              </select>
            </div>
          </div>
        )}

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

        <CarDropdown
          selectedOption={selected}
          onOptionSelect={setSelected}
          label={fare ? `Fare: $${fare}` : "Dest Required"}
        />

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
            <div className="w-[20%] border rounded-sm h-14 flex items-center justify-center gap-1 ">
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
                  pattern: "[0-9]{10}",
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
                helperText={contactError}
              />
            </div>
          </div>
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
            />
          </div>
        </div>

        <div className="mt-3">
          <button className="w-[80%] ml-[10%] px-2 py-3 border border-gray-500 rounded-md cursor-pointer">
            Request Booking
          </button>
        </div>
      </form>
    </section>
  );
};

export default SideBar;
