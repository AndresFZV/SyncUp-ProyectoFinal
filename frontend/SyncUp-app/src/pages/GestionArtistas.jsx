import React, { useState, useEffect } from 'react';
import './GestionComun.css';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserAlt, FaTimes, FaCompactDisc, FaMusic } from 'react-icons/fa';

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
      const response = await fetch('http://localhost:8080/api/artistas');
      if (response.ok) {
        const data = await response.json();
        setArtistas(data);
      } else {
        setArtistas([]);
      }
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
      // Cargar información completa del artista
      const responseArtista = await fetch(`http://localhost:8080/api/artistas/${artistaId}`);
      const artista = await responseArtista.json();

      // Cargar álbumes del artista
      const responseAlbumes = await fetch('http://localhost:8080/api/albumes');
      const todosAlbumes = await responseAlbumes.json();
      const albumesDelArtista = todosAlbumes.filter(album => album.artistId === artistaId);

      // Cargar canciones del artista
      const responseCanciones = await fetch('http://localhost:8080/api/canciones');
      const todasCanciones = await responseCanciones.json();
      const cancionesDelArtista = todasCanciones.filter(cancion => cancion.artistaId === artistaId);

      setArtistaSeleccionado({
        ...artista,
        albumesDetalle: albumesDelArtista,
        cancionesDetalle: cancionesDelArtista
      });
      setMostrarDetalles(true);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
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
    e.stopPropagation(); // Evitar que abra el modal de detalles
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
    e.stopPropagation(); // Evitar que abra el modal de detalles
    if (window.confirm('¿Estás seguro de eliminar este artista? Esto también eliminará todas sus canciones y álbumes.')) {
      try {
        const response = await fetch(`http://localhost:8080/api/artistas/${id}`, { 
          method: 'DELETE' 
        });
        if (response.ok) {
          cargarArtistas();
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el artista');
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

    if (!formData.imagen && !artistaEditando) {
      alert('Por favor selecciona una imagen');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      const solicitud = {
        nombre: formData.nombre,
        pais: formData.pais,
        generoPrincipal: formData.generoPrincipal,
        biografia: formData.biografia
      };

      formDataToSend.append('solicitud', JSON.stringify(solicitud));
      
      if (formData.imagen) {
        formDataToSend.append('archivo', formData.imagen);
      }

      const url = artistaEditando 
        ? `http://localhost:8080/api/artistas/${artistaEditando.artistId}`
        : 'http://localhost:8080/api/artistas';
      
      const method = artistaEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        setMostrarModal(false);
        cargarArtistas();
        alert(artistaEditando ? 'Artista actualizado exitosamente' : 'Artista agregado exitosamente');
      } else {
        const error = await response.text();
        alert('Error al guardar el artista: ' + error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el artista');
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
            style={{ cursor: 'pointer' }}
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
                      <div key={album._id} className="album-item" style={{ backgroundColor: album.bgColor }}>
                        <img src={album.imagenUrl} alt={album.nombre} />
                        <div className="album-item-info">
                          <h4>{album.nombre}</h4>
                          <p>{album.descripcion}</p>
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
                      <div key={cancion._id} className="cancion-item">
                        <span className="cancion-numero">{index + 1}</span>
                        <img src={cancion.imagenUrl} alt={cancion.titulo} className="cancion-img" />
                        <div className="cancion-info">
                          <h4>{cancion.titulo}</h4>
                          <p>{cancion.genero} • {cancion.anio}</p>
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

      <style jsx>{`
        .artistas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 25px;
          margin-top: 20px;
        }

        .artista-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .artista-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .artista-image {
          width: 100%;
          height: 300px;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .artista-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: rgba(0, 0, 0, 0.2);
        }

        .artista-info {
          padding: 20px;
        }

        .artista-info h3 {
          margin: 0 0 10px 0;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .artista-pais {
          margin: 0 0 5px 0;
          font-size: 14px;
          color: #666;
          font-weight: 600;
        }

        .artista-genero {
          display: inline-block;
          margin: 0 0 12px 0;
          padding: 5px 12px;
          background: #e8f4f8;
          color: #2196f3;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .artista-bio {
          margin: 0 0 15px 0;
          font-size: 13px;
          color: #555;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .artista-stats {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
        }

        .artista-stats span {
          font-size: 13px;
          color: #666;
        }

        .artista-actions {
          display: flex;
          gap: 10px;
        }

        .modal-artista {
          max-width: 600px;
        }

        .modal-detalles-artista {
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .btn-close-modal {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: background 0.3s;
        }

        .btn-close-modal:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        .detalles-header {
          display: flex;
          gap: 30px;
          padding: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .detalles-imagen {
          flex-shrink: 0;
        }

        .detalles-imagen img {
          width: 200px;
          height: 200px;
          border-radius: 15px;
          object-fit: cover;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .detalles-info h1 {
          margin: 0 0 10px 0;
          font-size: 36px;
          font-weight: 700;
        }

        .detalles-pais {
          margin: 0 0 10px 0;
          font-size: 16px;
          opacity: 0.9;
        }

        .detalles-genero {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .detalles-biografia {
          margin: 15px 0;
          font-size: 15px;
          line-height: 1.6;
          opacity: 0.95;
        }

        .detalles-stats {
          display: flex;
          gap: 25px;
          margin-top: 20px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
        }

        .detalles-contenido {
          padding: 30px;
        }

        .seccion-albumes,
        .seccion-canciones {
          margin-bottom: 40px;
        }

        .seccion-albumes h2,
        .seccion-canciones h2 {
          margin: 0 0 20px 0;
          font-size: 24px;
          color: #1a1a2e;
        }

        .albumes-lista {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .album-item {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .album-item img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .album-item-info {
          padding: 15px;
        }

        .album-item-info h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #1a1a2e;
        }

        .album-item-info p {
          margin: 0;
          font-size: 13px;
          color: #666;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .canciones-lista {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .cancion-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .cancion-numero {
          font-size: 18px;
          font-weight: 700;
          color: #999;
          min-width: 30px;
        }

        .cancion-img {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
        }

        .cancion-info {
          flex: 1;
        }

        .cancion-info h4 {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #1a1a2e;
        }

        .cancion-info p {
          margin: 0;
          font-size: 13px;
          color: #999;
        }

        .cancion-audio {
          width: 300px;
          height: 35px;
        }

        .empty-message {
          text-align: center;
          padding: 40px;
          color: #999;
          font-size: 15px;
        }

        .image-preview {
          margin-top: 15px;
          width: 200px;
          height: 200px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid #e0e0e0;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .artistas-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
          }

          .detalles-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .albumes-lista {
            grid-template-columns: 1fr;
          }

          .cancion-audio {
            width: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default GestionArtistas;