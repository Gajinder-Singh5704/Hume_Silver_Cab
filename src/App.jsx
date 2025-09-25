import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import { ToastContainer } from "react-toastify";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>}/>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
