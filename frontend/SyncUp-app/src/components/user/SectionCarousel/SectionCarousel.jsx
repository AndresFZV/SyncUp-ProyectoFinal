import React, { useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './SectionCarousel.module.css';

/**
 * Componente de carrusel horizontal para mostrar secciones de contenido
 * Permite desplazamiento suave con botones de navegación
 * 
 * @param {string} title - Título de la sección
 * @param {React.ReactNode} children - Contenido a mostrar dentro del carrusel
 * @param {function} showAll - Función opcional para mostrar todo el contenido
 */
const SectionCarousel = ({ title, children, showAll }) => {
  const scrollContainerRef = useRef(null);

  /**
   * Maneja el desplazamiento horizontal del carrusel
   * @param {string} direction - Dirección del desplazamiento ('left' o 'right')
   */
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newPosition = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>{title}</h2>
        {showAll && (
          <button className={styles.showAllButton} onClick={showAll}>
            Mostrar todo
          </button>
        )}
      </div>

      <div className={styles.carouselContainer}>
        <button 
          className={`${styles.scrollButton} ${styles.left}`}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <FaChevronLeft />
        </button>

        <div className={styles.carousel} ref={scrollContainerRef}>
          {children}
        </div>

        <button 
          className={`${styles.scrollButton} ${styles.right}`}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
};

export default SectionCarousel;