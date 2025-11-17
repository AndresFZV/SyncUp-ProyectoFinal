/**
 * ========================================
 * USUARIO SERVICE
 * ========================================
 */

import { get, del } from './api';
import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

// ============================================
// FUNCIONES EXISTENTES (ADMIN/CRUD)
// ============================================

export const getAllUsuarios = async () => {
  try {
    return await get(API_ENDPOINTS.USUARIOS);
  } catch (error) {
    throw new Error(error.message || 'Error al cargar usuarios');
  }
};

export const getUsuarioByUsername = async (username) => {
  try {
    return await get(`${API_ENDPOINTS.USUARIOS}/${username}`);
  } catch (error) {
    throw new Error(error.message || 'Error al cargar usuario');
  }
};

export const getUsuariosMasSeguidos = async () => {
  try {
    return await get(API_ENDPOINTS.USUARIOS_MAS_SEGUIDOS);
  } catch (error) {
    throw new Error(error.message || 'Error al cargar usuarios más seguidos');
  }
};

export const deleteUsuario = async (username) => {
  try {
    return await del(`${API_ENDPOINTS.USUARIOS}/${username}`);
  } catch (error) {
    throw new Error(error.message || 'Error al eliminar usuario');
  }
};

// ============================================
// FUNCIONES PARA PERFIL DE USUARIO
// ============================================

/**
 * Obtener perfil completo del usuario
 * @param {string} username - Username del usuario
 * @returns {Promise<Object>} - Datos del perfil y estadísticas
 */
export const obtenerPerfilUsuario = async (username) => {
  try {
    const response = await api.get(`/usuarios/${username}/perfil`);
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al obtener perfil:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al cargar perfil');
  }
};

/**
 * Obtener artistas favoritos del usuario
 * @param {string} username - Username del usuario
 * @returns {Promise<Array>} - Lista de artistas favoritos
 */
export const obtenerArtistasFavoritos = async (username) => {
  try {
    const response = await api.get(`/usuarios/${username}/favoritos/artistas`);
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al obtener artistas favoritos:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al cargar artistas favoritos');
  }
};

/**
 * Obtener canciones favoritas del usuario
 * @param {string} username - Username del usuario
 * @returns {Promise<Array>} - Lista de canciones favoritas
 */
export const obtenerCancionesFavoritas = async (username) => {
  try {
    const response = await api.get(`/usuarios/${username}/favoritos/canciones`);
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al obtener canciones favoritas:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al cargar canciones favoritas');
  }
};

/**
 * Obtener lista de usuarios que sigue
 * @param {string} username - Username del usuario
 * @returns {Promise<Array>} - Lista de usuarios seguidos
 */
export const obtenerSiguiendo = async (username) => {
  try {
    const response = await api.get(`/usuarios/${username}/siguiendo`);
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al obtener siguiendo:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al cargar usuarios seguidos');
  }
};

/**
 * Obtener lista de seguidores
 * @param {string} username - Username del usuario
 * @returns {Promise<Array>} - Lista de seguidores
 */
export const obtenerSeguidores = async (username) => {
  try {
    const response = await api.get(`/usuarios/${username}/seguidores`);
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al obtener seguidores:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al cargar seguidores');
  }
};

/**
 * Eliminar canción de favoritos
 * @param {string} username - Username del usuario
 * @param {string} cancionId - ID de la canción a eliminar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const eliminarCancionFavorita = async (username, cancionId) => {
  try {
    const response = await api.delete(`/usuarios/${username}/favoritos/canciones/${cancionId}`);
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al eliminar canción favorita:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al eliminar canción de favoritos');
  }
};

/**
 * Seguir a un usuario
 */
export const seguirUsuario = async (usernameASeguir) => {
  try {
    const currentUsername = localStorage.getItem('userName');
    const response = await api.post(`/usuarios/${currentUsername}/seguir/${usernameASeguir}`);
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al seguir usuario:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al seguir usuario');
  }
};

/**
 * Dejar de seguir a un usuario
 */
