import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCancionesSimilares } from '../../../services/radioService';
import { 
  FaPlay, 
  FaPause, 
  FaStepBackward, 
  FaStepForward, 
  FaVolumeUp,
  FaRandom,
  FaRedoAlt,
  FaRegHeart,
  FaHeart,
  FaCaretSquareUp
} from 'react-icons/fa';
import { HiQueueList } from "react-icons/hi2";
import { BiFullscreen } from "react-icons/bi";
import { useMusicPlayer } from '../../../contexts/MusicPlayerContext';
import {
  verificarCancionFavorita,
  agregarCancionFavorita,
  eliminarCancionFavorita
} from '../../../services/favoritosService';
import styles from './MusicPlayer.module.css';

/**
 * Componente del reproductor de música principal
 * Controla la reproducción, volumen, favoritos y navegación entre canciones
 */
const MusicPlayer = () => {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    isQueueOpen,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    toggleQueue,
    seek,
    changeVolume,
  } = useMusicPlayer();

  const [isFavorita, setIsFavorita] = useState(false);
  const [procesandoFavorito, setProcesandoFavorito] = useState(false);

  const username = localStorage.getItem('userName');

  useEffect(() => {
    /**
     * Verifica si la canción actual está marcada como favorita
     */
    const verificarFavorito = async () => {
      if (!currentSong || !username) {
        setIsFavorita(false);
        return;
      }

      const cancionId = currentSong.songId || currentSong.cancionId;
      if (!cancionId) return;

      try {
        const esFavorita = await verificarCancionFavorita(username, cancionId);
        setIsFavorita(esFavorita);
      } catch (error) {
        console.error('Error al verificar favorito:', error);
        setIsFavorita(false);
      }
    };

    verificarFavorito();
  }, [currentSong, username]);

  /**
   * Formatea el tiempo de segundos a formato mm:ss
   * @param {number} time - Tiempo en segundos
   * @returns {string} Tiempo formateado
   */
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Maneja el clic en la barra de progreso para cambiar el tiempo de reproducción
   * @param {Event} e - Evento del clic
   */
  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const progressBarWidth = progressBar.offsetWidth;
    const newTime = (clickPosition / progressBarWidth) * duration;
    seek(newTime);
  };

  /**
   * Maneja el cambio de volumen
   * @param {Event} e - Evento del input range
   */
  const handleVolumeChange = (e) => {
    changeVolume(parseFloat(e.target.value));
  };

  /**
   * Navega a la página del álbum de la canción actual
   */
  const handleAlbumClick = () => {
    if (!currentSong) return;

    const albumId = currentSong.albumId || currentSong.album?.id;
    if (albumId) {
      navigate(`/user/album/${albumId}`);
    } else {
      console.warn('No se encontró ID del álbum');
    }
  };

  /**
   * Navega a la página del artista de la canción actual
   * @param {Event} e - Evento del clic
   */
  const handleArtistaClick = (e) => {
    e.stopPropagation();

    if (!currentSong) return;

    const artistaId = currentSong.artistaId || currentSong.artista?.artistId;
    if (artistaId) {
      navigate(`/user/artist/${artistaId}`);
    } else {
      console.warn('No se encontró ID del artista');
    }
  };

  /**
   * Maneja el toggle de favoritos para la canción actual
   * @param {Event} e - Evento del clic
   */
  const handleToggleFavorito = async (e) => {
    e.stopPropagation();

    if (!currentSong || procesandoFavorito) return;

    const cancionId = currentSong.songId || currentSong.cancionId;
    if (!cancionId) return;

    try {
      setProcesandoFavorito(true);

      if (isFavorita) {
        await eliminarCancionFavorita(username, cancionId);
        setIsFavorita(false);
      } else {
        await agregarCancionFavorita(username, cancionId);
        setIsFavorita(true);
      }

    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      alert('Error al actualizar favoritos');
    } finally {
      setProcesandoFavorito(false);
    }
  };

  return (
    <div className={styles.musicPlayer}>
      {currentSong ? (
        <>
          <div className={styles.songInfoWrapper}>
            <div className={styles.songInfo} onClick={handleAlbumClick}>
              <img 
                src={currentSong.imagenUrl || currentSong.albumCover} 
                alt={currentSong.titulo}
                className={styles.albumCover}
              />
              <div className={styles.songDetails}>
                <h4 className={styles.clickable}>{currentSong.titulo}</h4>
                <p 
                  className={styles.clickable}
                  onClick={handleArtistaClick}
                >
                  {currentSong.artistaNombre}
                </p>
              </div>
            </div>

            <button 
              className={`${styles.addFavorites} ${isFavorita ? styles.isFavorite : ''}`}
              onClick={handleToggleFavorito}
              disabled={procesandoFavorito}
              title={isFavorita ? 'Quitar de favoritas' : 'Agregar a favoritas'}
            >
              {isFavorita ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
            </button>
          </div>

          <div className={styles.playerControls}>
            <div className={styles.controls}>
              <button 
                className={`${styles.controlButton} ${shuffle ? styles.active : ''}`}
                onClick={toggleShuffle}
                title="Aleatorio"
              >
                <FaRandom />
              </button>

              <button 
                className={styles.controlButton}
                onClick={playPrevious}
                title="Anterior"
              >
                <FaStepBackward />
              </button>

              <button 
                className={styles.playPauseButton}
                onClick={togglePlayPause}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>

              <button 
                className={styles.controlButton}
                onClick={playNext}
                title="Siguiente"
              >
                <FaStepForward />
              </button>

              <button 
                className={`${styles.controlButton} ${repeat !== 'off' ? styles.active : ''}`}
                onClick={toggleRepeat}
                title={`Repetir: ${repeat}`}
              >
                <FaRedoAlt />
                {repeat === 'one' && <span className={styles.repeatOne}>1</span>}
              </button>
            </div>

            <div className={styles.progressContainer}>
              <span className={styles.time}>{formatTime(currentTime)}</span>
              <div 
                className={styles.progressBar}
                onClick={handleProgressClick}
              >
                <div 
                  className={styles.progressFill}
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                >
                  <div className={styles.progressDot}></div>
                </div>
              </div>
              <span className={styles.time}>{formatTime(duration)}</span>
            </div>
          </div>

          <div className={styles.volumeControl}>
            <button 
              className={`${styles.queueButton} ${isQueueOpen ? styles.active : ''}`}
              onClick={toggleQueue}
              title="Cola de reproducción"
            >
              <HiQueueList size={20} />
            </button>

            <FaVolumeUp className={styles.volumeIcon} />

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
              style={{ 
                "--fill": `${volume * 100}%`,
                "--tooltip": `"${Math.round(volume * 100)}%"`
              }}
            />

            <button className={styles.fullSButton} title="Pantalla completa">
              <BiFullscreen size={20} />
            </button>
          </div>
        </>
      ) : (
        <div className={styles.emptyPlayer}>
          <p>Selecciona una canción para reproducir</p>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;