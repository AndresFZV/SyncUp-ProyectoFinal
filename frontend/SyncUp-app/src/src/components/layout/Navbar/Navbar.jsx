/**
 * NAVBAR COMPONENT - Navegación principal
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';
import styles from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthButtons, setShowAuthButtons] = useState(true);

  useEffect(() => {
    const authPages = [ROUTES.LOGIN, ROUTES.REGISTER];
    setShowAuthButtons(!authPages.includes(location.pathname));
  }, [location]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={() => navigate(ROUTES.HOME)}>
        <img src="/img/logo.png" alt="SyncUp Logo" className={styles.logoImg} />
      </div>

      <div className={styles.navLinks}>
        <button 
          className={styles.navButton}
          onClick={() => navigate(ROUTES.CARACTERISTICAS)}
        >
          Características
        </button>
        
        <button 
          className={styles.navButton}
          onClick={() => navigate(ROUTES.SOBRE_NOSOTROS)}
        >
          Sobre Nosotros
        </button>

        {showAuthButtons && (
          <>
            <button 
              className={`${styles.navButton} ${styles.login}`}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Iniciar sesión
            </button>
            
            <button 
              className={`${styles.navButton} ${styles.register}`}
              onClick={() => navigate(ROUTES.REGISTER)}
            >
              Registrarse
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;