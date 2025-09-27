import MapSection from "../components/map/MapSection.jsx";
import Navbar from "../components/navbar/Navbar.jsx";
import NavSection from "../components/navSection/NavSection.jsx";
import { useEffect, useState } from "react";
import SideBar from "../components/sidebar/SideBar.jsx";

const Home = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isVehicleDetailOpen, setIsVehicleDetailOpen] = useState(false);
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmall = screenSize < 640;

  return (
    <>
      {/* Navbar + NavSection */}
      {((isSmall && !isVehicleDetailOpen) || !isSmall) && (
        <>
          <Navbar />
          <NavSection onPlaceSelect={setSelectedPlace} />
        </>
      )}

      {/* Wrapper: page scroll on small; fixed height on md+ */}
      <div className="flex flex-col md:flex-row w-full md:h-[calc(100vh-125px)]">
        {/* Sidebar */}
        <div
          className={`
            ${((isSmall && !isVehicleDetailOpen) || !isSmall) ? "md:w-[410px]" : "w-full"}
            md:border-r order-2 md:order-1
            border-t md:border-t-0
            overflow-visible md:overflow-y-auto
          `}
        >
          <SideBar
            onPickupSelect={setSelectedPickup}
            onDestinationSelect={setSelectedDestination}
            onVehicleDetailOpenChange={setIsVehicleDetailOpen}
          />
        </div>

        {/* Map Section */}
        <div className="order-1 md:flex-1 md:order-2 md:h-full">
          {((isSmall && !isVehicleDetailOpen) || !isSmall) && (
            <div className="h-[40vh] md:h-full">
              <MapSection
                selectedPlace={selectedPlace}
                selectedPickup={selectedPickup}
                selectedDestination={selectedDestination}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
