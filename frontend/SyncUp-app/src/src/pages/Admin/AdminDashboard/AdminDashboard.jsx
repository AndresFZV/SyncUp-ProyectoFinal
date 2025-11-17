import React, { useState } from 'react';
import './AdminDashboard.css';
import GestionCanciones from '../GestionCanciones';
import GestionArtistas from '../GestionArtistas';
import GestionAlbumes from '../GestionAlbumes';
import CargaMasiva from '../CargaMasiva';
import Metricas from '../Metricas';
import GestionUsuarios from '../GestionUsuario/GestionUsuarios';
import { FaMusic, FaUsers, FaUpload, FaChartBar, FaSignOutAlt, FaCompactDisc, FaMicrophone, FaFileDownload } from 'react-icons/fa';
import { RiAdminLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../services/authService';
import { descargarReporteGlobal } from '../../../services/reportesService'; // ← NUEVO IMPORT
import { ROUTES } from '../../../utils/constants';

// Configuración del menú
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
  const [descargandoReporte, setDescargandoReporte] = useState(false); // ← NUEVO ESTADO

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  // ← NUEVA FUNCIÓN: Descargar reporte global
  const handleDescargarReporte = async () => {
    try {
      setDescargandoReporte(true);
      console.log('🔄 Iniciando descarga de reporte global...');
      
      await descargarReporteGlobal();
      
      console.log('✅ Reporte global descargado exitosamente');
      
      // Mostrar notificación de éxito (opcional)
      alert('✅ Reporte global descargado exitosamente');
      
    } catch (error) {
      console.error('❌ Error al descargar reporte global:', error);
      alert('❌ Error al generar el reporte global. Por favor, intenta de nuevo.');
    } finally {
      setDescargandoReporte(false);
    }
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

        {/* ← NUEVO BOTÓN: Descargar Reporte Global */}
        <button 
          className="report-btn" 
          onClick={handleDescargarReporte}
          disabled={descargandoReporte}
        >
          <FaFileDownload /> 
          {descargandoReporte ? 'Generando...' : 'Descargar Reporte Global'}
        </button>

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