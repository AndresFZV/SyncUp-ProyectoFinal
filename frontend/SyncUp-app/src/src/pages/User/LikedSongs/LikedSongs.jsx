import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaPlay, FaClock, FaPause } from 'react-icons/fa';
import styles from './LikedSongs.module.css';
import { useMusicPlayer } from '../../../contexts/MusicPlayerContext';
import { getCurrentUser } from '../../../services/authService';
import MultiSongRecommendations from '../../../components/MultiSongRecommendations/MultiSongRecommendations';
import { obtenerCancionesFavoritas, eliminarCancionFavorita } from '../../../services/usuariosService';

const LikedSongs = () => {
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying, pauseSong } = useMusicPlayer();
  const [canciones, setCanciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  let username = localStorage.getItem('userName');
  if (!username) {
    const currentUser = getCurrentUser();
    username = currentUser?.username;
  }

  useEffect(() => {
    if (!username) {
      navigate('/login');
      return;
    }
    cargarCanciones();
  }, []);

  const cargarCanciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerCancionesFavoritas(username);
      setCanciones(data);
    } catch (error) {
      console.error('Error al cargar canciones:', error);
      setError(error.message || 'Error al cargar canciones favoritas');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (cancionId, e) => {
    e.stopPropagation();
    
    try {
      await eliminarCancionFavorita(username, cancionId);
      
      setCanciones(prevCanciones => 
        prevCanciones.filter(cancion => cancion.cancionId !== cancionId)
      );
      
      console.log('✅ Canción eliminada de favoritos');
    } catch (error) {
      console.error('Error al eliminar de favoritos:', error);
      alert('Error al eliminar la canción de favoritos');
    }
  };

  const handlePlayAll = () => {
    if (canciones.length > 0) {
      playSong(canciones[0], canciones, 0);
    }
  };

  const handleSongClick = (cancion, index) => {
    if (isCurrentSong(cancion.cancionId)) {
      if (isPlaying) {
        pauseSong();
      } else {
        playSong(cancion, canciones, index);
      }
    } else {
      playSong(cancion, canciones, index);
    }
  };

  const isCurrentSong = (cancionId) => {
    return currentSong?.cancionId === cancionId || currentSong?.songId === cancionId;
  };

  const formatDuration = (duracion) => {
    const minutes = Math.floor(duracion);
    const seconds = Math.round((duracion % 1) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const formatDate = (fecha) => {
    return new Date().toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando canciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
        <button onClick={cargarCanciones} className={styles.retryButton}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.likedSongsPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.playlistIcon}>
            <FaHeart />
          </div>
          <div className={styles.playlistInfo}>
            <span className={styles.playlistType}>Lista</span>
            <h1 className={styles.playlistTitle}>Canciones que te gustan</h1>
            <div className={styles.playlistMeta}>
              <span>{username}</span>
              <span className={styles.dot}>•</span>
              <span>{canciones.length} canciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button 
          className={styles.playButton}
          onClick={handlePlayAll}
          disabled={canciones.length === 0}
        >
          {isPlaying && isCurrentSong(canciones[0]?.cancionId) ? <FaPause /> : <FaPlay />}
        </button>
      </div>

      {/* Songs Table */}
      <div className={styles.songsTable}>
        {/* Table Header */}
        <div className={styles.tableHeader}>
          <div className={styles.headerNumber}>#</div>
          <div className={styles.headerTitle}>Título</div>
          <div className={styles.headerAlbum}>Álbum</div>
          <div className={styles.headerDate}>Fecha en que se añadió</div>
          <div className={styles.headerLike}></div>
          <div className={styles.headerDuration}>
            <FaClock />
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Songs List */}
        {canciones.length > 0 ? (
          <>
            <div className={styles.songsList}>
              {canciones.map((cancion, index) => (
                <div
                  key={cancion.cancionId || index}
                  className={`${styles.songRow} ${isCurrentSong(cancion.cancionId) ? styles.playing : ''}`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => handleSongClick(cancion, index)}
                >
                  <div className={styles.songNumber}>
                    {hoveredRow === index || isCurrentSong(cancion.cancionId) ? (
                      isCurrentSong(cancion.cancionId) && isPlaying ? (
                        <div className={styles.playingIndicator}>
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : (
                        <FaPlay className={styles.playIcon} />
                      )
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <div className={styles.songInfo}>
                    <img 
                      src={cancion.imagenUrl || cancion.albumCover} 
                      alt={cancion.titulo}
                      className={styles.songImage}
                    />
                    <div className={styles.songDetails}>
                      <h4>{cancion.titulo}</h4>
                      <p>{cancion.artistaNombre}</p>
                    </div>
                  </div>

                  <div className={styles.songAlbum}>
                    {cancion.albumNombre}
                  </div>

                  <div className={styles.songDate}>
                    {formatDate()}
                  </div>

                  <div className={styles.songLike}>
                    <button
                      className={styles.likeButton}
                      onClick={(e) => handleRemoveFromFavorites(cancion.cancionId, e)}
                      title="Quitar de Canciones que te gustan"
                    >
                      <FaHeart className={styles.likeIcon} />
                    </button>
                  </div>

                  <div className={styles.songDuration}>
                    {formatDuration(cancion.duracion)}
                  </div>
                </div>
              ))}
            </div>

            {/* ← RECOMENDACIONES AGREGADAS AQUÍ */}
            <MultiSongRecommendations 
              canciones={canciones}
              limite={12}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <FaHeart />
            <p>No tienes canciones favoritas aún</p>
            <button onClick={() => navigate('/user/home')} className={styles.exploreButton}>
              Explorar música
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongs;