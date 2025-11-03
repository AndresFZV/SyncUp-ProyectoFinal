import React, { useState, useEffect } from 'react';
import './Metricas.css';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { FaMusic, FaUsers, FaCompactDisc, FaChartLine } from 'react-icons/fa';
import { getAllCanciones } from '../../../services/cancionesService';
import { getAllArtistas } from '../../../services/artistasService';
import { getUsuariosMasSeguidos } from "../../../services/usuariosService";


// Configuración de colores para gráficos
const CHART_COLORS = [
  '#8a2be2', 
  '#6a1bb2', 
  '#ff6b9d', 
  '#4ecdc4', 
  '#45b7d1', 
  '#f7b731', 
  '#5f27cd', 
  '#00d2d3'
];

// Configuración de cards de métricas
const METRIC_CARDS_CONFIG = [
  {
    key: 'totalCanciones',
    label: 'Total Canciones',
    icon: FaMusic,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    key: 'totalUsuarios',
    label: 'Total Usuarios',
    icon: FaUsers,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    key: 'totalArtistas',
    label: 'Total Artistas',
    icon: FaCompactDisc,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    key: 'totalGeneros',
    label: 'Géneros Musicales',
    icon: FaChartLine,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
];

const Metricas = () => {
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    totalCanciones: 0,
    totalUsuarios: 0,
    totalArtistas: 0,
    totalGeneros: 0,
    cancionesPorGenero: [],
    artistasPopulares: [],
    usuariosActivos: []
  });

  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    setLoading(true);
    try {
      // Cargar datos en paralelo
      const [canciones, artistas, usuariosMasSeguidos] = await Promise.all([
        getAllCanciones(),
        getAllArtistas(),
        getUsuariosMasSeguidos()
      ]);

      // Procesar datos de canciones
      const { generos, cancionesPorArtista } = procesarCanciones(canciones);

      // Preparar datos para gráficos
      const cancionesPorGenero = convertirObjetoAArray(generos, 'name', 'value');
      const artistasPopulares = obtenerTopArtistas(cancionesPorArtista, 10);
      const usuariosActivos = obtenerTopUsuarios(usuariosMasSeguidos, 5);

      setMetricas({
        totalCanciones: canciones.length,
        totalUsuarios: usuariosMasSeguidos.length,
        totalArtistas: artistas.length,
        totalGeneros: Object.keys(generos).length,
        cancionesPorGenero,
        artistasPopulares,
        usuariosActivos
      });
    } catch (error) {
      console.error('Error al cargar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Procesar canciones para extraer géneros y canciones por artista
  const procesarCanciones = (canciones) => {
    const generos = {};
    const cancionesPorArtista = {};

    canciones.forEach(cancion => {
      // Contar géneros
      if (cancion.genero) {
        generos[cancion.genero] = (generos[cancion.genero] || 0) + 1;
      }
      
      // Contar canciones por artista
      if (cancion.artistaNombre) {
        cancionesPorArtista[cancion.artistaNombre] = 
          (cancionesPorArtista[cancion.artistaNombre] || 0) + 1;
      }
    });

    return { generos, cancionesPorArtista };
  };

  // Convertir objeto a array para gráficos
  const convertirObjetoAArray = (objeto, keyName, valueName) => {
    return Object.entries(objeto).map(([key, value]) => ({
      [keyName]: key,
      [valueName]: value
    }));
  };

  // Obtener top N artistas por cantidad de canciones
  const obtenerTopArtistas = (cancionesPorArtista, limite) => {
    return Object.entries(cancionesPorArtista)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limite)
      .map(([name, canciones]) => ({
        name,
        canciones
      }));
  };

  // Obtener top N usuarios más seguidos
  const obtenerTopUsuarios = (usuarios, limite) => {
    return usuarios
      .slice(0, limite)
      .map(u => ({
        name: u.username,
        seguidores: u.seguidores,
        listaSeguidores: u.listaSeguidores || []
      }));
  };

  // Componente de Tooltip personalizado para usuarios
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="custom-tooltip">
        <p className="tooltip-username">{data.name}</p>
        <p className="tooltip-seguidores">{data.seguidores} seguidores</p>
        
        {data.listaSeguidores && data.listaSeguidores.length > 0 ? (
          <div className="tooltip-lista">
            <p className="tooltip-lista-titulo">Lo siguen:</p>
            <ul className="tooltip-lista-items">
              {data.listaSeguidores.map((seguidor, idx) => (
                <li key={idx}>{seguidor}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="tooltip-sin-seguidores">Sin seguidores</p>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Cargando métricas...</div>;
  }

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <h1>Métricas del Sistema</h1>
      </div>

      {/* Cards de resumen */}
      <div className="metrics-cards">
        {METRIC_CARDS_CONFIG.map(card => {
          const Icon = card.icon;
          const value = card.key === 'totalGeneros' 
            ? metricas.cancionesPorGenero.length 
            : metricas[card.key];

          return (
            <div 
              key={card.key}
              className="metric-card" 
              style={{ background: card.gradient }}
            >
              <div className="metric-icon">
                <Icon size={32} />
              </div>
              <div className="metric-info">
                <h3>{value}</h3>
                <p>{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Pie Chart - Distribución de Géneros */}
        <div className="chart-container">
          <h3>Distribución de Géneros Musicales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metricas.cancionesPorGenero}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {metricas.cancionesPorGenero.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Artistas más populares */}
        <div className="chart-container">
          <h3>Top 10 Artistas Con Más Canciones</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricas.artistasPopulares}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="canciones" fill="#8a2be2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Usuarios con más seguidores */}
        <div className="chart-container full-width">
          <h3>Usuarios Más Seguidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricas.usuariosActivos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="seguidores" 
                stroke="#8a2be2" 
                strokeWidth={3} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Metricas;