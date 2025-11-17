import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const obtenerDescubrimientoSemanal = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/playlists/weekly-discovery/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener descubrimiento semanal:', error);
    throw error;
  }
};

export const obtenerMixesPorGenero = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/playlists/genre-mix/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener mixes:', error);
    throw error;
  }
};

export const obtenerCancionesRecientes = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/playlists/recently-played/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener recientes:', error);
    throw error;
  }
};

export const obtenerRecomendaciones = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/playlists/recommendations/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    throw error;
  }
};

export const obtenerArtistasPopulares = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/playlists/top-artists/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener artistas populares:', error);
    throw error;
  }
};

/**
 * Obtener múltiples recomendaciones (canciones + artistas + descubrimiento)
 */
export const obtenerMultiplesRecomendaciones = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/playlists/multiple-recommendations/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener múltiples recomendaciones:', error);
    throw error;
  }
};

export default {
  obtenerDescubrimientoSemanal,
  obtenerMixesPorGenero,
  obtenerCancionesRecientes,
  obtenerRecomendaciones,
  obtenerArtistasPopulares,
  obtenerMultiplesRecomendaciones,
};