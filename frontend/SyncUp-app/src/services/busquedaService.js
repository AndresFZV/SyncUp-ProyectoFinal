import { post } from './api';

/**
 * RF-003, RF-004, RF-030: Búsqueda avanzada con Trie + Hilos
 */
export const busquedaAvanzada = async (criterios) => {
  try {
    const response = await post('/busqueda/avanzada', criterios);
    return response;
  } catch (error) {
    console.error('Error en búsqueda avanzada:', error);
    throw error;
  }
};

/**
 * Helper para crear criterios de búsqueda vacíos
 */
export const crearCriteriosVacios = () => ({
  query: '',
  artista: '',
  genero: '',
  anioMin: null,
  anioMax: null,
  logica: 'OR',
  limite: 50
});

/**
 * Validar si hay criterios activos
 */
export const tieneCriterios = (criterios) => {
  return (
    (criterios.query && criterios.query.trim()) ||
    (criterios.artista && criterios.artista.trim()) ||
    (criterios.genero && criterios.genero.trim()) ||
    criterios.anioMin !== null ||
    criterios.anioMax !== null
  );
};