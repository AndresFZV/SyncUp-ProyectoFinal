import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showAuthButtons, setShowAuthButtons] = useState(true);
  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/registro") {
      setShowAuthButtons(false);
    } else {
      setShowAuthButtons(true);
    }
  }, [location]);

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
        <img src="/img/logo.png" alt="SyncUp Logo" className="logo-img" />
      </div>
      <div className="nav-links">
        <button className="btn-caracteristicas" onClick={() => navigate("/caracteristicas")}>
          Características
        </button>
        <button className="btn-sobreNosotros" onClick={() => navigate("/sobre-nosotros")}>
          Sobre Nosotros
        </button>

        {showAuthButtons && (
          <>
            <button className="btn-login" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>
            <button className="btn-register" onClick={() => navigate("/registro")}>
              Registrarse
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
