import React from 'react';
import { FaPlay } from 'react-icons/fa';
import styles from './PlaylistCard.module.css';

const PlaylistCard = ({ playlist, onPlay }) => {
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