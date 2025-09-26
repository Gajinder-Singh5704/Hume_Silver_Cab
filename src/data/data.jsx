import images from "../assets/images";
import { CreditCard, IdCard, Wallet } from "lucide-react";

// navbar
export const navItems = [
  // { label: "Fare estimate", path: "/fare-estimate" },
  // { label: "Book a taxi", path: "/book-taxi" },
  { label: "Company website", path: "https://humesilvercabservices.com.au/book-taxi-online-melbourne/" },
  { label: "Contact us", path: "https://humesilvercabservices.com.au/contact-us/" },
];

export const mdNavItems = [
  "Fare estimate",
  "Book a taxi",
  "Company website",
  "Contact us",
];

// car drop down data
export const defaultVehicleOptions = [
  {
    id: "Next-Available",
    name: "Next Available",
    passengers: "1 - 4 passengers",
    image: images.sedan,
    fareEstimate: "Fare Estimate",
    destRequired: "Dest required",
    color: "bg-gray-100",
  },
  {
    id: "silver-service",
    name: "Silver Service",
    passengers: "1 - 4 passengers",
    image: images.silver,
    fareEstimate: "Fare Estimate",
    destRequired: "Dest required",
    color: "bg-gray-100",
  },
  {
    id: "suv",
    name: "SUV",
    passengers: "1 - 6 passengers",
    image: images.suv,
    fareEstimate: "Fare Estimate",
    destRequired: "Dest required",
    color: "bg-gray-50",
  },
  {
    id: "maxi-taxi",
    name: "MAXI TAXI",
    passengers: "1 - 11 passengers",
    image: images.maxi,
    fareEstimate: "Fare Estimate",
    destRequired: "Dest required",
    color: "bg-gray-100",
  },
];

// paymnet options
export const defaultPaymentOptions = [
  {
    id: "pay-driver-directly",
    name: "Pay Driver Directly",
    description: "Cash or card to driver",
    icon: <Wallet className="w-6 h-6 text-orange-600" />,
    type: "Direct",
    status: "Default",
    color: "bg-orange-50",
    brand: "Direct",
  },
  {
    id: "card",
    name: "Credit Card / Debit Card",
    description: "**** **** **** 4567",
    icon: <CreditCard className="w-6 h-6 text-blue-600" />,
    type: "Primary",
    status: "Available",
    color: "bg-blue-50",
    brand: "Visa,MasterCard",
  },
  
  {
    id: "CabCharge FastCard",
    name: "CabCharge FastCard",
    description: "Saved payment method",
    icon: (
      <img
        src={images.cabcharge}
        alt="Cabcharge"
        className="w-6 h-6 object-contain"
      />
    ),
    type: "Digital",
    status: "Available",
    color: "bg-blue-50",
    brand: "FastCard",
  },

  {
    id: "MPTP",
    name: "MPTP",   
    icon: <IdCard className="w-6 h-6 text-blue-600" />,    
  },
];

// Car seats data
export const seatDetails = {
  "Next Available": {
    name: "Next Available",
    capacity: "1 - 4 passengers",
    image: "sedan",
    imageDecs:
      "In a hurry? We'll get you there as soon as possible by sending the next available car!",
    path: "",
  },
  "Silver Service": {
    name: "Silver Service",
    capacity: "1 - 4 passengers",
    image: "silver",
    imageDecs:
      "We all deserve a little Silver Service occasionally. Travel in a luxurious long wheelbase sedan with a professional driver who’ll get you there in style.",
    path: "",
  },
  "Suv": {
    name: "SUV",
    capacity: "1 - 6 passengers",
    image: "suv",
    imageDecs:
      "In a hurry? We'll get you there as soon as possible by sending the next available car!",
    path: "",
  },
  "Maxi Taxi": {
    name: "Maxi Taxi",
    capacity: "1 - 11 passengers",
    image: "maxi",
    imageDecs:
      "Traveling in a group? We'll get you there. Our fleet of MAXI TAXIS are the perfect option.",
    path: "",
  },
};