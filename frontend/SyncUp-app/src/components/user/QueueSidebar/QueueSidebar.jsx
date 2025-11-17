import React from 'react';
import { FaTimes, FaMusic } from 'react-icons/fa';
import { MdDragIndicator, MdClose } from 'react-icons/md';
import { useMusicPlayer } from '../../../contexts/MusicPlayerContext';
import styles from './QueueSidebar.module.css';

/**
 * Componente de sidebar que muestra la cola de reproducción actual
 * Incluye la canción actual en reproducción y las siguientes canciones en cola
 * Permite gestionar la cola de reproducción (reproducir, eliminar)
 */
const QueueSidebar = () => {
  const {
    queue,
    queueIndex,
    currentSong,
    isQueueOpen,
    toggleQueue,
    playFromQueue,
    removeFromQueue,
    radioMode
  } = useMusicPlayer();

  if (!isQueueOpen) return null;

  /**
   * Formatea la duración de segundos a formato mm:ss
   * @param {number} duracion - Duración en segundos
   * @returns {string} Duración formateada
   */
  const formatDuration = (duracion) => {
    if (!duracion) return '0:00';
    const minutes = Math.floor(duracion);
    const seconds = Math.round((duracion % 1) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <>
      {/* Overlay de fondo */}
      <div className={styles.overlay} onClick={toggleQueue}></div>

      {/* Sidebar de cola de reproducción */}
      <div className={styles.sidebar}>
        {/* Header del sidebar */}
        <div className={styles.header}>
          <h3>Cola de reproducción</h3>
          <button className={styles.closeButton} onClick={toggleQueue}>
            <FaTimes />
          </button>
        </div>

        {/* Indicador de modo radio */}
        {radioMode && (
          <div className={styles.radioModeBadge}>
            <FaMusic />
            <span>Modo Radio Activo</span>
          </div>
        )}

        {/* Información de la cola */}
        <div className={styles.queueInfo}>
          <p>{queue.length} canción{queue.length !== 1 ? 'es' : ''} en cola</p>
        </div>

        {/* Sección de "Reproduciendo ahora" */}
        {currentSong && (
          <div className={styles.nowPlayingSection}>
            <h4>Reproduciendo ahora</h4>
            <div className={styles.nowPlayingCard}>
              <img 
                src={currentSong.imagenUrl || currentSong.albumCover} 
                alt={currentSong.titulo}
              />
              <div className={styles.nowPlayingInfo}>
                <h5>{currentSong.titulo}</h5>
                <p>{currentSong.artistaNombre}</p>
              </div>
              <div className={styles.playingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {/* Lista de canciones siguientes en cola */}
        <div className={styles.queueSection}>
          <h4>Siguiente{queue.length - queueIndex - 1 > 0 ? `s (${queue.length - queueIndex - 1})` : ''}</h4>
          <div className={styles.queueList}>
            {queue.map((song, index) => {
              // No mostrar la canción actual en la sección "Siguientes"
              if (index === queueIndex) return null;

              const isUpcoming = index > queueIndex;
              const cancionId = song.songId || song.cancionId;

              return (
                <div
                  key={`${cancionId}-${index}`}
                  className={`${styles.queueItem} ${!isUpcoming ? styles.played : ''}`}
                >
                  {/* Manejador de arrastre */}
                  <div className={styles.dragHandle}>
                    <MdDragIndicator />
                  </div>

                  {/* Información de la canción */}
                  <div 
                    className={styles.songInfo}
                    onClick={() => playFromQueue(index)}
                  >
                    <img 
                      src={song.imagenUrl || song.albumCover} 
                      alt={song.titulo}
                    />
                    <div className={styles.songDetails}>
                      <h5>{song.titulo}</h5>
                      <p>{song.artistaNombre}</p>
                    </div>
                  </div>

                  {/* Duración de la canción */}
                  <span className={styles.duration}>
                    {formatDuration(song.duracion)}
                  </span>

                  {/* Botón para eliminar de la cola */}
                  <button
                    className={styles.removeButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(index);
                    }}
                    title="Quitar de la cola"
                  >
                    <MdClose />
                  </button>
                </div>
              );
            })}

            {/* Estado vacío cuando no hay más canciones en cola */}
            {queue.length - queueIndex - 1 === 0 && (
              <div className={styles.emptyQueue}>
                <FaMusic />
                <p>No hay más canciones en la cola</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QueueSidebar;