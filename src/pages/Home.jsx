import MapSection from "../components/map/MapSection.jsx";
import Navbar from "../components/navbar/Navbar.jsx";
import NavSection from "../components/navSection/NavSection.jsx";
import SideBar from "../components/SideBar.jsx";
import { useState } from "react";

const Home = () => {
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [selectedPickup,setSelectedPickup] = useState(null)
  return (
    <>
      <Navbar />
      <NavSection onPlaceSelect={setSelectedPlace} />
      <div className="flex">
        <SideBar className="w-[25%]" onPickupSelect={setSelectedPickup} />
        <MapSection className="w-[75%]" selectedPlace={selectedPlace} selectedPickup = {selectedPickup} />
      </div>
    </>
  );
};

export default Home;
