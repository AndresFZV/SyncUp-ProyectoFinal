import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaMusic, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './SongRecommendations.module.css';
import { getCancionesSimilares } from '../../services/grafoService';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';

/**
 * Componente que muestra recomendaciones de canciones similares a la canción actual
 * Utiliza un grafo de similitudes para encontrar canciones relacionadas por género, artista, álbum y época
 * 
 * @param {Object} cancionActual - Canción de referencia para generar recomendaciones
 * @param {number} limite - Número máximo de recomendaciones a mostrar (por defecto 6)
 */
const SongRecommendations = ({ cancionActual, limite = 6 }) => {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playSong, currentSong, isPlaying, pauseSong } = useMusicPlayer();
  const navigate = useNavigate();

  useEffect(() => {
    if (cancionActual?.songId) {
      cargarRecomendaciones();
    }
  }, [cancionActual?.songId]);

  /**
   * Carga las canciones similares desde el servicio de grafo
   */
  const cargarRecomendaciones = async () => {
    if (!cancionActual?.songId) return;

    setLoading(true);
    try {
      const data = await getCancionesSimilares(cancionActual.songId, limite);
      setRecomendaciones(data);
    } catch (error) {
      console.error('Error al cargar recomendaciones:', error);
      setRecomendaciones([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la reproducción/pausa de una canción recomendada
   * @param {Object} cancion - Canción a reproducir
   * @param {number} index - Índice de la canción en la lista
   */
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

  /**
   * Verifica si una canción es la que se está reproduciendo actualmente
   * @param {string} cancionId - ID de la canción a verificar
   * @returns {boolean} True si es la canción actual
   */
  const isCurrentSong = (cancionId) => {
    return currentSong?.songId === cancionId;
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

  /**
   * Navega a la página de recomendaciones completas guardando la canción base
   */
  const handleVerTodas = () => {
    localStorage.setItem('cancionBaseRecomendaciones', JSON.stringify(cancionActual));
    navigate('/user/recommendations');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Buscando canciones similares...</p>
      </div>
    );
  }

  if (!cancionActual) {
    return (
      <div className={styles.emptyState}>
        <FaMusic size={48} />
        <p>Reproduce una canción para obtener recomendaciones</p>
      </div>
    );
  }

  if (recomendaciones.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FaMusic size={48} />
        <p>No se encontraron canciones similares</p>
      </div>
    );
  }

  return (
    <div className={styles.recommendationsContainer}>
      <div className={styles.header}>
        <h2>Canciones similares a "{cancionActual.titulo}"</h2>
        <p className={styles.subtitle}>
          Basado en género, artista, álbum y época
        </p>
      </div>

      <div className={styles.songsList}>
        {recomendaciones.map((cancion, index) => (
          <div
            key={cancion.songId}
            className={`${styles.songCard} ${
              isCurrentSong(cancion.songId) ? styles.playing : ''
            }`}
          >
            <div className={styles.songImage}>
              <img src={cancion.imagenUrl} alt={cancion.titulo} />
              <button
                className={styles.playButton}
                onClick={() => handlePlaySong(cancion, index)}
              >
                {isCurrentSong(cancion.songId) && isPlaying ? (
                  <FaPause />
                ) : (
                  <FaPlay />
                )}
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
        ))}
      </div>

      <button
        className={styles.viewAllButton}
        onClick={handleVerTodas}
      >
        Ver todas las recomendaciones <FaArrowRight />
      </button>
    </div>
  );
};

export default SongRecommendations;