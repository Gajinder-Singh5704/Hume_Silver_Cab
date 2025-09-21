import MapSection from "../components/map/MapSection.jsx";
import Navbar from "../components/navbar/Navbar.jsx";
import NavSection from "../components/navSection/NavSection.jsx";
import SideBar from "../components/SideBar.jsx";
import { useState } from "react";

const Home = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [destinations, setSelectedDestinations] = useState([]);

  return (
    <>
      <Navbar />
      <NavSection onPlaceSelect={setSelectedPlace} />

      <div className="hidden md:flex w-full h-[calc(100vh-100px)]">
        <div className="w-[380px] border-r">
          <SideBar
            onPickupSelect={setSelectedPickup}
            onDestinationsSelect={setSelectedDestinations}
          />
        </div>
        <div className="flex-1">
          <MapSection
            selectedPlace={selectedPlace}
            selectedPickup={selectedPickup}
            destinations={destinations}
          />
        </div>
      </div>

      <div className="flex flex-col md:hidden w-full h-[calc(100vh-100px)]">
        <div className="h-[50vh]">
          <MapSection
            selectedPlace={selectedPlace}
            selectedPickup={selectedPickup}
            destinations={destinations}
          />
        </div>
        <div className="h-[50vh] overflow-y-auto border-t">
          <SideBar
            onPickupSelect={setSelectedPickup}
            onDestinationsSelect={setSelectedDestinations}
          />
        </div>
      </div>
    </>
  );
};

export default Home;
