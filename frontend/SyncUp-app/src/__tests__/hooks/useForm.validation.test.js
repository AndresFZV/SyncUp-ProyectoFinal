/**
 * TEST 6: USEFORM HOOK - Pruebas para validación y submit (Parte 2)
 * 
 * Este archivo contiene pruebas para las funcionalidades avanzadas del hook useForm:
 * - Validación con handleBlur
 * - Validación completa del formulario
 * - Manejo de submit
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useForm } from '../../hooks/useForm';

describe('useForm Hook - Validación y Submit', () => {
  
  describe('handleBlur - Validación al perder foco', () => {
    it('debe marcar el campo como touched cuando pierde el foco', () => {
      const { result } = renderHook(() => useForm({ username: '' }));
      
      act(() => {
        result.current.handleBlur({ target: { name: 'username' } });
      });
      
      expect(result.current.touched.username).toBe(true);
    });

    it('debe ejecutar validación si hay reglas definidas', () => {
      const validationRules = {
        username: (value) => {
          if (!value || value.length < 4) {
            return { isValid: false, error: 'Mínimo 4 caracteres' };
          }
          return { isValid: true, error: '' };
        }
      };
      
      const { result } = renderHook(() => 
        useForm({ username: 'abc' }, null, validationRules)
      );
      
      act(() => {
        result.current.handleBlur({ target: { name: 'username' } });
      });
      
      expect(result.current.touched.username).toBe(true);
      expect(result.current.errors.username).toBe('Mínimo 4 caracteres');
    });

    it('no debe establecer error si la validación es exitosa', () => {
      const validationRules = {
        username: (value) => {
          if (!value || value.length < 4) {
            return { isValid: false, error: 'Mínimo 4 caracteres' };
          }
          return { isValid: true, error: '' };
        }
      };
      
      const { result } = renderHook(() => 
        useForm({ username: 'validusername' }, null, validationRules)
      );
      
      act(() => {
        result.current.handleBlur({ target: { name: 'username' } });
      });
      
      expect(result.current.touched.username).toBe(true);
      expect(result.current.errors.username).toBeUndefined();
    });

    it('debe validar múltiples campos independientemente', () => {
      const validationRules = {
        username: (value) => 
          value && value.length >= 4 
            ? { isValid: true, error: '' } 
            : { isValid: false, error: 'Username inválido' },
        email: (value) => 
          value && value.includes('@') 
            ? { isValid: true, error: '' } 
            : { isValid: false, error: 'Email inválido' }
      };
      
      const { result } = renderHook(() => 
        useForm({ username: 'abc', email: 'invalid' }, null, validationRules)
      );
      
      act(() => {
        result.current.handleBlur({ target: { name: 'username' } });
      });
      
      expect(result.current.errors.username).toBe('Username inválido');
      expect(result.current.errors.email).toBeUndefined();
      
      act(() => {
        result.current.handleBlur({ target: { name: 'email' } });
      });
      
      expect(result.current.errors.email).toBe('Email inválido');
    });
  });

  describe('Validación completa del formulario', () => {
    it('debe validar todos los campos al hacer submit', async () => {
      const mockOnSubmit = vi.fn();
      const validationRules = {
        username: (value) => 
          !value || value.length < 4
            ? { isValid: false, error: 'Username inválido' }
            : { isValid: true, error: '' },
        email: (value) => 
          !value || !value.includes('@')
            ? { isValid: false, error: 'Email inválido' }
            : { isValid: true, error: '' }
      };
      
      const { result } = renderHook(() => 
        useForm(
          { username: 'abc', email: 'invalid' },
          mockOnSubmit,
          validationRules
        )
      );
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      
      expect(result.current.errors.username).toBe('Username inválido');
      expect(result.current.errors.email).toBe('Email inválido');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('debe llamar onSubmit solo si la validación es exitosa', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      const validationRules = {
        username: (value) => 
          value && value.length >= 4
            ? { isValid: true, error: '' }
            : { isValid: false, error: 'Username inválido' }
      };
      
      const { result } = renderHook(() => 
        useForm(
          { username: 'validuser' },
          mockOnSubmit,
          validationRules
        )
      );
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      
      expect(mockOnSubmit).toHaveBeenCalledWith({ username: 'validuser' });
      expect(result.current.errors).toEqual({});
    });
  });

  describe('handleSubmit - Manejo de envío', () => {
    it('debe establecer isSubmitting durante el envío', async () => {
      let resolveSubmit;
      const mockOnSubmit = vi.fn(() =>  // ← CAMBIO AQUÍ: jest.fn() → vi.fn()
        new Promise(resolve => { resolveSubmit = resolve; })
      );
      
      const { result } = renderHook(() => 
        useForm({ username: 'test' }, mockOnSubmit)
      );
      
      const submitPromise = act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      
      // Durante el submit
      expect(result.current.isSubmitting).toBe(true);
      
      // Resolver el submit
      await act(async () => {
        resolveSubmit();
        await submitPromise;
      });
      
      // Después del submit
      expect(result.current.isSubmitting).toBe(false);
    });

    it('debe prevenir el comportamiento por defecto del evento', async () => {
      const mockPreventDefault = vi.fn();
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      
      const { result } = renderHook(() => 
        useForm({ username: 'test' }, mockOnSubmit)
      );
      
      await act(async () => {
        await result.current.handleSubmit({ 
          preventDefault: mockPreventDefault 
        });
      });
      
      expect(mockPreventDefault).toHaveBeenCalled();
    });

    it('debe manejar errores en onSubmit', async () => {
      const mockOnSubmit = vi.fn().mockRejectedValue(
        new Error('Error de red')
      );
      
      const { result } = renderHook(() => 
        useForm({ username: 'test' }, mockOnSubmit)
      );
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      
      expect(result.current.errors.submit).toBe('Error de red');
      expect(result.current.isSubmitting).toBe(false);
    });

    it('debe pasar los valores correctos a onSubmit', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      const initialValues = {
        username: 'testuser',
        email: 'test@example.com',
        age: '25'
      };
      
      const { result } = renderHook(() => 
        useForm(initialValues, mockOnSubmit)
      );
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      
      expect(mockOnSubmit).toHaveBeenCalledWith(initialValues);
    });

    it('debe permitir submit sin reglas de validación', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      
      const { result } = renderHook(() => 
        useForm({ field: 'value' }, mockOnSubmit, null)
      );
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });
      
      expect(mockOnSubmit).toHaveBeenCalledWith({ field: 'value' });
    });
  });

  describe('setError', () => {
    it('debe establecer un error manualmente', () => {
      const { result } = renderHook(() => useForm({ username: '' }));
      
      act(() => {
        result.current.setError('username', 'Error personalizado');
      });
      
      expect(result.current.errors.username).toBe('Error personalizado');
    });

    it('debe permitir establecer múltiples errores', () => {
      const { result } = renderHook(() => 
        useForm({ username: '', email: '' })
      );
      
      act(() => {
        result.current.setError('username', 'Error 1');
        result.current.setError('email', 'Error 2');
      });
      
      expect(result.current.errors.username).toBe('Error 1');
      expect(result.current.errors.email).toBe('Error 2');
    });

    it('debe sobrescribir errores existentes', () => {
      const { result } = renderHook(() => useForm({ field: '' }));
      
      act(() => {
        result.current.setError('field', 'Error original');
      });
      
      expect(result.current.errors.field).toBe('Error original');
      
      act(() => {
        result.current.setError('field', 'Error nuevo');
      });
      
      expect(result.current.errors.field).toBe('Error nuevo');
    });
  });
});