import React from "react";
import "./SobreNosotros.css";

function SobreNosotros() {
  return (
    <div className="sobre-nosotros-page">
      <div className="sobre-nosotros-container">
        <h1 className="sobre-nosotros-title">🎵 Sobre Nosotros — SyncUp</h1>
        
        <p className="sobre-nosotros-text">
          En <strong>SyncUp</strong> creemos que la música no solo se escucha: se vive, se comparte y nos conecta. 
          Somos una plataforma de streaming y descubrimiento social de música que une a artistas y oyentes en un solo lugar, 
          transformando la forma en que las personas descubren, comparten y disfrutan sus canciones favoritas.
        </p>

        <p className="sobre-nosotros-text">
          Nuestra misión es <strong>sincronizar a las personas</strong> a través del poder de la música. Buscamos crear una 
          experiencia única donde cada usuario pueda explorar nuevos sonidos, seguir a sus artistas preferidos, crear listas 
          colaborativas y descubrir lo que sus amigos están escuchando en tiempo real.
        </p>

        <p className="sobre-nosotros-text">
          Con un motor inteligente de recomendaciones y un diseño centrado en la interacción social, SyncUp no es solo una 
          aplicación de música: es una <strong>comunidad viva, diversa y en constante evolución</strong>. Aquí, cada reproducción 
          cuenta una historia, y cada conexión abre una nueva melodía.
        </p>

        <div className="vision-section">
          <h2>💡 Nuestra visión</h2>
          <p>
            Ser la plataforma líder en music streaming social, donde la música y la tecnología se unen para fomentar la 
            creatividad, el descubrimiento y la conexión humana.
          </p>
        </div>

        <div className="valores-section">
          <h2>❤️ Nuestros valores</h2>
          <ul>
            <li><strong>Conexión:</strong> unir personas a través de la música.</li>
            <li><strong>Innovación:</strong> integrar tecnología y arte para experiencias únicas.</li>
            <li><strong>Diversidad:</strong> celebrar todos los géneros, culturas y artistas.</li>
            <li><strong>Colaboración:</strong> potenciar la creación colectiva y el descubrimiento mutuo.</li>
          </ul>
        </div>

        <p className="sobre-nosotros-footer">
          En SyncUp, no solo escuchas música… <strong>te sincronizas con el mundo.</strong>
        </p>
      </div>
    </div>
  );
}

export default SobreNosotros;   