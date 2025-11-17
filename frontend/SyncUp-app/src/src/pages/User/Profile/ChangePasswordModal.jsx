import React, { useState } from 'react';
import { FaTimes, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './ChangePasswordModal.module.css';

const ChangePasswordModal = ({ isOpen, onClose, username, onSave }) => {
  const [formData, setFormData] = useState({
    nuevaPassword: '',
    confirmarPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.nuevaPassword.trim()) {
      setError('La contraseña es obligatoria');
      return;
    }

    if (formData.nuevaPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!/[A-Za-z]/.test(formData.nuevaPassword) || !/[0-9]/.test(formData.nuevaPassword)) {
      setError('La contraseña debe contener letras y números');
      return;
    }

    if (formData.nuevaPassword !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData.nuevaPassword);
      setFormData({ nuevaPassword: '', confirmarPassword: '' });
    } catch (err) {
      setError(err.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Cambiar Contraseña</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="nuevaPassword">
              <FaLock /> Nueva contraseña
            </label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="nuevaPassword"
                name="nuevaPassword"
                value={formData.nuevaPassword}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <small>Debe contener al menos 8 caracteres, letras y números</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmarPassword">
              <FaLock /> Confirmar contraseña
            </label>
            <div className={styles.passwordInput}>
              <input
                type={showConfirm ? 'text' : 'password'}
                id="confirmarPassword"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                placeholder="Repite la contraseña"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;