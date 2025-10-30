import React, { useState, useEffect } from 'react';
import './GestionComun.css';
import { FaPlus, FaTrash, FaSearch, FaImage, FaMusic, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';

const GestionCanciones = () => {
  const [canciones, setCanciones] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [albumes, setAlbumes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [ordenamiento, setOrdenamiento] = useState({
    campo: null,
    direccion: 'asc'
  });
  const [formData, setFormData] = useState({
    titulo: '',
    genero: '',
    anio: '',
    artistaId: '',
    albumId: '',
    imagenArchivo: null,
    musicaArchivo: null
  });

  useEffect(() => {
    cargarCanciones();
    cargarArtistas();
    cargarAlbumes();
  }, []);

  const cargarCanciones = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/canciones');
      if (response.ok) {
        const data = await response.json();
        setCanciones(data);
      } else {
        setCanciones([]);
      }
    } catch (error) {
      console.error('Error al cargar canciones:', error);
      setCanciones([]);
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

  const cargarAlbumes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/albumes');
      if (response.ok) {
        const data = await response.json();
        setAlbumes(data);
      }
    } catch (error) {
      console.error('Error al cargar álbumes:', error);
    }
  };

  const handleAgregar = () => {
    setFormData({ 
      titulo: '', 
      genero: '', 
      anio: '',
      artistaId: '', 
      albumId: '',
      imagenArchivo: null,
      musicaArchivo: null
    });
    setImagenPreview(null);
    setMostrarModal(true);
  };

  const handleEliminar = async (id, titulo) => {
    if (window.confirm(`¿Estás seguro de eliminar la canción "${titulo}"?`)) {
      try {
        const response = await fetch(`http://localhost:8080/api/canciones/${id}`, { 
          method: 'DELETE' 
        });
        if (response.ok) {
          cargarCanciones();
          alert('Canción eliminada exitosamente');
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar la canción');
      }
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, imagenArchivo: file});
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMusicaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, musicaArchivo: file});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.imagenArchivo || !formData.musicaArchivo) {
      alert('Por favor selecciona la imagen y el archivo de música');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      const solicitud = {
        titulo: formData.titulo,
        genero: formData.genero,
        anio: parseInt(formData.anio),
        artistaId: formData.artistaId,
        albumId: formData.albumId && formData.albumId !== '' ? formData.albumId : null
      };

      formDataToSend.append('solicitud', JSON.stringify(solicitud));
      formDataToSend.append('imagen', formData.imagenArchivo);
      formDataToSend.append('musica', formData.musicaArchivo);

      const response = await fetch('http://localhost:8080/api/canciones', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        setMostrarModal(false);
        cargarCanciones();
        alert('Canción agregada exitosamente');
      } else {
        const errorText = await response.text();
        alert('Error al guardar la canción: ' + errorText);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      alert('Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrdenar = (campo) => {
    let direccion = 'asc';
    
    if (ordenamiento.campo === campo && ordenamiento.direccion === 'asc') {
      direccion = 'desc';
    }
    
    setOrdenamiento({ campo, direccion });
  };

  const renderIconoOrdenamiento = (campo) => {
    if (ordenamiento.campo !== campo) {
      return <FaSort className="sort-icon" />;
    }
    return ordenamiento.direccion === 'asc' 
      ? <FaSortUp className="sort-icon active" /> 
      : <FaSortDown className="sort-icon active" />;
  };

  const cancionesFiltradas = canciones.filter(c => 
    c.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.artistaNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.albumNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.genero?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const obtenerCancionesOrdenadas = () => {
    let cancionesOrdenadas = [...cancionesFiltradas];

    if (ordenamiento.campo) {
      cancionesOrdenadas.sort((a, b) => {
        let valorA = a[ordenamiento.campo];
        let valorB = b[ordenamiento.campo];

        if (typeof valorA === 'string') {
          valorA = valorA.toLowerCase();
          valorB = valorB?.toLowerCase() || '';
        }

        if (valorA < valorB) {
          return ordenamiento.direccion === 'asc' ? -1 : 1;
        }
        if (valorA > valorB) {
          return ordenamiento.direccion === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return cancionesOrdenadas;
  };

  const cancionesParaMostrar = obtenerCancionesOrdenadas();

  const formatDuracion = (duracion) => {
    if (!duracion) return 'N/A';
    const minutos = Math.floor(duracion);
    const segundos = Math.round((duracion - minutos) * 60);
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  };

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <h1>Gestión de Canciones</h1>
        <button className="btn-primary" onClick={handleAgregar}>
          <FaPlus /> Agregar Canción
        </button>
      </div>

      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Buscar por título, artista, álbum o género..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {loading && <div className="loading">Cargando...</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th onClick={() => handleOrdenar('titulo')} className="sortable">
                <div className="th-content">
                  Título
                  <span className="sort-icon-container">{renderIconoOrdenamiento('titulo')}</span>
                </div>
              </th>
              <th onClick={() => handleOrdenar('artistaNombre')} className="sortable">
                <div className="th-content">
                  Artista
                  <span className="sort-icon-container">{renderIconoOrdenamiento('artistaNombre')}</span>
                </div>
              </th>
              <th onClick={() => handleOrdenar('albumNombre')} className="sortable">
                <div className="th-content">
                  Álbum
                  <span className="sort-icon-container">{renderIconoOrdenamiento('albumNombre')}</span>
                </div>
              </th>
              <th onClick={() => handleOrdenar('genero')} className="sortable">
                <div className="th-content">
                  Género
                  <span className="sort-icon-container">{renderIconoOrdenamiento('genero')}</span>
                </div>
              </th>
              <th onClick={() => handleOrdenar('duracion')} className="sortable">
                <div className="th-content">
                  Duración
                  <span className="sort-icon-container">{renderIconoOrdenamiento('duracion')}</span>
                </div>
              </th>
              <th onClick={() => handleOrdenar('anio')} className="sortable">
                <div className="th-content">
                  Año
                  <span className="sort-icon-container">{renderIconoOrdenamiento('anio')}</span>
                </div>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cancionesParaMostrar.map((cancion) => (
              <tr key={cancion.songId}>
                <td>
                  {cancion.imagenUrl ? (
                    <img 
                      src={cancion.imagenUrl} 
                      alt={cancion.titulo} 
                      style={{
                        width: '50px', 
                        height: '50px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }} 
                    />
                  ) : (
                    <div style={{
                      width: '50px', 
                      height: '50px', 
                      background: '#f0f0f0', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaMusic color="#ccc" />
                    </div>
                  )}
                </td>
                <td><strong>{cancion.titulo}</strong></td>
                <td>{cancion.artistaNombre || 'Sin artista'}</td>
                <td>{cancion.albumNombre || '-'}</td>
                <td><span className="badge">{cancion.genero}</span></td>
                <td>{formatDuracion(cancion.duracion)}</td>
                <td>{cancion.anio}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-delete" 
                      onClick={() => handleEliminar(cancion.songId, cancion.titulo)}
                      title="Eliminar canción"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cancionesParaMostrar.length === 0 && !loading && (
          <div className="empty-state">No se encontraron canciones</div>
        )}
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content modal-cancion" onClick={(e) => e.stopPropagation()}>
            <h2>Agregar Canción</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
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
                <label>Álbum (opcional)</label>
                <select
                  value={formData.albumId}
                  onChange={(e) => setFormData({...formData, albumId: e.target.value})}
                >
                  <option value="">Sin álbum</option>
                  {albumes.map(album => (
                    <option key={album._id} value={album._id}>
                      {album.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Género *</label>
                <input
                  type="text"
                  value={formData.genero}
                  onChange={(e) => setFormData({...formData, genero: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Año *</label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={formData.anio}
                  onChange={(e) => setFormData({...formData, anio: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label><FaImage /> Imagen de la Canción *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  required
                />
                {imagenPreview && (
                  <div className="image-preview">
                    <img src={imagenPreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label><FaMusic /> Archivo de Música (MP3) *</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleMusicaChange}
                  required
                />
                {formData.musicaArchivo && (
                  <p style={{marginTop: '10px', color: '#666', fontSize: '14px'}}>
                    ✓ {formData.musicaArchivo.name}
                  </p>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Subiendo...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .sortable {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s;
        }

        .sortable:hover {
          background-color: rgba(138, 43, 226, 0.1);
        }

        .th-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .sort-icon-container {
          display: flex;
          align-items: center;
          min-width: 16px;
        }

        .sort-icon {
          font-size: 14px;
          opacity: 0.3;
          transition: opacity 0.2s;
        }

        .sortable:hover .sort-icon {
          opacity: 0.6;
        }

        .sort-icon.active {
          opacity: 1;
          color: #8a2be2;
        }

        .modal-cancion {
          max-width: 600px;
        }

        .image-preview {
          margin-top: 15px;
          width: 150px;
          height: 150px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid #e0e0e0;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .data-table th {
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default GestionCanciones;