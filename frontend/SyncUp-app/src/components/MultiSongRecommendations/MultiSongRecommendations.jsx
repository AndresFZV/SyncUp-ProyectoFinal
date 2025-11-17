import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaMusic } from 'react-icons/fa';
import styles from './MultiSongRecommendations.module.css';
import { getCancionesSimilares } from '../../services/grafoService';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';

/**
 * Componente que genera recomendaciones musicales basadas en múltiples canciones de referencia
 * Utiliza un grafo de similitudes para encontrar canciones relacionadas
 * 
 * @param {Array} canciones - Lista de canciones de referencia para generar recomendaciones
 * @param {number} limite - Número máximo de recomendaciones a mostrar (por defecto 12)
 */
const MultiSongRecommendations = ({ canciones, limite = 12 }) => {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playSong, currentSong, isPlaying, pauseSong } = useMusicPlayer();

  useEffect(() => {
    if (canciones && canciones.length > 0) {
      cargarRecomendacionesMixtas();
    }
  }, [canciones]);

  /**
   * Carga recomendaciones combinadas basadas en las canciones de referencia
   * Analiza hasta 5 canciones y combina sus recomendaciones
   */
  const cargarRecomendacionesMixtas = async () => {
    setLoading(true);
    
    try {
      const todasRecomendaciones = [];
      const cancionesParaAnalizar = canciones.slice(0, Math.min(5, canciones.length));
      
      for (const cancion of cancionesParaAnalizar) {
        try {
          const cancionId = cancion.cancionId || cancion.songId;
          
          if (!cancionId) {
            continue;
          }
          
          const recs = await getCancionesSimilares(cancionId, 15);
          todasRecomendaciones.push(...recs);
          
        } catch (error) {
          console.error('Error cargando recomendaciones para canción:', error);
        }
      }

      // Filtrar duplicados y canciones ya en favoritos
      const idsUnicos = new Map();
      const idsFavoritos = new Set(canciones.map(c => c.cancionId || c.songId));
      
      todasRecomendaciones.forEach(rec => {
        const recId = rec.songId || rec.cancionId;
        
        if (!idsFavoritos.has(recId)) {
          if (idsUnicos.has(recId)) {
            const existing = idsUnicos.get(recId);
            idsUnicos.set(recId, {
              cancion: rec,
              frecuencia: existing.frecuencia + 1
            });
          } else {
            idsUnicos.set(recId, {
              cancion: rec,
              frecuencia: 1
            });
          }
        }
      });

      // Ordenar por frecuencia y aplicar límite
      const recsOrdenadas = Array.from(idsUnicos.values())
        .sort((a, b) => b.frecuencia - a.frecuencia)
        .map(item => item.cancion)
        .slice(0, limite);

      setRecomendaciones(recsOrdenadas);
      
    } catch (error) {
      console.error('Error general cargando recomendaciones:', error);
      setRecomendaciones([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la reproducción/pausa de una canción
   * @param {Object} cancion - Canción a reproducir
   * @param {number} index - Índice de la canción en la lista
   */
  const handlePlaySong = (cancion, index) => {
    const cancionId = cancion.songId || cancion.cancionId;
    const currentId = currentSong?.songId || currentSong?.cancionId;
    
    if (currentId === cancionId) {
      if (isPlaying) {
        pauseSong();
      } else {
        playSong(cancion, recomendaciones, index);
      }
    } else {
      playSong(cancion, recomendaciones, index);
    }
  };

  /**
   * Formatea la duración de segundos a formato mm:ss
   * @param {number} duracion - Duración en segundos
   * @returns {string} Duración formateada
   */
  const formatDuration = (duracion) => {
    const minutes = Math.floor(duracion);
    const seconds = Math.round((duracion % 1) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Analizando tus gustos musicales...</p>
      </div>
    );
  }

  if (recomendaciones.length === 0) {
    return null;
  }

  return (
    <div className={styles.recommendationsContainer}>
      <div className={styles.header}>
        <h2>Recomendaciones personalizadas</h2>
        <p className={styles.subtitle}>
          Basadas en tus {canciones.length} canciones favoritas
        </p>
      </div>

      <div className={styles.songsList}>
        {recomendaciones.map((cancion, index) => {
          const cancionId = cancion.songId || cancion.cancionId;
          const currentId = currentSong?.songId || currentSong?.cancionId;
          const isCurrentPlaying = currentId === cancionId && isPlaying;
          
          return (
            <div
              key={cancionId || `rec-${index}`}
              className={`${styles.songCard} ${isCurrentPlaying ? styles.playing : ''}`}
            >
              <div className={styles.songImage}>
                <img 
                  src={cancion.imagenUrl} 
                  alt={cancion.titulo}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
                <button
                  className={styles.playButton}
                  onClick={() => handlePlaySong(cancion, index)}
                >
                  {isCurrentPlaying ? <FaPause /> : <FaPlay />}
                </button>
              </div>

              <div className={styles.songInfo}>
                <h4 className={styles.songTitle}>{cancion.titulo}</h4>
                <p className={styles.songArtist}>{cancion.artistaNombre}</p>
                <div className={styles.songMeta}>
                  <span className={styles.genre}>{cancion.genero}</span>
                  <span className={styles.duration}>
                    {formatDuration(cancion.duracion)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiSongRecommendations;