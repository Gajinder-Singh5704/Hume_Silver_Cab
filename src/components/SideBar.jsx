import React, { useEffect, useRef, useState } from "react";
import {
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

const AU_TIMEZONE = "Australia/Melbourne";

const SideBar = ({ onPickupSelect }) => {
  // form fields
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [passenger, setPassenger] = useState("");
  const [contact, setContact] = useState("");
  const [instruction, setInstruction] = useState("");
  const [isOn, setIsOn] = useState(false);
  const [selected, setSelected] = useState(null);

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

  const handleDestinationSelect = async (s) => {
    setDestination(s.description);
    setDestinationSuggestions([]);

    try {
      const location = await getGeocode(s);
      if (location) {
        setDestinationLoc(location);
      }
    } catch (err) {
      console.error("Failed to select destination", err);
    }
  };

  // Clear button handlers (for MUI TextField end adornment)
  const clearPickup = () => {
    setPickup("");
    setPickupLoc(null);
    setPickupSuggestions([]);
  };
  const clearDestination = () => {
    setDestination("");
    setDestinationLoc(null);
    setDestinationSuggestions([]);
  };

  // ---- Calculate route when both pickup & destination present ----
  const calculateRoute = async () => {
    const ds = directionsServiceRef.current;
    if (!ds) {
      // google not ready
      return;
    }

    // prefer lat/lng objects if we have them
    const origin = pickupLoc ? { lat: pickupLoc.lat, lng: pickupLoc.lng } : pickup;
    const destinationParam = destinationLoc ? { lat: destinationLoc.lat, lng: destinationLoc.lng } : destination;

    if (!origin || !destinationParam) return;

    ds.route(
      {
        origin,
        destination: destinationParam,
        travelMode: window.google.maps.TravelMode.DRIVING,
        region: "AU",
      },
      (res, status) => {
        if (status !== "OK" || !res?.routes?.length) {
          console.error("❌ Google Directions error:", status);
          setDistanceKm("");
          setHasToll(false);
          // update hidden fields
          if (distanceRef.current) {
            distanceRef.current.value = "";
            distanceRef.current.dispatchEvent(new Event("input", { bubbles: true }));
          }
          if (tollRef.current) {
            tollRef.current.value = "0";
            tollRef.current.dispatchEvent(new Event("input", { bubbles: true }));
          }
          return;
        }

        const leg = res.routes[0].legs[0];
        const km = (leg.distance.value / 1000).toFixed(1);
        setDistanceKm(km);
        if (distanceRef.current) {
          distanceRef.current.value = km;
          distanceRef.current.dispatchEvent(new Event("input", { bubbles: true }));
        }

        const stepsText = leg.steps.map((s) => (s.instructions || "").toLowerCase()).join(" ");
        const summary = (res.routes[0].summary || "").toLowerCase();

        const foundToll =
          stepsText.includes("citylink") ||
          stepsText.includes("eastlink") ||
          stepsText.includes("tullamarine fwy") ||
          stepsText.includes("tollway") ||
          summary.includes("citylink") ||
          summary.includes("eastlink") ||
          summary.includes("tullamarine");

        setHasToll(foundToll);
        if (tollRef.current) {
          tollRef.current.value = foundToll ? "1" : "0";
          tollRef.current.dispatchEvent(new Event("input", { bubbles: true }));
        }

        // small nudge: trigger a change on any Book Later/Now radio to force 3rd-party recalculation
        const bookLaterRadio = document.querySelector('input[name="radio-1"]');
        if (bookLaterRadio) {
          bookLaterRadio.dispatchEvent(new Event("change", { bubbles: true }));
        }

        console.log("✅ Distance:", km, "km | Toll:", foundToll ? "Yes" : "No");
      }
    );
  };

  // call calculateRoute whenever pickupLoc or destinationLoc or pickup/destination string changes
  useEffect(() => {
    // wait directionsService to be ready
    if (!directionsServiceRef.current) return;
    // only compute when we have values
    if ((pickupLoc || pickup) && (destinationLoc || destination)) {
      calculateRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupLoc, destinationLoc, pickup, destination, directionsServiceRef.current]);

  // ---- Time type detection (mirrors your original logic) ----
  const determineTimeType = (dateObj) => {
    const day = dateObj.getDay();
    const hour = dateObj.getHours();
    let tt = 2; // default

    // Friday 22:00–23:59, Saturday 00:00–03:59, Saturday 22:00–23:59, Sunday 00:00–03:59
    if (
      (day === 5 && hour >= 22) || // Friday 22:00–23:59
      (day === 6 && hour < 4) || // Saturday 00:00–03:59
      (day === 6 && hour >= 22) || // Saturday 22:00–23:59
      (day === 0 && hour < 4) // Sunday 00:00–03:59
    ) {
      tt = 3; // Overnight Weekend
    } else if (hour >= 9 && hour < 17) {
      tt = 1; // Normal
    }

    return tt;
  };

  // helper to build Date in AU timezone either "now" or from selected date/time controls
  const buildSelectedDateInAU = () => {
    if (bookingMode === "now") {
      // create date in AU time using toLocaleString trick
      const local = new Date();
      const str = local.toLocaleString("en-US", { timeZone: AU_TIMEZONE });
      return new Date(str);
    } else {
      // bookingMode === 'later'
      if (!dateVal || hourVal === "" || minuteVal === "" || ampmVal === "") return null;

      // dateVal is yyyy-mm-dd (native <input type="date">), or possibly dd-mm-yyyy string; handle both
      let y, m, d;
      if (dateVal.includes("-")) {
        // likely yyyy-mm-dd
        const parts = dateVal.split("-");
        if (parts[0].length === 4) {
          y = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
          d = parseInt(parts[2], 10);
        } else {
          // maybe dd-mm-yyyy
          d = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
          y = parseInt(parts[2], 10);
        }
      } else {
        return null;
      }

      let hour = parseInt(hourVal, 10);
      const minute = parseInt(minuteVal, 10);
      if (ampmVal === "pm" && hour !== 12) hour += 12;
      if (ampmVal === "am" && hour === 12) hour = 0;

      // construct as ISO string in local timezone and then convert to AU zone via toLocaleString
      const iso = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
      // create Date from iso (interpreted as local zone)
      const dt = new Date(iso);
      // convert to AU timezone by formatting & re-parsing in that timezone
      const auStr = dt.toLocaleString("en-US", { timeZone: AU_TIMEZONE });
      return new Date(auStr);
    }
  };

  // run interval like original script to auto-detect timeType and write to hidden input
  useEffect(() => {
    const interval = setInterval(() => {
      const selectedDate = buildSelectedDateInAU();
      if (!selectedDate || isNaN(selectedDate)) {
        return;
      }
      const newTimeType = determineTimeType(selectedDate);
      if (newTimeType !== timeType) {
        setTimeType(newTimeType);
        if (timeTypeRef.current) {
          timeTypeRef.current.value = newTimeType;
          timeTypeRef.current.dispatchEvent(new Event("input", { bubbles: true }));
        }
        console.log("✅ number-3 updated to:", newTimeType);
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingMode, dateVal, hourVal, minuteVal, ampmVal, timeType]);

  // ---- MutationObserver to force Forminator recalculation like your jQuery snippet ----
  useEffect(() => {
    const distanceEl = distanceRef.current;
    if (!distanceEl) return;

    const calcFields = document.querySelectorAll(".forminator-calculation");

    const observer = new MutationObserver(() => {
      console.log("📏 Distance updated — forcing recalculation");

      calcFields.forEach((el) => {
        // trigger native input event
        el.dispatchEvent(new Event("input", { bubbles: true }));
      });

      // nudge a watched field (Book Now/Later radio)
      const radio = document.querySelector('input[name="radio-1"]');
      if (radio) radio.dispatchEvent(new Event("change", { bubbles: true }));

      // if jQuery exists, trigger events like original
      if (window.jQuery) {
        try {
          window.jQuery(".forminator-calculation").each(function () {
            window.jQuery(this).trigger("input");
          });
          window.jQuery('input[name="radio-1"]').first().trigger("change");
        } catch (e) {
          // ignore
        }
      }
    });

    observer.observe(distanceEl, {
      attributes: true,
      attributeFilter: ["value"], // observe 'value' attribute changes
    });

    return () => observer.disconnect();
  }, [distanceRef.current]);

  // ---- Recalculate route automatically when user types destination/pickup text (to mirror place_changed firing) ----
  // If user has typed an address and not selected a geocode result, directionsService can still accept string origin/destination.
  useEffect(() => {
    // Throttle a bit: when user types, wait 600ms after last change
    const t = setTimeout(() => {
      if ((pickupLoc || pickup) && (destinationLoc || destination) && directionsServiceRef.current) {
        calculateRoute();
      }
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup, destination, pickupLoc, destinationLoc]);

  // ---- JSX UI ----
  return (
    <section className=" w-full  h-[83.4vh] overflow-y-scroll">
      <form>
        {/* Hidden inputs that mimic Forminator / your original DOM fields */}
        <input ref={distanceRef} name="number-1" type="hidden" value={distanceKm} readOnly />
        <input ref={tollRef} name="number-6" type="hidden" value={hasToll ? "1" : "0"} readOnly />
        <input ref={timeTypeRef} name="number-3" type="hidden" value={timeType} readOnly />

        {/* Step 1 */}
        <div className="px-5 py-6">
          <h3 className="text-sm mb-4 hidden md:flex">
            Step 1 of 4 <b>Booking details</b>
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

          <div className="mb-4 relative">
            <TextField
              label="Add destination(required)"
              variant="outlined"
              fullWidth
              required
              placeholder="Add your destination"
              value={destination}
              onChange={handleDestinationChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {destination ? (
                      <IconButton size="small" onClick={clearDestination}>
                        <span style={{ fontSize: 16 }}>✖</span>
                      </IconButton>
                    ) : null}
                  </InputAdornment>
                ),
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
                    <span className="font-medium">{s.structured_formatting.main_text}</span>
                    <span className="text-gray-500 ml-2 text-sm">{s.structured_formatting.secondary_text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-3 items-center align-center">
            <IoAddCircle size={20} />
            <span className="inline-block">Add Destination</span>
          </div>
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
        </div>

        {/* Step 4 Driver Instruction */}
        <div className="px-5 py-6">
          <h3 className="text-sm mt-2 mb-4">
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
      </form>
    </section>
  );
};

export default SideBar;
