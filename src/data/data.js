import images from "../assets/images";
// navbar 
export const navItems = [
    // { label: "Fare estimate", path: "/fare-estimate" },
    // { label: "Book a taxi", path: "/book-taxi" },
    { label: "Company website", path: "/company" },
    { label: "Contact us", path: "/contact" },
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
      id: 'sedan',
      name: 'Sedan',
      passengers: '1 - 4 passengers',
      image: images.sedan,
      fareEstimate: 'Fare Estimate',
      destRequired: 'Dest required',
      color: 'bg-gray-100'
    },
    {
      id: 'silver-service',
      name: 'Silver Service',
      passengers: '1 - 4 passengers',
      image: images.silver,
      fareEstimate: 'Fare Estimate',
      destRequired: 'Dest required',
      color: 'bg-gray-100'
    },
    {
      id: 'suv',
      name: 'SUV',
      passengers: '1 - 6 passengers',
      image: images.suv,
      fareEstimate: 'Fare Estimate',
      destRequired: 'Dest required',
      color: 'bg-gray-50'
    },
    {
      id: 'maxi-taxi',
      name: 'MAXI TAXI',
      passengers: '1 - 11 passengers',
      image: images.maxi,
      fareEstimate: 'Fare Estimate',
      destRequired: 'Dest required',
      color: 'bg-gray-100'
    }
  ];

  // paymnet options
export const defaultPaymentOptions = [
    {
      id: 'card',
      name: 'Credit Card / Debit Card',
      description: '**** **** **** 4567',
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
      type: 'Primary',
      status: 'Default',
      color: 'bg-blue-50',
      brand: 'Visa,MasterCard'
    },
    {
      id: 'pay-driver-directly',
      name: 'Pay Driver Directly',
      description: 'Cash or card to driver',
      icon: <Wallet className="w-6 h-6 text-orange-600" />,
      type: 'Direct',
      status: 'Available',
      color: 'bg-orange-50',
      brand: 'Direct'
    },
    {
      id: 'CabCharge FastCard',
      name: 'CabCharge FastCard',
      description: 'Saved payment method',
      icon: <img src={images.cabcharge} alt="Cabcharge" className="w-6 h-6 object-contain" />,
      type: 'Digital',
      status: 'Available',
      color: 'bg-blue-50',
      brand: 'FastCard'
    }
  ];