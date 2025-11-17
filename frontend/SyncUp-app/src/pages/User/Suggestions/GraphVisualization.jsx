import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network } from 'vis-network/standalone';
import { FaTimes, FaSpinner, FaUser, FaProjectDiagram, FaFilter } from 'react-icons/fa';
import styles from './GraphVisualization.module.css';
import { obtenerEstadisticas, obtenerEstructuraGrafo } from '../../../services/grafoSocialService';

const GraphVisualization = ({ onClose }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [estructuraCompleta, setEstructuraCompleta] = useState(null);
  
  // Estados para filtros
  const [nivelesActivos, setNivelesActivos] = useState({
    nivel0: true,  // Tú
    nivel1: true,  // Amigos directos
    nivel2: true   // Amigos de amigos
  });
  
  const currentUsername = localStorage.getItem('userName');

  useEffect(() => {
    loadGraphData();
    
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar grafo cuando cambien los filtros
  useEffect(() => {
    if (estructuraCompleta) {
      renderizarGrafo(estructuraCompleta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivelesActivos]);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener estadísticas del grafo
      const estadisticas = await obtenerEstadisticas();
      setStats(estadisticas);
      
      // Obtener estructura completa del grafo
      const estructura = await obtenerEstructuraGrafo(currentUsername, 2);
      
      console.log('📊 Estructura del grafo:', estructura);
      
      setEstructuraCompleta(estructura);
      renderizarGrafo(estructura);
      
    } catch (error) {
      console.error('❌ Error al cargar grafo:', error);
      setError(error.message || 'Error al cargar el grafo');
    } finally {
      setLoading(false);
    }
  };

  const renderizarGrafo = (estructura) => {
    if (!estructura || !containerRef.current) return;

    // Filtrar nodos según niveles activos
    const nodosFiltrados = estructura.nodos.filter(nodo => {
      if (nodo.nivel === 0) return nivelesActivos.nivel0;
      if (nodo.nivel === 1) return nivelesActivos.nivel1;
      if (nodo.nivel === 2) return nivelesActivos.nivel2;
      return false;
    });

    // Crear set de IDs de nodos visibles
    const nodosVisiblesIds = new Set(nodosFiltrados.map(n => n.id));

    // Filtrar aristas: solo mostrar si ambos nodos están visibles
    const aristasFiltradas = estructura.aristas.filter(arista => 
      nodosVisiblesIds.has(arista.from) && nodosVisiblesIds.has(arista.to)
    );

    // Construir nodos
    const nodes = nodosFiltrados.map(nodo => {
      const nivel = nodo.nivel;
      let color, size, fontSize, borderWidth;
      
      // Estilo según nivel
      if (nivel === 0) {
        color = {
          background: '#a435f0',
          border: '#8a2be2',
          highlight: {
            background: '#8a2be2',
            border: '#6a1ba2'
          }
        };
        size = 30;
        fontSize = 16;
        borderWidth = 3;
      } else if (nivel === 1) {
        color = {
          background: '#1db954',
          border: '#1ed760',
          highlight: {
            background: '#1ed760',
            border: '#1db954'
          }
        };
        size = 20;
        fontSize = 14;
        borderWidth = 2;
      } else {
        color = {
          background: '#ffa500',
          border: '#ff8c00',
          highlight: {
            background: '#ff8c00',
            border: '#ff7700'
          }
        };
        size = 15;
        fontSize = 12;
        borderWidth = 2;
      }
      
      return {
        id: nodo.id,
        label: nodo.label,
        color: color,
        font: {
          color: '#ffffff',
          size: fontSize,
          bold: nivel === 0
        },
        size: size,
        borderWidth: borderWidth,
        title: `${nodo.label}\nNivel: ${nivel}\nConexiones: ${nodo.grado}`
      };
    });
    
    // Construir aristas
    const edges = aristasFiltradas.map(arista => {
      const fromNode = estructura.nodos.find(n => n.id === arista.from);
      const toNode = estructura.nodos.find(n => n.id === arista.to);
      
      const maxNivel = Math.max(fromNode?.nivel || 0, toNode?.nivel || 0);
      
      let color, width, dashes;
      
      if (maxNivel === 1) {
        color = {
          color: '#1db954',
          highlight: '#1ed760'
        };
        width = 2;
        dashes = false;
      } else {
        color = {
          color: 'rgba(255, 165, 0, 0.5)',
          highlight: 'rgba(255, 140, 0, 0.8)'
        };
        width = 1.5;
        dashes = true;
      }
      
      return {
        from: arista.from,
        to: arista.to,
        color: color,
        width: width,
        dashes: dashes
      };
    });
    
    // Crear la red
    const data = { nodes, edges };
    
    const options = {
      physics: {
        enabled: true,
        stabilization: {
          iterations: 150,
          updateInterval: 25
        },
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.5,
          springLength: 150,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.3
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true,
        navigationButtons: true,
        keyboard: true
      },
      nodes: {
        shape: 'dot',
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.3)',
          size: 10,
          x: 2,
          y: 2
        }
      },
      edges: {
        smooth: {
          type: 'continuous',
          roundness: 0.5
        },
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.1)',
          size: 5,
          x: 1,
          y: 1
        }
      }
    };
    
    // Destruir red anterior si existe
    if (networkRef.current) {
      networkRef.current.destroy();
    }

    // Crear nueva red
    if (containerRef.current) {
      networkRef.current = new Network(containerRef.current, data, options);
      
      // Eventos
      networkRef.current.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          setSelectedNode(nodeId);
        } else {
          setSelectedNode(null);
        }
      });
      
      networkRef.current.on('doubleClick', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          handleNodeDoubleClick(nodeId);
        }
      });
      
      // Centrar en el usuario después de estabilización
      networkRef.current.once('stabilizationIterationsDone', () => {
        networkRef.current.fit({
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
          }
        });
      });
    }
  };

  const handleNodeDoubleClick = (username) => {
    if (username === currentUsername) {
      navigate('/user/profile');
    } else {
      navigate(`/user/profile/${username}`);
    }
    onClose();
  };

  const handleNodeClick = (username) => {
    if (username === currentUsername) {
      navigate('/user/profile');
    } else {
      navigate(`/user/profile/${username}`);
    }
    onClose();
  };

  const toggleNivel = (nivel) => {
    setNivelesActivos(prev => ({
      ...prev,
      [nivel]: !prev[nivel]
    }));
  };

  const mostrarTodos = () => {
    setNivelesActivos({
      nivel0: true,
      nivel1: true,
      nivel2: true
    });
  };

  const ocultarTodos = () => {
    setNivelesActivos({
      nivel0: true,  // Siempre mostrar el usuario actual
      nivel1: false,
      nivel2: false
    });
  };

  // Calcular nodos visibles
  const nodosVisibles = estructuraCompleta 
    ? estructuraCompleta.nodos.filter(nodo => {
        if (nodo.nivel === 0) return nivelesActivos.nivel0;
        if (nodo.nivel === 1) return nivelesActivos.nivel1;
        if (nodo.nivel === 2) return nivelesActivos.nivel2;
        return false;
      }).length
    : 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <FaProjectDiagram className={styles.headerIcon} />
            <div>
              <h2>Visualización del Grafo Social</h2>
              <p>Grafo No Dirigido - Algoritmo BFS</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <FaUser />
              <span>{stats.totalNodos} Nodos totales</span>
            </div>
            <div className={styles.statItem}>
              <span>{stats.totalAristas} Conexiones</span>
            </div>
            <div className={styles.statItem}>
              <span>{nodosVisibles} Nodos visibles</span>
            </div>
            <div className={styles.statItem}>
              <span>Grado promedio: {stats.gradoPromedio?.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Panel de Filtros */}
        <div className={styles.filtrosPanel}>
          <div className={styles.filtrosHeader}>
            <FaFilter className={styles.filtrosIcon} />
            <h3>Filtros de Niveles</h3>
          </div>

          <div className={styles.filtrosGrid}>
            {/* Nivel 0 - Tú */}
            <button
              className={`${styles.filtroBtn} ${styles.nivel0} ${nivelesActivos.nivel0 ? styles.activo : styles.inactivo}`}
              onClick={() => toggleNivel('nivel0')}
              disabled={true} // Siempre debe estar visible
            >
              <div className={styles.filtroDot}></div>
              <div className={styles.filtroInfo}>
                <span className={styles.filtroLabel}>Tú (Nivel 0)</span>
                <span className={styles.filtroCount}>
                  {estructuraCompleta?.nodos.filter(n => n.nivel === 0).length || 0} nodo
                </span>
              </div>
            </button>

            {/* Nivel 1 - Amigos */}
            <button
              className={`${styles.filtroBtn} ${styles.nivel1} ${nivelesActivos.nivel1 ? styles.activo : styles.inactivo}`}
              onClick={() => toggleNivel('nivel1')}
            >
              <div className={styles.filtroDot}></div>
              <div className={styles.filtroInfo}>
                <span className={styles.filtroLabel}>Amigos (Nivel 1)</span>
                <span className={styles.filtroCount}>
                  {estructuraCompleta?.nodos.filter(n => n.nivel === 1).length || 0} nodos
                </span>
              </div>
            </button>

            {/* Nivel 2 - Amigos de amigos */}
            <button
              className={`${styles.filtroBtn} ${styles.nivel2} ${nivelesActivos.nivel2 ? styles.activo : styles.inactivo}`}
              onClick={() => toggleNivel('nivel2')}
            >
              <div className={styles.filtroDot}></div>
              <div className={styles.filtroInfo}>
                <span className={styles.filtroLabel}>Amigos de amigos (Nivel 2)</span>
                <span className={styles.filtroCount}>
                  {estructuraCompleta?.nodos.filter(n => n.nivel === 2).length || 0} nodos
                </span>
              </div>
            </button>
          </div>

          {/* Botones de acción rápida */}
          <div className={styles.filtrosActions}>
            <button className={styles.btnMostrarTodos} onClick={mostrarTodos}>
              Mostrar todos
            </button>
            <button className={styles.btnOcultarTodos} onClick={ocultarTodos}>
              Solo yo
            </button>
          </div>
        </div>

        {/* Leyenda */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.currentUser}`}></div>
            <span>Tú (Nivel 0)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.directFriend}`}></div>
            <span>Amigos (Nivel 1)</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.friendOfFriend}`}></div>
            <span>Amigos de amigos (Nivel 2)</span>
          </div>
        </div>

        {/* Contenedor del grafo */}
        <div className={styles.graphContainer}>
          {loading && (
            <div className={styles.loading}>
              <FaSpinner className={styles.spinner} />
              <p>Construyendo grafo social...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={loadGraphData} className={styles.retryButton}>
                Reintentar
              </button>
            </div>
          )}

          <div ref={containerRef} className={styles.networkCanvas}></div>
        </div>

        {/* Info del nodo seleccionado */}
        {selectedNode && (
          <div className={styles.nodeInfo}>
            <h3>
              <FaUser /> {selectedNode}
            </h3>
            <button
              className={styles.viewProfileButton}
              onClick={() => handleNodeClick(selectedNode)}
            >
              Ver perfil
            </button>
          </div>
        )}

        {/* Footer con instrucciones */}
        <div className={styles.footer}>
          <p>💡 <strong>Tip:</strong> Haz doble clic en un nodo para ir a su perfil • Usa los filtros para explorar por niveles</p>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualization;