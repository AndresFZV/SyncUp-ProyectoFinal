import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { obtenerCancionesSimilares } from '../services/radioService';

const MusicPlayerContext = createContext(undefined);

export const MusicPlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  
  // Estados básicos
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off');
  
  // Estados de cola y radio
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [radioMode, setRadioMode] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [originalQueue, setOriginalQueue] = useState([]);

  // ========== DEFINIR TODAS LAS FUNCIONES PRIMERO ==========

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const toggleQueue = () => {
    console.log('🔘 toggleQueue llamado');
    setIsQueueOpen(prev => !prev);
  };

  const toggleShuffle = () => {
    const newShuffle = !shuffle;
    setShuffle(newShuffle);
    if (newShuffle && queue.length > 0) {
      const currentSongObj = queue[queueIndex];
      const otherSongs = queue.filter((_, i) => i !== queueIndex);
      const shuffled = [...otherSongs].sort(() => Math.random() - 0.5);
      setQueue([currentSongObj, ...shuffled]);
      setQueueIndex(0);
    } else if (!newShuffle && originalQueue.length > 0) {
      setQueue([...originalQueue]);
      const originalIndex = originalQueue.findIndex(
        s => (s.songId || s.cancionId) === (currentSong?.songId || currentSong?.cancionId)
      );
      setQueueIndex(originalIndex >= 0 ? originalIndex : 0);
    }
  };

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeat);
    setRepeat(modes[(currentIndex + 1) % modes.length]);
  };

  const playFromQueue = (index) => {
    if (index >= 0 && index < queue.length) {
      setQueueIndex(index);
      setCurrentSong(queue[index]);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const removeFromQueue = (index) => {
    if (queue.length <= 1) return;
    const newQueue = queue.filter((_, i) => i !== index);
    setQueue(newQueue);
    setOriginalQueue(newQueue);
    if (index < queueIndex) {
      setQueueIndex(queueIndex - 1);
    } else if (index === queueIndex && queueIndex >= newQueue.length) {
      setQueueIndex(newQueue.length - 1);
      setCurrentSong(newQueue[newQueue.length - 1]);
    }
  };

const playNext = () => {
  console.log('⏭️ playNext llamado');
  console.log('📊 Estado actual:', {
    queueLength: queue.length,
    queueIndex,
    shuffle,
    repeat
  });

  if (queue.length === 0) {
    console.warn('❌ Cola vacía, no hay siguiente canción');
    return;
  }

  let nextIndex;

  if (shuffle) {
    // Modo aleatorio: elegir índice random diferente al actual
    const availableIndices = queue
      .map((_, i) => i)
      .filter(i => i !== queueIndex);
    
    if (availableIndices.length === 0) {
      console.warn('❌ No hay más canciones para shuffle');
      setIsPlaying(false);
      return;
    }
    
    nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    console.log('🔀 Shuffle - Siguiente índice aleatorio:', nextIndex);
  } else {
    // Modo normal: siguiente en orden
    if (queueIndex < queue.length - 1) {
      // Hay siguiente canción
      nextIndex = queueIndex + 1;
      console.log('▶️ Siguiente canción en orden:', nextIndex);
    } else if (repeat === 'all') {
      // Última canción con repeat all: volver al inicio
      nextIndex = 0;
      console.log('🔁 Repeat all - Volviendo al inicio');
    } else {
      // Última canción sin repeat: detener
      console.log('⏹️ Última canción alcanzada, deteniendo');
      setIsPlaying(false);
      return;
    }
  }

  console.log('✅ Reproduciendo canción:', queue[nextIndex]?.titulo);
  
  setQueueIndex(nextIndex);
  setCurrentSong(queue[nextIndex]);
  setIsPlaying(true);
  setCurrentTime(0);
};

  const playPrevious = () => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      seek(0);
      return;
    }
    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      setCurrentSong(queue[prevIndex]);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const generarColaRadio = async (cancionBase) => {
    try {
      console.log('🎵 Generando cola de radio...');
      const cancionId = cancionBase.songId || cancionBase.cancionId;
      const cancionesSimilares = await obtenerCancionesSimilares(cancionId, 20);
      const nuevaCola = [cancionBase, ...cancionesSimilares];
      
      setQueue(nuevaCola);
      setOriginalQueue([...nuevaCola]);
      setQueueIndex(0);
      setRadioMode(true);
      
      console.log('✅ Cola generada:', nuevaCola.length, 'canciones');
    } catch (error) {
      console.error('❌ Error al generar cola:', error);
      setQueue([cancionBase]);
      setOriginalQueue([cancionBase]);
      setQueueIndex(0);
      setRadioMode(true);
    }
  };

  const playSong = async (song, playlist = null, index = 0) => {
    console.log('▶️ Reproduciendo:', song.titulo);
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);

    if (playlist && playlist.length > 0) {
      setQueue(playlist);
      setOriginalQueue([...playlist]);
      setQueueIndex(index);
      setRadioMode(false);
    } else {
      await generarColaRadio(song);
    }
  };

  // ========== EFFECTS ==========

useEffect(() => {
  const audio = new Audio();
  audioRef.current = audio;

  const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
  const handleLoadedMetadata = () => setDuration(audio.duration);
  
  const handleEnded = () => {
    console.log('🎵 Canción terminada');
    console.log('📊 Repeat mode:', repeat);
    
    if (repeat === 'one') {
      // Repetir la misma canción
      console.log('🔂 Repeat one - Reiniciando canción');
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      // Reproducir siguiente
      console.log('⏭️ Llamando a playNext');
      playNext();
    }
  };

  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('loadedmetadata', handleLoadedMetadata);
  audio.addEventListener('ended', handleEnded);

  return () => {
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    audio.removeEventListener('ended', handleEnded);
    audio.pause();
  };
}, [repeat, queue, queueIndex, shuffle]); // ← AGREGAR DEPENDENCIAS
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audioUrl = currentSong.musica || currentSong.audioUrl;
    if (!audioUrl) return;

    audioRef.current.src = audioUrl;
    audioRef.current.volume = volume;

    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error('Error al reproducir:', error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentSong, isPlaying, volume]);

  // ========== CREAR OBJETO VALUE ==========

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    queue,
    queueIndex,
    radioMode,
    isQueueOpen,
    playSong,
    togglePlayPause,
    playNext,
    playPrevious,
    playFromQueue,
    removeFromQueue,
    toggleQueue,
    toggleShuffle,
    toggleRepeat,
    seek,
    changeVolume,
  };

  console.log('🟢 Provider Value:', {
    toggleQueue: typeof value.toggleQueue,
    isQueueOpen: value.isQueueOpen
  });

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  
  if (context === undefined) {
    throw new Error('useMusicPlayer debe usarse dentro de MusicPlayerProvider');
  }
  
  console.log('🟡 useMusicPlayer:', {
    toggleQueue: typeof context.toggleQueue
  });
  
  return context;
};
