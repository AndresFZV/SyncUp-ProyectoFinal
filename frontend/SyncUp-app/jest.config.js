export default {
  testEnvironment: 'jsdom',
  
  // Archivos de configuración - DESHABILITADO TEMPORALMENTE
  // setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  
  // Extensión para ES modules
  extensionsToTreatAsEsm: ['.jsx'],
  
  // Mapeo de módulos para CSS e imágenes
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Transformación de archivos - CRÍTICO
  transform: {
    '^.+\\.jsx?$': ['babel-jest', {
      configFile: './babel.config.cjs'
    }],
  },
  
  // Ignorar transformaciones en node_modules excepto @testing-library
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library)/)'
  ],
  
  // Patrones para encontrar tests - NO incluir setup.js
  testMatch: [
    '**/__tests__/**/*.test.js?(x)',
    '**/__tests__/**/*.spec.js?(x)',
    '**/?(*.)+(spec|test).js?(x)'
  ],
  
  // Excluir archivos que NO son tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__mocks__/',
    '/setup\\.js$',
    'jest\\.config\\.js$',
    'babel\\.config\\.cjs$'
  ],
  
  // Cobertura
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/__tests__/**',
    '!src/main.jsx',
  ],
  
  // Extensiones de módulos
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  
  // Verbose para debugging
  verbose: true,
};