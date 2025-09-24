import React, { createContext, useContext, useState, useEffect } from "react";

const BookingContext = createContext();



export const BookingProvider = ({ children }) => {
  const initialState = {
    pickup: "",
    pickupLoc: null,
    destinations: [""],
    destinationLocs: [],
    passenger: "",
    contact: "",
    instruction: "",
    selectedCar: null,
    selectedPayment: null,
    isOn: true,
    tollPrice: 0,
    distanceKm: "",
    hasToll: false,
    seatCount: "",

  };

  const [bookingData, setBookingData] = useState(initialState);

  const resetBooking = () => setBookingData(initialState);

  // Reset on browser reload
  useEffect(() => {
    const handleReload = () => {
      resetBooking();
    };
    window.addEventListener("beforeunload", handleReload);
    return () => {
      window.removeEventListener("beforeunload", handleReload);
    };
  }, []);

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);