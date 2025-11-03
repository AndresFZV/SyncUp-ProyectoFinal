import React, { useState } from 'react';
import './AdminDashboard.css';
import GestionCanciones from '../GestionCanciones';  // ← Usa index.js
import GestionArtistas from '../GestionArtistas';    // ← Usa index.js
import GestionAlbumes from '../GestionAlbumes';      // ← Usa index.js

import CargaMasiva from '../CargaMasiva';            // ← Usa index.js
import Metricas from '../Metricas';                  // ← Usa index.js
import GestionUsuarios from '../GestionUsuario/GestionUsuarios';
import { FaMusic, FaUsers, FaUpload, FaChartBar, FaSignOutAlt, FaCompactDisc, FaMicrophone } from 'react-icons/fa';
import { RiAdminLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../services/authService';
import { ROUTES } from '../../../utils/constants';


// Configuración del menú (buena práctica: separar datos de lógica)
const MENU_ITEMS = [
  { id: 'canciones', label: 'Gestión de Canciones', icon: FaMusic },
  { id: 'artistas', label: 'Gestión de Artistas', icon: FaMicrophone },
  { id: 'albumes', label: 'Gestión de Álbumes', icon: FaCompactDisc },
  { id: 'usuarios', label: 'Gestión de Usuarios', icon: FaUsers },
  { id: 'carga', label: 'Carga Masiva', icon: FaUpload },
  { id: 'metricas', label: 'Métricas del Sistema', icon: FaChartBar },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState('canciones');

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const renderSeccion = () => {
    switch(seccionActiva) {
      case 'canciones':
        return <GestionCanciones />;
      case 'artistas':
        return <GestionArtistas />;
      case 'albumes':
        return <GestionAlbumes />;
      case 'usuarios':
        return <GestionUsuarios />;
      case 'carga':
        return <CargaMasiva />;
      case 'metricas':
        return <Metricas />;
      default:
        return <GestionCanciones />;
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <RiAdminLine size={32} />
          <h2>SyncUp Admin</h2>
        </div>

        <nav className="admin-nav">
          {MENU_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id}
                className={`nav-item ${seccionActiva === item.id ? 'active' : ''}`}
                onClick={() => setSeccionActiva(item.id)}
              >
                <Icon /> {item.label}
              </button>
            );
          })}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Cerrar Sesión
        </button>
      </aside>

      <main className="admin-content">
        {renderSeccion()}
      </main>
    </div>
  );
};

export default AdminDashboard;