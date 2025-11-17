import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';
import styles from './AlbumCard.module.css';

/**
 * Componente de tarjeta para mostrar información de un álbum
 * Permite navegar a la página detallada del álbum al hacer clic
 * 
 * @param {Object} album - Objeto con la información del álbum
 * @param {string} album.albumId - ID único del álbum
 * @param {string} album.nombre - Nombre del álbum
 * @param {string} album.artistaNombre - Nombre del artista
 * @param {string} album.imagenUrl - URL de la imagen del álbum
 * @param {number} album.anio - Año de lanzamiento (opcional)
 * @param {number} album.totalCanciones - Número total de canciones (opcional)
 */
const AlbumCard = ({ album }) => {
  const navigate = useNavigate();

  /**
   * Maneja la navegación a la página detallada del álbum
   */
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