/**
 * ARTISTASSERVICE.JS
 */

import { get, post, put, del, uploadFile } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getAllArtistas = async () => {
  try {
    return await get(API_ENDPOINTS.ARTISTAS);
  } catch (error) {
    throw new Error(error.message || 'Error al cargar artistas');
  }
};

export const getArtistaById = async (id) => {
  try {
    return await get(`${API_ENDPOINTS.ARTISTAS}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Error al cargar artista');
  }
};

export const createArtista = async (artistaData) => {
  try {
    const formData = new FormData();
    
    const solicitud = {
      nombre: artistaData.nombre,
      pais: artistaData.pais,
      generoPrincipal: artistaData.generoPrincipal,
      biografia: artistaData.biografia,
    };

    formData.append('solicitud', JSON.stringify(solicitud));
    formData.append('archivo', artistaData.imagen);

    return await uploadFile(API_ENDPOINTS.ARTISTAS, formData, 'POST');
  } catch (error) {
    throw new Error(error.message || 'Error al crear artista');
  }
};

export const updateArtista = async (id, artistaData) => {
  try {
    const formData = new FormData();
    
    const solicitud = {
      nombre: artistaData.nombre,
      pais: artistaData.pais,
      generoPrincipal: artistaData.generoPrincipal,
      biografia: artistaData.biografia,
    };

    formData.append('solicitud', JSON.stringify(solicitud));
    
    if (artistaData.imagen) {
      formData.append('archivo', artistaData.imagen);
    }

    return await uploadFile(`${API_ENDPOINTS.ARTISTAS}/${id}`, formData, 'PUT');
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar artista');
  }
};

export const deleteArtista = async (id) => {
  try {
    return await del(`${API_ENDPOINTS.ARTISTAS}/${id}`);
  } catch (error) {
    throw new Error(error.message || 'Error al eliminar artista');
  }
};

export default {
  getAllArtistas,
  getArtistaById,
  createArtista,
  updateArtista,
  deleteArtista,
};