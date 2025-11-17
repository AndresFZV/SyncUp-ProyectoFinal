import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ArtistCard.module.css';

const ArtistCard = ({ artista }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/user/artist/${artista.artistaId}`);
  };

  return (
    <div className={styles.artistCard} onClick={handleClick}>
      <div className={styles.imageContainer}>
        <img 
          src={artista.imagenUrl || 'https://via.placeholder.com/300x300?text=Artist'}
          alt={artista.nombre}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=Artist';
          }}
        />
      </div>
      <div className={styles.artistInfo}>
        <h4 title={artista.nombre}>{artista.nombre}</h4>
        <p>Artista</p>
        {artista.canciones && <span>{artista.canciones} canciones</span>}
      </div>
    </div>
  );
};

export default ArtistCard;