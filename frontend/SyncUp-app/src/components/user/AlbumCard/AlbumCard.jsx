import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';
import styles from './AlbumCard.module.css';

const AlbumCard = ({ album }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/user/album/${album.albumId}`);
  };

  return (
    <div className={styles.albumCard} onClick={handleClick}>
      <div className={styles.imageContainer}>
        <img 
          src={album.imagenUrl || 'https://via.placeholder.com/300x300?text=Album'}
          alt={album.nombre}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=Album';
          }}
        />
        <div className={styles.playOverlay}>
          <button className={styles.playButton}>
            <FaPlay />
          </button>
        </div>
      </div>
      <div className={styles.albumInfo}>
        <h4 title={album.nombre}>{album.nombre}</h4>
        <p title={album.artistaNombre}>{album.artistaNombre}</p>
        {album.anio && <span>{album.anio}</span>}
        {album.totalCanciones && <span> • {album.totalCanciones} canciones</span>}
      </div>
    </div>
  );
};

export default AlbumCard;