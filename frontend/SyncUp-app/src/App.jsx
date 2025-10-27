import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./pages/Login";
import Slider from "./pages/Slider";
import SobreNosotros from "./pages/SobreNosotros";
import Registro from "./pages/Registro";
import RecuperarPassword from "./pages/RecuperarPassword";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function AppContent() {
  const location = useLocation();
  
  // Ocultar Navbar si la ruta comienza con /admin
  const mostrarNavbar = !location.pathname.startsWith('/admin');

  return (
    <>
      {mostrarNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/caracteristicas" element={<Slider />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;