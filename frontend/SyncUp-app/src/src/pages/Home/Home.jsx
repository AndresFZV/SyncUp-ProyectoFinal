/**
 * HOME PAGE
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.home}>
      <div className={styles.content}>
        <h1>Donde cada nota encuentra su conexión.</h1>
        <p>
          Explora, comparte y sincroniza tu mundo musical con personas que vibran como tú.
        </p>
        <button 
          className={styles.btnMain} 
          onClick={() => navigate(ROUTES.REGISTER)}
        >
          Pruébalo gratis
        </button>
      </div>
      <div className={styles.backgroundShape}></div>
    </section>
  );
};

export default Home;