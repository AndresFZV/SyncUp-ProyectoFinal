import React from 'react';
import { FaPlay } from 'react-icons/fa';
import styles from './SongCard.module.css';

/**
 * Componente de tarjeta para mostrar información de una canción
 * Permite reproducir la canción al hacer clic en la tarjeta
 * 
 * @param {Object} song - Objeto con la información de la canción
 * @param {string} song.titulo - Título de la canción
 * @param {string} song.artistaNombre - Nombre del artista
 * @param {string} song.imagenUrl - URL de la imagen de la canción o álbum
 * @param {function} onPlay - Función callback que se ejecuta al reproducir la canción
 */
const SongCard = ({ song, onPlay }) => {
  /**
   * Maneja el clic en la canción para iniciar la reproducción
   */
  const handleClick = () => {
    if (onPlay) {
      onPlay(song);
    }
  };

  return (
    <div className={styles.songCard} onClick={handleClick}>
      <div className={styles.imageContainer}>
        <img 
          src={song.imagenUrl} 
          alt={song.titulo}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
        />
        <div className={styles.playOverlay}>
          <button className={styles.playButton}>
            <FaPlay />
          </button>
        </div>
      </div>
      <div className={styles.songInfo}>
        <h4 title={song.titulo}>{song.titulo}</h4>
        <p title={song.artistaNombre}>{song.artistaNombre}</p>
      </div>
    </div>
  );
};

export default SongCard;