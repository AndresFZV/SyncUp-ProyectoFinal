import { get, post, del } from './api';

const API_URL = '/favoritos';
const USUARIOS_API_URL = '/usuarios'; // ← AGREGAR ESTA LÍNEA

// ============================================
// ARTISTAS FAVORITOS
// ============================================

export const getArtistasFavoritos = async (username) => {
  try {
    console.log(`[Favoritos Service] Obteniendo artistas favoritos de ${username}`);
    const data = await get(`${API_URL}/artistas/${username}`);
    console.log('[Favoritos Service] ✅ Artistas favoritos obtenidos:', data);
    return data;
  } catch (error) {
    console.error('[Favoritos Service] ❌ Error al cargar artistas favoritos:', error);
    throw new Error(error.message || 'Error al cargar artistas favoritos');
  }
};

export const verificarArtistaFavorito = async (username, artistaId) => {
  try {
    const response = await get(`${API_URL}/artistas/${username}/${artistaId}/check`);
    return response.esFavorito;
  } catch (error) {
    return false;
  }
};

export const agregarArtistaFavorito = async (username, artistaId) => {
  try {
    console.log(`[Favoritos Service] Agregando artista ${artistaId} a favoritos`);
    const response = await post(`${API_URL}/artistas/${username}/${artistaId}`);
    
    console.log('🔔 Disparando evento: favoritosActualizados (artista agregado)');
    window.dispatchEvent(new CustomEvent('favoritosActualizados', { 
      detail: { tipo: 'artista', accion: 'agregar', artistaId } 
    }));
    
    console.log('[Favoritos Service] ✅ Artista agregado a favoritos');
    return response;
  } catch (error) {
    console.error('[Favoritos Service] ❌ Error al agregar artista a favoritos:', error);
    throw new Error(error.message || 'Error al agregar artista a favoritos');
  }
};

export const eliminarArtistaFavorito = async (username, artistaId) => {
  try {
    console.log(`[Favoritos Service] Eliminando artista ${artistaId} de favoritos`);
    const response = await del(`${API_URL}/artistas/${username}/${artistaId}`);
    
    console.log('🔔 Disparando evento: favoritosActualizados (artista eliminado)');
    window.dispatchEvent(new CustomEvent('favoritosActualizados', { 
      detail: { tipo: 'artista', accion: 'eliminar', artistaId } 
    }));
    
    console.log('[Favoritos Service] ✅ Artista eliminado de favoritos');
    return response;
  } catch (error) {
    console.error('[Favoritos Service] ❌ Error al eliminar artista de favoritos:', error);
    throw new Error(error.message || 'Error al eliminar artista de favoritos');
  }
};

// ============================================
// ÁLBUMES FAVORITOS
// ============================================

export const getAlbumesFavoritos = async (username) => {
  try {
    console.log(`[Favoritos Service] Obteniendo álbumes favoritos de ${username}`);
    const data = await get(`${API_URL}/albumes/${username}`);
    console.log('[Favoritos Service] ✅ Álbumes favoritos obtenidos:', data);
    return data;
  } catch (error) {
    console.error('[Favoritos Service] ❌ Error al cargar álbumes favoritos:', error);
    throw new Error(error.message || 'Error al cargar álbumes favoritos');
  }
};

export const verificarAlbumFavorito = async (username, albumId) => {
  try {
    const response = await get(`${API_URL}/albumes/${username}/${albumId}/check`);
    return response.esFavorito;
  } catch (error) {
    return false;
  }
};

export const agregarAlbumFavorito = async (username, albumId) => {
  try {
    console.log(`[Favoritos Service] Agregando álbum ${albumId} a favoritos`);
    const response = await post(`${API_URL}/albumes/${username}/${albumId}`);
    
    console.log('🔔 Disparando evento: favoritosActualizados (álbum agregado)');
    window.dispatchEvent(new CustomEvent('favoritosActualizados', { 
      detail: { tipo: 'album', accion: 'agregar', albumId } 
    }));
    
    console.log('[Favoritos Service] ✅ Álbum agregado a favoritos');
    return response;
  } catch (error) {
    console.error('[Favoritos Service] ❌ Error al agregar álbum a favoritos:', error);
    throw new Error(error.message || 'Error al agregar álbum a favoritos');
  }
};

