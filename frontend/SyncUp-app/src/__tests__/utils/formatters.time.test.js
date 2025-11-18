/**
 * TEST 3: FORMATTERS - Pruebas para formateo de tiempo y duración
 * 
 * Este archivo contiene pruebas unitarias para las funciones de formateo
 * de tiempo y duración de canciones.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  formatTime,
  formatDuration,
} from '../../utils/formatters';

describe('Formateadores de Tiempo y Duración', () => {
  
  describe('formatTime', () => {
    it('debe formatear correctamente segundos a formato mm:ss', () => {
      const result = formatTime(125);
      expect(result).toBe('2:05');
    });

    it('debe formatear correctamente cuando hay cero segundos', () => {
      const result = formatTime(0);
      expect(result).toBe('0:00');
    });

    it('debe formatear correctamente 1 minuto exacto', () => {
      const result = formatTime(60);
      expect(result).toBe('1:00');
    });

    it('debe agregar cero inicial a los segundos menores a 10', () => {
      const result = formatTime(65);
      expect(result).toBe('1:05');
    });

    it('debe formatear correctamente 10 minutos y 30 segundos', () => {
      const result = formatTime(630);
      expect(result).toBe('10:30');
    });

    it('debe formatear correctamente más de una hora', () => {
      const result = formatTime(3665); // 61 minutos y 5 segundos
      expect(result).toBe('61:05');
    });

    it('debe manejar números decimales truncando a entero', () => {
      const result = formatTime(125.7);
      expect(result).toBe('2:05');
    });

    it('debe retornar 0:00 para valores negativos', () => {
      const result = formatTime(-10);
      expect(result).toBe('0:00');
    });

    it('debe retornar 0:00 para valores NaN', () => {
      const result = formatTime(NaN);
      expect(result).toBe('0:00');
    });

    it('debe retornar 0:00 para valores undefined', () => {
      const result = formatTime(undefined);
      expect(result).toBe('0:00');
    });

    it('debe formatear correctamente segundos cerca de un minuto', () => {
      const result = formatTime(59);
      expect(result).toBe('0:59');
    });

    it('debe formatear correctamente una canción de duración típica', () => {
      const result = formatTime(203); // 3:23
      expect(result).toBe('3:23');
    });
  });

  describe('formatDuration', () => {
    it('debe formatear correctamente una duración en minutos decimales', () => {
      const result = formatDuration(3.5); // 3 minutos y 30 segundos
      expect(result).toBe('3:30');
    });

    it('debe formatear correctamente duración con cero decimales', () => {
      const result = formatDuration(5.0);
      expect(result).toBe('5:00');
    });

    it('debe agregar cero inicial a segundos menores a 10', () => {
      const result = formatDuration(2.1); // 2 minutos y 6 segundos
      expect(result).toBe('2:06');
    });

    it('debe retornar N/A para valores undefined', () => {
      const result = formatDuration(undefined);
      expect(result).toBe('N/A');
    });

    it('debe retornar N/A para valores null', () => {
      const result = formatDuration(null);
      expect(result).toBe('N/A');
    });

    it('debe retornar N/A para valores NaN', () => {
      const result = formatDuration(NaN);
      expect(result).toBe('N/A');
    });

    it('debe manejar duraciones pequeñas correctamente', () => {
      const result = formatDuration(0.5); // 30 segundos
      expect(result).toBe('0:30');
    });

    it('debe manejar duraciones largas (más de una hora)', () => {
      const result = formatDuration(75.5); // 75 minutos y 30 segundos
      expect(result).toBe('75:30');
    });

    it('debe redondear correctamente los segundos', () => {
      const result = formatDuration(3.99); // ~3:59
      expect(result).toBe('3:59');
    });

    it('debe manejar duración de cero', () => {
      const result = formatDuration(0);
      expect(result).toBe('0:00');
    });

    it('debe formatear correctamente una duración típica de canción', () => {
      const result = formatDuration(4.25); // 4:15
      expect(result).toBe('4:15');
    });

    it('debe manejar duraciones con muchos decimales', () => {
      const result = formatDuration(3.456789);
      expect(result).toBe('3:27');
    });
  });
});
