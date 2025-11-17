import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Input.module.css';

/**
 * Componente de input reutilizable con soporte para validación, iconos y tipo password
 * 
 * @param {string} label - Etiqueta descriptiva del input
 * @param {string} type - Tipo de input HTML ('text', 'password', 'email', etc.)
 * @param {string} name - Nombre del campo para formularios
 * @param {string} value - Valor actual del input
 * @param {string} placeholder - Texto placeholder
 * @param {string} error - Mensaje de error a mostrar
 * @param {React.ReactNode} icon - Icono opcional a mostrar a la izquierda
 * @param {boolean} required - Indica si el campo es obligatorio
 * @param {boolean} disabled - Estado deshabilitado del input
 * @param {function} onChange - Función manejadora del evento change
 * @param {function} onBlur - Función manejadora del evento blur
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales para el elemento input
 */
const Input = ({
  label,
  type = 'text',
  name,
  value,
  placeholder,
  error,
  icon,
  required = false,
  disabled = false,
  onChange,
  onBlur,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;

  const inputClass = [
    styles.input,
    error && styles.inputError,
    icon && styles.inputWithIcon,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.inputGroup}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {icon && (
          <span className={styles.iconLeft}>{icon}</span>
        )}
        
        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={inputClass}
          {...props}
        />
        
        {isPasswordType && (
          <button
            type="button"
            className={styles.iconRight}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      
      {error && (
        <span className={styles.error}>{error}</span>
      )}
    </div>
  );
};

export default Input;