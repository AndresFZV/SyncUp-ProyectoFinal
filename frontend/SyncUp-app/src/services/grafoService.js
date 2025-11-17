/**
 * ========================================
 * GRAFO SERVICE
 * ========================================
 */

import { get } from './api';

const API_URL = '/grafo';

/**
 * Obtener canciones similares a una canción
 */
export const getCancionesSimilares = async (cancionId, limite = 10) => {
  try {
    return await get(`${API_URL}/similares/${cancionId}?limite=${limite}`);
  } catch (error) {
    throw new Error(error.message || 'Error al obtener canciones similares');
  }
};

/**
 * Encontrar ruta de similitud entre dos canciones (Dijkstra)
 */
export const getRutaSimilitud = async (origenId, destinoId) => {
  try {
    console.log('📡 Llamando al endpoint de ruta...');
    console.log('   URL:', `/grafo/ruta?origen=${origenId}&destino=${destinoId}`);
    
    const response = await get(`/grafo/ruta?origen=${origenId}&destino=${destinoId}`);
    
    console.log('✅ Respuesta recibida:', response);
    return response;
    
  } catch (error) {
    console.error('❌ Error en getRutaSimilitud:', error);
    console.error('   Response:', error.response);
    console.error('   Data:', error.response?.data);
    throw error;
  }
};

export const getEstadisticasGrafo = async () => {
  try {
    return await get(`${API_URL}/estadisticas`);
  } catch (error) {
    throw new Error(error.message || 'Error al obtener estadísticas');
  }
};

/**
 * Reconstruir el grafo
 */
export const reconstruirGrafo = async () => {
  try {
    return await get(`${API_URL}/reconstruir`, {}, 'POST');
  } catch (error) {
    throw new Error(error.message || 'Error al reconstruir grafo');
  }
};

export default {
  getCancionesSimilares,
  getRutaSimilitud,
  getEstadisticasGrafo,
  reconstruirGrafo,
};