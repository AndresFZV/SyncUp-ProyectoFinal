import React from 'react';
import styles from './Button.module.css';

/**
 * Componente de botón reutilizable con múltiples variantes y estados
 * 
 * @param {string} variant - Variante de estilo del botón ('primary', 'secondary', 'danger', etc.)
 * @param {string} size - Tamaño del botón ('small', 'medium', 'large')
 * @param {boolean} loading - Estado de carga, muestra un spinner y deshabilita el botón
 * @param {boolean} disabled - Estado deshabilitado
 * @ {React.ReactNode} icon - Icono opcional a mostrar en el botón
 * @param {React.ReactNode} children - Contenido textual del botón
 * @param {function} onClick - Función manejadora del evento click
 * @param {string} type - Tipo de botón HTML ('button', 'submit', 'reset')
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales para el elemento button
 */
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