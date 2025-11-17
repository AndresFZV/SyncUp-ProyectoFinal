/**
 * TEST 4: FORMATTERS - Pruebas para formateo de texto y números
 * 
 * Este archivo contiene pruebas unitarias para las funciones de formateo
 * de texto (capitalización, truncado) y números.
 */

import { describe, it, expect } from '@jest/globals';
import {
  capitalizeFirst,
  truncateText,
  formatNumber,
} from '../../utils/formatters';

describe('Formateadores de Texto y Números', () => {
  
  describe('capitalizeFirst', () => {
    it('debe capitalizar la primera letra de una palabra en minúscula', () => {
      const result = capitalizeFirst('hola');
      expect(result).toBe('Hola');
    });

    it('debe capitalizar y convertir el resto a minúsculas', () => {
      const result = capitalizeFirst('HOLA');
      expect(result).toBe('Hola');
    });

    it('debe manejar una cadena ya capitalizada correctamente', () => {
      const result = capitalizeFirst('Hola');
      expect(result).toBe('Hola');
    });

    it('debe manejar una cadena mixta', () => {
      const result = capitalizeFirst('hOlA mUnDo');
      expect(result).toBe('Hola mundo');
    });

    it('debe retornar cadena vacía para input vacío', () => {
      const result = capitalizeFirst('');
      expect(result).toBe('');
    });

    it('debe retornar cadena vacía para input null', () => {
      const result = capitalizeFirst(null);
      expect(result).toBe('');
    });

    it('debe retornar cadena vacía para input undefined', () => {
      const result = capitalizeFirst(undefined);
      expect(result).toBe('');
    });

    it('debe capitalizar una sola letra', () => {
      const result = capitalizeFirst('a');
      expect(result).toBe('A');
    });

    it('debe manejar cadenas con espacios al inicio', () => {
      const result = capitalizeFirst(' hola');
      expect(result).toBe(' hola');
    });

    it('debe manejar caracteres especiales', () => {
      const result = capitalizeFirst('ñoño');
      expect(result).toBe('Ñoño');
    });

    it('debe manejar números al inicio', () => {
      const result = capitalizeFirst('123abc');
      expect(result).toBe('123abc');
    });
  });

  describe('truncateText', () => {
    it('debe truncar texto que excede la longitud máxima', () => {
      const result = truncateText('Este es un texto largo', 10);
      expect(result).toBe('Este es...');
    });

    it('debe no truncar texto que no excede la longitud', () => {
      const result = truncateText('Texto corto', 20);
      expect(result).toBe('Texto corto');
    });

    it('debe retornar el texto completo si es igual a la longitud máxima', () => {
      const result = truncateText('Exacto', 6);
      expect(result).toBe('Exacto');
    });

    it('debe usar sufijo personalizado', () => {
      const result = truncateText('Texto muy largo', 10, '...');
      expect(result).toBe('Texto m...');
    });

    it('debe usar sufijo diferente cuando se especifica', () => {
      const result = truncateText('Texto largo', 8, ' (más)');
      expect(result).toBe('Te (más)');
    });

    it('debe manejar texto vacío', () => {
      const result = truncateText('', 10);
      expect(result).toBe('');
    });

    it('debe manejar null retornando el valor', () => {
      const result = truncateText(null, 10);
      expect(result).toBeNull();
    });

    it('debe manejar undefined retornando el valor', () => {
      const result = truncateText(undefined, 10);
      expect(result).toBeUndefined();
    });

    it('debe truncar correctamente cuando maxLength es muy pequeño', () => {
      const result = truncateText('Hola mundo', 5);
      expect(result).toBe('Ho...');
    });

    it('debe manejar sufijo más largo que el texto permitido', () => {
      const result = truncateText('Hola', 3, '...');
      expect(result).toBe('...');
    });

    it('debe truncar títulos de canciones largos', () => {
      const result = truncateText('Esta es una canción con un título muy largo', 30);
      expect(result).toBe('Esta es una canción con un...');
    });
  });

  describe('formatNumber', () => {
    it('debe formatear números con separador de miles', () => {
      const result = formatNumber(1000);
      expect(result).toBe('1.000');
    });

    it('debe formatear números grandes correctamente', () => {
      const result = formatNumber(1234567);
      expect(result).toBe('1.234.567');
    });

    it('debe formatear número cero', () => {
      const result = formatNumber(0);
      expect(result).toBe('0');
    });

    it('debe formatear números pequeños sin separadores', () => {
      const result = formatNumber(999);
      expect(result).toBe('999');
    });

    it('debe formatear números negativos', () => {
      const result = formatNumber(-5000);
      expect(result).toBe('-5.000');
    });

    it('debe formatear números decimales', () => {
      const result = formatNumber(1234.56);
      expect(result).toBe('1.234,56');
    });

    it('debe retornar 0 para NaN', () => {
      const result = formatNumber(NaN);
      expect(result).toBe('0');
    });

    it('debe retornar 0 para undefined', () => {
      const result = formatNumber(undefined);
      expect(result).toBe('0');
    });

    it('debe formatear millones correctamente', () => {
      const result = formatNumber(1500000);
      expect(result).toBe('1.500.000');
    });

    it('debe formatear número 1', () => {
      const result = formatNumber(1);
      expect(result).toBe('1');
    });

    it('debe manejar números muy grandes', () => {
      const result = formatNumber(999999999);
      expect(result).toBe('999.999.999');
    });

    it('debe formatear correctamente para visualizar reproducciones', () => {
      const result = formatNumber(45678);
      expect(result).toBe('45.678');
    });
  });
});
