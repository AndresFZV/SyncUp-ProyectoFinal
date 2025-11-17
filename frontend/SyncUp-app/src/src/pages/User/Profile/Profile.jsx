import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUser, FaMusic, FaHeart, FaTimes, FaEdit, FaLock, FaArrowLeft, FaCompactDisc, FaUserFriends } from 'react-icons/fa';

import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';
import { useMusicPlayer } from '../../../contexts/MusicPlayerContext';
import { getCurrentUser } from '../../../services/authService';
import {
  obtenerPerfilUsuario,
  obtenerArtistasFavoritos,
  obtenerCancionesFavoritas,
  obtenerAlbumesFavoritos,
  obtenerSiguiendo,
  obtenerSeguidores,
  eliminarArtistaFavorito,
  eliminarCancionFavorita,
  eliminarAlbumFavorito,
  actualizarPerfil,
  cambiarPassword,
  seguirUsuario,
  dejarDeSeguirUsuario,
  verificarSiSigo
} from '../../../services/usuariosService';

const Profile = () => {
  const navigate = useNavigate();
  const { username: usernameParam } = useParams();
  
  let currentUsername = localStorage.getItem('userName');
  
  if (!currentUsername) {
    const currentUser = getCurrentUser();
    currentUsername = currentUser?.username;
  }

  const profileUsername = usernameParam || currentUsername;
  const isOwnProfile = !usernameParam || usernameParam === currentUsername;
  
  const { playSong, currentSong, isPlaying } = useMusicPlayer();
  
  const [userData, setUserData] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [cancionesFavoritas, setCancionesFavoritas] = useState([]);
  const [albumesFavoritos, setAlbumesFavoritos] = useState([]);
  const [usuariosSiguiendo, setUsuariosSiguiendo] = useState([]);
  const [usuariosSeguidores, setUsuariosSeguidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estaSiguiendo, setEstaSiguiendo] = useState(false);
  const [loadingSeguir, setLoadingSeguir] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!profileUsername) {
      console.error('❌ No hay usuario especificado');
      navigate('/login');
      return;
    }
    
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUsername]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const perfil = await obtenerPerfilUsuario(profileUsername);
      setUserData(perfil);
      
      const artistas = await obtenerArtistasFavoritos(profileUsername);
      setTopArtists(artistas);
      
      const canciones = await obtenerCancionesFavoritas(profileUsername);
      setCancionesFavoritas(canciones);
      
      const albums = await obtenerAlbumesFavoritos(profileUsername);
      setAlbumesFavoritos(albums);
      
      const siguiendo = await obtenerSiguiendo(profileUsername);
      setUsuariosSiguiendo(siguiendo);
      
      const seguidores = await obtenerSeguidores(profileUsername);
      setUsuariosSeguidores(seguidores);
      
      if (!isOwnProfile) {
        const sigo = await verificarSiSigo(profileUsername);
        setEstaSiguiendo(sigo);
      }
      
    } catch (error) {
      console.error('❌ Error al cargar perfil:', error);
      setError(error.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSeguir = async () => {
    if (loadingSeguir) return;
    
    try {
      setLoadingSeguir(true);
      
      if (estaSiguiendo) {
        await dejarDeSeguirUsuario(profileUsername);
        setEstaSiguiendo(false);
        
        setUserData(prev => ({
          ...prev,
          estadisticas: {
            ...prev.estadisticas,
            seguidores: Math.max(0, prev.estadisticas.seguidores - 1)
          }
        }));
        
        setUsuariosSeguidores(prev => 
          prev.filter(u => u.username !== currentUsername)
        );
        
      } else {
        await seguirUsuario(profileUsername);
        setEstaSiguiendo(true);
        
        setUserData(prev => ({
          ...prev,
          estadisticas: {
            ...prev.estadisticas,
            seguidores: prev.estadisticas.seguidores + 1
          }
        }));
        
        const nuevoSeguidor = {
          username: currentUsername,
          nombre: userData.nombre || currentUsername
        };
        
        setUsuariosSeguidores(prev => {
          const yaExiste = prev.some(u => u.username === currentUsername);
          if (yaExiste) return prev;
          return [...prev, nuevoSeguidor];
        });
      }
      
    } catch (error) {
      console.error('❌ Error al seguir/dejar de seguir:', error);
      alert(error.message || 'Error al procesar la acción');
      await loadProfileData();
      
    } finally {
      setLoadingSeguir(false);
    }
  };

  const handleSaveProfile = async (formData) => {
    try {
      await actualizarPerfil(currentUsername, formData);
      
      setUserData(prev => ({
        ...prev,
        nombre: formData.nombre,
        correo: formData.correo,
        edad: parseInt(formData.edad)
      }));
      
      setShowEditModal(false);
      alert('✅ Perfil actualizado exitosamente');
    } catch (error) {
      throw error;
    }
  };

  const handleChangePassword = async (nuevaPassword) => {
    try {
      await cambiarPassword(currentUsername, nuevaPassword);
      setShowPasswordModal(false);
      alert('✅ Contraseña actualizada exitosamente');
    } catch (error) {
      throw error;
    }
  };

  const handleArtistClick = (artistId) => {
    navigate(`/user/artist/${artistId}`);
  };

  const handleAlbumClick = (albumId) => {
    navigate(`/user/album/${albumId}`);
  };

  const handleUsuarioClick = (username) => {
    if (username === currentUsername) {
      navigate('/user/profile');
    } else {
      navigate(`/user/profile/${username}`);
    }
  };

  const handleEliminarArtista = async (artistaId, e) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar este artista de favoritos?')) {
      try {
        await eliminarArtistaFavorito(currentUsername, artistaId);
        setTopArtists(topArtists.filter(a => a.artistaId !== artistaId));
        
        if (userData) {
          setUserData({
            ...userData,
            estadisticas: {
              ...userData.estadisticas,
              artistasFavoritos: userData.estadisticas.artistasFavoritos - 1
            }
          });
        }
      } catch (error) {
        console.error('Error al eliminar artista:', error);
        alert(error.message || 'Error al eliminar artista de favoritos');
      }
    }
  };

  const handleEliminarCancion = async (cancionId, e) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar esta canción de favoritos?')) {
      try {
        await eliminarCancionFavorita(currentUsername, cancionId);
        setCancionesFavoritas(cancionesFavoritas.filter(c => c.cancionId !== cancionId));
        
        if (userData) {
          setUserData({
            ...userData,
            estadisticas: {
              ...userData.estadisticas,
              cancionesFavoritas: userData.estadisticas.cancionesFavoritas - 1
            }
          });
        }
      } catch (error) {
        console.error('Error al eliminar canción:', error);
        alert(error.message || 'Error al eliminar canción de favoritos');
      }
    }
  };

  const handleEliminarAlbum = async (albumId, e) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar este álbum de favoritos?')) {
      try {
        await eliminarAlbumFavorito(currentUsername, albumId);
        setAlbumesFavoritos(albumesFavoritos.filter(a => a.albumId !== albumId));
        
        if (userData) {
          setUserData({
            ...userData,
            estadisticas: {
              ...userData.estadisticas,
              albumesFavoritos: userData.estadisticas.albumesFavoritos - 1
            }
          });
        }
      } catch (error) {
        console.error('Error al eliminar álbum:', error);
        alert(error.message || 'Error al eliminar álbum de favoritos');
      }
    }
  };

  const handleSongClick = (cancion) => {
    const index = cancionesFavoritas.findIndex(c => c.cancionId === cancion.cancionId);
    playSong(cancion, cancionesFavoritas, index);
  };

  const formatDuration = (duracion) => {
    const minutes = Math.floor(duracion);
    const seconds = Math.round((duracion % 1) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const isCurrentSong = (cancionId) => {
    return currentSong?.cancionId === cancionId || currentSong?.songId === cancionId;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FaTimes className={styles.errorIcon} />
        <h2>Error al cargar perfil</h2>
        <p>{error}</p>
        <button onClick={loadProfileData} className={styles.retryButton}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.errorContainer}>
        <p>No se pudo cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      {!isOwnProfile && (
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Volver
        </button>
      )}

      <div className={styles.profileHeader}>
        <div className={styles.profileImageContainer}>
          <div className={styles.profileImagePlaceholder}>
            <FaUser />
          </div>
        </div>

        <div className={styles.profileInfo}>
          <span className={styles.profileType}>Perfil</span>
          <h1 className={styles.profileName}>{userData.nombre || userData.username}</h1>
          <div className={styles.profileStats}>
            <span>{userData.estadisticas.playlistsPublicas} listas públicas</span>
            <span className={styles.dot}>•</span>
            <span>{userData.estadisticas.seguidores} seguidores</span>
            <span className={styles.dot}>•</span>
            <span>Sigue a {userData.estadisticas.siguiendo} usuarios</span>
          </div>
          
          <div className={styles.profileActions}>
            {isOwnProfile ? (
              <>
                <button 
                  className={styles.editButton}
                  onClick={() => setShowEditModal(true)}
                >
                  <FaEdit /> Editar perfil
                </button>
                <button 
                  className={styles.passwordButton}
                  onClick={() => setShowPasswordModal(true)}
                >
                  <FaLock /> Cambiar contraseña
                </button>
              </>
            ) : (
              <button 
                className={estaSiguiendo ? styles.followingButton : styles.followButton}
                onClick={handleToggleSeguir}
                disabled={loadingSeguir}
              >
                {loadingSeguir ? 'Procesando...' : estaSiguiendo ? 'Siguiendo' : 'Seguir'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.profileContent}>
        
        <div className={styles.socialSection}>
          <section className={styles.halfSection}>
            <div className={styles.sectionHeader}>
              <h2>Siguiendo</h2>
              <span className={styles.privacyNote}>{usuariosSiguiendo.length}</span>
            </div>

            {usuariosSiguiendo.length > 0 ? (
              <div className={styles.usuariosGrid}>
                {usuariosSiguiendo.map((usuario, index) => (
                  <div 
                    key={`siguiendo-${usuario.username}-${index}`}
                    className={styles.usuarioCard}
                    onClick={() => handleUsuarioClick(usuario.username)}
                  >
                    <div className={styles.usuarioAvatar}>
                      <FaUser />
                    </div>
                    <div className={styles.usuarioInfo}>
                      <h3>{usuario.nombre}</h3>
                      <p>@{usuario.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <FaUserFriends />
                <p>{isOwnProfile ? 'Aún no sigues a ningún usuario' : 'Este usuario no sigue a nadie'}</p>
              </div>
            )}
          </section>

          <section className={styles.halfSection}>
            <div className={styles.sectionHeader}>
              <h2>Seguidores</h2>
              <span className={styles.privacyNote}>{usuariosSeguidores.length}</span>
            </div>

            {usuariosSeguidores.length > 0 ? (
              <div className={styles.usuariosGrid}>
                {usuariosSeguidores.map((usuario, index) => (
                  <div 
                    key={`seguidor-${usuario.username}-${index}`}
                    className={styles.usuarioCard}
                    onClick={() => handleUsuarioClick(usuario.username)}
                  >
                    <div className={styles.usuarioAvatar}>
                      <FaUser />
                    </div>
                    <div className={styles.usuarioInfo}>
                      <h3>{usuario.nombre}</h3>
                      <p>@{usuario.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <FaUserFriends />
                <p>{isOwnProfile ? 'Aún no tienes seguidores' : 'Este usuario no tiene seguidores'}</p>
              </div>
            )}
          </section>
        </div>

        <section className={styles.topArtistsSection}>
          <div className={styles.sectionHeader}>
            <h2>Artistas Favoritos</h2>
            <span className={styles.privacyNote}>{userData.estadisticas.artistasFavoritos} artistas</span>
          </div>

          {topArtists.length > 0 ? (
            <div className={styles.artistsGrid}>
              {topArtists.map((artist) => (
                <div 
                  key={artist.artistaId}
                  className={styles.artistCard}
                  onClick={() => handleArtistClick(artist.artistaId)}
                >
                  <div className={styles.artistImageContainer}>
                    {artist.imagenUrl ? (
                      <img 
                        src={artist.imagenUrl} 
                        alt={artist.nombre}
                        className={styles.artistImage}
                      />
                    ) : (
                      <div className={styles.artistImagePlaceholder}>
                        <FaMusic />
                      </div>
                    )}
                    {isOwnProfile && (
                      <div className={styles.cardActions}>
                        <button 
                          className={styles.favoriteButton}
                          onClick={(e) => handleEliminarArtista(artist.artistaId, e)}
                          title="Eliminar de favoritos"
                        >
                          <FaHeart />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={styles.artistInfo}>
                    <h3>{artist.nombre}</h3>
                    <p>{artist.pais || 'Artista'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FaMusic />
              <p>{isOwnProfile ? 'Aún no tienes artistas favoritos' : 'Este usuario no tiene artistas favoritos'}</p>
              {isOwnProfile && (
                <button className={styles.exploreButton} onClick={() => navigate('/user/home')}>
                  Explorar artistas
                </button>
              )}
            </div>
          )}
        </section>

        <section className={styles.topArtistsSection}>
          <div className={styles.sectionHeader}>
            <h2>Álbumes Favoritos</h2>
            <span className={styles.privacyNote}>{albumesFavoritos.length} álbumes</span>
          </div>

          {albumesFavoritos.length > 0 ? (
            <div className={styles.artistsGrid}>
              {albumesFavoritos.map((album) => (
                <div 
                  key={album.albumId}
                  className={styles.artistCard}
                  onClick={() => handleAlbumClick(album.albumId)}
                >
                  <div className={styles.artistImageContainer}>
                    {album.imagenUrl ? (
                      <img 
                        src={album.imagenUrl} 
                        alt={album.nombre}
                        className={styles.albumImage}
                      />
                    ) : (
                      <div className={styles.albumImagePlaceholder}>
                        <FaCompactDisc />
                      </div>
                    )}
                    {isOwnProfile && (
                      <div className={styles.cardActions}>
                        <button 
                          className={styles.favoriteButton}
                          onClick={(e) => handleEliminarAlbum(album.albumId, e)}
                          title="Eliminar de favoritos"
                        >
                          <FaHeart />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={styles.artistInfo}>
                    <h3>{album.nombre}</h3>
                    <p>{album.anio || 'Álbum'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FaCompactDisc />
              <p>{isOwnProfile ? 'Aún no tienes álbumes favoritos' : 'Este usuario no tiene álbumes favoritos'}</p>
              {isOwnProfile && (
                <button className={styles.exploreButton} onClick={() => navigate('/user/home')}>
                  Explorar álbumes
                </button>
              )}
            </div>
          )}
        </section>

        <section className={styles.playlistsSection}>
          <div className={styles.sectionHeader}>
            <h2>Canciones Favoritas</h2>
            <span className={styles.privacyNote}>{userData.estadisticas.cancionesFavoritas} canciones</span>
          </div>

          {cancionesFavoritas.length > 0 ? (
            <div className={styles.songsList}>
              {cancionesFavoritas.map((cancion, index) => (
                <div 
                  key={cancion.cancionId} 
                  className={`${styles.songItem} ${isCurrentSong(cancion.cancionId) ? styles.playing : ''}`}
                  onClick={() => handleSongClick(cancion)}
                >
                  <span className={styles.songNumber}>
                    {isCurrentSong(cancion.cancionId) && isPlaying ? (
                      <div className={styles.playingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <img 
                    src={cancion.imagenUrl || cancion.albumCover} 
                    alt={cancion.titulo}
                    className={styles.songImage}
                  />
                  <div className={styles.songDetails}>
                    <h4>{cancion.titulo}</h4>
                    <p>{cancion.artistaNombre}</p>
                  </div>
                  <span className={styles.songGenre}>{cancion.genero}</span>
                  <span className={styles.songDuration}>{formatDuration(cancion.duracion)}</span>
                  {isOwnProfile && (
                    <button 
                      className={styles.favoriteButtonSong}
                      onClick={(e) => handleEliminarCancion(cancion.cancionId, e)}
                      title="Eliminar de favoritos"
                    >
                      <FaHeart />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <FaHeart />
              <p>{isOwnProfile ? 'Aún no tienes canciones favoritas' : 'Este usuario no tiene canciones favoritas'}</p>
              {isOwnProfile && (
                <button className={styles.exploreButton} onClick={() => navigate('/user/home')}>
                  Explorar música
                </button>
              )}
            </div>
          )}
        </section>

      </div>

      {isOwnProfile && (
        <>
          <EditProfileModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            userData={userData}
            onSave={handleSaveProfile}
          />

          <ChangePasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            username={currentUsername}
            onSave={handleChangePassword}
          />
        </>
      )}
    </div>
  );
};

export default Profile;