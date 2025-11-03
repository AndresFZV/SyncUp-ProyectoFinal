/**
 * ALBUMESSERVICE.JS
 */

import { get, post, put, del, uploadFile } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getAllAlbumes = async () => {
  try {
    return await get(API_ENDPOINTS.ALBUMES);
  } catch (error) {
    throw new Error(error.message || 'Error al cargar álbumes');
  }
};

export const getAlbumById = async (id) => {
  try {
    return await get(`${API_ENDPOINTS.ALBUMES}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Error al cargar álbum');
  }
};

export const createAlbum = async (albumData) => {
  try {
    const formData = new FormData();
    
    const solicitud = {
      nombre: albumData.nombre,
      descripcion: albumData.descripcion,
      bgColor: albumData.bgColor,
      artistId: albumData.artistaId,
      songIds: [],
    };

    formData.append('solicitud', JSON.stringify(solicitud));
    formData.append('archivo', albumData.imagen);

    return await uploadFile(API_ENDPOINTS.ALBUMES, formData, 'POST');
  } catch (error) {
    throw new Error(error.message || 'Error al crear álbum');
  }
};

export const updateAlbum = async (id, albumData) => {
  try {
    const formData = new FormData();
    
    const solicitud = {
      nombre: albumData.nombre,
      descripcion: albumData.descripcion,
      bgColor: albumData.bgColor,
      artistId: albumData.artistaId,
      songIds: [],
    };

    formData.append('solicitud', JSON.stringify(solicitud));
    
    if (albumData.imagen) {
      formData.append('archivo', albumData.imagen);
    }

    return await uploadFile(`${API_ENDPOINTS.ALBUMES}/${id}`, formData, 'PUT');
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar álbum');
  }
};

export const deleteAlbum = async (id) => {
  try {
    return await del(`${API_ENDPOINTS.ALBUMES}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Error al eliminar álbum');
  }
};

export const cargaMasivaAlbum = async (archivoMetadata, imagenPortada, archivoMultimedia) => {
  try {
    const formData = new FormData();
    formData.append('archivoMetadata', archivoMetadata);
    formData.append('imagenPortada', imagenPortada);
    formData.append('archivoMultimedia', archivoMultimedia);

    return await uploadFile(API_ENDPOINTS.ALBUMES_CARGA_MASIVA, formData, 'POST');
  } catch (error) {
    throw new Error(error.message || 'Error en carga masiva de álbum');
  }
};

export default {
  getAllAlbumes,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  cargaMasivaAlbum,
};