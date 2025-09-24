import { createContext, useContext, useEffect, useState } from "react";

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

  useEffect(() => {
    const handleReload = () => {
      resetBooking;
    };
    window.addEventListener("beforeunload", handleReload);
    return () => {
      window.removeEventListener("beforeunload", handleReload);
    };
  },[])
return (
    <BookingContext.Provider value={{bookingData,setBookingData,resetBooking}}>
        {children}
    </BookingContext.Provider>
)
};

export const useBooking = () => useContext(BookingContext);
