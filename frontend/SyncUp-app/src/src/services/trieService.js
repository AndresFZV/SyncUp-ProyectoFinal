import { get } from './api';

/**
 * RF-026: Buscar por prefijo usando el Trie
 */
export const buscarPorPrefijo = async (prefijo, limite = 10) => {
  try {
    const response = await get(`/trie/buscar?q=${encodeURIComponent(prefijo)}&limite=${limite}`);
    return response;
  } catch (error) {
    console.error('Error en búsqueda:', error);
    throw error;
  }
};

/**
 * Obtener sugerencias de autocompletado
 */
export const obtenerSugerencias = async (prefijo, limite = 5) => {
  try {
    const response = await get(`/trie/sugerencias?q=${encodeURIComponent(prefijo)}&limite=${limite}`);
    return response;
  } catch (error) {
    console.error('Error al obtener sugerencias:', error);
    throw error;
  }
};

/**
 * Verificar si una palabra existe en el Trie
 */
export const verificarExistencia = async (palabra) => {
  try {
    const response = await get(`/trie/existe?palabra=${encodeURIComponent(palabra)}`);
    return response.existe;
  } catch (error) {
    console.error('Error al verificar existencia:', error);
    return false;
  }
};

/**
 * Obtener estadísticas del Trie
 */
export const obtenerEstadisticasTrie = async () => {
  try {
    const response = await get('/trie/estadisticas');
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};