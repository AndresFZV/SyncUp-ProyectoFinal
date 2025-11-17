import React from 'react';
import { FaTimes, FaMusic } from 'react-icons/fa';
import { MdDragIndicator, MdClose } from 'react-icons/md';
import { useMusicPlayer } from '../../../contexts/MusicPlayerContext';
import styles from './QueueSidebar.module.css';

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

  const formatDuration = (duracion) => {
    if (!duracion) return '0:00';
    const minutes = Math.floor(duracion);
    const seconds = Math.round((duracion % 1) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={toggleQueue}></div>

      {/* Sidebar */}
      <div className={styles.sidebar}>
        {/* Header */}
        <div className={styles.header}>
          <h3>Cola de reproducción</h3>
          <button className={styles.closeButton} onClick={toggleQueue}>
            <FaTimes />
          </button>
        </div>

        {/* Radio Mode Badge */}
        {radioMode && (
          <div className={styles.radioModeBadge}>
            <FaMusic />
            <span>Modo Radio Activo</span>
          </div>
        )}

        {/* Queue Info */}
        <div className={styles.queueInfo}>
          <p>{queue.length} canción{queue.length !== 1 ? 'es' : ''} en cola</p>
        </div>

        {/* Now Playing */}
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

        {/* Queue List */}
        <div className={styles.queueSection}>
          <h4>Siguiente{queue.length - queueIndex - 1 > 0 ? `s (${queue.length - queueIndex - 1})` : ''}</h4>
          <div className={styles.queueList}>
            {queue.map((song, index) => {
              // No mostrar la canción actual en "Siguientes"
              if (index === queueIndex) return null;

              const isUpcoming = index > queueIndex;
              const cancionId = song.songId || song.cancionId;

              return (
                <div
                  key={`${cancionId}-${index}`}
                  className={`${styles.queueItem} ${!isUpcoming ? styles.played : ''}`}
                >
                  {/* Drag Handle */}
                  <div className={styles.dragHandle}>
                    <MdDragIndicator />
                  </div>

                  {/* Song Info */}
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

                  {/* Duration */}
                  <span className={styles.duration}>
                    {formatDuration(song.duracion)}
                  </span>

                  {/* Remove Button */}
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