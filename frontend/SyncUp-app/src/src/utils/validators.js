/**
 * VALIDATORS.JS - Validaciones reutilizables
 */

import { VALIDATION_RULES } from './constants';

export const validateUsername = (username) => {
  if (!username || username.trim() === '') {
    return { isValid: false, error: 'El username es requerido' };
  }

  if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    return { 
      isValid: false, 
      error: `El username debe tener al menos ${VALIDATION_RULES.USERNAME.MIN_LENGTH} caracteres` 
    };
  }

  return { isValid: true, error: '' };
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'La contraseña es requerida' };
  }

  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return { 
      isValid: false, 
      error: `La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} caracteres` 
    };
  }

  if (!VALIDATION_RULES.PASSWORD.REGEX.test(password)) {
    return { isValid: false, error: VALIDATION_RULES.PASSWORD.MESSAGE };
  }

  return { isValid: true, error: '' };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Confirma tu contraseña' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Las contraseñas no coinciden' };
  }

  return { isValid: true, error: '' };
};

export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'El correo es requerido' };
  }

  if (!VALIDATION_RULES.EMAIL.REGEX.test(email)) {
    return { isValid: false, error: VALIDATION_RULES.EMAIL.MESSAGE };
  }

  return { isValid: true, error: '' };
};

export const validateRequired = (value, fieldName = 'Este campo') => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} es requerido` };
  }

  return { isValid: true, error: '' };
};

export const validateAge = (age) => {
  const ageNum = parseInt(age);

  if (isNaN(ageNum)) {
    return { isValid: false, error: 'La edad debe ser un número válido' };
  }

  if (ageNum < VALIDATION_RULES.AGE.MIN || ageNum > VALIDATION_RULES.AGE.MAX) {
    return { 
      isValid: false, 
      error: `Debes tener entre ${VALIDATION_RULES.AGE.MIN} y ${VALIDATION_RULES.AGE.MAX} años` 
    };
  }

  return { isValid: true, error: '' };
};

export const validateYear = (year) => {
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();

  if (isNaN(yearNum)) {
    return { isValid: false, error: 'El año debe ser un número válido' };
  }

  if (yearNum < 1900 || yearNum > currentYear + 1) {
    return { isValid: false, error: `El año debe estar entre 1900 y ${currentYear + 1}` };
  }

  return { isValid: true, error: '' };
};

export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach((fieldName) => {
    const validator = validationRules[fieldName];
    const result = validator(formData[fieldName]);

    if (!result.isValid) {
      errors[fieldName] = result.error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

export default {
  validateUsername,
  validatePassword,
  validatePasswordMatch,
  validateEmail,
  validateRequired,
  validateAge,
  validateYear,
  validateForm,
};