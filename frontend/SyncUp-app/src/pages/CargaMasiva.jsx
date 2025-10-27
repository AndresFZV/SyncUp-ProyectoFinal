import React, { useState } from 'react';
import './GestionComun.css';
import { FaUpload, FaFileAlt, FaCheckCircle, FaTimesCircle, FaMusic, FaCompactDisc } from 'react-icons/fa';

const CargaMasiva = () => {
  const [tipoArchivo, setTipoArchivo] = useState('canciones'); // 'canciones' o 'album'
  const [archivo, setArchivo] = useState(null);
  const [imagenAlbum, setImagenAlbum] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      setArchivo(file);
      setResultado(null);
      setErrores([]);
    } else {
      alert('Por favor selecciona un archivo .txt válido');
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImagenAlbum(file);
    } else {
      alert('Por favor selecciona una imagen válida');
    }
  };

  const handleCargarCanciones = async () => {
    if (!archivo) {
      alert('Por favor selecciona un archivo primero');
      return;
    }

    setLoading(true);
    setResultado(null);
    setErrores([]);

    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      const response = await fetch('http://localhost:8080/api/canciones/carga-masiva', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setResultado(data);
      } else {
        const error = await response.text();
        setErrores([error]);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrores(['Error al procesar el archivo']);
    } finally {
      setLoading(false);
    }
  };

  const handleCargarAlbum = async () => {
    if (!archivo) {
      alert('Por favor selecciona un archivo con las canciones');
      return;
    }

    if (!imagenAlbum) {
      alert('Por favor selecciona una imagen para el álbum');
      return;
    }

    setLoading(true);
    setResultado(null);
    setErrores([]);

    const formData = new FormData();
    formData.append('archivoCanciones', archivo);
    formData.append('imagenAlbum', imagenAlbum);

    try {
      const response = await fetch('http://localhost:8080/api/albumes/carga-masiva', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setResultado(data);
      } else {
        const error = await response.text();
        setErrores([error]);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrores(['Error al procesar el archivo']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <h1>Carga Masiva</h1>
      </div>

      {/* Selector de tipo */}
      <div className="tipo-selector">
        <button 
          className={`tipo-btn ${tipoArchivo === 'canciones' ? 'active' : ''}`}
          onClick={() => {
            setTipoArchivo('canciones');
            setArchivo(null);
            setImagenAlbum(null);
            setResultado(null);
            setErrores([]);
          }}
        >
          <FaMusic /> Canciones Sueltas
        </button>
        <button 
          className={`tipo-btn ${tipoArchivo === 'album' ? 'active' : ''}`}
          onClick={() => {
            setTipoArchivo('album');
            setArchivo(null);
            setImagenAlbum(null);
            setResultado(null);
            setErrores([]);
          }}
        >
          <FaCompactDisc /> Álbum Completo
        </button>
      </div>

      <div className="carga-masiva-content">
        <div className="upload-section">
          
          {/* Información del formato */}
          <div className="upload-info">
            <FaFileAlt size={48} color="#8a2be2" />
            <h3>
              {tipoArchivo === 'canciones' 
                ? 'Formato para Canciones Sueltas' 
                : 'Formato para Álbum con Canciones'}
            </h3>
            
            {tipoArchivo === 'canciones' ? (
              <>
                <p>El archivo debe ser un .txt con el siguiente formato (una canción por línea):</p>
                <div className="formato-ejemplo">
                  <code>
                    Titulo;ArtistaId;AlbumId;Genero;Duracion;Año;ImagenUrl<br/>
                    Bohemian Rhapsody;artist123;;Rock;5.55;1975;https://...<br/>
                    Imagine;artist456;album789;Pop;3.03;1971;https://...
                  </code>
                  <p style={{marginTop: '10px', fontSize: '13px', color: '#666'}}>
                    * AlbumId puede estar vacío si la canción no pertenece a un álbum
                  </p>
                </div>
              </>
            ) : (
              <>
                <p>Para subir un álbum completo necesitas:</p>
                <ol style={{textAlign: 'left', marginTop: '15px', paddingLeft: '20px'}}>
                  <li>Un archivo .txt con la información del álbum y sus canciones</li>
                  <li>Una imagen para la portada del álbum</li>
                </ol>
                <div className="formato-ejemplo">
                  <code>
                    # Primera línea: Info del álbum<br/>
                    AlbumNombre;ArtistaId;Descripcion;BgColor<br/>
                    Blonde;artist123;Álbum experimental;#F5E6CC<br/>
                    <br/>
                    # Siguientes líneas: Canciones del álbum<br/>
                    Titulo;Genero;Duracion;Año<br/>
                    Nikes;R&B;5.14;2016<br/>
                    Ivy;Soul;4.09;2016<br/>
                    Pink + White;Pop;3.04;2016
                  </code>
                </div>
              </>
            )}
          </div>

          {/* Upload de archivo .txt */}
          <div className="upload-box">
            <input
              type="file"
              id="file-upload"
              accept=".txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="upload-label">
              <FaUpload size={32} />
              <p>{archivo ? archivo.name : 'Seleccionar archivo .txt'}</p>
            </label>
          </div>

          {/* Upload de imagen (solo para álbum) */}
          {tipoArchivo === 'album' && (
            <div className="upload-box" style={{marginTop: '20px'}}>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImagenChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="upload-label">
                <FaCompactDisc size={32} />
                <p>{imagenAlbum ? imagenAlbum.name : 'Seleccionar imagen del álbum'}</p>
              </label>
            </div>
          )}

          {/* Botón de carga */}
          {archivo && (tipoArchivo === 'canciones' || imagenAlbum) && (
            <button 
              className="btn-primary btn-cargar" 
              onClick={tipoArchivo === 'canciones' ? handleCargarCanciones : handleCargarAlbum}
              disabled={loading}
            >
              {loading ? 'Cargando...' : `Cargar ${tipoArchivo === 'canciones' ? 'Canciones' : 'Álbum'}`}
            </button>
          )}
        </div>

        {/* Resultados */}
        {resultado && (
          <div className="resultado-box success">
            <FaCheckCircle size={32} color="#4caf50" />
            <h3>¡Carga exitosa!</h3>
            {tipoArchivo === 'canciones' ? (
              <p>Se cargaron <strong>{resultado.cancionesCargadas || resultado.total}</strong> canciones correctamente</p>
            ) : (
              <>
                <p>Álbum <strong>{resultado.albumNombre}</strong> creado exitosamente</p>
                <p>Se agregaron <strong>{resultado.totalCanciones}</strong> canciones al álbum</p>
              </>
            )}
          </div>
        )}

        {/* Errores */}
        {errores.length > 0 && (
          <div className="resultado-box error">
            <FaTimesCircle size={32} color="#f44336" />
            <h3>Errores en la carga</h3>
            <ul>
              {errores.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        .tipo-selector {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          justify-content: center;
        }

        .tipo-btn {
          padding: 15px 30px;
          border: 2px solid #8a2be2;
          background: white;
          color: #8a2be2;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tipo-btn:hover {
          background: #f8f4ff;
        }

        .tipo-btn.active {
          background: linear-gradient(135deg, #8a2be2, #6a1bb2);
          color: white;
        }

        .carga-masiva-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .upload-section {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 30px;
        }

        .upload-info {
          text-align: center;
          margin-bottom: 30px;
        }

        .upload-info h3 {
          margin: 15px 0 10px;
          font-size: 20px;
          color: #333;
        }

        .upload-info p {
          color: #666;
          margin-bottom: 15px;
        }

        .formato-ejemplo {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          text-align: left;
          margin-top: 15px;
        }

        .formato-ejemplo code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #333;
          line-height: 1.8;
        }

        .upload-box {
          text-align: center;
        }

        .upload-label {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 40px 60px;
          border: 3px dashed #8a2be2;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8f4ff;
        }

        .upload-label:hover {
          background: #f0e7ff;
          border-color: #6a1bb2;
        }

        .upload-label p {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #8a2be2;
        }

        .btn-cargar {
          margin-top: 20px;
          width: 100%;
          max-width: 300px;
        }

        .resultado-box {
          background: white;
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .resultado-box h3 {
          margin: 15px 0 10px;
          font-size: 22px;
        }

        .resultado-box.success {
          border: 2px solid #4caf50;
        }

        .resultado-box.success h3 {
          color: #4caf50;
        }

        .resultado-box.error {
          border: 2px solid #f44336;
        }

        .resultado-box.error h3 {
          color: #f44336;
        }

        .resultado-box ul {
          text-align: left;
          margin-top: 15px;
          padding-left: 20px;
        }

        .resultado-box li {
          margin: 5px 0;
          color: #666;
        }

        @media (max-width: 640px) {
          .tipo-selector {
            flex-direction: column;
          }

          .tipo-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CargaMasiva;