export const dejarDeSeguirUsuario = async (usernameADejarDeSeguir) => {
  try {
    const currentUsername = localStorage.getItem('userName');
    const response = await api.post(`/usuarios/${currentUsername}/dejar-seguir/${usernameADejarDeSeguir}`);
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al dejar de seguir usuario:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al dejar de seguir usuario');
  }
};

/**
 * Verificar si sigo a un usuario
 */
export const verificarSiSigo = async (username) => {
  try {
    const currentUsername = localStorage.getItem('userName');
    
    if (!currentUsername || currentUsername === username) {
      return false;
    }
    
    console.log(`🔍 Verificando si ${currentUsername} sigue a ${username}`);
    
    const response = await api.get(`/usuarios/${currentUsername}/sigue/${username}`);
    const resultado = response.data.siguiendo || false;
    
    console.log(`✅ Resultado: ${resultado}`);
    return resultado;
  } catch (error) {
    console.error('[Usuario Service] Error al verificar si sigue:', error);
    // Si es 404, simplemente retorna false (no sigue)
    if (error.response?.status === 404) {
      return false;
    }
    return false;
  }
};

/**
 * Eliminar artista de favoritos
 * @param {string} username - Username del usuario
 * @param {string} artistaId - ID del artista a eliminar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const eliminarArtistaFavorito = async (username, artistaId) => {
  try {
    const response = await api.delete(`/usuarios/${username}/favoritos/artistas/${artistaId}`);
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al eliminar artista favorito:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al eliminar artista de favoritos');
  }
};

/**
 * Obtener álbumes favoritos del usuario
 * @param {string} username - Username del usuario
 * @returns {Promise<Array>} - Lista de álbumes favoritos
 */
export const obtenerAlbumesFavoritos = async (username) => {
  try {
    const response = await api.get(`/usuarios/${username}/favoritos/albums`);
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al obtener álbumes favoritos:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al cargar álbumes favoritos');
  }
};

/**
 * Eliminar álbum de favoritos
 * @param {string} username - Username del usuario
 * @param {string} albumId - ID del álbum a eliminar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const eliminarAlbumFavorito = async (username, albumId) => {
  try {
    const response = await api.delete(`/usuarios/${username}/favoritos/albums/${albumId}`);
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al eliminar álbum favorito:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al eliminar álbum de favoritos');
  }
};

/**
 * Actualizar perfil del usuario
 * @param {string} username - Username del usuario
 * @param {Object} data - Datos a actualizar {nombre, correo, edad}
 * @returns {Promise<Object>}
 */
export const actualizarPerfil = async (username, data) => {
  try {
    const params = new URLSearchParams();
    if (data.nombre) params.append('nombre', data.nombre);
    if (data.correo) params.append('correo', data.correo);
    if (data.edad) params.append('edad', data.edad);
    
    const response = await api.put(`/usuarios/${username}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al actualizar perfil:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al actualizar perfil');
  }
};

/**
 * Cambiar contraseña del usuario
 * @param {string} username - Username del usuario
 * @param {string} nuevaPassword - Nueva contraseña
 * @returns {Promise<Object>}
 */
export const cambiarPassword = async (username, nuevaPassword) => {
  try {
    const response = await api.put('/usuarios/actualizar-password', {
      username,
      nuevaPassword
    });
    return response.data;
  } catch (error) {
    console.error('[Usuario Service] Error al cambiar contraseña:', error);
    throw new Error(error.response?.data?.mensaje || 'Error al cambiar contraseña');
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  // Admin/CRUD
  getAllUsuarios,
  getUsuarioByUsername,
  getUsuariosMasSeguidos,
  deleteUsuario,
  
  // Perfil de usuario
  obtenerPerfilUsuario,
  obtenerArtistasFavoritos,
  obtenerCancionesFavoritas,
  obtenerAlbumesFavoritos,
  obtenerSiguiendo,
  obtenerSeguidores,
  eliminarCancionFavorita,
  eliminarArtistaFavorito,
  eliminarAlbumFavorito,
  actualizarPerfil,
  cambiarPassword,
  
  // Seguir/Dejar de seguir
  seguirUsuario,
  dejarDeSeguirUsuario,
  verificarSiSigo,
};