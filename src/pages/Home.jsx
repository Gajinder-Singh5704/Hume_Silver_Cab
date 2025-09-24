import MapSection from "../components/map/MapSection.jsx";
import Navbar from "../components/navbar/Navbar.jsx";
import NavSection from "../components/navSection/NavSection.jsx";
import { useState } from "react";
import SideBar from "../components/sidebar/SideBar.jsx";

const Home = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [destinations, setSelectedDestinations] = useState([]);
  const [isVehicleDetailOpen,setIsVehicleDetailOpen] = useState(false)

  return (
    <>
      {!isVehicleDetailOpen && <Navbar/>}
      
       {!isVehicleDetailOpen && <NavSection onPlaceSelect={setSelectedPlace} />}

      {/* Wrapper handles both sm & lg */}
      <div className="flex flex-col md:flex-row w-full h-[calc(100vh-125px)]">
        
        {/* Sidebar */}
        <div className="md:w-[410px] md:border-r order-2 md:order-1 h-[50vh] md:h-auto border-t md:border-t-0 overflow-y-auto">
          <SideBar
            onPickupSelect={setSelectedPickup}
            onDestinationsSelect={setSelectedDestinations}
          />
        </div>

        {/* Map Section */}
        <div className="flex-1 order-1 md:order-2 h-[50vh] md:h-auto">
          {!isVehicleDetailOpen && <MapSection
            selectedPlace={selectedPlace}
            selectedPickup={selectedPickup}
            destinations={destinations}
          />}
        </div>
      </div>
    </>
  );
};

export default Home;
