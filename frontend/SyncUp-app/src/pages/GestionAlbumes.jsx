import React, { useState, useEffect } from 'react';
import './GestionComun.css';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCompactDisc } from 'react-icons/fa';

const GestionAlbumes = () => {
  const [albumes, setAlbumes] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [albumEditando, setAlbumEditando] = useState(null);
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

  const handleEditar = (album) => {
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

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este álbum?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/albumes/${id}`, { 
          method: 'DELETE' 
        });
        if (response.ok) {
          cargarAlbumes();
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el álbum');
      }
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, imagen: file});
      // Crear preview
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
      
      // Crear el objeto solicitud
      const solicitud = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        bgColor: formData.bgColor,
        artistId: formData.artistaId,
        songIds: []
      };

      formDataToSend.append('solicitud', JSON.stringify(solicitud));
      
      // Agregar imagen solo si hay una nueva
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
          <div key={album._id} className="album-card" style={{ backgroundColor: album.bgColor }}>
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
                <button className="btn-edit" onClick={() => handleEditar(album)}>
                  <FaEdit />
                </button>
                <button className="btn-delete" onClick={() => handleEliminar(album._id)}>
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

      {/* Modal */}
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
          .albums-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default GestionAlbumes;