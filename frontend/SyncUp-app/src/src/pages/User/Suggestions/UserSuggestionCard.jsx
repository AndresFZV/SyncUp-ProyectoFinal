import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaUserPlus, FaUsers, FaCheck } from 'react-icons/fa';
import styles from './UserSuggestionCard.module.css';
import { seguirUsuario } from '../../../services/usuariosService';

const UserSuggestionCard = ({ usuario, onSeguir }) => {
  const navigate = useNavigate();
  const [siguiendo, setSiguiendo] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSeguir = async (e) => {
    e.stopPropagation();
    
    if (loading) return;
    
    try {
      setLoading(true);
      await seguirUsuario(usuario.username);
      setSiguiendo(true);
      
      // Notificar al componente padre para actualizar la lista
      if (onSeguir) {
        setTimeout(() => {
          onSeguir(usuario.username);
        }, 800);
      }
      
    } catch (error) {
      console.error('Error al seguir usuario:', error);
      alert(error.message || 'Error al seguir usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleVerPerfil = () => {
    navigate(`/user/profile/${usuario.username}`);
  };

  return (
    <div className={`${styles.card} ${siguiendo ? styles.siguiendo : ''}`}>
      {/* Avatar */}
      <div className={styles.avatarContainer}>
        <div className={styles.avatar}>
          <FaUser />
        </div>
        {siguiendo && (
          <div className={styles.checkmark}>
            <FaCheck />
          </div>
        )}
      </div>

      {/* Info del usuario */}
      <div className={styles.userInfo}>
        <h3 className={styles.nombre}>{usuario.nombre}</h3>
        <p className={styles.username}>@{usuario.username}</p>
      </div>

      {/* Estadísticas */}
      <div className={styles.stats}>
        {/* Conexiones en común */}
        {usuario.conexionesComunes > 0 && (
          <div className={styles.statItem}>
            <span className={styles.statIcon}>⚡</span>
            <span className={styles.statText}>
              {usuario.conexionesComunes} conexión{usuario.conexionesComunes !== 1 ? 'es' : ''} en común
            </span>
          </div>
        )}

        {/* Seguidores */}
        <div className={styles.statItem}>
          <FaUsers className={styles.statIcon} />
          <span className={styles.statText}>
            {usuario.seguidores} seguidores{usuario.seguidores !== 1}
          </span>
        </div>

        {/* Grado de separación */}
        {usuario.gradoSeparacion > 0 && (
          <div className={styles.statItem}>
            <span className={styles.statIcon}>📍</span>
            <span className={styles.statText}>
              Nivel {usuario.gradoSeparacion}
            </span>
          </div>
        )}
      </div>

      {/* Amigos en común */}
      {usuario.amigosEnComun && usuario.amigosEnComun.length > 0 && (
        <div className={styles.amigosComunes}>
          <p className={styles.amigosLabel}>Amigos en común:</p>
          <p className={styles.amigosLista}>
            {usuario.amigosEnComun.slice(0, 3).join(', ')}
            {usuario.amigosEnComun.length > 3 && ` +${usuario.amigosEnComun.length - 3}`}
          </p>
        </div>
      )}

      {/* Botones de acción */}
      <div className={styles.acciones}>
        <button
          className={`${styles.btnSeguir} ${siguiendo ? styles.btnSiguiendo : ''}`}
          onClick={handleSeguir}
          disabled={loading || siguiendo}
        >
          {siguiendo ? (
            <>
              <FaCheck /> Siguiendo
            </>
          ) : (
            <>
              <FaUserPlus /> {loading ? 'Siguiendo...' : 'Seguir'}
            </>
          )}
        </button>
        
        <button
          className={styles.btnVerPerfil}
          onClick={handleVerPerfil}
        >
          Ver perfil
        </button>
      </div>
    </div>
  );
};

export default UserSuggestionCard;