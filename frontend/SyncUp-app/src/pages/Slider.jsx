import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import "./Slider.css";

const slidesData = [
  {
    imgSrc: "/img/frank.jpg",
    title: "Descubre tu sonido",
    description: "Explora miles de canciones y artistas de todo el mundo. Encuentra nuevos géneros y deja que la música te sorprenda cada día."
  },
  {
    imgSrc: "/img/kendrick.jpg",
    title: "Conecta con otros oyentes",
    description: "Forma parte de una comunidad donde la música une. Sigue a tus amigos y descubre lo que están escuchando en tiempo real."
  },
  {
    imgSrc: "/img/concierto.jpg",
    title: "Tu música, a tu estilo",
    description: "Crea listas personalizadas, guarda tus favoritos y deja que nuestro algoritmo te recomiende lo que realmente te gusta."
  },
  {
    imgSrc: "/img/artistas.jpg",
    title: "Descubre nuevos artistas",
    description: "SyncUp te presenta músicos que podrían ser tus próximos artistas favoritos."
  },
  {
    imgSrc: "/img/bad.jpg",
    title: "Siempre contigo, siempre conectado",
    description: "Escucha tu música en cualquier momento y lugar, sin interrupciones, desde cualquier dispositivo."
  },
];

export default function Slider() {
  const swiperWrappedRef = useRef(null);

  // Función para ajustar margen dinámicamente según tamaño de pantalla
  function adjustMargin() {
    const screenWidth = window.innerWidth;
    if (swiperWrappedRef.current) {
      swiperWrappedRef.current.style.marginLeft =
        screenWidth <= 520
          ? "0px"
          : screenWidth <= 650
          ? "-50px"
          : screenWidth <= 800
          ? "-100px"
          : "-150px";
    }
  }

  useEffect(() => {
    adjustMargin();
    window.addEventListener("resize", adjustMargin);
    return () => {
      window.removeEventListener("resize", adjustMargin);
    };
  }, []);

  return (
    <div className="slider-page">
      <div className="slider-container">
        <Swiper
          modules={[Pagination]}
          grabCursor={true}
          initialSlide={2}
          centeredSlides={true}
          slidesPerView={'auto'}
          speed={800}
          slideToClickedSlide={true}
          pagination={{ clickable: true }}
          loop={true}
          breakpoints={{
            320: { spaceBetween: 40 },
            650: { spaceBetween: 30 },
            1000: { spaceBetween: 20 },
          }}
          onSwiper={(swiper) => {
            if (swiper.wrapperEl) swiperWrappedRef.current = swiper.wrapperEl;
          }}
        >
          {slidesData.map((slide, index) => (
            <SwiperSlide key={index}>
              <img src={slide.imgSrc} alt={slide.title} />
              <div className="slider-title">
                <h1>{slide.title}</h1>
              </div>
              <div className="slider-content">
                <div className="slider-text-box">
                  <p>{slide.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
