import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaSignOutAlt, FaMusic, FaMicrophone, FaCompactDisc, FaFilter, FaUserCircle, FaUserFriends, FaFileCsv } from 'react-icons/fa';
import { GoHome } from "react-icons/go";
import './Navbar.css';
import { buscarPorPrefijo } from '../../services/trieService';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import AdvancedSearch from '../AdvancedSearch/AdvancedSearch';
import { descargarReporteUsuario } from '../../services/reportesService';

/**
 * Componente de barra de navegación principal
 * Incluye búsqueda, navegación, menú de usuario y funcionalidades avanzadas
 * 
 * @param {string} userName - Nombre del usuario actual
 * @param {function} onSearch - Callback para búsquedas
 * @param {function} onLogout - Callback para cierre de sesión
 */
const Navbar = ({ userName = 'Usuario', onSearch, onLogout }) => {
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying, pauseSong } = useMusicPlayer();
  
  // Estados del componente
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({
    canciones: [],
    artistas: [],
    albums: [],
    usuarios: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // Referencias para manejar clicks externos
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  /**
   * Efecto para manejar clicks fuera del dropdown y resultados de búsqueda
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Maneja el cambio en el campo de búsqueda con debounce
   * @param {Event} e - Evento del input
   */
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setShowSearchResults(false);
      setSearchResults({ canciones: [], artistas: [], albums: [], usuarios: [] });
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await buscarPorPrefijo(query, 5);
        
        setSearchResults({
          canciones: results.canciones || [],
          artistas: results.artistas || [],
          albums: results.albums || [],
          usuarios: results.usuarios || []
        });
        
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error al buscar:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  /**
   * Maneja el envío del formulario de búsqueda
   * @param {Event} e - Evento del formulario
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }

    setShowSearchResults(false);

    // Si solo hay UN resultado total
    if (totalResults === 1) {
      if (searchResults.canciones.length === 1) {
        const cancion = searchResults.canciones[0];
        playSong(cancion, searchResults.canciones, 0);
        setSearchQuery('');
        return;
      }
      
      if (searchResults.artistas.length === 1) {
        const artista = searchResults.artistas[0];
        const artistaId = artista.artistId || artista._id;
        navigate(`/user/artist/${artistaId}`);
        setSearchQuery('');
        return;
      }
      
      if (searchResults.albums.length === 1) {
        const album = searchResults.albums[0];
        const albumId = album._id || album.id;
        navigate(`/user/album/${albumId}`);
        setSearchQuery('');
        return;
      }
      
      if (searchResults.usuarios.length === 1) {
        const usuario = searchResults.usuarios[0];
        navigate(`/user/profile/${usuario.username}`);
        setSearchQuery('');
        return;
      }
    }

    // Si hay SOLO canciones (múltiples)
    if (searchResults.canciones.length > 0 && 
        searchResults.artistas.length === 0 && 
        searchResults.albums.length === 0 &&
        searchResults.usuarios.length === 0) {
      const primeraCancion = searchResults.canciones[0];
      playSong(primeraCancion, searchResults.canciones, 0);
      setSearchQuery('');
      return;
    }

    // Si hay múltiples tipos, abrir búsqueda avanzada
    setShowAdvancedSearch(true);
  };

  /**
   * Maneja el clic en un resultado de búsqueda
   * @param {string} type - Tipo de resultado (cancion, artista, album, usuario)
   * @param {Object} item - Item seleccionado
   * @param {number} index - Índice del item en la lista
   */
  const handleResultClick = (type, item, index) => {
    setShowSearchResults(false);
    setSearchQuery('');
    
    switch(type) {
      case 'cancion':
        const cancionId = item._id || item.songId || item.cancionId;
        
        if (cancionId) {
          playSong(item, searchResults.canciones, index);
        }
        break;
        
      case 'artista':
        const artistaId = item.artistId || item._id || item.id;
        
        if (artistaId) {
          navigate(`/user/artist/${artistaId}`);
        }
        break;
        
      case 'album':
        const albumIdDirecto = item._id || item.id || item.albumId;
        
        if (albumIdDirecto) {
          navigate(`/user/album/${albumIdDirecto}`);
        }
        break;
        
      case 'usuario':
        const username = item.username || item._id;
      
        if (username) {
          const currentUsername = localStorage.getItem('userName');
            
          if (username === currentUsername) {
            navigate('/user/profile');
          } else {
            navigate(`/user/profile/${username}`);
          }
        }
        break;
        
      default:
        break;
    }
  };

  /**
   * Navega a la página de inicio
   */
  const handleLogoClick = () => {
    navigate('/user/home');
  };

  /**
   * Navega a la página de inicio
   */
  const handleHomeClick = () => {
    navigate('/user/home');
  };

  /**
   * Navega a la página de sugerencias de personas
   */
  const handleSuggestionsClick = () => {
    navigate('/user/suggestions');
  };

  /**
   * Maneja el cierre de sesión del usuario
   */
  const handleLogout = () => {
    setShowDropdown(false);
    onLogout?.();
  };

  /**
   * Navega al perfil del usuario
   */
  const handleProfile = () => {
    setShowDropdown(false);
    navigate('/user/profile');
  };

  /**
   * Maneja la descarga de reportes del usuario
   */
  const handleReportesClick = async () => {
    try {
      await descargarReporteUsuario();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte. Por favor, intenta de nuevo.');
    }
  };

  // Calcula el total de resultados de búsqueda
  const totalResults = searchResults.canciones.length + 
                      searchResults.artistas.length + 
                      searchResults.albums.length +
                      searchResults.usuarios.length;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          
          {/* Sección del logo */}
          <div className="logo-section">
            <button 
              className="logo-button" 
              onClick={handleLogoClick}
              aria-label="Ir al inicio"
            >
             <img src="/img/Sync_logo.png" alt="Logo SyncUp" className="logo-img" />
            </button>
          </div>

          {/* Grupo central: Inicio, Sugerencias y Búsqueda */}
          <div className="center-group">
            <button 
              className="home-button"
              onClick={handleHomeClick}
              aria-label="Inicio"
            >
              <GoHome />
            </button>

            <button 
              className="suggestions-button"
              onClick={handleSuggestionsClick}
              aria-label="Descubrir personas"
              title="Descubrir personas"
            >
              <FaUserFriends />
            </button>

            <form className="search-section" onSubmit={handleSearchSubmit} ref={searchRef}>
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="¿Qué quieres reproducir?"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                />
                
                <button
                  type="button"
                  className="advanced-search-button"
                  onClick={() => setShowAdvancedSearch(true)}
                  title="Búsqueda avanzada"
                >
                  <FaFilter />
                </button>
                
                {/* Dropdown de resultados de búsqueda */}
                {showSearchResults && totalResults > 0 && (
                  <div className="search-dropdown">
                    {isSearching && (
                      <div className="search-loading">
                        <div className="search-spinner"></div>
                        <span>Buscando...</span>
                      </div>
                    )}

                    {!isSearching && (
                      <>
                        {/* Sección de canciones */}
                        {searchResults.canciones.length > 0 && (
                          <div className="search-section-results" key="canciones-section">
                            <h4 className="search-section-title">
                              <FaMusic /> Canciones
                            </h4>
                            {searchResults.canciones.map((cancion, index) => {
                              const cancionId = cancion._id || cancion.songId;
                              const currentId = currentSong?._id || currentSong?.songId;
                              const isCurrentPlaying = currentId === cancionId && isPlaying;
                              
                              return (
                                <button
                                  key={cancion._id || cancion.songId || Math.random()}
                                  className={`search-result-item ${isCurrentPlaying ? 'playing' : ''}`}
                                  onClick={() => handleResultClick('cancion', cancion, index)}
                                >
                                  <img 
                                    src={cancion.imagenUrl} 
                                    alt={cancion.titulo}
                                    className="search-result-image"
                                  />
                                  <div className="search-result-info">
                                    <span className="search-result-title">{cancion.titulo}</span>
                                    <span className="search-result-subtitle">
                                      {cancion.artista?.nombre || 'Artista desconocido'}
                                    </span>
                                  </div>
                                  {isCurrentPlaying && (
                                    <div className="search-playing-indicator">
                                      <span></span>
                                      <span></span>
                                      <span></span>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Sección de artistas */}
                        {searchResults.artistas.length > 0 && (
                          <div className="search-section-results" key="artistas-section">
                            <h4 className="search-section-title">
                              <FaMicrophone /> Artistas
                            </h4>
                            {searchResults.artistas.map((artista) => (
                              <button
                                key={artista.artistId || artista._id || Math.random()}
                                className="search-result-item"
                                onClick={() => handleResultClick('artista', artista)}
                              >
                                <img 
                                  src={artista.imagenUrl} 
                                  alt={artista.nombre}
                                  className="search-result-image"
                                />
                                <div className="search-result-info">
                                  <span className="search-result-title">{artista.nombre}</span>
                                  <span className="search-result-subtitle">Artista</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Sección de álbumes */}
                        {searchResults.albums.length > 0 && (
                          <div className="search-section-results" key="albums-section">
                            <h4 className="search-section-title">
                              <FaCompactDisc /> Álbumes
                            </h4>
                            {searchResults.albums.map((album) => (
                              <button
                                key={album._id || album.id || Math.random()}
                                className="search-result-item"
                                onClick={() => handleResultClick('album', album)}
                              >
                                <img 
                                  src={album.imagenUrl} 
                                  alt={album.nombre}
                                  className="search-result-image"
                                />
                                <div className="search-result-info">
                                  <span className="search-result-title">{album.nombre}</span>
                                  <span className="search-result-subtitle">Álbum</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Sección de usuarios */}
                        {searchResults.usuarios.length > 0 && (
                          <div className="search-section-results" key="usuarios-section">
                            <h4 className="search-section-title">
                              <FaUserCircle /> Usuarios
                            </h4>
                            {searchResults.usuarios.map((usuario) => (
                              <button
                                key={usuario.username || usuario._id || Math.random()}
                                className="search-result-item"
                                onClick={() => handleResultClick('usuario', usuario)}
                              >
                                <div className="search-result-image search-result-avatar">
                                  <FaUserCircle />
                                </div>
                                <div className="search-result-info">
                                  <span className="search-result-title">{usuario.nombre}</span>
                                  <span className="search-result-subtitle">@{usuario.username}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Mensaje de sin resultados */}
                {showSearchResults && totalResults === 0 && !isSearching && searchQuery.trim() && (
                  <div className="search-dropdown">
                    <div className="search-no-results">
                      <FaSearch />
                      <p>No se encontraron resultados para "{searchQuery}"</p>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Sección del usuario */}
          <div className="user-section" ref={dropdownRef}>
            <button 
              className="user-button"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="Menú de usuario"
            >
              <div className="user-icon">
                <FaUser />
              </div>
            </button>

            {showDropdown && (
              <div className="dropdown">
                <button className="dropdown-item" onClick={handleProfile}>
                  <FaUser />
                  <span>Perfil</span>
                </button>
                <button className="dropdown-item" onClick={handleSuggestionsClick}>
                  <FaUserFriends />
                  <span>Descubrir personas</span>
                </button>
                <button className="dropdown-item" onClick={handleReportesClick}> 
                  <FaFileCsv /> 
                  <span>Reportes</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Modal de búsqueda avanzada */}
      {showAdvancedSearch && (
        <AdvancedSearch onClose={() => setShowAdvancedSearch(false)} />
      )}
    </>
  );
};

export default Navbar;