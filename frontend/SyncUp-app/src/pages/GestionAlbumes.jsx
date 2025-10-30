import React, { useState, useEffect } from 'react';
import './GestionComun.css';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCompactDisc, FaMusic, FaTimes, FaPlay, FaPause } from 'react-icons/fa';

const GestionAlbumes = () => {
  const [albumes, setAlbumes] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalCanciones, setMostrarModalCanciones] = useState(false);
  const [albumEditando, setAlbumEditando] = useState(null);
  const [albumSeleccionado, setAlbumSeleccionado] = useState(null);
  const [cancionesAlbum, setCancionesAlbum] = useState([]);
  const [cancionReproduciendo, setCancionReproduciendo] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioRef, setAudioRef] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    bgColor: '#F5E6CC',
    artistaId: '',
    imagen: null
  });

  useEffect(() => {
    cargarAlbumes();
    cargarArtistas();
  }, []);

  // Crear referencia de audio
// Crear referencia de audio
useEffect(() => {
  const audio = new Audio();
  
  audio.addEventListener('ended', handleCancionTerminada);
  audio.addEventListener('play', () => setIsPlaying(true));
  audio.addEventListener('pause', () => setIsPlaying(false));
  audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
  audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
  
  setAudioRef(audio);

  return () => {
    audio.pause();
    audio.removeEventListener('ended', handleCancionTerminada);
    audio.removeEventListener('play', () => setIsPlaying(true));
    audio.removeEventListener('pause', () => setIsPlaying(false));
    audio.removeEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.removeEventListener('loadedmetadata', () => setDuration(audio.duration));
  };
}, []);

  const handleCancionTerminada = () => {
    // Opcional: reproducir siguiente canción
    const index = cancionesAlbum.findIndex(c => c.songId === cancionReproduciendo?.songId);
    if (index >= 0 && index < cancionesAlbum.length - 1) {
      reproducirCancion(cancionesAlbum[index + 1]);
    } else {
      setCancionReproduciendo(null);
      setIsPlaying(false);
    }
  };

  const reproducirCancion = (cancion) => {
    if (audioRef) {
      audioRef.src = cancion.musica;
      audioRef.play();
      setCancionReproduciendo(cancion);
    }
  };

  const togglePlayPause = () => {
    if (audioRef && cancionReproduciendo) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
    }
  };
  const handleSeek = (e) => {
  if (audioRef) {
    const newTime = parseFloat(e.target.value);
    audioRef.currentTime = newTime;
    setCurrentTime(newTime);
  }
};

const handleNext = () => {
  const index = cancionesAlbum.findIndex(c => c.songId === cancionReproduciendo?.songId);
  if (index >= 0 && index < cancionesAlbum.length - 1) {
    reproducirCancion(cancionesAlbum[index + 1]);
  }
};

