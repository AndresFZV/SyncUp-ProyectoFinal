import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaSearch,
  FaHeart,
  FaMusic,
  FaBars,
  FaPlus
} from 'react-icons/fa';
import { BiLibrary } from 'react-icons/bi';
import styles from './Sidebar.module.css';
import { useSidebar } from '../../../contexts/SidebarContext';
import { getArtistasFavoritos, getAlbumesFavoritos } from '../../../services/favoritosService';

/**
 * Componente de barra lateral que muestra navegación, biblioteca del usuario
 * y contenido favorito (artistas, álbumes, playlists)
 * Soporta modo expandido y colapsado con funcionalidades de búsqueda y filtrado
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { expanded, toggleSidebar } = useSidebar();
  const [albumesFavoritos, setAlbumesFavoritos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [artistasFavoritos, setArtistasFavoritos] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const username = localStorage.getItem('userName');

  /**
   * Carga los datos del sidebar (artistas favoritos, álbumes favoritos y playlists)
   */
  const cargarDatos = async () => {
    try {
      try {
        const artistas = await getArtistasFavoritos(username);
        setArtistasFavoritos(artistas || []);
      } catch (error) {
        console.error('Error al cargar artistas:', error);
        setArtistasFavoritos([]);
      }

      try {
        const albumes = await getAlbumesFavoritos(username);
        setAlbumesFavoritos(albumes || []);
      } catch (error) {
        console.error('Error al cargar álbumes:', error);
        setAlbumesFavoritos([]);
      }
      
      setPlaylists([
        { id: '1', nombre: 'Mi lista n.º 1', canciones: 12 },
        { id: '2', nombre: 'Mi lista n.º 2', canciones: 8 }
      ]);
      
    } catch (error) {
      console.error('Error al cargar datos del sidebar:', error);
    }
  };

  // Cargar datos inicialmente
  useEffect(() => {
    if (username) {
      cargarDatos();
    }
  }, [username]);

  /**
   * Escucha eventos de actualización de favoritos para recargar datos
   */
  useEffect(() => {
    const handleFavoritosActualizados = (event) => {
      // Recargar los datos del sidebar cuando se actualizan favoritos
      cargarDatos();
    };

    // Agregar listener para eventos de favoritos
    window.addEventListener('favoritosActualizados', handleFavoritosActualizados);

    // Cleanup del listener
    return () => {
      window.removeEventListener('favoritosActualizados', handleFavoritosActualizados);
    };
  }, [username]);

  /**
   * Verifica si una ruta está activa
   * @param {string} path - Ruta a verificar
   * @returns {boolean} True si la ruta está activa
   */
  const isActive = (path) => location.pathname === path;

  /**
   * Obtiene datos filtrados y buscados según los criterios activos
   * @returns {Array} Datos filtrados y buscados
   */
  const getFilteredAndSearchedData = () => {
    let data = [];
    
    // Si hay filtro activo, usar solo esa categoría
    if (activeFilter) {
      switch (activeFilter) {
        case 'listas':
          data = playlists.map(item => ({ ...item, tipo: 'lista' }));
          break;
        case 'artistas':
          data = artistasFavoritos.map(item => ({ ...item, tipo: 'artista' }));
          break;
        case 'albumes':
          data = albumesFavoritos.map(item => ({ ...item, tipo: 'album' }));
          break;
        default:
          break;
      }
    } else {
      // Si no hay filtro, buscar en todas las categorías
      data = [
        ...playlists.map(item => ({ ...item, tipo: 'lista' })),
        ...artistasFavoritos.map(item => ({ ...item, tipo: 'artista' })),
        ...albumesFavoritos.map(item => ({ ...item, tipo: 'album' }))
      ];
    }
    
    // Aplicar búsqueda si hay término
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(item => 
        item.nombre?.toLowerCase().includes(term)
      );
    }
    
    return data;
  };

  /**
   * Maneja el clic en los filtros
   * @param {string} filter - Tipo de filtro a aplicar
   */
  const handleFilterClick = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
      setSearchTerm('');
    } else {
      setActiveFilter(filter);
      setSearchTerm('');
    }
  };

  /**
   * Maneja el cambio en el campo de búsqueda
   * @param {Event} e - Evento del input
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = getFilteredAndSearchedData();
  const showSearchResults = searchTerm.trim().length > 0;
  const showFilteredView = activeFilter !== null && !showSearchResults;

  /**
   * Renderiza un item según su tipo (artista, álbum o lista)
   * @param {Object} item - Item a renderizar
   * @returns {JSX.Element} Componente renderizado
   */
  const renderItem = (item) => {
    if (item.tipo === 'artista') {
      return (
        <div 
          key={item.artistId} 
          className={styles.libraryItem}
          onClick={() => navigate(`/user/artist/${item.artistId}`)}
        >
          {item.imagenUrl ? (
            <img 
              src={item.imagenUrl} 
              alt={item.nombre}
              className={styles.artistImageRound}
            />
          ) : (
            <div className={styles.artistImagePlaceholderRound}>
              <FaMusic />
            </div>
          )}
          <div className={styles.itemInfo}>
            <h4>{item.nombre}</h4>
            <p>Artista</p>
          </div>
        </div>
      );
    }
    
    if (item.tipo === 'album') {
      return (
        <div 
          key={item.id} 
          className={styles.libraryItem}
          onClick={() => navigate(`/user/album/${item.id}`)}
        >
          <img 
            src={item.imagenUrl} 
            alt={item.nombre}
            className={styles.itemImage}
          />
          <div className={styles.itemInfo}>
            <h4>{item.nombre}</h4>
            <p>Álbum • {item.artistaNombre || 'Sin artista'}</p>
          </div>
        </div>
      );
    }
    
    if (item.tipo === 'lista') {
      return (
        <div key={item.id} className={styles.libraryItem}>
          <div className={styles.playlistIcon}>
            <FaMusic />
          </div>
          <div className={styles.itemInfo}>
            <h4>{item.nombre}</h4>
            <p>Lista • {item.canciones} canciones</p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`${styles.sidebar} ${!expanded ? styles.collapsed : ''}`}>
      {expanded ? (
        <>
          <nav className={styles.navigation}>
            <button
              className={`${styles.navItem} ${isActive('/user/home') ? styles.active : ''}`}
              onClick={() => navigate('/user/home')}
            >
              <FaHome />
              <span>Inicio</span>
            </button>
          </nav>

          <div className={styles.divider}></div>

          <div className={styles.libraryHeader}>
            <button
              className={`${styles.navItem} ${isActive('/user/library') ? styles.active : ''}`}
              onClick={() => navigate('/user/library')}
              style={{ flex: 1 }}
            >
              <BiLibrary />
              <span>Tu Biblioteca</span>
            </button>
            
            <button 
              className={styles.toggleButtonNew}
              onClick={toggleSidebar}
              title="Contraer"
            >
              <FaBars />
            </button>
          </div>

          <button className={styles.createButton}>
            <div className={styles.createIcon}>
              <FaPlus />
            </div>
            <span>Crear lista</span>
          </button>

          <button
            className={`${styles.likedSongs} ${isActive('/user/liked-songs') ? styles.active : ''}`}
            onClick={() => navigate('/user/liked-songs')}
          >
            <div className={styles.likedIcon}>
              <FaHeart />
            </div>
            <span>Canciones que te gustan</span>
          </button>

          <div className={styles.divider}></div>

          <div className={styles.libraryContent}>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeFilter === 'listas' ? styles.active : ''}`}
                onClick={() => handleFilterClick('listas')}
              >
                Listas
              </button>
              <button 
                className={`${styles.tab} ${activeFilter === 'artistas' ? styles.active : ''}`}
                onClick={() => handleFilterClick('artistas')}
              >
                Artistas
              </button>
              <button 
                className={`${styles.tab} ${activeFilter === 'albumes' ? styles.active : ''}`}
                onClick={() => handleFilterClick('albumes')}
              >
                Álbumes
              </button>
            </div>

            <div className={styles.searchBox}>
              <FaSearch />
              <input 
                type="text" 
                placeholder="Buscar en tu biblioteca"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className={styles.itemsList}>
              {/* Resultados de búsqueda */}
              {showSearchResults ? (
                <>
                  {filteredData.length > 0 ? (
                    filteredData.map(item => renderItem(item))
                  ) : (
                    <div className={styles.emptyLibrary}>
                      <p>No se encontraron resultados para "{searchTerm}"</p>
                    </div>
                  )}
                </>
              ) : showFilteredView ? (
                /* Vista filtrada (sin búsqueda) */
                <>
                  {filteredData.length > 0 ? (
                    filteredData.map(item => renderItem(item))
                  ) : (
                    <div className={styles.emptyLibrary}>
                      <p>No tienes {activeFilter} en tu biblioteca</p>
                    </div>
                  )}
                </>
              ) : (
                /* Vista completa (sin filtro ni búsqueda) */
                <>
                  {artistasFavoritos.length > 0 && (
                    <>
                      <div className={styles.sectionTitle}>Artistas Favoritos</div>
                      {artistasFavoritos.map(artista => (
                        <div 
                          key={artista.artistId} 
                          className={styles.libraryItem}
                          onClick={() => navigate(`/user/artist/${artista.artistId}`)}
                        >
                          {artista.imagenUrl ? (
                            <img 
                              src={artista.imagenUrl} 
                              alt={artista.nombre}
                              className={styles.artistImageRound}
                            />
                          ) : (
                            <div className={styles.artistImagePlaceholderRound}>
                              <FaMusic />
                            </div>
                          )}
                          <div className={styles.itemInfo}>
                            <h4>{artista.nombre}</h4>
                            <p>Artista</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {albumesFavoritos.length > 0 && (
                    <>
                      <div className={styles.sectionTitle}>Álbumes de tus favoritos</div>
                      {albumesFavoritos.map(album => (
                        <div 
                          key={album.id} 
                          className={styles.libraryItem}
                          onClick={() => navigate(`/user/album/${album.id}`)}
                        >
                          <img 
                            src={album.imagenUrl} 
                            alt={album.nombre}
                            className={styles.itemImage}
                          />
                          <div className={styles.itemInfo}>
                            <h4>{album.nombre}</h4>
                            <p>Álbum • {album.artistaNombre || 'Sin artista'}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {playlists.length > 0 && (
                    <>
                      <div className={styles.sectionTitle}>Tus listas</div>
                      {playlists.map(playlist => (
                        <div key={playlist.id} className={styles.libraryItem}>
                          <div className={styles.playlistIcon}>
                            <FaMusic />
                          </div>
                          <div className={styles.itemInfo}>
                            <h4>{playlist.nombre}</h4>
                            <p>Lista • {playlist.canciones} canciones</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {artistasFavoritos.length === 0 && albumesFavoritos.length === 0 && playlists.length === 0 && (
                    <div className={styles.emptyLibrary}>
                      <p>Tu biblioteca está vacía</p>
                      <p className={styles.emptySubtext}>
                        Agrega artistas y álbumes a favoritos para verlos aquí
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Modo colapsado */
        <>
          <button
            className={`${styles.collapsedIcon} ${isActive('/user/home') ? styles.active : ''}`}
            onClick={() => navigate('/user/home')}
            title="Inicio"
          >
            <FaHome />
          </button>

          <div className={styles.dividerCollapsed}></div>

          <button
            className={`${styles.collapsedIcon} ${isActive('/user/library') ? styles.active : ''}`}
            onClick={toggleSidebar}
            title="Expandir Tu Biblioteca"
          >
            <BiLibrary />
          </button>

          <button
            className={styles.collapsedIcon}
            onClick={() => {
              console.log('Crear nueva lista');
            }}
            title="Crear lista"
          >
            <div className={styles.createIconCollapsed}>
              <FaPlus />
            </div>
          </button>

          <button
            className={`${styles.collapsedIcon} ${isActive('/user/liked-songs') ? styles.active : ''}`}
            onClick={() => navigate('/user/liked-songs')}
            title="Canciones que te gustan"
          >
            <div className={styles.likedIconCollapsed}>
              <FaHeart />
            </div>
          </button>

          {artistasFavoritos.length > 0 && (
            <div className={styles.collapsedArtists}>
              {artistasFavoritos.slice(0, 6).map(artista => (
                <button
                  key={artista.artistId}
                  className={styles.collapsedArtistItem}
                  onClick={() => navigate(`/user/artist/${artista.artistId}`)}
                  title={artista.nombre}
                >
                  {artista.imagenUrl ? (
                    <img 
                      src={artista.imagenUrl} 
                      alt={artista.nombre}
                      className={styles.collapsedArtistImage}
                    />
                  ) : (
                    <div className={styles.collapsedArtistPlaceholder}>
                      <FaMusic />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {albumesFavoritos.length > 0 && (
            <div className={styles.collapsedAlbums}>
              {albumesFavoritos.slice(0, 6).map(album => (
                <button
                  key={album.id}
                  className={styles.collapsedAlbumItem}
                  onClick={() => navigate(`/user/album/${album.id}`)}
                  title={`${album.nombre} - ${album.artistaNombre || 'Sin artista'}`}
                >
                  <img 
                    src={album.imagenUrl} 
                    alt={album.nombre}
                    className={styles.collapsedAlbumImage}
                  />
                </button>
              ))}
            </div>
          )}

          {playlists.length > 0 && (
            <div className={styles.collapsedPlaylists}>
              {playlists.map(playlist => (
                <button
                  key={playlist.id}
                  className={styles.collapsedPlaylistItem}
                  onClick={() => {
                    console.log('Click en playlist:', playlist.nombre);
                  }}
                  title={playlist.nombre}
                >
                  <div className={styles.collapsedPlaylistIcon}>
                    <FaMusic />
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar;