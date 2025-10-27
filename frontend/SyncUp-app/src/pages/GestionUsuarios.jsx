import React, { useState, useEffect } from 'react';
import './GestionComun.css';
import { FaSearch, FaTrash, FaUserCircle, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [ordenamiento, setOrdenamiento] = useState({
    campo: null,
    direccion: 'asc' // 'asc' o 'desc'
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const handleEliminar = async (username) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${username}?`)) {
      try {
        const response = await fetch(`http://localhost:8080/api/usuarios/${username}`, { 
          method: 'DELETE' 
        });
        if (response.ok) {
          cargarUsuarios();
          alert('Usuario eliminado exitosamente');
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el usuario');
      }
    }
  };

  const handleOrdenar = (campo) => {
    let direccion = 'asc';
    
    // Si ya está ordenado por este campo, invertir la dirección
    if (ordenamiento.campo === campo && ordenamiento.direccion === 'asc') {
      direccion = 'desc';
    }
    
    setOrdenamiento({ campo, direccion });
  };

  const obtenerUsuariosOrdenados = () => {
    let usuariosOrdenados = [...usuariosFiltrados];

    if (ordenamiento.campo) {
      usuariosOrdenados.sort((a, b) => {
        let valorA = a[ordenamiento.campo];
        let valorB = b[ordenamiento.campo];

        // Manejar campos especiales
        if (ordenamiento.campo === 'seguidores' || ordenamiento.campo === 'siguiendo') {
          valorA = a[ordenamiento.campo]?.length || 0;
          valorB = b[ordenamiento.campo]?.length || 0;
        }

        // Comparación para strings
        if (typeof valorA === 'string') {
          valorA = valorA.toLowerCase();
          valorB = valorB.toLowerCase();
        }

        // Ordenar
        if (valorA < valorB) {
          return ordenamiento.direccion === 'asc' ? -1 : 1;
        }
        if (valorA > valorB) {
          return ordenamiento.direccion === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return usuariosOrdenados;
  };

  const renderIconoOrdenamiento = (campo) => {
    if (ordenamiento.campo !== campo) {
      return <FaSort className="sort-icon" />;
    }
    return ordenamiento.direccion === 'asc' 
      ? <FaSortUp className="sort-icon active" /> 
      : <FaSortDown className="sort-icon active" />;
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.username?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const usuariosParaMostrar = obtenerUsuariosOrdenados();

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <h1>Gestión de Usuarios</h1>
        <div className="stats">
          <span className="stat-badge">
            Total: {usuarios.length} usuarios
          </span>
        </div>
      </div>

      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Buscar por username, nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {loading && <div className="loading">Cargando...</div>}

      <div className="table-container">
        <table className="data-table">
<thead>
  <tr>
    <th onClick={() => handleOrdenar('username')} className="sortable">
      <div className="th-content">
        Username 
        <span className="sort-icon-container">{renderIconoOrdenamiento('username')}</span>
      </div>
    </th>
    <th onClick={() => handleOrdenar('nombre')} className="sortable">
      <div className="th-content">
        Nombre 
        <span className="sort-icon-container">{renderIconoOrdenamiento('nombre')}</span>
      </div>
    </th>
    <th onClick={() => handleOrdenar('correo')} className="sortable">
      <div className="th-content">
        Correo 
        <span className="sort-icon-container">{renderIconoOrdenamiento('correo')}</span>
      </div>
    </th>
    <th onClick={() => handleOrdenar('edad')} className="sortable">
      <div className="th-content">
        Edad 
        <span className="sort-icon-container">{renderIconoOrdenamiento('edad')}</span>
      </div>
    </th>
    <th onClick={() => handleOrdenar('seguidores')} className="sortable">
      <div className="th-content">
        Seguidores 
        <span className="sort-icon-container">{renderIconoOrdenamiento('seguidores')}</span>
      </div>
    </th>
    <th onClick={() => handleOrdenar('siguiendo')} className="sortable">
      <div className="th-content">
        Siguiendo 
        <span className="sort-icon-container">{renderIconoOrdenamiento('siguiendo')}</span>
      </div>
    </th>
    <th>Acciones</th>
  </tr>
</thead>
          <tbody>
            {usuariosParaMostrar.map((usuario) => (
              <tr key={usuario.username}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaUserCircle size={24} color="#8a2be2" />
                    <strong>{usuario.username}</strong>
                  </div>
                </td>
                <td>{usuario.nombre}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.edad}</td>
                <td>{usuario.seguidores?.length || 0}</td>
                <td>{usuario.siguiendo?.length || 0}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-delete" 
                      onClick={() => handleEliminar(usuario.username)}
                      title="Eliminar usuario"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuariosParaMostrar.length === 0 && !loading && (
          <div className="empty-state">No se encontraron usuarios</div>
        )}
      </div>

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

  .data-table th {
    white-space: nowrap;
  }
`}</style>
    </div>
  );
};

export default GestionUsuarios;