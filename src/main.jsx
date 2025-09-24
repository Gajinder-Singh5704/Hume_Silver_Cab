import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { BookingProvider } from "./components/context/BookingContect.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <BookingProvider>
      <App />
      </BookingProvider>
    </BrowserRouter>
  </StrictMode>
);
