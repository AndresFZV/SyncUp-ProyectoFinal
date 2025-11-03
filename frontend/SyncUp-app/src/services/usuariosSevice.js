/**
 * USUARIOSSERVICE.JS
 */

import { get, del } from './api';
import { API_ENDPOINTS } from '../utils/constants';

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

export default {
  getAllUsuarios,
  getUsuarioByUsername,
  getUsuariosMasSeguidos,
  deleteUsuario,
};