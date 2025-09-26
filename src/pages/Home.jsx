import MapSection from "../components/map/MapSection.jsx";
import Navbar from "../components/navbar/Navbar.jsx";
import NavSection from "../components/navSection/NavSection.jsx";
import { useEffect, useState } from "react";
import SideBar from "../components/sidebar/SideBar.jsx";

const Home = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [destinations, setSelectedDestinations] = useState([]);
  const [isVehicleDetailOpen,setIsVehicleDetailOpen] = useState(false)
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

   const isSmall = screenSize < 640;     
  // console.log("SELECTED PLACE IS : " , selectedPlace)
  return (
   <>
  {/* Navbar + NavSection */}
  {((isSmall && !isVehicleDetailOpen) || !isSmall) && (
    <>
      <Navbar />
      <NavSection onPlaceSelect={setSelectedPlace} />
    </>
  )}

  {/* Wrapper handles both sm & lg */}
  <div className="flex flex-col md:flex-row w-full h-[calc(100vh-125px)]">
    {/* Sidebar */}
    <div
      className={`
        ${((isSmall && !isVehicleDetailOpen) || !isSmall) ? "md:w-[410px]": "w-full min-h-screen " }
        md:border-r order-2 md:order-1
        h-[50vh] md:h-auto border-t md:border-t-0
        overflow-y-auto
      `}
    >
      <SideBar
        onPickupSelect={setSelectedPickup}
        onDestinationsSelect={setSelectedDestinations}
        onVehicleDetailOpenChange={setIsVehicleDetailOpen}
      />
    </div>

    {/* Map Section */}
    <div className=" order-1 md:flex-1 md:order-2 min-h-[44vh] md:h-auto">
      {((isSmall && !isVehicleDetailOpen) || !isSmall) && (
        <MapSection
          selectedPlace={selectedPlace}
          selectedPickup={selectedPickup}
          destinations={destinations}
        />
      )}
    </div>
  </div>
</>

  );
};

export default Home;
