import React, { useState, useEffect } from 'react';
import './GestionComun.css';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaMusic } from 'react-icons/fa';

const GestionCanciones = () => {
  const [canciones, setCanciones] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [albumes, setAlbumes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cancionEditando, setCancionEditando] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
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
      console.log('📀 ÁLBUMES CARGADOS:', data);
      console.log('📀 Primer álbum:', data[0]);
      console.log('📀 ¿Tiene id?', data[0]?.id);
      console.log('📀 ¿Tiene _id?', data[0]?._id);
      console.log('📀 ¿Tiene albumId?', data[0]?.albumId);
      setAlbumes(data);
    }
  } catch (error) {
    console.error('Error al cargar álbumes:', error);
  }
};
  const handleAgregar = () => {
    setCancionEditando(null);
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

  const handleEditar = (cancion) => {
    setCancionEditando(cancion);
    setFormData({
      titulo: cancion.titulo || '',
      genero: cancion.genero || '',
      anio: cancion.anio || '',
      artistaId: cancion.artista?.artistId || '',
      albumId: cancion.album?.id || '',
      imagenArchivo: null,
      musicaArchivo: null
    });
    setImagenPreview(cancion.imagenUrl);
    setMostrarModal(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta canción?')) {
      try {
        await fetch(`http://localhost:8080/api/canciones/${id}`, { method: 'DELETE' });
        cargarCanciones();
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

    console.log('=== ENVIANDO CANCIÓN ===');
    console.log('Imagen:', formData.imagenArchivo.name, formData.imagenArchivo.size, 'bytes');
    console.log('Música:', formData.musicaArchivo.name, formData.musicaArchivo.size, 'bytes');

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

      console.log('Solicitud:', solicitud);

      formDataToSend.append('solicitud', JSON.stringify(solicitud));
      formDataToSend.append('imagen', formData.imagenArchivo);
      formDataToSend.append('musica', formData.musicaArchivo);

      console.log('Enviando petición...');

      const response = await fetch('http://localhost:8080/api/canciones', {
        method: 'POST',
        body: formDataToSend
      });

      console.log('Respuesta recibida:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✓ Canción guardada:', data);
        setMostrarModal(false);
        cargarCanciones();
        alert('Canción agregada exitosamente');
      } else {
        const errorText = await response.text();
        console.error('✗ Error del servidor:', errorText);
        alert('Error al guardar la canción: ' + errorText);
      }
    } catch (error) {
      console.error('✗ Error en la petición:', error);
      alert('Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancionesFiltradas = canciones.filter(c => 
    c.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.artista?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.genero?.toLowerCase().includes(busqueda.toLowerCase())
  );

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
          placeholder="Buscar por título, artista o género..."
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
              <th>Título</th>
              <th>Artista</th>
              <th>Álbum</th>
              <th>Género</th>
              <th>Duración</th>
              <th>Año</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cancionesFiltradas.map((cancion) => (
              <tr key={cancion.songId}>
                <td>
                  {cancion.imagenUrl ? (
                    <img src={cancion.imagenUrl} alt={cancion.titulo} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px'}} />
                  ) : (
                    <div style={{width: '50px', height: '50px', background: '#f0f0f0', borderRadius: '5px'}}></div>
                  )}
                </td>
                <td><strong>{cancion.titulo}</strong></td>
                <td>{cancion.artistaNombre || 'Sin artista'}</td>
                <td>{cancion.albumNombre || 'Sin álbum'}</td> 
                <td><span className="badge">{cancion.genero}</span></td>
                <td>{formatDuracion(cancion.duracion)}</td>
                <td>{cancion.anio}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-delete" onClick={() => handleEliminar(cancion.songId)}>
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cancionesFiltradas.length === 0 && !loading && (
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
                      <option key={album._id} value={album._id}>  {/* ← album.id */}
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
      `}</style>
    </div>
  );
};

export default GestionCanciones;