export const eliminarAlbumFavorito = async (username, albumId) => {
  try {
    console.log(`[Favoritos Service] Eliminando álbum ${albumId} de favoritos`);
    const response = await del(`${API_URL}/albumes/${username}/${albumId}`);
    
    console.log('🔔 Disparando evento: favoritosActualizados (álbum eliminado)');
    window.dispatchEvent(new CustomEvent('favoritosActualizados', { 
      detail: { tipo: 'album', accion: 'eliminar', albumId } 
    }));
    
    console.log('[Favoritos Service] ✅ Álbum eliminado de favoritos');
    return response;
  } catch (error) {
    console.error('[Favoritos Service] ❌ Error al eliminar álbum de favoritos:', error);
    throw new Error(error.message || 'Error al eliminar álbum de favoritos');
  }
};

// ============================================
// CANCIONES FAVORITAS ← CAMBIAR A USUARIOS API
// ============================================

/**
 * Obtener canciones favoritas del usuario
 */
export const getCancionesFavoritas = async (username) => {
  try {
    console.log(`[Favoritos Service] Obteniendo canciones favoritas de ${username}`);
    const data = await get(`${USUARIOS_API_URL}/${username}/favoritos/canciones`); // ← CAMBIO AQUÍ
    console.log('[Favoritos Service] ✅ Canciones favoritas obtenidas:', data);
    return data;
  } catch (error) {
    console.error('[Favoritos Service] ❌ Error al cargar canciones favoritas:', error);
    throw new Error(error.message || 'Error al cargar canciones favoritas');
  }
};

/**
 * Verificar si una canción es favorita
 */
export const verificarCancionFavorita = async (username, cancionId) => {
  try {
    const response = await get(`${USUARIOS_API_URL}/${username}/favoritos/canciones/${cancionId}/check`); // ← CAMBIO AQUÍ
    return response.esFavorita || false;
  } catch (error) {
    console.error('[Favoritos Service] Error al verificar canción favorita:', error);
    return false;
  }
};

/**
 * Agregar canción a favoritas
 */
export const agregarCancionFavorita = async (username, cancionId) => {
  try {
    console.log(`[Favoritos Service] Agregando canción ${cancionId} a favoritas`);
    const response = await post(`${USUARIOS_API_URL}/${username}/favoritos/canciones/${cancionId}`); // ← CAMBIO AQUÍ
    
    console.log('🔔 Disparando evento: favoritosActualizados (canción agregada)');
    window.dispatchEvent(new CustomEvent('favoritosActualizados', { 
      detail: { tipo: 'cancion', accion: 'agregar', cancionId } 
    }));
    
    console.log('[Favoritos Service] ✅ Canción agregada a favoritas');
    return response;
  } catch (error) {
    console.error('[Favoritos Service] ❌ Error al agregar canción a favoritas:', error);
    throw new Error(error.message || 'Error al agregar canción a favoritas');
  }
};

/**
 * Eliminar canción de favoritas
 */
export const eliminarCancionFavorita = async (username, cancionId) => {
  try {
    console.log(`[Favoritos Service] Eliminando canción ${cancionId} de favoritas`);
    const response = await del(`${USUARIOS_API_URL}/${username}/favoritos/canciones/${cancionId}`); // ← CAMBIO AQUÍ
    
    console.log('🔔 Disparando evento: favoritosActualizados (canción eliminada)');
    window.dispatchEvent(new CustomEvent('favoritosActualizados', { 
      detail: { tipo: 'cancion', accion: 'eliminar', cancionId } 
    }));
    
    console.log('[Favoritos Service] ✅ Canción eliminada de favoritas');
    return response;
  } catch (error) {
    console.error('[Favoritos Service] ❌ Error al eliminar canción de favoritas:', error);
    throw new Error(error.message || 'Error al eliminar canción de favoritas');
  }
};

// ============================================
// EXPORTS
// ============================================

export default {
  // Artistas
  getArtistasFavoritos,
  verificarArtistaFavorito,
  agregarArtistaFavorito,
  eliminarArtistaFavorito,
  
  // Álbumes
  getAlbumesFavoritos,
  verificarAlbumFavorito,
  agregarAlbumFavorito,
  eliminarAlbumFavorito,
  
  // Canciones
  getCancionesFavoritas,
  verificarCancionFavorita,
  agregarCancionFavorita,
  eliminarCancionFavorita,
};