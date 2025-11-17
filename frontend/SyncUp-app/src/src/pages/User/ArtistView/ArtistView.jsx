import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaHeart } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import styles from './ArtistView.module.css';
import { getArtistaById } from '../../../services/artistasService';
import { 
  agregarArtistaFavorito, 
  eliminarArtistaFavorito 
} from '../../../services/favoritosService';
import { getArtistasFavoritos } from '../../../services/favoritosService';
import { useMusicPlayer } from '../../../contexts/MusicPlayerContext';

const ArtistView = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying, pauseSong } = useMusicPlayer();
  
  const [artista, setArtista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [processingFavorite, setProcessingFavorite] = useState(false);
  
  const username = localStorage.getItem('userName');

  useEffect(() => {
    cargarArtista();
    verificarSiFavorito();
  }, [artistId]);

const cargarArtista = async () => {
  try {
    setLoading(true);
    const data = await getArtistaById(artistId);
    
    console.log('📀 ARTISTA COMPLETO:', data);
    console.log('📀 ÁLBUMES:', data.albumes);
    
    if (data.albumes && data.albumes.length > 0) {
      console.log('📀 PRIMER ÁLBUM:', data.albumes[0]);
      console.log('🆔 ID DEL PRIMER ÁLBUM:', data.albumes[0].id);
    }
    
    setArtista(data);
  } catch (error) {
    console.error('Error al cargar artista:', error);
  } finally {
    setLoading(false);
  }
};
  const verificarSiFavorito = async () => {
    try {
      const favoritos = await getArtistasFavoritos(username);
      const esFavorito = favoritos.some(a => a.artistId === artistId);
      setIsFavorite(esFavorito);
    } catch (error) {
      console.error('Error al verificar favorito:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (processingFavorite) return;
    
    try {
      setProcessingFavorite(true);
      
      if (isFavorite) {
        await eliminarArtistaFavorito(username, artistId);
        setIsFavorite(false);
        console.log('Artista eliminado de favoritos');
      } else {
        await agregarArtistaFavorito(username, artistId);
        setIsFavorite(true);
        console.log('Artista agregado a favoritos');
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      alert('Error al actualizar favoritos');
    } finally {
      setProcessingFavorite(false);
    }
  };

  const handlePlayArtist = () => {
    if (artista?.canciones && artista.canciones.length > 0) {
      const primeraCancion = artista.canciones[0];
      if (currentSong?.songId === primeraCancion.songId && isPlaying) {
        pauseSong();
      } else {
        playSong(primeraCancion, artista.canciones, 0);
      }
    }
  };

  const handlePlaySong = (cancion, index) => {
    if (currentSong?.songId === cancion.songId) {
      if (isPlaying) {
        pauseSong();
      } else {
        playSong(cancion, artista.canciones, index);
      }
    } else {
      playSong(cancion, artista.canciones, index);
    }
  };

  const isCurrentSong = (cancionId) => {
    return currentSong?.songId === cancionId || currentSong?.cancionId === cancionId;
  };

  const formatDuration = (duracion) => {
    const minutes = Math.floor(duracion);
    const seconds = Math.round((duracion % 1) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando artista...</p>
      </div>
    );
  }

  if (!artista) {
    return (
      <div className={styles.errorContainer}>
        <p>No se pudo cargar el artista</p>
      </div>
    );
  }

  return (
    <div className={styles.artistPage}>
      {/* Header con imagen de fondo */}
      <div 
        className={styles.header}
        style={{
          backgroundImage: artista.imagenUrl 
            ? `url(${artista.imagenUrl})` 
            : 'linear-gradient(180deg, #1db954 0%, #121212 100%)'
        }}
      >
        <div className={styles.headerOverlay}>
          <div className={styles.headerContent}>
            <div className={styles.verified}>
            </div>
            <h1 className={styles.artistName}>{artista.nombre}</h1>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className={styles.controls}>
        <button 
          className={styles.playButton}
          onClick={handlePlayArtist}
          disabled={!artista.canciones || artista.canciones.length === 0}
        >
          {isPlaying && currentSong && artista.canciones?.some(c => c.songId === currentSong.songId) ? (
            <FaPause />
          ) : (
            <FaPlay />
          )}
        </button>

        <button 
          className={`${styles.favoriteButton} ${isFavorite ? styles.isFavorite : ''}`}
          onClick={handleToggleFavorite}
          disabled={processingFavorite}
          title={isFavorite ? 'Dejar de seguir' : 'Seguir'}
        >
          <FaHeart />
        </button>
      </div>

      {/* Biografía */}
      {artista.biografia && (
        <div className={styles.biography}>
          <h2>Biografía</h2>
          <p>{artista.biografia}</p>
        </div>
      )}

      {/* Canciones del artista */}
      <div className={styles.songsSection}>
        <h2 className={styles.sectionTitle}>Canciones del artista</h2>
        
        {artista.canciones && artista.canciones.length > 0 ? (
          <div className={styles.songsList}>
            {artista.canciones.slice(0, 5).map((cancion, index) => (
              <div
                key={cancion.songId}
                className={`${styles.songRow} ${isCurrentSong(cancion.songId) ? styles.playing : ''}`}
                onClick={() => handlePlaySong(cancion, index)}
              >
                <div className={styles.songNumber}>
                  {isCurrentSong(cancion.songId) && isPlaying ? (
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
                  <img 
                    src={cancion.imagenUrl || artista.imagenUrl} 
                    alt={cancion.titulo}
                    className={styles.songImage}
                  />
                  <div className={styles.songDetails}>
                    <h4>{cancion.titulo}</h4>
                  </div>
                </div>

                <div className={styles.songDuration}>
                  {formatDuration(cancion.duracion)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noContent}>No hay canciones disponibles</p>
        )}
      </div>

      {/* Discografía */}
      <div className={styles.discography}>
        <div className={styles.discographyHeader}>
          <h2>Discografía</h2>
        </div>

   <div className={styles.albumsGrid}>
  {artista.albumes && artista.albumes.length > 0 ? (
    artista.albumes.map((album, index) => {
      // ← ACEPTA AMBOS FORMATOS
      const albumId = album.id || album._id;
      
      console.log(`📀 Álbum ${index}:`, album);
      console.log(`🆔 ID extraído: ${albumId}`);
      
      if (!albumId) {
        console.error('❌ Álbum sin ID:', album);
        return null;
      }
      
      return (
        <div
          key={albumId}
          className={styles.albumCard}
          onClick={() => {
            console.log('🔍 Navegando a álbum ID:', albumId);
            navigate(`/user/album/${albumId}`);
          }}
        >
          <div className={styles.albumCover}>
            <img src={album.imagenUrl} alt={album.nombre} />
            <div className={styles.albumPlayButton}>
              <FaPlay />
            </div>
          </div>
          <div className={styles.albumInfo}>
            <h4>{album.nombre}</h4>
            <p>{album.anio || '2016'} • Álbum</p>
          </div>
        </div>
      );
    })
  ) : (
    <p className={styles.noContent}>No hay álbumes disponibles</p>
  )}
</div>
      </div>
    </div>
  );
};

export default ArtistView;