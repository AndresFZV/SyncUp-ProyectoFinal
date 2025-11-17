/**
 * CONSTANTS.JS - Constantes centralizadas
 */

// API CONFIGURATION
export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/usuarios/login',
  REGISTER: '/usuarios/registro',
  RECOVER_PASSWORD: '/usuarios/buscar',
  VERIFY_SECRET_WORD: '/usuarios/verificar-palabra-secreta',
  UPDATE_PASSWORD: '/usuarios/actualizar-password',
  
  // Usuarios
  USUARIOS: '/usuarios',
  USUARIOS_MAS_SEGUIDOS: '/usuarios/mas-seguidos',
  
  // Canciones
  CANCIONES: '/canciones',
  CANCIONES_CARGA_MASIVA: '/canciones/carga-masiva',
  
  // Artistas
  ARTISTAS: '/artistas',
  
  // Álbumes
  ALBUMES: '/albumes',
  ALBUMES_CARGA_MASIVA: '/albumes/carga-masiva',
};

// UI CONSTANTS
export const COLORS = {
  PRIMARY: '#8a2be2',
  PRIMARY_DARK: '#6a1bb2',
  SECONDARY: '#f39c12',
  SUCCESS: '#4caf50',
  ERROR: '#f44336',
  WARNING: '#ff9800',
  INFO: '#2196f3',
};

// VALIDATION RULES
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 20,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
    MESSAGE: 'Mínimo 8 caracteres, debe incluir letras y números',
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Ingresa un correo válido',
  },
  AGE: {
    MIN: 13,
    MAX: 120,
  },
  SECRET_WORD: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
  },
};

// ROUTES
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/registro',
  RECOVER_PASSWORD: '/recuperar-password',
  CARACTERISTICAS: '/caracteristicas',
  SOBRE_NOSOTROS: '/sobre-nosotros',
  ADMIN_DASHBOARD: '/admin/dashboard',
  USER_DASHBOARD: '/user/home',
};

// LOCAL STORAGE KEYS
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'syncup_auth_token',
  USER_DATA: 'syncup_user_data',
  THEME: 'syncup_theme',
};

// USER ROLES
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  COLORS,
  VALIDATION_RULES,
  ROUTES,
  STORAGE_KEYS,
  USER_ROLES,
};