import React, { useState, useEffect } from 'react';
import './GestionComun.css';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FaMusic, FaUsers, FaCompactDisc, FaChartLine } from 'react-icons/fa';

const Metricas = () => {
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    totalCanciones: 0,
    totalUsuarios: 0,
    totalArtistas: 0,
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
    // Obtener canciones
    const cancionesRes = await fetch('http://localhost:8080/api/canciones');
    const canciones = await cancionesRes.json();

    // Obtener usuarios
    const usuariosRes = await fetch('http://localhost:8080/api/usuarios');
    const usuarios = await usuariosRes.json();

    // Obtener artistas directamente
    const artistasRes = await fetch('http://localhost:8080/api/artistas');
    const artistas = await artistasRes.json();

    // Procesar datos
    const generos = {};
    const cancionesPorArtista = {};

    canciones.forEach(cancion => {
      // Contar géneros
      if (cancion.genero) {
        generos[cancion.genero] = (generos[cancion.genero] || 0) + 1;
      }
      
      // Contar canciones por artista usando artistaNombre
      if (cancion.artistaNombre) {
        cancionesPorArtista[cancion.artistaNombre] = (cancionesPorArtista[cancion.artistaNombre] || 0) + 1;
      }
    });

    // Convertir a arrays para los gráficos
    const cancionesPorGenero = Object.entries(generos).map(([name, value]) => ({
      name,
      value
    }));

    const artistasPopulares = Object.entries(cancionesPorArtista)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, canciones]) => ({
        name,
        canciones
      }));

    // Usuarios más seguidos (ordenados por cantidad de seguidores)
    const usuariosOrdenados = usuarios
      .sort((a, b) => (b.seguidores?.length || 0) - (a.seguidores?.length || 0))
      .slice(0, 5)
      .map(u => ({
        name: u.username,
        seguidores: u.seguidores?.length || 0
      }));

    console.log('📊 DEBUG MÉTRICAS:');
    console.log('Total canciones:', canciones.length);
    console.log('Total usuarios:', usuarios.length);
    console.log('Total artistas:', artistas.length);
    console.log('Artistas en BD:', artistas.map(a => a.nombre));
    console.log('Canciones por artista:', cancionesPorArtista);

    setMetricas({
      totalCanciones: canciones.length,
      totalUsuarios: usuarios.length,
      totalArtistas: artistas.length, // ← Usar el count directo de artistas
      cancionesPorGenero,
      artistasPopulares,
      usuariosActivos: usuariosOrdenados
    });
  } catch (error) {
    console.error('Error al cargar métricas:', error);
  } finally {
    setLoading(false);
  }
};

  const COLORS = ['#8a2be2', '#6a1bb2', '#ff6b9d', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3'];

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
        <div className="metric-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="metric-icon">
            <FaMusic size={32} />
          </div>
          <div className="metric-info">
            <h3>{metricas.totalCanciones}</h3>
            <p>Total Canciones</p>
          </div>
        </div>

        <div className="metric-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <div className="metric-icon">
            <FaUsers size={32} />
          </div>
          <div className="metric-info">
            <h3>{metricas.totalUsuarios}</h3>
            <p>Total Usuarios</p>
          </div>
        </div>

        <div className="metric-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <div className="metric-icon">
            <FaCompactDisc size={32} />
          </div>
          <div className="metric-info">
            <h3>{metricas.totalArtistas}</h3>
            <p>Total Artistas</p>
          </div>
        </div>

        <div className="metric-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <div className="metric-icon">
            <FaChartLine size={32} />
          </div>
          <div className="metric-info">
            <h3>{metricas.cancionesPorGenero.length}</h3>
            <p>Géneros Musicales</p>
          </div>
        </div>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Artistas más populares */}
        <div className="chart-container">
          <h3>Top 10 Artistas Más Populares</h3>
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
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="seguidores" stroke="#8a2be2" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style jsx>{`
        .metrics-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .metric-card {
          padding: 25px;
          border-radius: 15px;
          color: white;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .metric-icon {
          background: rgba(255, 255, 255, 0.2);
          padding: 15px;
          border-radius: 12px;
        }

        .metric-info h3 {
          font-size: 32px;
          margin: 0 0 5px 0;
          font-weight: 700;
        }

        .metric-info p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 25px;
        }

        .chart-container {
          background: white;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .chart-container.full-width {
          grid-column: 1 / -1;
        }

        .chart-container h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }

          .metric-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Metricas;