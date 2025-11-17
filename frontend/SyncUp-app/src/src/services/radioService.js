import { get } from './api';

/**
 * Obtener canciones similares para crear una radio
 * @param {string} cancionId - ID de la canción base
 * @param {number} limite - Número de canciones similares a obtener
 * @returns {Promise<Array>} - Lista de canciones similares
 */
export const obtenerCancionesSimilares = async (cancionId, limite = 20) => {
  try {
    console.log(`[Radio Service] Obteniendo canciones similares a ${cancionId}`);
    const data = await get(`/canciones/${cancionId}/similares?limite=${limite}`);
    console.log('[Radio Service] ✅ Canciones similares obtenidas:', data);
    return data;
  } catch (error) {
    console.error('[Radio Service] ❌ Error al cargar canciones similares:', error);
    throw new Error(error.message || 'Error al cargar canciones similares');
  }
};

/**
 * Obtener todas las canciones del mismo género
 * @param {string} genero - Género musical
 * @param {number} limite - Número de canciones a obtener
 * @returns {Promise<Array>} - Lista de canciones del género
 */
export const obtenerCancionesPorGenero = async (genero, limite = 20) => {
  try {
    console.log(`[Radio Service] Obteniendo canciones del género ${genero}`);
    const data = await get(`/canciones/genero/${genero}?limite=${limite}`);
    console.log('[Radio Service] ✅ Canciones por género obtenidas:', data);
    return data;
  } catch (error) {
    console.error('[Radio Service] ❌ Error al cargar canciones por género:', error);
    throw new Error(error.message || 'Error al cargar canciones por género');
  }
};

export default {
  obtenerCancionesSimilares,
  obtenerCancionesPorGenero
};