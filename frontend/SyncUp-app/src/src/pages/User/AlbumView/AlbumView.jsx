import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaClock, FaHeart, FaRegHeart } from 'react-icons/fa';
import { MdMoreHoriz } from 'react-icons/md';
import styles from './AlbumView.module.css';
import { useMusicPlayer } from '../../../contexts/MusicPlayerContext';
import { obtenerAlbumPorId } from '../../../services/albumesService';
import { obtenerCancionesPorAlbum } from '../../../services/cancionesService';
import { getArtistaById } from '../../../services/artistasService';
import { 
  verificarAlbumFavorito, 
  agregarAlbumFavorito, 
  eliminarAlbumFavorito,
  verificarCancionFavorita,
  agregarCancionFavorita,
  eliminarCancionFavorita
} from '../../../services/favoritosService';
import SongRecommendations from '../../../components/SongRecommendations/SongRecommendations';

const AlbumView = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying } = useMusicPlayer();
  
  const [album, setAlbum] = useState(null);
  const [artista, setArtista] = useState(null);
  const [canciones, setCanciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAlbumFavorito, setIsAlbumFavorito] = useState(false);
  const [cancionesFavoritas, setCancionesFavoritas] = useState(new Set());
  const [procesando, setProcesando] = useState(false);

  const username = localStorage.getItem('userName');

  useEffect(() => {
    cargarAlbum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  const cargarAlbum = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Cargando álbum:', albumId);

      // Cargar datos del álbum
      const albumData = await obtenerAlbumPorId(albumId);
      console.log('📀 Álbum recibido:', albumData);
      setAlbum(albumData);

      // Verificar si el álbum es favorito
      const esFavorito = await verificarAlbumFavorito(username, albumId);
      setIsAlbumFavorito(esFavorito);

      // Cargar datos del artista
      if (albumData.artistaId) {
        try {
          const artistaData = await getArtistaById(albumData.artistaId);
          console.log('🎤 Artista recibido:', artistaData);
          setArtista(artistaData);
        } catch (err) {
          console.warn('No se pudo cargar el artista:', err);
        }
      }

      // Cargar canciones del álbum
      const cancionesData = await obtenerCancionesPorAlbum(albumId);
      console.log('🎵 Canciones recibidas:', cancionesData);
      setCanciones(cancionesData);

      // Verificar qué canciones son favoritas
      const favoritasSet = new Set();
      for (const cancion of cancionesData) {
        const cancionId = cancion.songId || cancion.cancionId;
        if (cancionId) {
          const esFavorita = await verificarCancionFavorita(username, cancionId);
          if (esFavorita) {
            favoritasSet.add(cancionId);
          }
        }
      }
      setCancionesFavoritas(favoritasSet);

    } catch (error) {
      console.error('❌ Error al cargar álbum:', error);
      setError(error.message || 'Error al cargar el álbum');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (canciones.length > 0) {
      playSong(canciones[0], canciones, 0);
    }
  };

  const handleSongClick = (cancion, index) => {
    playSong(cancion, canciones, index);
  };

  const handleToggleAlbumFavorito = async () => {
    if (procesando) return;

    try {
      setProcesando(true);

      if (isAlbumFavorito) {
        await eliminarAlbumFavorito(username, albumId);
        setIsAlbumFavorito(false);
        console.log('✅ Álbum quitado de favoritos');
      } else {
        await agregarAlbumFavorito(username, albumId);
        setIsAlbumFavorito(true);
        console.log('✅ Álbum agregado a favoritos');
      }

    } catch (error) {
      console.error('❌ Error al actualizar favorito:', error);
      alert('Error al actualizar favoritos');
    } finally {
      setProcesando(false);
    }
  };

  const handleToggleCancionFavorita = async (cancion, event) => {
    event.stopPropagation();

    const cancionId = cancion.songId || cancion.cancionId;
    if (!cancionId) return;

    try {
      const esFavorita = cancionesFavoritas.has(cancionId);

      if (esFavorita) {
        await eliminarCancionFavorita(username, cancionId);
        setCancionesFavoritas(prev => {
          const newSet = new Set(prev);
          newSet.delete(cancionId);
          return newSet;
        });
        console.log('✅ Canción quitada de favoritas');
      } else {
        await agregarCancionFavorita(username, cancionId);
        setCancionesFavoritas(prev => new Set(prev).add(cancionId));
        console.log('✅ Canción agregada a favoritas');
      }

    } catch (error) {
      console.error('❌ Error al actualizar canción favorita:', error);
      alert('Error al actualizar favoritos');
    }
  };

  const isCurrentSong = (cancionId) => {
    return currentSong?.cancionId === cancionId || 
           currentSong?.songId === cancionId;
  };

  const formatDuration = (duracion) => {
    const minutes = Math.floor(duracion);
    const seconds = Math.round((duracion % 1) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const calculateTotalDuration = () => {
    const total = canciones.reduce((sum, cancion) => sum + (cancion.duracion || 0), 0);
    const hours = Math.floor(total / 60);
    const minutes = Math.round(total % 60);
    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando álbum...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
        <button onClick={cargarAlbum} className={styles.retryButton}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!album) return null;

  return (
    <div className={styles.albumPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.albumCover}>
            <img src={album.imagenUrl} alt={album.nombre} />
          </div>
          <div className={styles.albumInfo}>
            <span className={styles.albumType}>Álbum</span>
            <h1 className={styles.albumTitle}>{album.nombre}</h1>
            <div className={styles.albumMeta}>
              {artista && (
                <>
                  <img 
                    src={artista.imagenUrl} 
                    alt={artista.nombre}
                    className={styles.artistImage}
                  />
                  <span 
                    className={styles.artistName} 
                    onClick={() => navigate(`/user/artist/${artista.artistId}`)}
                  >
                    {artista.nombre}
                  </span>
                  <span className={styles.dot}>•</span>
                </>
              )}
              <span>2016</span>
              <span className={styles.dot}>•</span>
              <span>{canciones.length} canciones</span>
              {canciones.length > 0 && (
                <>
                  <span className={styles.dot}>•</span>
                  <span>{calculateTotalDuration()}</span>
                </>
              )}
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
          <FaPlay />
        </button>

        <button 
          className={`${styles.favoriteButton} ${isAlbumFavorito ? styles.isFavorite : ''}`}
          onClick={handleToggleAlbumFavorito}
          disabled={procesando}
          title={isAlbumFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          {isAlbumFavorito ? <FaHeart /> : <FaRegHeart />}
        </button>

        <button className={styles.moreButton}>
          <MdMoreHoriz />
        </button>
      </div>

      {/* Songs List */}
      <div className={styles.songsSection}>
        <div className={styles.songsHeader}>
          <div className={styles.headerNumber}>#</div>
          <div className={styles.headerTitle}>Título</div>
          <div className={styles.headerLike}></div>
          <div className={styles.headerDuration}>
            <FaClock />
          </div>
        </div>

        <div className={styles.divider}></div>

        {canciones.length > 0 ? (
          <div className={styles.songsList}>
            {canciones.map((cancion, index) => {
              const cancionId = cancion.songId || cancion.cancionId;
              const esFavorita = cancionesFavoritas.has(cancionId);

              return (
                <div
                  key={cancionId || index}
                  className={`${styles.songRow} ${isCurrentSong(cancionId) ? styles.playing : ''}`}
                  onClick={() => handleSongClick(cancion, index)}
                >
                  <div className={styles.songNumber}>
                    {isCurrentSong(cancionId) && isPlaying ? (
                      <div className={styles.playingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <div className={styles.songInfo}>
                    <div className={styles.songDetails}>
                      <h4>{cancion.titulo}</h4>
                      <p>{cancion.artistaNombre || album.artistaNombre}</p>
                    </div>
                  </div>

                  <div className={styles.songLike}>
                    <button
                      className={`${styles.likeButton} ${esFavorita ? styles.liked : ''}`}
                      onClick={(e) => handleToggleCancionFavorita(cancion, e)}
                      title={esFavorita ? 'Quitar de favoritas' : 'Agregar a favoritas'}
                    >
                      {esFavorita ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </div>

                  <div className={styles.songDuration}>
                    {formatDuration(cancion.duracion)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No hay canciones disponibles</p>
          </div>
        )}
      </div>

      {/* Album Info Footer */}
      <div className={styles.albumFooter}>
        <p className={styles.releaseDate}>
          {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        {album.descripcion && (
          <div className={styles.description}>
            <p>{album.descripcion}</p>
          </div>
        )}
      </div>

      {/* Recomendaciones */}
      {currentSong && canciones.some(c => 
        (c.songId === currentSong.songId) || (c.cancionId === currentSong.cancionId)
      ) && (
        <SongRecommendations 
          cancionActual={currentSong} 
          limite={6} 
        />
      )}
    </div>
  );
};

export default AlbumView;