/**
 * API.JS - Configuración de Axios
 */

import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          error.message = data.message || 'Solicitud inválida';
          break;
        case 401:
          error.message = 'No autorizado. Por favor inicia sesión';
          break;
        case 403:
          error.message = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          error.message = data.message || 'Recurso no encontrado';
          break;
        case 500:
          error.message = 'Error del servidor. Intenta más tarde';
          break;
        default:
          error.message = data.message || 'Error inesperado';
      }
    } else if (error.request) {
      error.message = 'No se pudo conectar con el servidor';
    }

    return Promise.reject(error);
  }
);

// Helper Functions
export const get = async (url, params = {}) => {
  const response = await api.get(url, { params });
  return response.data;
};

export const post = async (url, data = {}, config = {}) => {
  const response = await api.post(url, data, config);
  return response.data;
};

export const put = async (url, data = {}, config = {}) => {
  const response = await api.put(url, data, config);
  return response.data;
};

export const del = async (url) => {
  const response = await api.delete(url);
  return response.data;
};

export const uploadFile = async (url, formData, method = 'POST') => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const response = method === 'PUT' 
    ? await api.put(url, formData, config)
    : await api.post(url, formData, config);

  return response.data;
};

export default api;