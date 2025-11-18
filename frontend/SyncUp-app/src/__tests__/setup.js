import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mocks globales
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
};