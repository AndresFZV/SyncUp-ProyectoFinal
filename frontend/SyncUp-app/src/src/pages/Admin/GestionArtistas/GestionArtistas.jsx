import React, { useState, useEffect } from 'react';
import './GestionArtistas.css';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserAlt, FaTimes, FaCompactDisc, FaMusic } from 'react-icons/fa';
import { 
  getAllArtistas, 
  getArtistaById,
  createArtista, 
  updateArtista, 
  deleteArtista 
} from '../../../services/artistasService';
import { validateRequired } from '../../../utils/validators';

const GestionArtistas = () => {
  const [artistas, setArtistas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [artistaEditando, setArtistaEditando] = useState(null);
  const [artistaSeleccionado, setArtistaSeleccionado] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    pais: '',
    generoPrincipal: '',
    biografia: '',
    imagen: null
  });

  useEffect(() => {
    cargarArtistas();
  }, []);

  const cargarArtistas = async () => {
    setLoading(true);
    try {
      const data = await getAllArtistas();
      setArtistas(data);
    } catch (error) {
      console.error('Error al cargar artistas:', error);
      setArtistas([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarDetallesArtista = async (artistaId) => {
    setLoading(true);
    try {
      // Cargar información completa del artista (ahora incluye álbumes y canciones)
      const artista = await getArtistaById(artistaId);
      
      console.log('📀 Artista cargado:', artista);

      setArtistaSeleccionado({
        ...artista,
        // Los álbumes y canciones ya vienen en el DTO
        albumesDetalle: artista.albumes || [],
        cancionesDetalle: artista.canciones || []
      });
      
      setMostrarDetalles(true);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      alert('Error al cargar los detalles del artista');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregar = () => {
    setArtistaEditando(null);
    setFormData({ 
      nombre: '', 
      pais: '', 
      generoPrincipal: '', 
      biografia: '',
      imagen: null
    });
    setImagenPreview(null);
    setMostrarModal(true);
  };

  const handleEditar = (artista, e) => {
    e.stopPropagation();
    setArtistaEditando(artista);
    setFormData({
      nombre: artista.nombre || '',
      pais: artista.pais || '',
      generoPrincipal: artista.generoPrincipal || '',
      biografia: artista.biografia || '',
      imagen: null
    });
    setImagenPreview(artista.imagenUrl);
    setMostrarModal(true);
  };

  const handleEliminar = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de eliminar este artista? Esto también eliminará todas sus canciones y álbumes.')) {
      try {
        await deleteArtista(id);
        cargarArtistas();
        alert('Artista eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert(error.message || 'Error al eliminar el artista');
      }
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

    const validaciones = [
      validateRequired(formData.nombre, 'Nombre'),
      validateRequired(formData.pais, 'País'),
      validateRequired(formData.generoPrincipal, 'Género Principal')
    ];

    const errores = validaciones.filter(v => !v.isValid);
    if (errores.length > 0) {
      alert(errores[0].error);
      return;
    }

    if (!formData.imagen && !artistaEditando) {
      alert('Por favor selecciona una imagen');
      return;
    }

    setLoading(true);

    try {
      if (artistaEditando) {
        await updateArtista(artistaEditando.artistId, formData);
        alert('Artista actualizado exitosamente');
      } else {
        await createArtista(formData);
        alert('Artista agregado exitosamente');
      }
      setMostrarModal(false);
      cargarArtistas();
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error al guardar el artista');
    } finally {
      setLoading(false);
    }
  };

  const artistasFiltrados = artistas.filter(a => 
    a.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.pais?.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.generoPrincipal?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <h1>Gestión de Artistas</h1>
        <button className="btn-primary" onClick={handleAgregar}>
          <FaPlus /> Agregar Artista
        </button>
      </div>

      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Buscar por nombre, país o género..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {loading && <div className="loading">Cargando...</div>}

      <div className="artistas-grid">
        {artistasFiltrados.map((artista) => (
          <div 
            key={artista.artistId} 
            className="artista-card"
            onClick={() => cargarDetallesArtista(artista.artistId)}
          >
            <div className="artista-image">
              {artista.imagenUrl ? (
                <img src={artista.imagenUrl} alt={artista.nombre} />
              ) : (
                <div className="no-image">
                  <FaUserAlt size={48} />
                </div>
              )}
            </div>
            <div className="artista-info">
              <h3>{artista.nombre}</h3>
              <p className="artista-pais">📍 {artista.pais}</p>
              <p className="artista-genero">{artista.generoPrincipal}</p>
              <p className="artista-bio">{artista.biografia}</p>
              <div className="artista-stats">
                <span>🎵 {artista.totalCanciones || 0} canciones</span>
                <span>💿 {artista.totalAlbumes || 0} álbumes</span>
              </div>
              <div className="artista-actions">
                <button className="btn-edit" onClick={(e) => handleEditar(artista, e)}>
                  <FaEdit />
                </button>
                <button className="btn-delete" onClick={(e) => handleEliminar(artista.artistId, e)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {artistasFiltrados.length === 0 && !loading && (
        <div className="empty-state">No se encontraron artistas</div>
      )}

      {/* Modal de Edición/Creación */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content modal-artista" onClick={(e) => e.stopPropagation()}>
            <h2>{artistaEditando ? 'Editar Artista' : 'Agregar Artista'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Artista *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>País *</label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => setFormData({...formData, pais: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Género Principal *</label>
                  <input
                    type="text"
                    value={formData.generoPrincipal}
                    onChange={(e) => setFormData({...formData, generoPrincipal: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Biografía</label>
                <textarea
                  value={formData.biografia}
                  onChange={(e) => setFormData({...formData, biografia: e.target.value})}
                  rows="4"
                  placeholder="Escribe una breve biografía del artista..."
                />
              </div>

              <div className="form-group">
                <label>Imagen del Artista {!artistaEditando && '*'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  required={!artistaEditando}
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

      {/* Modal de Detalles del Artista */}
      {mostrarDetalles && artistaSeleccionado && (
        <div className="modal-overlay" onClick={() => setMostrarDetalles(false)}>
          <div className="modal-content modal-detalles-artista" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setMostrarDetalles(false)}>
              <FaTimes />
            </button>
            
            <div className="detalles-header">
              <div className="detalles-imagen">
                <img src={artistaSeleccionado.imagenUrl} alt={artistaSeleccionado.nombre} />
              </div>
              <div className="detalles-info">
                <h1>{artistaSeleccionado.nombre}</h1>
                <p className="detalles-pais">📍 {artistaSeleccionado.pais}</p>
                <span className="detalles-genero">{artistaSeleccionado.generoPrincipal}</span>
                <p className="detalles-biografia">{artistaSeleccionado.biografia}</p>
                <div className="detalles-stats">
                  <div className="stat-item">
                    <FaCompactDisc />
                    <span>{artistaSeleccionado.albumesDetalle?.length || 0} Álbumes</span>
                  </div>
                  <div className="stat-item">
                    <FaMusic />
                    <span>{artistaSeleccionado.cancionesDetalle?.length || 0} Canciones</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detalles-contenido">
              {/* Álbumes */}
              <div className="seccion-albumes">
                <h2>💿 Álbumes</h2>
                {artistaSeleccionado.albumesDetalle && artistaSeleccionado.albumesDetalle.length > 0 ? (
                  <div className="albumes-lista">
                    {artistaSeleccionado.albumesDetalle.map(album => (
                      <div 
                        key={album.id || album._id} 
                        className="album-item" 
                        style={{ backgroundColor: album.bgColor }}
                      >
                        <img src={album.imagenUrl} alt={album.nombre} />
                        <div className="album-item-info">
                          <h4>{album.nombre}</h4>
                          <p>{album.descripcion}</p>
                          <p className="album-canciones-count">
                            {album.totalCanciones || 0} canciones
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-message">No hay álbumes registrados</p>
                )}
              </div>

              {/* Canciones */}
              <div className="seccion-canciones">
                <h2>🎵 Canciones</h2>
                {artistaSeleccionado.cancionesDetalle && artistaSeleccionado.cancionesDetalle.length > 0 ? (
                  <div className="canciones-lista">
                    {artistaSeleccionado.cancionesDetalle.map((cancion, index) => (
                      <div key={cancion.songId || cancion._id} className="cancion-item">
                        <span className="cancion-numero">{index + 1}</span>
                        <img src={cancion.imagenUrl} alt={cancion.titulo} className="cancion-img" />
                        <div className="cancion-info">
                          <h4>{cancion.titulo}</h4>
                          <p>{cancion.genero} • {cancion.anio}</p>
                          {cancion.albumNombre && (
                            <p className="cancion-album">Álbum: {cancion.albumNombre}</p>
                          )}
                        </div>
                        <audio controls className="cancion-audio">
                          <source src={cancion.musica} type="audio/mpeg" />
                        </audio>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-message">No hay canciones registradas</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionArtistas;