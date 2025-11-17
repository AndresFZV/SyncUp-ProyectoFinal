/**
 * JEST CONFIGURATION
 * Configuración para ejecutar los tests del frontend de SyncUp
 */

export default {
  // Entorno de prueba
  testEnvironment: 'jsdom',
  
  // Archivos de setup
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  
  // Transformación de archivos
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { 
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ] 
    }]
  },
  
  // Módulos CSS
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__tests__/__mocks__/fileMock.js'
  },
  
  // Patrones de archivos de test
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.jsx'
  ],
  
  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/__tests__/**',
    '!src/main.jsx',
    '!src/App.jsx'
  ],
  
  // Límites de cobertura (opcional)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  
  // Directorios a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Extensiones de módulos
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  // Verbose output
  verbose: true
};
