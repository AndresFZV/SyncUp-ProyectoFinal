import React, { useState } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaCalendar } from 'react-icons/fa';
import styles from './EditProfileModal.module.css';

const EditProfileModal = ({ isOpen, onClose, userData, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: userData?.nombre || '',
    username: userData?.username || '',
    correo: userData?.correo || '',
    edad: userData?.edad || ''
  });
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
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!formData.username.trim()) {
      setError('El usuario es obligatorio');
      return;
    }
    if (!formData.correo.trim()) {
      setError('El correo es obligatorio');
      return;
    }

    if (!formData.correo.includes('@')) {
      setError('El correo debe ser válido');
      return;
    }

    if (formData.edad && (formData.edad < 1 || formData.edad > 120)) {
      setError('La edad debe estar entre 1 y 120');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Editar Perfil</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="nombre">
              <FaUser /> Nombre completo
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              disabled={loading}
            />
          </div>
        
          <div className={styles.formGroup}>
            <label htmlFor="usuario">
              <FaUser /> Usuario
            </label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ingresa tu usuario"
              disabled={loading}
            />
          </div>


          <div className={styles.formGroup}>
            <label htmlFor="correo">
              <FaEnvelope /> Correo electrónico
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="edad">
              <FaCalendar /> Edad
            </label>
            <input
              type="number"
              id="edad"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              placeholder="Ingresa tu edad"
              min="1"
              max="120"
              disabled={loading}
            />
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
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;