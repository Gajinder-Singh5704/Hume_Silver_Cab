import MapSection from "../components/map/MapSection.jsx";
import Navbar from "../components/navbar/Navbar.jsx";
import NavSection from "../components/navSection/NavSection.jsx";
import SideBar from "../components/SideBar.jsx";
import { useState } from "react";

const Home = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);

  return (
    <>
      <Navbar />
      <NavSection onPlaceSelect={setSelectedPlace} />

      {/* Desktop / Tablet */}
      <div className="hidden md:flex w-full h-[calc(100vh-100px)]">
        {/* Sidebar takes 25% */}
        <div className="w-[27%] border-r">
          <SideBar onPickupSelect={setSelectedPickup} />
        </div>

        {/* Map takes 75% */}
        <div className="w-[73%]">
          <MapSection selectedPlace={selectedPlace} selectedPickup={selectedPickup} />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col md:hidden w-full h-[calc(100vh-100px)]">
        {/* Map top half */}
        <div className="h-[50vh]">
          <MapSection selectedPlace={selectedPlace} selectedPickup={selectedPickup} />
        </div>

        {/* Sidebar bottom half */}
        <div className="h-[50vh] overflow-y-auto border-t">
          <SideBar onPickupSelect={setSelectedPickup} />
        </div>
      </div>
    </>
  );
};

export default Home;
