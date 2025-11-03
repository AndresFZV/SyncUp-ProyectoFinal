/**
 * BUTTON COMPONENT - Botón reutilizable
 */

import React from 'react';
import styles from './Button.module.css';

const Button = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon = null,
  children,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const buttonClass = [
    styles.button,
    styles[variant],
    styles[size],
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} />
      )}
      {!loading && icon && (
        <span className={styles.icon}>{icon}</span>
      )}
      {children && (
        <span className={styles.text}>{children}</span>
      )}
    </button>
  );
};

export default Button;