import React from 'react';
import { FaPlay } from 'react-icons/fa';
import styles from './SongCard.module.css';

const SongCard = ({ song, onPlay }) => {
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