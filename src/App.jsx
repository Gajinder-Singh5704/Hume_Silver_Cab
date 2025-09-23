import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import SideBar from "./components/sidebar/SideBar.jsx";
import Seatdetails from "./components/sidebar/SeatDetails.jsx";
import { seatDetails } from "./data/data.jsx";

function App() {

  console.log("object", seatDetails["MAXI TAXI"])
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<SideBar />} />
          <Route
            path="Next-Available"
            element={<Seatdetails data={seatDetails["Next Available"]} />}
          />
          <Route
            path="Silver-Service"
            element={<Seatdetails data={seatDetails["Silver Service"]} />}
          />
          <Route
            path="Suv"
            element={<Seatdetails data={seatDetails["Suv"]} />}
          />
          <Route
            path="Maxi-Taxi"
            element={<Seatdetails data={seatDetails["Maxi Taxi"]} />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
