import MapSection from "../components/map/MapSection.jsx";
import Navbar from "../components/navbar/Navbar.jsx";
import NavSection from "../components/navSection/NavSection.jsx";
import SideBar from "../components/SideBar.jsx";

const Home = () => {
  return (
    <>
      <Navbar />
      <NavSection />
      <div className="flex">
        <SideBar className="w-[25%]" />
        <MapSection className="w-[75%]" />
      </div>
    </>
  );
};

export default Home;
