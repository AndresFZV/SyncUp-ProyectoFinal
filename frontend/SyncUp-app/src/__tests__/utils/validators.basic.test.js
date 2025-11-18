/**
 * TEST 1: VALIDATORS - Pruebas para validación de username y email
 * 
 * Este archivo contiene pruebas unitarias para las funciones de validación
 * básicas del sistema: username y email.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  validateUsername,
  validateEmail,
} from '../../utils/validators';

describe('Validadores Básicos', () => {
  
  describe('validateUsername', () => {
    it('debe validar correctamente un username válido', () => {
      const result = validateUsername('usuario123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('debe rechazar un username vacío', () => {
      const result = validateUsername('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El username es requerido');
    });

    it('debe rechazar un username con solo espacios', () => {
      const result = validateUsername('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El username es requerido');
    });

    it('debe rechazar un username menor a 4 caracteres', () => {
      const result = validateUsername('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('al menos 4 caracteres');
    });

    it('debe aceptar un username exactamente de 4 caracteres', () => {
      const result = validateUsername('abcd');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('debe aceptar un username largo válido', () => {
      const result = validateUsername('usuarioConNombreLargo');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('debe validar correctamente un email válido', () => {
      const result = validateEmail('usuario@ejemplo.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('debe validar emails con dominios complejos', () => {
      const result = validateEmail('test.user+tag@subdomain.example.co.uk');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe('');
    });

    it('debe rechazar un email vacío', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El correo es requerido');
    });

    it('debe rechazar un email con solo espacios', () => {
      const result = validateEmail('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El correo es requerido');
    });

    it('debe rechazar un email sin @', () => {
      const result = validateEmail('usuarioejemplo.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ingresa un correo válido');
    });

    it('debe rechazar un email sin dominio', () => {
      const result = validateEmail('usuario@');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ingresa un correo válido');
    });

    it('debe rechazar un email sin nombre de usuario', () => {
      const result = validateEmail('@ejemplo.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ingresa un correo válido');
    });

    it('debe rechazar un email sin extensión de dominio', () => {
      const result = validateEmail('usuario@ejemplo');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ingresa un correo válido');
    });

    it('debe rechazar un email con espacios', () => {
      const result = validateEmail('usuario @ejemplo.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ingresa un correo válido');
    });
  });
});
