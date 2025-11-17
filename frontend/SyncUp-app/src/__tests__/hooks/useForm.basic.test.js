/**
 * TEST 5: USEFORM HOOK - Pruebas para el hook personalizado de formularios (Parte 1)
 * 
 * Este archivo contiene pruebas para las funcionalidades básicas del hook useForm:
 * - Inicialización de valores
 * - Manejo de cambios (handleChange)
 * - Reset de formulario
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useForm } from '../../hooks/useForm';

describe('useForm Hook - Funcionalidades Básicas', () => {
  
  describe('Inicialización', () => {
    it('debe inicializar con valores por defecto vacíos', () => {
      const { result } = renderHook(() => useForm());
      
      expect(result.current.values).toEqual({});
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
    });

    it('debe inicializar con valores personalizados', () => {
      const initialValues = {
        username: 'testuser',
        email: 'test@example.com',
        age: '25'
      };
      
      const { result } = renderHook(() => useForm(initialValues));
      
      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });

    it('debe proporcionar todas las funciones necesarias', () => {
      const { result } = renderHook(() => useForm());
      
      expect(typeof result.current.handleChange).toBe('function');
      expect(typeof result.current.handleBlur).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
      expect(typeof result.current.resetForm).toBe('function');
      expect(typeof result.current.setValue).toBe('function');
      expect(typeof result.current.setError).toBe('function');
      expect(typeof result.current.setFormValues).toBe('function');
    });
  });

  describe('handleChange - Manejo de inputs de texto', () => {
    it('debe actualizar valores cuando cambia un input de texto', () => {
      const { result } = renderHook(() => useForm({ username: '' }));
      
      act(() => {
        result.current.handleChange({
          target: { name: 'username', value: 'newuser', type: 'text' }
        });
      });
      
      expect(result.current.values.username).toBe('newuser');
    });

    it('debe actualizar múltiples campos independientemente', () => {
      const { result } = renderHook(() => 
        useForm({ username: '', email: '', age: '' })
      );
      
      act(() => {
        result.current.handleChange({
          target: { name: 'username', value: 'testuser', type: 'text' }
        });
      });
      
      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'test@mail.com', type: 'text' }
        });
      });
      
      expect(result.current.values.username).toBe('testuser');
      expect(result.current.values.email).toBe('test@mail.com');
      expect(result.current.values.age).toBe('');
    });

    it('debe limpiar errores del campo al cambiar su valor', () => {
      const { result } = renderHook(() => useForm({ username: '' }));
      
      // Establecer un error manualmente
      act(() => {
        result.current.setError('username', 'Username es requerido');
      });
      
      expect(result.current.errors.username).toBe('Username es requerido');
      
      // Cambiar el valor debe limpiar el error
      act(() => {
        result.current.handleChange({
          target: { name: 'username', value: 'newvalue', type: 'text' }
        });
      });
      
      expect(result.current.errors.username).toBe('');
    });
  });

  describe('handleChange - Tipos especiales de input', () => {
    it('debe manejar correctamente checkboxes', () => {
      const { result } = renderHook(() => useForm({ accepted: false }));
      
      act(() => {
        result.current.handleChange({
          target: { 
            name: 'accepted', 
            type: 'checkbox', 
            checked: true,
            value: 'on'
          }
        });
      });
      
      expect(result.current.values.accepted).toBe(true);
    });

    it('debe manejar correctamente archivos', () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const { result } = renderHook(() => useForm({ avatar: null }));
      
      act(() => {
        result.current.handleChange({
          target: { 
            name: 'avatar', 
            type: 'file', 
            files: [mockFile]
          }
        });
      });
      
      expect(result.current.values.avatar).toBe(mockFile);
      expect(result.current.values.avatar.name).toBe('test.jpg');
    });
  });

  describe('resetForm', () => {
    it('debe resetear el formulario a sus valores iniciales', () => {
      const initialValues = { username: 'initial', email: '' };
      const { result } = renderHook(() => useForm(initialValues));
      
      // Modificar valores
      act(() => {
        result.current.handleChange({
          target: { name: 'username', value: 'modified', type: 'text' }
        });
        result.current.setError('username', 'Error de prueba');
      });
      
      expect(result.current.values.username).toBe('modified');
      expect(result.current.errors.username).toBe('Error de prueba');
      
      // Resetear
      act(() => {
        result.current.resetForm();
      });
      
      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
    });

    it('debe resetear todos los estados del formulario', () => {
      const { result } = renderHook(() => useForm({ field: '' }));
      
      // Modificar todos los estados
      act(() => {
        result.current.handleChange({
          target: { name: 'field', value: 'value', type: 'text' }
        });
        result.current.handleBlur({ target: { name: 'field' } });
        result.current.setError('field', 'error');
      });
      
      expect(result.current.touched.field).toBe(true);
      expect(result.current.errors.field).toBe('error');
      
      // Resetear
      act(() => {
        result.current.resetForm();
      });
      
      expect(result.current.values.field).toBe('');
      expect(result.current.touched).toEqual({});
      expect(result.current.errors).toEqual({});
    });
  });

  describe('setValue y setFormValues', () => {
    it('debe establecer un valor individual con setValue', () => {
      const { result } = renderHook(() => useForm({ username: '', email: '' }));
      
      act(() => {
        result.current.setValue('username', 'newvalue');
      });
      
      expect(result.current.values.username).toBe('newvalue');
      expect(result.current.values.email).toBe('');
    });

    it('debe establecer múltiples valores con setFormValues', () => {
      const { result } = renderHook(() => 
        useForm({ username: '', email: '', age: '' })
      );
      
      act(() => {
        result.current.setFormValues({
          username: 'testuser',
          email: 'test@example.com'
        });
      });
      
      expect(result.current.values.username).toBe('testuser');
      expect(result.current.values.email).toBe('test@example.com');
      expect(result.current.values.age).toBe('');
    });

    it('debe mantener valores existentes al usar setFormValues', () => {
      const { result } = renderHook(() => 
        useForm({ username: 'existing', email: '', age: '25' })
      );
      
      act(() => {
        result.current.setFormValues({ email: 'new@example.com' });
      });
      
      expect(result.current.values.username).toBe('existing');
      expect(result.current.values.email).toBe('new@example.com');
      expect(result.current.values.age).toBe('25');
    });
  });
});
