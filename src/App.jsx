import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import { ToastContainer } from "react-toastify";
import {Toaster} from "react-hot-toast"

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>}/>
      </Routes>
      <Toaster position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
