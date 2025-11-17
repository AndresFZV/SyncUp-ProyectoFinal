/**
 * INPUT COMPONENT - Input reutilizable con validación
 */

import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Input.module.css';

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