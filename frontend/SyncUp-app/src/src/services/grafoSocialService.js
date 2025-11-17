import api from './api';

/**
 * Servicio para interactuar con el Grafo Social
 * RF-008: Sugerencias de usuarios
 * RF-023: Grafo No Dirigido
 * RF-024: Recorridos BFS
 */

/**
 * Obtener sugerencias de usuarios para seguir
 * @param {string} username - Username del usuario actual
 * @param {number} limite - Número máximo de sugerencias (default: 10)
 * @returns {Promise<Object>} - Objeto con array de sugerencias y metadata
 */
export const obtenerSugerencias = async (username, limite = 10) => {
  try {
    console.log(`[Grafo Service] Obteniendo sugerencias para ${username}`);
    const response = await api.get(`/grafo-social/sugerencias/${username}?limite=${limite}`);
    console.log('[Grafo Service] Sugerencias obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Grafo Service] Error al obtener sugerencias:', error);
    throw new Error(
      error.response?.data?.mensaje || 
      'Error al cargar sugerencias de usuarios'
    );
  }
};

/**
 * Obtener información de conexiones de un usuario
 * @param {string} username - Username del usuario
 * @returns {Promise<Object>} - Info de conexiones directas y amigos de amigos
 */
export const obtenerConexiones = async (username) => {
  try {
    console.log(`[Grafo Service] Obteniendo conexiones de ${username}`);
    const response = await api.get(`/grafo-social/conexiones/${username}`);
    console.log('[Grafo Service] Conexiones obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Grafo Service] Error al obtener conexiones:', error);
    throw new Error(
      error.response?.data?.mensaje || 
      'Error al cargar conexiones del usuario'
    );
  }
};

/**
 * Encontrar el camino más corto entre dos usuarios usando BFS
 * @param {string} origen - Username del usuario origen
 * @param {string} destino - Username del usuario destino
 * @returns {Promise<Object>} - Camino, distancia y si existe conexión
 */
export const encontrarCamino = async (origen, destino) => {
  try {
    console.log(`[Grafo Service] Buscando camino: ${origen} → ${destino}`);
    const response = await api.get(`/grafo-social/camino/${origen}/${destino}`);
    console.log('[Grafo Service] Camino encontrado:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Grafo Service] Error al buscar camino:', error);
    throw new Error(
      error.response?.data?.mensaje || 
      'Error al buscar conexión entre usuarios'
    );
  }
};

/**
 * Obtener estadísticas generales del grafo social
 * @returns {Promise<Object>} - Estadísticas (nodos, aristas, etc.)
 */
export const obtenerEstadisticas = async () => {
  try {
    console.log('[Grafo Service] Obteniendo estadísticas del grafo');
    const response = await api.get('/grafo-social/estadisticas');
    console.log('[Grafo Service] Estadísticas obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Grafo Service] Error al obtener estadísticas:', error);
    throw new Error(
      error.response?.data?.mensaje || 
      'Error al cargar estadísticas del grafo'
    );
  }
};

/**
 * Reconstruir el grafo social manualmente
 * (Útil para testing o actualización forzada)
 * @returns {Promise<Object>} - Confirmación y estadísticas
 */
export const reconstruirGrafo = async () => {
  try {
    console.log('[Grafo Service] Reconstruyendo grafo social');
    const response = await api.post('/grafo-social/reconstruir');
    console.log('[Grafo Service] Grafo reconstruido:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Grafo Service] Error al reconstruir grafo:', error);
    throw new Error(
      error.response?.data?.mensaje || 
      'Error al reconstruir el grafo social'
    );
  }
};

/**
 * Calcular el grado de separación entre dos usuarios
 * Extrae solo la distancia del camino
 * @param {string} origen - Username origen
 * @param {string} destino - Username destino
 * @returns {Promise<number>} - Grado de separación (-1 si no existe conexión)
 */
export const calcularGradoSeparacion = async (origen, destino) => {
  try {
    const camino = await encontrarCamino(origen, destino);
    return camino.existe ? camino.distancia : -1;
  } catch (error) {
    console.error('[Grafo Service] Error al calcular grado de separación:', error);
    return -1;
  }
};

/**
 * Obtener estructura completa del grafo para visualización
 * @param {string} username - Username del usuario origen
 * @param {number} profundidad - Profundidad del BFS (default: 2)
 * @returns {Promise<Object>} - Nodos y aristas del grafo
 */
export const obtenerEstructuraGrafo = async (username, profundidad = 2) => {
  try {
    console.log(`[Grafo Service] Obteniendo estructura del grafo para ${username}`);
    const response = await api.get(`/grafo-social/estructura/${username}?profundidad=${profundidad}`);
    console.log('[Grafo Service] Estructura obtenida:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Grafo Service] Error al obtener estructura del grafo:', error);
    throw new Error(
      error.response?.data?.mensaje || 
      'Error al cargar estructura del grafo'
    );
  }
};

// Export default con todas las funciones
export default {
  obtenerSugerencias,
  obtenerConexiones,
  encontrarCamino,
  obtenerEstadisticas,
  reconstruirGrafo,
  calcularGradoSeparacion,
  obtenerEstructuraGrafo
};