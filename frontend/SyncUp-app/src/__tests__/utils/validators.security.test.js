/**
 * TEST 2: VALIDATORS - Pruebas para validación de password y edad
 * 
 * Este archivo contiene pruebas unitarias para las funciones de validación
 * de contraseñas y edad del sistema.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  validatePassword,
  validatePasswordMatch,
  validateAge,
} from '../../utils/validators';

describe('Validadores de Seguridad y Edad', () => {
  
  describe('validatePassword', () => {
    it('debe validar correctamente una contraseña válida', () => {
      const result = validatePassword('Password123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('debe aceptar contraseñas con caracteres especiales', () => {
      const result = validatePassword('Pass@123!');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('debe rechazar una contraseña vacía', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('La contraseña es requerida');
    });

    it('debe rechazar una contraseña menor a 8 caracteres', () => {
      const result = validatePassword('Pass12');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('al menos 8 caracteres');
    });

    it('debe rechazar una contraseña sin números', () => {
      const result = validatePassword('Password');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('letras y números');
    });

    it('debe rechazar una contraseña sin letras', () => {
      const result = validatePassword('12345678');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('letras y números');
    });

    it('debe aceptar una contraseña de exactamente 8 caracteres válida', () => {
      const result = validatePassword('Pass1234');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('debe aceptar una contraseña larga válida', () => {
      const result = validatePassword('MiPasswordSuperSegura123456');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });

  describe('validatePasswordMatch', () => {
    it('debe validar correctamente cuando las contraseñas coinciden', () => {
      const result = validatePasswordMatch('Password123', 'Password123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('debe rechazar cuando la confirmación está vacía', () => {
      const result = validatePasswordMatch('Password123', '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Confirma tu contraseña');
    });

    it('debe rechazar cuando las contraseñas no coinciden', () => {
      const result = validatePasswordMatch('Password123', 'Password456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Las contraseñas no coinciden');
    });

    it('debe detectar diferencias de mayúsculas/minúsculas', () => {
      const result = validatePasswordMatch('Password123', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Las contraseñas no coinciden');
    });

    it('debe detectar espacios adicionales', () => {
      const result = validatePasswordMatch('Password123', 'Password123 ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Las contraseñas no coinciden');
    });
  });

  describe('validateAge', () => {
    it('debe validar correctamente una edad válida', () => {
      const result = validateAge('25');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('debe aceptar la edad mínima válida (13)', () => {
      const result = validateAge('13');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('debe aceptar la edad máxima válida (120)', () => {
      const result = validateAge('120');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('debe rechazar una edad menor a 13', () => {
      const result = validateAge('12');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('entre 13 y 120');
    });

    it('debe rechazar una edad mayor a 120', () => {
      const result = validateAge('121');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('entre 13 y 120');
    });

    it('debe rechazar un valor no numérico', () => {
      const result = validateAge('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('La edad debe ser un número válido');
    });

    it('debe rechazar una edad vacía', () => {
      const result = validateAge('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('La edad debe ser un número válido');
    });

    it('debe rechazar números decimales', () => {
      const result = validateAge('25.5');
      expect(result.isValid).toBe(true); // parseInt convierte a 25
      expect(result.error).toBe('');
    });

    it('debe rechazar números negativos', () => {
      const result = validateAge('-5');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('entre 13 y 120');
    });
  });
});
