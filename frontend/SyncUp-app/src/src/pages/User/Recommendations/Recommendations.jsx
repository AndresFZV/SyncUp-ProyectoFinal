import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaMusic, FaRandom, FaRoute } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './Recommendations.module.css';
import { getCancionesSimilares, getRutaSimilitud } from '../../../services/grafoService';
import { getAllCanciones } from '../../../services/cancionesService';
import { useMusicPlayer } from '../../../contexts/MusicPlayerContext';

const Recommendations = () => {
  const [cancionBase, setCancionBase] = useState(null);
  const [todasCanciones, setTodasCanciones] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarRuta, setMostrarRuta] = useState(false);
  const [rutaSimilitud, setRutaSimilitud] = useState(null);
  const { playSong, currentSong, isPlaying, pauseSong } = useMusicPlayer();
  const navigate = useNavigate();

  useEffect(() => {
    cargarCanciones();
  }, []);

  useEffect(() => {
    // ← VERIFICAR SI HAY UNA CANCIÓN BASE EN LOCALSTORAGE
    const cancionGuardada = localStorage.getItem('cancionBaseRecomendaciones');
    
    if (cancionGuardada) {
      try {
        const cancion = JSON.parse(cancionGuardada);
        setCancionBase(cancion);
        cargarRecomendaciones(cancion.songId);
        // Limpiar localStorage después de usarlo
        localStorage.removeItem('cancionBaseRecomendaciones');
      } catch (error) {
        console.error('Error al parsear canción guardada:', error);
      }
    } else if (currentSong) {
      setCancionBase(currentSong);
      cargarRecomendaciones(currentSong.songId);
    }
  }, [currentSong]);

  const cargarCanciones = async () => {
    try {
      const data = await getAllCanciones();
      setTodasCanciones(data);
      
      // Si no hay canción actual ni guardada, seleccionar una aleatoria
      if (!currentSong && !localStorage.getItem('cancionBaseRecomendaciones') && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        const cancion = data[randomIndex];
        setCancionBase(cancion);
        cargarRecomendaciones(cancion.songId);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarRecomendaciones = async (cancionId) => {
    setLoading(true);
    try {
      const data = await getCancionesSimilares(cancionId, 20);
      setRecomendaciones(data);
    } catch (error) {
      console.error('Error:', error);
      setRecomendaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarCancionAleatoria = () => {
    if (todasCanciones.length > 0) {
      const randomIndex = Math.floor(Math.random() * todasCanciones.length);
      const cancion = todasCanciones[randomIndex];
      setCancionBase(cancion);
      cargarRecomendaciones(cancion.songId);
      setMostrarRuta(false);
      setRutaSimilitud(null);
    }
  };

const buscarRutaSimilitud = async (cancionDestinoId) => {
  if (!cancionBase) {
    alert('❌ No hay canción base seleccionada');
    return;
  }

  console.log('🔍 Buscando ruta:');
  console.log('   Origen:', cancionBase.songId, '-', cancionBase.titulo);
  console.log('   Destino:', cancionDestinoId);

  setLoading(true);
  try {
    const data = await getRutaSimilitud(cancionBase.songId, cancionDestinoId);
    
    console.log('✅ Respuesta del servidor:', data);
    
    // Verificar si la ruta tiene al menos 2 canciones
    if (!data.ruta || data.ruta.length < 2) {
      alert(
        '🎵 No existe una conexión directa entre estas canciones.\n\n' +
        'Las canciones están muy alejadas en el grafo de similitud.\n\n' +
        'Intenta con otra canción más similar.'
      );
      return;
    }
    
    setRutaSimilitud(data);
    setMostrarRuta(true);
    
    console.log('✅ Ruta mostrada:', data.ruta.length, 'pasos');
    
  } catch (error) {
    console.error('❌ Error al buscar ruta:', error);
    console.error('   Detalles:', error.response?.data || error.message);
    
    alert(
      '🎵 No se encontró una ruta entre estas canciones.\n\n' +
      'Error: ' + (error.response?.data?.mensaje || error.message) + '\n\n' +
      '💡 Tip: Intenta con canciones del mismo género o artista.'
    );
  } finally {
    setLoading(false);
  }
};

  const handlePlaySong = (cancion, index) => {
    if (currentSong?.songId === cancion.songId) {
      if (isPlaying) {
        pauseSong();
      } else {
        playSong(cancion, recomendaciones, index);
      }
    } else {
      playSong(cancion, recomendaciones, index);
    }
  };

  const formatDuration = (duracion) => {
    const minutes = Math.floor(duracion);
    const seconds = Math.round((duracion % 1) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className={styles.recommendationsPage}>
      <div className={styles.header}>
        <h1>Descubre Música Similar</h1>
        <p>Encuentra canciones parecidas usando inteligencia artificial basada en grafos</p>
      </div>

      {cancionBase && (
        <div className={styles.baseSection}>
          <h2>Explorando música similar a:</h2>
          <div className={styles.baseSong}>
            <img src={cancionBase.imagenUrl} alt={cancionBase.titulo} />
            <div className={styles.baseSongInfo}>
              <h3>{cancionBase.titulo}</h3>
              <p>{cancionBase.artistaNombre}</p>
              <span className={styles.genre}>{cancionBase.genero}</span>
            </div>
            <button 
              className={styles.randomButton}
              onClick={seleccionarCancionAleatoria}
            >
              <FaRandom /> Cambiar canción
            </button>
          </div>
        </div>
      )}

      {/* Ruta de similitud (Dijkstra) */}
{mostrarRuta && rutaSimilitud && (
  <div className={styles.rutaSection}>
    <h2>
      <FaRoute /> Ruta de Similitud (Algoritmo de Dijkstra)
    </h2>
    <p className={styles.rutaInfo}>
      Pasos: {rutaSimilitud.cantidadPasos} | Similitud total: {rutaSimilitud.similitudTotal}
    </p>
    <div className={styles.rutaFlow}>
      {rutaSimilitud.ruta.map((cancion, index) => (
        <React.Fragment key={`ruta-${cancion.songId}-${index}`}> {/* ← CAMBIO AQUÍ */}
          <div className={styles.rutaCancion}>
            <img src={cancion.imagenUrl} alt={cancion.titulo} />
            <div>
              <h4>{cancion.titulo}</h4>
              <p>{cancion.artistaNombre}</p>
            </div>
          </div>
          {index < rutaSimilitud.ruta.length - 1 && (
            <div className={styles.rutaArrow}>→</div>
          )}
        </React.Fragment>
      ))}
    </div>
    <button 
      className={styles.closeRutaButton}
      onClick={() => setMostrarRuta(false)}
    >
      Cerrar ruta
    </button>
  </div>
)}

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Analizando similitudes con algoritmos de grafos...</p>
        </div>
      ) : recomendaciones.length > 0 ? (
        <>
          <div className={styles.statsBar}>
            <p>
              Mostrando <strong>{recomendaciones.length}</strong> canciones similares
            </p>
          </div>
          
          <div className={styles.recommendationsGrid}>
            {recomendaciones.map((cancion, index) => (
              <div
                key={cancion.songId}
                className={`${styles.songCard} ${
                  currentSong?.songId === cancion.songId ? styles.playing : ''
                }`}
              >
                <div className={styles.songImage} onClick={() => handlePlaySong(cancion, index)}>
                  <img src={cancion.imagenUrl} alt={cancion.titulo} />
                  <div className={styles.playOverlay}>
                    {currentSong?.songId === cancion.songId && isPlaying ? (
                      <FaPause />
                    ) : (
                      <FaPlay />
                    )}
                  </div>
                </div>
                <div className={styles.songDetails}>
                  <h4>{cancion.titulo}</h4>
                  <p>{cancion.artistaNombre}</p>
                  <div className={styles.meta}>
                    <span className={styles.badge}>{cancion.genero}</span>
                    <span className={styles.duration}>
                      {formatDuration(cancion.duracion)}
                    </span>
                  </div>
                  <button
                    className={styles.findRouteButton}
                    onClick={() => buscarRutaSimilitud(cancion.songId)}
                    title="Ver ruta de similitud"
                  >
                    <FaRoute /> Ruta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <FaMusic size={64} />
          <h3>No hay recomendaciones disponibles</h3>
          <p>Reproduce una canción para comenzar</p>
          <button 
            className={styles.exploreButton}
            onClick={seleccionarCancionAleatoria}
          >
            <FaRandom /> Explorar aleatoriamente
          </button>
        </div>
      )}
    </div>
  );
};

export default Recommendations;