import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Estilos globales
import "./styles/global.css";

// Layout
import Navbar from "./components/layout/Navbar";

// Pages - Public
import Home from "./pages/Home";
import Caracteristicas from "./pages/Caracteristicas";
import SobreNosotros from "./pages/SobreNosotros";

// Pages - Auth
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import RecoverPassword from "./pages/Auth/RecoverPassword";

// Pages - Admin
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard";

// Pages - User
import UserDashboard from "./pages/User/UserDashboard/UserDashboard";

function AppContent() {
  const location = useLocation();
  
  // No mostrar Navbar pública en rutas admin, user o auth
  const mostrarNavbar = !location.pathname.startsWith('/admin') && 
                        !location.pathname.startsWith('/user')

  return (
    <>
      {mostrarNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/caracteristicas" element={<Caracteristicas />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar-password" element={<RecoverPassword />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        {/* User Routes */}
        <Route path="/user/*" element={<UserDashboard />} />
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