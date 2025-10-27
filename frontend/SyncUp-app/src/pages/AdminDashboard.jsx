import React, { useState } from 'react';
import './AdminDashboard.css';
import GestionCanciones from './GestionCanciones';
import GestionArtistas from './GestionArtistas';
import GestionAlbumes from './GestionAlbumes';
import GestionUsuarios from './GestionUsuarios';
import CargaMasiva from './CargaMasiva';
import Metricas from './Metricas';
import { FaMusic, FaUsers, FaUpload, FaChartBar, FaSignOutAlt, FaCompactDisc, FaMicrophone } from 'react-icons/fa';
import { RiAdminLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState('canciones');

  const handleLogout = () => {
    navigate('/login');
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
          <button 
            className={`nav-item ${seccionActiva === 'canciones' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('canciones')}
          >
            <FaMusic /> Gestión de Canciones
          </button>

          <button 
            className={`nav-item ${seccionActiva === 'artistas' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('artistas')}
          >
            <FaMicrophone /> Gestión de Artistas
          </button>

          <button 
            className={`nav-item ${seccionActiva === 'albumes' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('albumes')}
          >
            <FaCompactDisc /> Gestión de Álbumes
          </button>

          <button 
            className={`nav-item ${seccionActiva === 'usuarios' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('usuarios')}
          >
            <FaUsers /> Gestión de Usuarios
          </button>

          <button 
            className={`nav-item ${seccionActiva === 'carga' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('carga')}
          >
            <FaUpload /> Carga Masiva
          </button>

          <button 
            className={`nav-item ${seccionActiva === 'metricas' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('metricas')}
          >
            <FaChartBar /> Métricas del Sistema
          </button>
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