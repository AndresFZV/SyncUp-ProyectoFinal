/**
 * CANCIONESSERVICE.JS
 */

import { get, post, del, uploadFile } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getAllCanciones = async () => {
  try {
    return await get(API_ENDPOINTS.CANCIONES);
  } catch (error) {
    throw new Error(error.message || 'Error al cargar canciones');
  }
};

export const getCancionById = async (id) => {
  try {
    return await get(`${API_ENDPOINTS.CANCIONES}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Error al cargar canción');
  }
};

// ← NUEVO: Obtener canciones por álbum
export const getCancionesPorAlbum = async (albumId) => {
  try {
    return await get(`${API_ENDPOINTS.CANCIONES}/album/${albumId}`);
  } catch (error) {
    throw new Error(error.message || 'Error al cargar canciones del álbum');
  }
};

// ← NUEVO: Alias para compatibilidad con AlbumView
export const obtenerCancionesPorAlbum = getCancionesPorAlbum;

// ← NUEVO: Obtener canciones por artista
export const getCancionesPorArtista = async (artistaId) => {
  try {
    return await get(`${API_ENDPOINTS.CANCIONES}/artista/${artistaId}`);
  } catch (error) {
    throw new Error(error.message || 'Error al cargar canciones del artista');
  }
};

export const createCancion = async (cancionData) => {
  try {
    const formData = new FormData();
    
    const solicitud = {
      titulo: cancionData.titulo,
      genero: cancionData.genero,
      anio: parseInt(cancionData.anio),
      artistaId: cancionData.artistaId,
      albumId: cancionData.albumId || null,
    };

    formData.append('solicitud', JSON.stringify(solicitud));
    formData.append('imagen', cancionData.imagenArchivo);
    formData.append('musica', cancionData.musicaArchivo);

    return await uploadFile(API_ENDPOINTS.CANCIONES, formData, 'POST');
  } catch (error) {
    throw new Error(error.message || 'Error al crear canción');
  }
};

export const deleteCancion = async (id) => {
  try {
    return await del(`${API_ENDPOINTS.CANCIONES}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Error al eliminar canción');
  }
};

export const cargaMasivaCanciones = async (archivoMetadata, archivoMultimedia) => {
  try {
    const formData = new FormData();
    formData.append('archivoMetadata', archivoMetadata);
    formData.append('archivoMultimedia', archivoMultimedia);

    return await uploadFile(API_ENDPOINTS.CANCIONES_CARGA_MASIVA, formData, 'POST');
  } catch (error) {
    throw new Error(error.message || 'Error en carga masiva');
  }
};

export default {
  getAllCanciones,
  getCancionById,
  getCancionesPorAlbum, // ← NUEVO
  obtenerCancionesPorAlbum, // ← NUEVO
  getCancionesPorArtista, // ← NUEVO
  createCancion,
  deleteCancion,
  cargaMasivaCanciones,
};