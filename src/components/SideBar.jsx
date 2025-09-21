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
import { getPlaces ,getGeocode   } from "../hooks/map";
import PaymentDropdown from "./PaymentDropdown";

const SideBar = ({ onPickupSelect }) => {
  // form fields
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [pickup, setPickup] = useState("");
  const [destinations, setDestinations] = useState([""]);
  const [passenger, setPassenger] = useState("");
  const [contact, setContact] = useState("");
  const [instruction, setInstruction] = useState("");
  const [isOn, setIsOn] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // internal geo selections
  const [pickupLoc, setPickupLoc] = useState(null); // {lat, lng}
  const [destinationLoc, setDestinationLoc] = useState(null);

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

  // refs for hidden inputs used by external Forminator code
  const distanceRef = useRef(null);
  const tollRef = useRef(null);
  const timeTypeRef = useRef(null);

  // polling for google availability
  const directionsServiceRef = useRef(null);
  useEffect(() => {
    let poll = setInterval(() => {
      if (typeof window !== "undefined" && window.google && window.google.maps && window.google.maps.DirectionsService) {
        directionsServiceRef.current = new window.google.maps.DirectionsService();
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

  const handleDestinationChange = async (e) => {
    const value = e.target.value;
    setDestination(value);
    setDestinationLoc(null);

    if (!value) {
      // clear suggestions
      return setDestinationSuggestions([]);
    }

    try {
      const data = await getPlaces(value);
      if (data?.predictions) setDestinationSuggestions(data.predictions);
    } catch (err) {
      console.error("Error fetching destination places:", err);
      setDestinationSuggestions([]);
    }
  };

  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  const handlePickupSelect = async (s) => {
    setPickup(s.description);
    setPickupSuggestions([]);

    try {
      const location = await getGeocode(s);
      if (location) {
        setPickupLoc(location);
        // pass pickup location up (existing behavior)
        onPickupSelect(location);
      }
    } catch (err) {
      console.error("Failed to select pickup", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault()


  }

  

  // Handle when user selects a payment method
  const handlePaymentSelect = (paymentMethod) => {
    setSelectedPayment(paymentMethod);
    console.log('Selected payment:', paymentMethod);
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

  return (
    <section className=" w-full  h-[83.4vh] overflow-y-scroll">
      <form onSubmit={handleSubmit}>
        {/* Step 1 */}

        {/* Step 1 */}
        <div className="px-5 py-6">
          <h3 className="text-sm mb-4 hidden md:flex">
            Step 1 of 4  <b className="ml-2"> Booking details</b>
          </h3>

          <h2 className="md:hidden text-2xl text-bold mb-2">Fare Estimates Calculator</h2>
          <h3 className="md:hidden mb-4 text-sm">Please enter a valid pickup and destination </h3>

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
                      <IconButton size="small" onClick={clearPickup}>
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
                    <span className="font-medium">{s.structured_formatting.main_text}</span>
                    <span className="text-gray-500 ml-2 text-sm">{s.structured_formatting.secondary_text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

                {destinations.map((destination, index) => (
                <TextField
                key={index}
                label={`Destination ${index + 1}`}
                variant="outlined"
                fullWidth
                value={destination}
                onChange={(e) => handleChange(index, e.target.value)}
                required
                />
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
                className="w-full border rounded px-3 py-2"
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <select value={hourVal} onChange={(e) => setHourVal(e.target.value)} className="border rounded p-2">
                {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>

              <select value={minuteVal} onChange={(e) => setMinuteVal(e.target.value)} className="border rounded p-2">
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select value={ampmVal} onChange={(e) => setAmpmVal(e.target.value)} className="border rounded p-2">
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

        <CarDropdown selectedOption={selected} onOptionSelect={setSelected} />

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
              <img className="h-5" src="https://flagsapi.com/AU/flat/64.png" alt="AU" />
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
                  maxLength: 10,
                }}
                value={contact}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setContact(value);
                }}
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
