import React, { useState, useEffect, useRef } from 'react';
import './GestionAlbumes.css';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCompactDisc, FaMusic, FaTimes, FaPlay, FaPause } from 'react-icons/fa';
import { 
  getAllAlbumes, 
  createAlbum, 
  updateAlbum, 
  deleteAlbum 
} from '../../../services/albumesService';
import { getAllArtistas } from '../../../services/artistasService';
import { getAllCanciones } from '../../../services/cancionesService';
import { validateRequired } from '../../../utils/validators';
import { formatDuration } from '../../../utils/formatters';

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
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [albumesData, artistasData] = await Promise.all([
        getAllAlbumes(),
        getAllArtistas()
      ]);
      setAlbumes(albumesData);
      setArtistas(artistasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setAlbumes([]);
      setArtistas([]);
    } finally {
      setLoading(false);
    }
  };

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

  const cargarCancionesDelAlbum = async (albumId) => {
    try {
      const todasCanciones = await getAllCanciones();
      const cancionesFiltradas = todasCanciones.filter(cancion => 
        cancion.albumId === albumId || cancion.albumId === albumId.toString()
      );
      setCancionesAlbum(cancionesFiltradas);
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

    if (!confirmacion) return;

    try {
      await deleteAlbum(id);
      cargarDatos();
      alert(`Álbum "${nombreAlbum}" eliminado exitosamente`);
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error.message || 'Error al eliminar el álbum');
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

    // Validaciones
    const validaciones = [
      validateRequired(formData.nombre, 'Nombre'),
      validateRequired(formData.artistaId, 'Artista')
    ];

    const errores = validaciones.filter(v => !v.isValid);
    if (errores.length > 0) {
      alert(errores[0].error);
      return;
    }

    if (!formData.imagen && !albumEditando) {
      alert('Por favor selecciona una imagen');
      return;
    }

    setLoading(true);

    try {
      if (albumEditando) {
        await updateAlbum(albumEditando._id, formData);
        alert('Álbum actualizado exitosamente');
      } else {
        await createAlbum(formData);
        alert('Álbum creado exitosamente');
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error al guardar el álbum');
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
                          {cancion.genero} • {cancion.anio} • {formatDuration(cancion.duracion)}
                        </p>
                      </div>
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
    </div>
  );
};

export default GestionAlbumes;