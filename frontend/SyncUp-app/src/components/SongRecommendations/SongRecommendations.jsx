import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaMusic, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './SongRecommendations.module.css';
import { getCancionesSimilares } from '../../services/grafoService';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';

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

  const isCurrentSong = (cancionId) => {
    return currentSong?.songId === cancionId;
  };

  const formatDuration = (duracion) => {
    const minutes = Math.floor(duracion);
    const seconds = Math.round((duracion % 1) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  // ← NUEVA FUNCIÓN: Navegar con la canción actual
  const handleVerTodas = () => {
    // Guardar la canción base en localStorage para que Recommendations la use
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

      {/* ← BOTÓN ACTUALIZADO */}
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