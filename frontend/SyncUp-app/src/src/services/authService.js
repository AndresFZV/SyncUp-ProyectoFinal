/**
 * AUTHSERVICE.JS - Servicio de autenticación
 */

import { get, post, put } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

export const login = async (username, password) => {
  try {
    const response = await post(
      `${API_ENDPOINTS.LOGIN}?username=${username}&password=${password}`
    );

    if (response) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response));
    }

    return response;
  } catch (error) {
    throw new Error(error.message || 'Error al iniciar sesión');
  }
};

export const register = async (userData) => {
  try {
    const { username, password, nombre, correo, edad, palabraSecreta } = userData;

    const response = await post(API_ENDPOINTS.REGISTER, {
      username,
      password,
      nombre,
      correo,
      edad: parseInt(edad),
      palabraSecreta,
    });

    return response;
  } catch (error) {
    throw new Error(error.message || 'Error al registrar usuario');
  }
};

export const findUserByIdentifier = async (identifier) => {
  try {
    const response = await get(API_ENDPOINTS.RECOVER_PASSWORD, {
      identificador: identifier,
    });
    return response;
  } catch (error) {
    throw new Error('Usuario no encontrado. Verifica tus datos.');
  }
};

export const verifySecretWord = async (username, palabraSecreta) => {
  try {
    const response = await post(API_ENDPOINTS.VERIFY_SECRET_WORD, {
      username,
      palabraSecreta,
    });
    return response;
  } catch (error) {
    throw new Error('Palabra secreta incorrecta');
  }
};

export const updatePassword = async (username, nuevaPassword) => {
  try {
    const response = await put(API_ENDPOINTS.UPDATE_PASSWORD, {
      username,
      nuevaPassword,
    });
    return response;
  } catch (error) {
    throw new Error('Error al actualizar la contraseña');
  }
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  return true;
};

export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return null;
  }
};

export const isAdmin = () => {
  const user = getCurrentUser();
  if (!user) return false;

  return (
    user.rol === 'ADMIN' ||
    user.esAdmin === true ||
    user.username === 'admin'
  );
};

export const isAuthenticated = () => {
  const user = getCurrentUser();
  return user !== null;
};

export default {
  login,
  register,
  findUserByIdentifier,
  verifySecretWord,
  updatePassword,
  logout,
  getCurrentUser,
  isAdmin,
  isAuthenticated,
};