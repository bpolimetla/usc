import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Apts from "./Apts.jsx";
import AptsList from "./AptsList.jsx";
import About from "./About.jsx";
import SfoWells from "./SfoWells.jsx";
import LaWells from "./LaWells.jsx";
import SanDiegoWells from "./SanDiegoWells.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/apts" element={<Apts />} />
        <Route path="/apts-list" element={<AptsList />} />
        <Route path="/about" element={<About />} />
        <Route path="/wells/sfo" element={<SfoWells />} />
        <Route path="/wells/la" element={<LaWells />} />
        <Route path="/wells/san-diego" element={<SanDiegoWells />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
