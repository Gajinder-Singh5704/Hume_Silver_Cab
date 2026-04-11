// src/constants/sidebar-constants.js
// Centralized constants used by SideBar component

// Helper to get current time in Melbourne as a Date object
export const getMelbourneNow = () =>
  new Date(
    new Date().toLocaleString("en-US", { timeZone: "Australia/Melbourne" })
  );

export const COLORS = {
  FIXED_ORANGE: "#F4BA40", // used as fixedColor in SideBar
};

export const LIMITS = {
  MAX_DESTINATIONS: 4,
};

export const FEES = {
  BOOKING_FEE: 3.32,
  MIN_FARE: 40,
  AIRPORT_SURCHARGE: 4.68,
};

// Vehicle specific surcharges (names used in code)
export const VEHICLE_SURCHARGES = {
  Sedan: 0,
  SilverService: 11,
  SUV: 27,
  MaxiTaxi: 27,
};

// Time type constants (to make the magic numbers explicit)
export const TIME_TYPE = {
  NORMAL: 1,
  SHOULDER: 2,
  OVERNIGHT_WEEKEND: 3,
};

// Fare rate multipliers for each time type
export const FARE_RATES = {
  [TIME_TYPE.OVERNIGHT_WEEKEND]: {
    baseFlat: 0,
    perKm: 2.493,
    flagFall: 7.8,
  },
  [TIME_TYPE.SHOULDER]: {
    baseFlat: 0,
    perKm: 2.265,
    flagFall: 6.55,
  },
  [TIME_TYPE.NORMAL]: {
    baseFlat: 0,
    perKm: 2.037,
    flagFall: 5.25,
  },
};

// Google Places Autocomplete options reused in the component
export const AUTOCOMPLETE_OPTIONS = {
  componentRestrictions: { country: "au" },
  fields: ["formatted_address", "geometry"],
};

// Regex / validation constants
export const CONTACT = {
  AU_PHONE_PREFIX: "+61",
  LOCAL_DIGITS_REQUIRED: 9,
  LOCAL_PATTERN: "[0-9]{9}",
};

// Export single default object for one-import usage
const SIDEBAR_CONSTANTS = {
  getMelbourneNow,
  COLORS,
  LIMITS,
  FEES,
  VEHICLE_SURCHARGES,
  TIME_TYPE,
  FARE_RATES,
  AUTOCOMPLETE_OPTIONS,
  CONTACT,
};

export default SIDEBAR_CONSTANTS;