import { Routes, Route } from "react-router-dom";
import { seatDetails } from "./data/data.jsx";
import Home from "./pages/home.jsx";

function App() {

  console.log("object", seatDetails["MAXI TAXI"])
  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>}/>
      </Routes>
    </>
  );
}

export default App;
