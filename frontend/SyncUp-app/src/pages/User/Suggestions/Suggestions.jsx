import React, { useState, useEffect } from 'react';
import { FaUsers, FaSpinner, FaUserFriends, FaFilter, FaProjectDiagram } from 'react-icons/fa';
import styles from './Suggestions.module.css';
import UserSuggestionCard from './UserSuggestionCard';
import GraphVisualization from './GraphVisualization';
import { obtenerSugerencias } from '../../../services/grafoSocialService';

const Suggestions = () => {
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limite, setLimite] = useState(12);
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'conexiones', 'populares'
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);

  const currentUsername = localStorage.getItem('userName');

  useEffect(() => {
    cargarSugerencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarSugerencias = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await obtenerSugerencias(currentUsername, limite);
      
      console.log('📊 Sugerencias recibidas:', data);
      setSugerencias(data.sugerencias || []);
      
    } catch (error) {
      console.error('❌ Error al cargar sugerencias:', error);
      setError(error.message || 'Error al cargar sugerencias');
    } finally {
      setLoading(false);
    }
  };

  const handleSeguir = (username) => {
    // Eliminar de la lista cuando se sigue a un usuario
    setSugerencias(prev => prev.filter(u => u.username !== username));
  };

  const handleCargarMas = () => {
    setLimite(prev => prev + 12);
    cargarSugerencias();
  };

  const handleRefresh = () => {
    setLimite(12);
    cargarSugerencias();
  };

  // Filtrar sugerencias
  const sugerenciasFiltradas = sugerencias.filter(sugerencia => {
    if (filtro === 'conexiones') {
      return sugerencia.conexionesComunes > 0;
    }
    if (filtro === 'populares') {
      return sugerencia.seguidores > 100; // Umbral ajustable
    }
    return true; // 'todas'
  });

  // Ordenar sugerencias
  const sugerenciasOrdenadas = [...sugerenciasFiltradas].sort((a, b) => {
    // Primero por score (ya viene ordenado del backend)
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Luego por conexiones en común
    if (b.conexionesComunes !== a.conexionesComunes) {
      return b.conexionesComunes - a.conexionesComunes;
    }
    // Finalmente por seguidores
    return b.seguidores - a.seguidores;
  });

  if (loading && sugerencias.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <h2>Buscando personas para ti...</h2>
        <p>Analizando tus conexiones con BFS</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FaUserFriends className={styles.errorIcon} />
        <h2>Error al cargar sugerencias</h2>
        <p>{error}</p>
        <button onClick={handleRefresh} className={styles.btnReintentar}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.suggestionsPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <FaUsers className={styles.headerIcon} />
          <div className={styles.headerText}>
            <h1>Personas que podrían gustarte</h1>
            <p>Basado en tus conexiones y usuarios populares</p>
          </div>
        </div>

        {/* Controles */}
        <div className={styles.controles}>
          <button 
            className={styles.btnGrafo}
            onClick={() => setShowGraphModal(true)}
            title="Visualizar Grafo Social (RF-023, RF-024)"
          >
            <FaProjectDiagram /> GRAFO
          </button>
          <button 
            className={styles.btnFiltros}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <FaFilter /> Filtros
          </button>
          
          <button 
            className={styles.btnRefresh}
            onClick={handleRefresh}
            disabled={loading}
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className={styles.filtrosPanel}>
          <div className={styles.filtrosGrid}>
            <button
              className={`${styles.filtroBtn} ${filtro === 'todas' ? styles.activo : ''}`}
              onClick={() => setFiltro('todas')}
            >
              Todas las sugerencias
              <span className={styles.count}>{sugerencias.length}</span>
            </button>
            
            <button
              className={`${styles.filtroBtn} ${filtro === 'conexiones' ? styles.activo : ''}`}
              onClick={() => setFiltro('conexiones')}
            >
              Con conexiones en común
              <span className={styles.count}>
                {sugerencias.filter(s => s.conexionesComunes > 0).length}
              </span>
            </button>
            
            <button
              className={`${styles.filtroBtn} ${filtro === 'populares' ? styles.activo : ''}`}
              onClick={() => setFiltro('populares')}
            >
              Usuarios populares
              <span className={styles.count}>
                {sugerencias.filter(s => s.seguidores > 100).length}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className={styles.estadisticas}>
        <div className={styles.statBox}>
          <span className={styles.statNumber}>{sugerenciasOrdenadas.length}</span>
          <span className={styles.statLabel}>Sugerencias</span>
        </div>
        
        <div className={styles.statBox}>
          <span className={styles.statNumber}>
            {sugerencias.filter(s => s.conexionesComunes > 0).length}
          </span>
          <span className={styles.statLabel}>Con conexiones</span>
        </div>
        
        <div className={styles.statBox}>
          <span className={styles.statNumber}>
            {sugerencias.filter(s => s.gradoSeparacion === 2).length}
          </span>
          <span className={styles.statLabel}>Nivel 2 (BFS)</span>
        </div>
      </div>

      {/* Grid de sugerencias */}
      {sugerenciasOrdenadas.length > 0 ? (
        <>
          <div className={styles.sugerenciasGrid}>
            {sugerenciasOrdenadas.map((usuario) => (
              <UserSuggestionCard
                key={usuario.username}
                usuario={usuario}
                onSeguir={handleSeguir}
              />
            ))}
          </div>

          {/* Botón cargar más */}
          {sugerencias.length >= limite && (
            <div className={styles.cargarMasContainer}>
              <button
                className={styles.btnCargarMas}
                onClick={handleCargarMas}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className={styles.spinnerBtn} />
                    Cargando...
                  </>
                ) : (
                  'Cargar más sugerencias'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <FaUserFriends className={styles.emptyIcon} />
          <h2>No hay sugerencias disponibles</h2>
          <p>
            {filtro !== 'todas' 
              ? 'Prueba cambiando los filtros para ver más opciones'
              : 'Ya sigues a todos los usuarios sugeridos o no hay usuarios compatibles en este momento'
            }
          </p>
          {filtro !== 'todas' && (
            <button 
              className={styles.btnMostrarTodas}
              onClick={() => setFiltro('todas')}
            >
              Mostrar todas las sugerencias
            </button>
          )}
        </div>
      )}

      {/* Footer informativo */}
      <div className={styles.infoFooter}>
        <div className={styles.infoCard}>
          <h3>💡 ¿Cómo funcionan las sugerencias?</h3>
          <p>
            Utilizamos el algoritmo <strong>BFS (Breadth-First Search)</strong> para encontrar 
            "amigos de amigos" en el grafo social. Las sugerencias se ordenan por:
          </p>
          <ul>
            <li><strong>Conexiones en común:</strong> Usuarios que compartes con tus amigos</li>
            <li><strong>Popularidad:</strong> Número de seguidores del usuario</li>
            <li><strong>Proximidad:</strong> Grado de separación en la red social</li>
          </ul>
        </div>
      </div>
      {/* ← MODAL DEL GRAFO */}
      {showGraphModal && (
        <GraphVisualization onClose={() => setShowGraphModal(false)} />
      )}
    </div>
  );
};

export default Suggestions;