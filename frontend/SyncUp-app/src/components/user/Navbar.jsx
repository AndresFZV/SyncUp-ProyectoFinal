import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaCog, FaSignOutAlt, FaMusic, FaMicrophone, FaCompactDisc, FaFilter, FaUserCircle, FaUserFriends, FaFileCsv } from 'react-icons/fa';
import { GoHome } from "react-icons/go";
import './Navbar.css';
import { buscarPorPrefijo } from '../../services/trieService';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import AdvancedSearch from '../AdvancedSearch/AdvancedSearch';
import { descargarReporteUsuario } from '../../services/reportesService';

const Navbar = ({ userName = 'Usuario', onSearch, onLogout }) => {
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying, pauseSong } = useMusicPlayer();
  
  // ========================================
  // ESTADOS
  // ========================================
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
  
  // ========================================
  // REFS
  // ========================================
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // ========================================
  // EFFECTS
  // ========================================
  
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

  // ========================================
  // HANDLERS - BÚSQUEDA
  // ========================================
  
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

  const handleResultClick = (type, item, index) => {
    setShowSearchResults(false);
    setSearchQuery('');
    
    switch(type) {
      case 'cancion':
        const cancionId = item._id || item.songId || item.cancionId;
        console.log('🎵 Reproduciendo:', item.titulo, 'ID:', cancionId);
        
        if (cancionId) {
          playSong(item, searchResults.canciones, index);
        }
        break;
        
      case 'artista':
        const artistaId = item.artistId || item._id || item.id;
        console.log('🎤 Click en artista:', item.nombre, 'ID:', artistaId);
        
        if (artistaId) {
          navigate(`/user/artist/${artistaId}`);
        }
        break;
        
      case 'album':
        const albumIdDirecto = item._id || item.id || item.albumId;
        console.log('💿 Click en álbum:', item.nombre, 'ID:', albumIdDirecto);
        
        if (albumIdDirecto) {
          navigate(`/user/album/${albumIdDirecto}`);
        }
        break;
        
      case 'usuario':
        const username = item.username || item._id;
        console.log('👤 Click en usuario:', item.nombre, 'Username:', username);
      
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

  // ========================================
  // HANDLERS - NAVEGACIÓN
  // ========================================
  
  const handleLogoClick = () => {
    navigate('/user/home');
  };

  const handleHomeClick = () => {
    navigate('/user/home');
  };

  // ← NUEVO HANDLER
  const handleSuggestionsClick = () => {
    navigate('/user/suggestions');
  };

  // ========================================
  // HANDLERS - USUARIO
  // ========================================
  
  const handleLogout = () => {
    setShowDropdown(false);
    onLogout?.();
  };

  const handleProfile = () => {
    setShowDropdown(false);
    navigate('/user/profile');
  };

const handleReportesClick = async () => {
  try {
    console.log('🔄 Descargando reporte del usuario...');
    
    await descargarReporteUsuario();
    
    console.log('✅ Reporte descargado exitosamente');
    setShowUserDropdown(false);
    
  } catch (error) {
    console.error('❌ Error al generar reporte:', error);
    alert('❌ Error al generar el reporte. Por favor, intenta de nuevo.');
  }
};

  // ========================================
  // COMPUTED VALUES
  // ========================================
  
  const totalResults = searchResults.canciones.length + 
                      searchResults.artistas.length + 
                      searchResults.albums.length +
                      searchResults.usuarios.length;

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          
          {/* LOGO */}
          <div className="logo-section">
            <button 
              className="logo-button" 
              onClick={handleLogoClick}
              aria-label="Ir al inicio"
            >
             <img src="/img/Sync_logo.png" alt="Logo SyncUp" className="logo-img" />
            </button>
          </div>

          {/* CENTRO: HOME + BÚSQUEDA */}
          <div className="center-group">
            <button 
              className="home-button"
              onClick={handleHomeClick}
              aria-label="Inicio"
            >
              <GoHome />
            </button>

            {/* ← NUEVO BOTÓN DE SUGERENCIAS */}
            <button 
              className="suggestions-button"
              onClick={handleSuggestionsClick}
              aria-label="Descubrir personas"
              title="Descubrir personas (RF-008)"
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
                  title="Búsqueda avanzada (RF-004)"
                >
                  <FaFilter />
                </button>
                
                {/* Dropdown de resultados */}
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
                        {/* CANCIONES */}
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

                        {/* ARTISTAS */}
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

                        {/* ÁLBUMES */}
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

                        {/* USUARIOS */}
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

                {/* Sin resultados */}
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

          {/* USUARIO */}
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
                {/* ← NUEVO ITEM EN DROPDOWN */}
                <button className="dropdown-item" onClick={handleSuggestionsClick}>
                  <FaUserFriends />
                  <span>Descubrir personas</span>
                </button>
                <button className="dropdown-item" onClick={handleReportesClick }> 
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

      {showAdvancedSearch && (
        <AdvancedSearch onClose={() => setShowAdvancedSearch(false)} />
      )}
    </>
  );
};

export default Navbar;