import React from 'react';
import { FaPlay } from 'react-icons/fa';
import styles from './PlaylistCard.module.css';

/**
 * Componente de tarjeta para mostrar información de una playlist
 * Permite reproducir la playlist al hacer clic en la tarjeta
 * 
 * @param {Object} playlist - Objeto con la información de la playlist
 * @param {string} playlist.nombre - Nombre de la playlist
 * @param {string} playlist.descripcion - Descripción de la playlist
 * @param {string} playlist.imagenUrl - URL de la imagen de la playlist
 * @param {Array} playlist.canciones - Lista de canciones de la playlist
 * @param {function} onPlay - Función callback que se ejecuta al reproducir la playlist
 */
const PlaylistCard = ({ playlist, onPlay }) => {
  /**
   * Maneja el clic en la playlist para iniciar la reproducción
   */
  const handleClick = () => {
    if (onPlay && playlist.canciones) {
      onPlay(playlist.canciones);
    }
  };

  return (
    <div className={styles.playlistCard} onClick={handleClick}>
      <div className={styles.imageContainer}>
        <img 
          src={playlist.imagenUrl || 'https://via.placeholder.com/300x300?text=Playlist'}
          alt={playlist.nombre}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=Playlist';
          }}
        />
        <div className={styles.playOverlay}>
          <button className={styles.playButton}>
            <FaPlay />
          </button>
        </div>
      </div>
      <div className={styles.playlistInfo}>
        <h4 title={playlist.nombre}>{playlist.nombre}</h4>
        <p>{playlist.descripcion}</p>
      </div>
    </div>
  );
};

export default PlaylistCard;