import React, { useState, useEffect } from 'react';
import { FaClock, FaMusic } from 'react-icons/fa';
import { useMusicPlayer } from '../../../contexts/MusicPlayerContext';
import SongCard from '../../../components/user/SongCard/SongCard';
import ArtistCard from '../../../components/user/ArtistCard/ArtistCard';
import PlaylistCard from '../../../components/user/PlaylistCard/PlaylistCard';
import SectionCarousel from '../../../components/user/SectionCarousel/SectionCarousel';
import {
  obtenerDescubrimientoSemanal,
  obtenerMixesPorGenero,
  obtenerCancionesRecientes,
  obtenerArtistasPopulares,
  obtenerMultiplesRecomendaciones, // ← AGREGADO
} from '../../../services/homeService';
import styles from './Home.module.css';

const Home = () => {
  const { playSong } = useMusicPlayer();
  const username = localStorage.getItem('userName');

  const [loading, setLoading] = useState(true);
  const [descubrimientoSemanal, setDescubrimientoSemanal] = useState([]);
  const [mixesPorGenero, setMixesPorGenero] = useState({});
  const [cancionesRecientes, setCancionesRecientes] = useState([]);
  const [artistasPopulares, setArtistasPopulares] = useState([]);
  const [recomendacionesExtra, setRecomendacionesExtra] = useState([]); // ← NUEVO

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const cargarDatos = async () => {
    if (!username) {
      console.warn('No hay usuario logueado');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Cargando datos del home para:', username);

      const [
        descubrimiento,
        mixes,
        recientes,
        artistas,
        multiplesRec, // ← AGREGADO
      ] = await Promise.all([
        obtenerDescubrimientoSemanal(username).catch(() => []),
        obtenerMixesPorGenero(username).catch(() => ({})),
        obtenerCancionesRecientes(username).catch(() => []),
        obtenerArtistasPopulares(username).catch(() => []),
        obtenerMultiplesRecomendaciones(username).catch(() => ({})), // ← AGREGADO
      ]);

      console.log('✅ Datos cargados:', {
        descubrimiento: descubrimiento.length,
        mixes: Object.keys(mixes).length,
        recientes: recientes.length,
        artistas: artistas.length,
        multiplesRec: multiplesRec,
      });

      setDescubrimientoSemanal(descubrimiento);
      setMixesPorGenero(mixes);
      setCancionesRecientes(recientes);
      setArtistasPopulares(artistas);
      
      // Guardar las canciones extra recomendadas
      setRecomendacionesExtra(multiplesRec.canciones || []); // ← AGREGADO

    } catch (error) {
      console.error('❌ Error al cargar datos del home:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song) => {
    console.log('▶️ Reproduciendo canción:', song.titulo);
    playSong(song);
  };

  const handlePlayPlaylist = (canciones) => {
    if (canciones && canciones.length > 0) {
      console.log('▶️ Reproduciendo playlist:', canciones.length, 'canciones');
      playSong(canciones[0], canciones, 0);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando tu música...</p>
      </div>
    );
  }

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <h1>{obtenerSaludo()}</h1>
      </header>

      {/* Canciones recientes */}
      {cancionesRecientes.length > 0 && (
        <section className={styles.recentSection}>
          <div className={styles.recentGrid}>
            {cancionesRecientes.slice(0, 6).map((cancion) => (
              <div
                key={cancion.songId}
                className={styles.recentCard}
                onClick={() => handlePlaySong(cancion)}
              >
                <img src={cancion.imagenUrl} alt={cancion.titulo} />
                <span>{cancion.titulo}</span>
                <button className={styles.quickPlayButton}>
                  <FaClock />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Descubrimiento Semanal */}
      {descubrimientoSemanal.length > 0 && (
        <SectionCarousel title="Descubrimiento Semanal">
          <PlaylistCard
            playlist={{
              nombre: 'Descubrimiento Semanal',
              descripcion: `${descubrimientoSemanal.length} canciones basadas en tus gustos`,
              imagenUrl: descubrimientoSemanal[0]?.imagenUrl,
              canciones: descubrimientoSemanal
            }}
            onPlay={handlePlayPlaylist}
          />
          {descubrimientoSemanal.slice(0, 10).map((cancion) => (
            <SongCard
              key={cancion.songId}
              song={cancion}
              onPlay={handlePlaySong}
            />
          ))}
        </SectionCarousel>
      )}

      {/* Recomendaciones Extra */}
      {recomendacionesExtra.length > 0 && (
        <SectionCarousel title="Recomendado para ti">
          <PlaylistCard
            playlist={{
              nombre: 'Recomendado para ti',
              descripcion: `${recomendacionesExtra.length} canciones que podrían gustarte`,
              imagenUrl: recomendacionesExtra[0]?.imagenUrl,
              canciones: recomendacionesExtra
            }}
            onPlay={handlePlayPlaylist}
          />
          {recomendacionesExtra.slice(0, 10).map((cancion) => (
            <SongCard
              key={cancion.songId}
              song={cancion}
              onPlay={handlePlaySong}
            />
          ))}
        </SectionCarousel>
      )}

      {/* Tus artistas favoritos */}
      {artistasPopulares.length > 0 && (
        <SectionCarousel title="Tus artistas favoritos">
          {artistasPopulares.map((artista) => (
            <ArtistCard key={artista.artistaId} artista={artista} />
          ))}
        </SectionCarousel>
      )}

      {/* Mixes por género */}
      {Object.keys(mixesPorGenero).map((genero) => (
        <SectionCarousel key={genero} title={`Mix de ${genero}`}>
          <PlaylistCard
            playlist={{
              nombre: `${genero} Mix`,
              descripcion: `Las mejores canciones de ${genero}`,
              imagenUrl: mixesPorGenero[genero][0]?.imagenUrl,
              canciones: mixesPorGenero[genero]
            }}
            onPlay={handlePlayPlaylist}
          />
          {mixesPorGenero[genero].slice(0, 10).map((cancion) => (
            <SongCard
              key={cancion.songId}
              song={cancion}
              onPlay={handlePlaySong}
            />
          ))}
        </SectionCarousel>
      ))}

      {/* Empty state */}
      {!loading && 
       cancionesRecientes.length === 0 && 
       descubrimientoSemanal.length === 0 && 
       recomendacionesExtra.length === 0 &&
       Object.keys(mixesPorGenero).length === 0 && (
        <div className={styles.emptyState}>
          <FaMusic size={64} />
          <h2>Empieza a descubrir música</h2>
          <p>Agrega canciones a tus favoritos para recibir recomendaciones personalizadas</p>
        </div>
      )}
    </div>
  );
};

export default Home;