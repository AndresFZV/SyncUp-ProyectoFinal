import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes, FaPlay, FaPause, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './AdvancedSearch.module.css';
import { busquedaAvanzada, crearCriteriosVacios, tieneCriterios } from '../../services/busquedaService';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';

const AdvancedSearch = ({ onClose }) => {
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying, pauseSong } = useMusicPlayer();
  
  const [criterios, setCriterios] = useState(crearCriteriosVacios());
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleChange = (field, value) => {
    setCriterios(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    
    if (!tieneCriterios(criterios)) {
      alert('Ingresa al menos un criterio de búsqueda');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Búsqueda avanzada con criterios:', criterios);
      const data = await busquedaAvanzada(criterios);
      console.log('✅ Resultados:', data);
      setResultados(data);
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCriterios(crearCriteriosVacios());
    setResultados(null);
  };

  const handleSongClick = (cancion, index) => {
    const cancionId = cancion._id || cancion.songId;
    const currentId = currentSong?._id || currentSong?.songId;
    
    if (currentId === cancionId && isPlaying) {
      pauseSong();
    } else {
      playSong(cancion, resultados.canciones, index);
    }
  };

  const handleArtistClick = (artistaId) => {
    navigate(`/user/artist/${artistaId}`);
    onClose?.();
  };

  const handleAlbumClick = (albumId) => {
    navigate(`/user/album/${albumId}`);
    onClose?.();
  };

  const handleUsuarioClick = (username) => {
    navigate(`/user/profile/${username}`);
    onClose?.();
  };

  const formatDuration = (duracion) => {
    const minutes = Math.floor(duracion);
    const seconds = Math.round((duracion % 1) * 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const isCurrentSong = (cancionId) => {
    const currentId = currentSong?._id || currentSong?.songId;
    return currentId === cancionId;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <FaSearch />
            <h2>Búsqueda Avanzada</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Formulario */}
        <form className={styles.form} onSubmit={handleSearch}>
          {/* Búsqueda general (Trie) */}
          <div className={styles.formGroup}>
            <label>Búsqueda general (RF-003: Autocompletado)</label>
            <input
              type="text"
              placeholder="Título, artista, género, usuario..."
              value={criterios.query}
              onChange={(e) => handleChange('query', e.target.value)}
              className={styles.input}
            />
            <small>Usa el Trie para autocompletado</small>
          </div>

          {/* Toggle filtros avanzados */}
          <button
            type="button"
            className={styles.toggleFilters}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <FaFilter />
            {mostrarFiltros ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados (RF-004)'}
          </button>

          {/* Filtros avanzados */}
          {mostrarFiltros && (
            <div className={styles.advancedFilters}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Artista</label>
                  <input
                    type="text"
                    placeholder="Nombre del artista"
                    value={criterios.artista}
                    onChange={(e) => handleChange('artista', e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Género</label>
                  <input
                    type="text"
                    placeholder="Hip-Hop, R&B, Pop..."
                    value={criterios.genero}
                    onChange={(e) => handleChange('genero', e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Año mínimo</label>
                  <input
                    type="number"
                    placeholder="2000"
                    value={criterios.anioMin || ''}
                    onChange={(e) => handleChange('anioMin', e.target.value ? parseInt(e.target.value) : null)}
                    className={styles.input}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Año máximo</label>
                  <input
                    type="number"
                    placeholder="2024"
                    value={criterios.anioMax || ''}
                    onChange={(e) => handleChange('anioMax', e.target.value ? parseInt(e.target.value) : null)}
                    className={styles.input}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              {/* Lógica AND/OR */}
              <div className={styles.formGroup}>
                <label>Lógica de filtros (RF-004)</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="logica"
                      value="AND"
                      checked={criterios.logica === 'AND'}
                      onChange={(e) => handleChange('logica', e.target.value)}
                    />
                    <span>AND (cumplir todos los filtros)</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="logica"
                      value="OR"
                      checked={criterios.logica === 'OR'}
                      onChange={(e) => handleChange('logica', e.target.value)}
                    />
                    <span>OR (cumplir al menos uno)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.resetButton}
              onClick={handleReset}
            >
              Limpiar
            </button>
            <button
              type="submit"
              className={styles.searchButton}
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>RF-030: Búsqueda con hilos en paralelo...</p>
          </div>
        )}

        {/* Resultados */}
        {resultados && !loading && (
          <div className={styles.results}>
            {/* Estadísticas de concurrencia */}
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Tiempo total:</span>
                <span className={styles.statValue}>{resultados.tiempoBusqueda}ms</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Hilos utilizados:</span>
                <span className={styles.statValue}>{resultados.hilosUtilizados}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Resultados:</span>
                <span className={styles.statValue}>{resultados.totalResultados}</span>
              </div>
            </div>

            {/* Canciones */}
            {resultados.canciones && resultados.canciones.length > 0 && (
              <div className={styles.section}>
                <h3>🎵 Canciones ({resultados.canciones.length})</h3>
                <div className={styles.songsList}>
                  {resultados.canciones.map((cancion, index) => {
                    const cancionId = cancion._id || cancion.songId;
                    const playing = isCurrentSong(cancionId) && isPlaying;
                    
                    return (
                      <div
                        key={cancionId || index}
                        className={`${styles.songCard} ${playing ? styles.playing : ''}`}
                        onClick={() => handleSongClick(cancion, index)}
                      >
                        <img src={cancion.imagenUrl} alt={cancion.titulo} />
                        <div className={styles.songInfo}>
                          <h4>{cancion.titulo}</h4>
                          <p>{cancion.artista?.nombre || 'Artista desconocido'}</p>
                          <span className={styles.meta}>
                            {cancion.genero} • {cancion.anio} • {formatDuration(cancion.duracion)}
                          </span>
                        </div>
                        <button className={styles.playBtn}>
                          {playing ? <FaPause /> : <FaPlay />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Artistas */}
            {resultados.artistas && resultados.artistas.length > 0 && (
              <div className={styles.section}>
                <h3>🎤 Artistas ({resultados.artistas.length})</h3>
                <div className={styles.artistsList}>
                  {resultados.artistas.map((artista) => (
                    <div
                      key={artista.artistId || artista._id}
                      className={styles.artistCard}
                      onClick={() => handleArtistClick(artista.artistId || artista._id)}
                    >
                      <img src={artista.imagenUrl} alt={artista.nombre} />
                      <h4>{artista.nombre}</h4>
                      <p>{artista.generoPrincipal}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Álbumes */}
            {resultados.albums && resultados.albums.length > 0 && (
              <div className={styles.section}>
                <h3>💿 Álbumes ({resultados.albums.length})</h3>
                <div className={styles.albumsList}>
                  {resultados.albums.map((album) => (
                    <div
                      key={album._id || album.id}
                      className={styles.albumCard}
                      onClick={() => handleAlbumClick(album._id || album.id)}
                    >
                      <img src={album.imagenUrl} alt={album.nombre} />
                      <h4>{album.nombre}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usuarios */}
            {resultados.usuarios && resultados.usuarios.length > 0 && (
              <div className={styles.section}>
                <h3>👤 Usuarios ({resultados.usuarios.length})</h3>
                <div className={styles.usuariosList}>
                  {resultados.usuarios.map((usuario) => (
                    <div
                      key={usuario.username || usuario._id}
                      className={styles.usuarioCard}
                      onClick={() => handleUsuarioClick(usuario.username)}
                    >
                      <div className={styles.usuarioAvatar}>
                        <FaUserCircle />
                      </div>
                      <div className={styles.usuarioInfo}>
                        <h4>{usuario.nombre}</h4>
                        <p>@{usuario.username}</p>
                        {usuario.edad && <span>{usuario.edad} años</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sin resultados */}
            {resultados.totalResultados === 0 && (
              <div className={styles.noResults}>
                <FaSearch size={48} />
                <p>No se encontraron resultados</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;