const handlePrevious = () => {
  const index = cancionesAlbum.findIndex(c => c.songId === cancionReproduciendo?.songId);
  if (index > 0) {
    reproducirCancion(cancionesAlbum[index - 1]);
  }
};

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

  const cargarAlbumes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/albumes');
      if (response.ok) {
        const data = await response.json();
        setAlbumes(data);
      } else {
        setAlbumes([]);
      }
    } catch (error) {
      console.error('Error al cargar álbumes:', error);
      setAlbumes([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarArtistas = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/artistas');
      if (response.ok) {
        const data = await response.json();
        setArtistas(data);
      }
    } catch (error) {
      console.error('Error al cargar artistas:', error);
    }
  };

  const cargarCancionesDelAlbum = async (albumId) => {
    try {
      const response = await fetch('http://localhost:8080/api/canciones');
      if (response.ok) {
        const todasCanciones = await response.json();
        const cancionesFiltradas = todasCanciones.filter(cancion => 
          cancion.albumId === albumId || cancion.albumId === albumId.toString()
        );
        setCancionesAlbum(cancionesFiltradas);
      }
    } catch (error) {
      console.error('Error al cargar canciones del álbum:', error);
      setCancionesAlbum([]);
    }
  };

  const handleClickAlbum = async (album) => {
    setAlbumSeleccionado(album);
    const idAlbum = album.albumId || album._id;
    await cargarCancionesDelAlbum(idAlbum);
    setMostrarModalCanciones(true);
  };

  const handleCerrarModal = () => {
    setMostrarModalCanciones(false);
    if (audioRef) {
      audioRef.pause();
      audioRef.src = '';
    }
    setCancionReproduciendo(null);
    setIsPlaying(false);
  };

  const handleAgregar = () => {
    setAlbumEditando(null);
    setFormData({ 
      nombre: '', 
      descripcion: '', 
      bgColor: '#F5E6CC',
      artistaId: '',
      imagen: null
    });
    setImagenPreview(null);
    setMostrarModal(true);
  };

  const handleEditar = (album, e) => {
    e.stopPropagation();
    setAlbumEditando(album);
    setFormData({
      nombre: album.nombre || '',
      descripcion: album.descripcion || '',
      bgColor: album.bgColor || '#F5E6CC',
      artistaId: album.artistId || '',
      imagen: null
    });
    setImagenPreview(album.imagenUrl);
    setMostrarModal(true);
  };

  const handleEliminar = async (id, nombreAlbum, e) => {
    e.stopPropagation();
    
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar el álbum "${nombreAlbum}"?\n\n` +
      `⚠️ ADVERTENCIA: Esto también eliminará todas las canciones asociadas a este álbum.`
    );

    if (!confirmacion) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/albumes/${id}`, { 
        method: 'DELETE' 
      });
      if (response.ok) {
        cargarAlbumes();
        alert(`Álbum "${nombreAlbum}" eliminado exitosamente`);
      } else {
        const error = await response.text();
        alert(`Error al eliminar: ${error}`);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el álbum');
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, imagen: file});
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      const solicitud = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        bgColor: formData.bgColor,
        artistId: formData.artistaId,
        songIds: []
      };

      formDataToSend.append('solicitud', JSON.stringify(solicitud));
      
      if (formData.imagen) {
        formDataToSend.append('archivo', formData.imagen);
      }

      const url = albumEditando 
        ? `http://localhost:8080/api/albumes/${albumEditando._id}`
        : 'http://localhost:8080/api/albumes';
      
      const method = albumEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        setMostrarModal(false);
        cargarAlbumes();
      } else {
        const error = await response.text();
        alert('Error al guardar el álbum: ' + error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el álbum');
    } finally {
      setLoading(false);
    }
  };

  const albumesFiltrados = albumes.filter(a => 
    a.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const obtenerNombreArtista = (artistaId) => {
    const artista = artistas.find(a => a.artistId === artistaId);
    return artista ? artista.nombre : 'Sin artista';
  };

  const formatearDuracion = (minutos) => {
    const mins = Math.floor(minutos);
    const segs = Math.round((minutos - mins) * 60);
    return `${mins}:${segs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <h1>Gestión de Álbumes</h1>
        <button className="btn-primary" onClick={handleAgregar}>
          <FaPlus /> Agregar Álbum
        </button>
      </div>

      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {loading && <div className="loading">Cargando...</div>}

      <div className="albums-grid">
        {albumesFiltrados.map((album) => (
          <div 
            key={album._id} 
            className="album-card" 
            style={{ backgroundColor: album.bgColor }}
            onClick={() => handleClickAlbum(album)}
          >
            <div className="album-image">
              {album.imagenUrl ? (
                <img src={album.imagenUrl} alt={album.nombre} />
              ) : (
                <div className="no-image">
                  <FaCompactDisc size={48} />
                </div>
              )}
            </div>
            <div className="album-info">
              <h3>{album.nombre}</h3>
              <p className="album-artist">{obtenerNombreArtista(album.artistId)}</p>
              <p className="album-description">{album.descripcion}</p>
              <div className="album-actions">
                <button className="btn-edit" onClick={(e) => handleEditar(album, e)}>
                  <FaEdit />
                </button>
                <button className="btn-delete" onClick={(e) => handleEliminar(album._id, album.nombre, e)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {albumesFiltrados.length === 0 && !loading && (
        <div className="empty-state">No se encontraron álbumes</div>
      )}

      {/* Modal de Canciones del Álbum con Reproductor */}
      {mostrarModalCanciones && albumSeleccionado && (
        <div className="modal-overlay" onClick={handleCerrarModal}>
          <div className="modal-content modal-canciones-album" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-album">
              <div className="album-info-header">
                {albumSeleccionado.imagenUrl && (
                  <img 
                    src={albumSeleccionado.imagenUrl} 
                    alt={albumSeleccionado.nombre}
                    className="album-cover-modal"
                  />
                )}
                <div>
                  <h2>{albumSeleccionado.nombre}</h2>
                  <p className="artist-name-modal">{obtenerNombreArtista(albumSeleccionado.artistId)}</p>
                  <p className="album-stats">
                    <FaMusic /> {cancionesAlbum.length} {cancionesAlbum.length === 1 ? 'canción' : 'canciones'}
                  </p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={handleCerrarModal}>
                <FaTimes />
              </button>
            </div>

            <div className="canciones-list-scroll">
              {cancionesAlbum.length > 0 ? (
                <div className="canciones-grid">
                  {cancionesAlbum.map((cancion, index) => (
                    <div 
                      key={cancion.songId} 
                      className={`cancion-item ${cancionReproduciendo?.songId === cancion.songId ? 'playing' : ''}`}
                    >
                      <div className="cancion-numero">{index + 1}</div>
                      
                      <div className="cancion-imagen" onClick={() => reproducirCancion(cancion)}>
                        <img src={cancion.imagenUrl} alt={cancion.titulo} />
                        <div className="play-overlay">
                          <button className="play-btn">
                            {cancionReproduciendo?.songId === cancion.songId && isPlaying ? (
                              <FaPause />
                            ) : (
                              <FaPlay />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="cancion-info">
                        <h4>{cancion.titulo}</h4>
                        <p className="cancion-meta">
                          {cancion.genero} • {cancion.anio} • {formatearDuracion(cancion.duracion)}
                        </p>
                      </div>

                      <button 
                        className="btn-play-small"
                        onClick={() => reproducirCancion(cancion)}
                      >
                        {cancionReproduciendo?.songId === cancion.songId && isPlaying ? (
                          <FaPause />
                        ) : (
                          <FaPlay />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaMusic size={48} color="#ccc" />
                  <p>Este álbum no tiene canciones aún</p>
                </div>
              )}
            </div>

{/* Reproductor de Audio */}
{cancionReproduciendo && (
  <div className="audio-player">
    <div className="player-cover">
      <img src={cancionReproduciendo.imagenUrl} alt={cancionReproduciendo.titulo} />
    </div>
    
    <div className="player-info-section">
      <h4>{cancionReproduciendo.titulo}</h4>
      <p>{cancionReproduciendo.artistaNombre || obtenerNombreArtista(albumSeleccionado.artistId)}</p>
      
      <div className="progress-bar-container">
        <span className="time-display">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="progress-bar"
        />
        <span className="time-display">{formatTime(duration)}</span>
      </div>
    </div>

    <div className="player-controls">
      <button 
        className="player-control-btn" 
        onClick={handlePrevious}
        disabled={cancionesAlbum.findIndex(c => c.songId === cancionReproduciendo?.songId) === 0}
      >
        ⏮
      </button>
      
      <button className="player-control-main" onClick={togglePlayPause}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      
      <button 
        className="player-control-btn" 
        onClick={handleNext}
        disabled={cancionesAlbum.findIndex(c => c.songId === cancionReproduciendo?.songId) === cancionesAlbum.length - 1}
      >
        ⏭
      </button>
    </div>
  </div>
)}
          </div>
        </div>
      )}

      {/* Modal de Edición/Creación */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content modal-album" onClick={(e) => e.stopPropagation()}>
            <h2>{albumEditando ? 'Editar Álbum' : 'Agregar Álbum'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Álbum *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Artista *</label>
                <select
                  value={formData.artistaId}
                  onChange={(e) => setFormData({...formData, artistaId: e.target.value})}
                  required
                >
                  <option value="">Seleccionar artista</option>
                  {artistas.map(artista => (
                    <option key={artista.artistId} value={artista.artistId}>
                      {artista.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Color de Fondo</label>
                <input
                  type="color"
                  value={formData.bgColor}
                  onChange={(e) => setFormData({...formData, bgColor: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Imagen del Álbum *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  required={!albumEditando}
                />
                {imagenPreview && (
                  <div className="image-preview">
                    <img src={imagenPreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .albums-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
          margin-top: 20px;
        }

        .album-card {
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }

        .album-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .album-image {
          width: 100%;
          height: 280px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.05);
        }

        .album-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .album-card:hover .album-image img {
          transform: scale(1.05);
        }

        .no-image {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: rgba(0, 0, 0, 0.2);
        }

        .album-info {
          padding: 20px;
        }

        .album-info h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .album-artist {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #666;
          font-weight: 600;
        }

        .album-description {
          margin: 0 0 15px 0;
          font-size: 13px;
          color: #444;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .album-actions {
          display: flex;
          gap: 10px;
        }

        .modal-album {
          max-width: 600px;
        }

        .modal-canciones-album {
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .modal-header-album {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
          flex-shrink: 0;
        }

        .album-info-header {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .album-cover-modal {
          width: 100px;
          height: 100px;
          border-radius: 12px;
          object-fit: cover;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .album-info-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #1a1a2e;
          font-weight: 700;
        }

        .artist-name-modal {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #666;
          font-weight: 600;
        }

        .album-stats {
          margin: 0;
          font-size: 13px;
          color: #8a2be2;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }

        .btn-close-modal {
          background: #f5f5f5;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #666;
          flex-shrink: 0;
        }

        .btn-close-modal:hover {
          background: #e0e0e0;
          transform: rotate(90deg);
          color: #333;
        }

        .canciones-list-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 5px;
          margin-bottom: 10px;
        }

        .canciones-grid {
          display: grid;
          gap: 10px;
        }

        .cancion-item {
          display: grid;
          grid-template-columns: 35px 70px 1fr 45px;
          gap: 12px;
          align-items: center;
          padding: 10px 12px;
          background: #f8f9fa;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .cancion-item:hover {
          background: #e9ecef;
          transform: translateX(3px);
        }

        .cancion-item.playing {
          background: linear-gradient(135deg, #f0e7ff 0%, #e9ecef 100%);
          border: 2px solid #8a2be2;
        }

        .cancion-numero {
          font-size: 14px;
          font-weight: 700;
          color: #999;
          text-align: center;
        }

        .cancion-item.playing .cancion-numero {
          color: #8a2be2;
        }

        .cancion-imagen {
          position: relative;
          width: 70px;
          height: 70px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }

        .cancion-imagen img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .cancion-item:hover .play-overlay {
          opacity: 1;
        }

        .cancion-item.playing .play-overlay {
          opacity: 1;
          background: rgba(138, 43, 226, 0.8);
        }

        .play-btn {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: white;
          border: none;
          color: #8a2be2;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 2px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .play-btn:hover {
          transform: scale(1.1);
        }

        .cancion-info {
          min-width: 0;
        }

        .cancion-info h4 {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 600;
          color: #1a1a2e;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cancion-meta {
          margin: 0;
          font-size: 12px;
          color: #666;
        }

        .btn-play-small {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          border: 2px solid #8a2be2;
          color: #8a2be2;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 2px;
          transition: all 0.3s ease;
        }

        .btn-play-small:hover {
          background: #8a2be2;
          color: white;
          transform: scale(1.05);
        }

        .cancion-item.playing .btn-play-small {
          background: #8a2be2;
          color: white;
        }

        .audio-player {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #8a2be2 0%, #6a1bb2 100%);
  border-radius: 12px;
  margin-top: 10px;
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
  flex-shrink: 0;
}

.player-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.player-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-info-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-info-section h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-info-section p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.time-display {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-bar::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.player-control-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
}

.player-control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.player-control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.player-control-main {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: none;
  color: #8a2be2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.player-control-main:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.player-control-main svg {
  margin-left: 2px; /* Centrar el ícono de play */
}

.player-control-main:has(svg[data-icon="pause"]) svg {
  margin-left: 0; /* Centrar el ícono de pause */
}

/* Arreglar centrado de íconos play/pause */
.play-btn svg,
.btn-play-small svg {
  margin-left: 2px;
}

.cancion-item.playing .btn-play-small svg[data-icon="pause"] {
  margin-left: 0;
}

@media (max-width: 768px) {
  .audio-player {
    flex-wrap: wrap;
    gap: 15px;
    padding: 12px 15px;
  }

  .player-cover {
    width: 50px;
    height: 50px;
  }

  .player-info-section {
    flex: 1 1 100%;
    order: 3;
  }

  .player-controls {
    order: 2;
  }

  .player-control-main {
    width: 45px;
    height: 45px;
  }

  .player-control-btn {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
}
      `}</style>
    </div>
  );
};

export default GestionAlbumes;