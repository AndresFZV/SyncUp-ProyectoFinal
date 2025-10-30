import React, { useState } from 'react';
import './GestionComun.css';
import { FaUpload, FaFileAlt, FaCheckCircle, FaTimesCircle, FaMusic, FaCompactDisc, FaFileArchive, FaImage } from 'react-icons/fa';

const CargaMasiva = () => {
  const [tipoArchivo, setTipoArchivo] = useState('canciones');
  const [archivoTxt, setArchivoTxt] = useState(null);
  const [archivoZip, setArchivoZip] = useState(null);
  const [imagenAlbum, setImagenAlbum] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState([]);

  const handleTxtChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.txt')) {
      setArchivoTxt(file);
      setResultado(null);
      setErrores([]);
    } else {
      alert('Por favor selecciona un archivo .txt válido');
    }
  };

  const handleZipChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      setArchivoZip(file);
    } else {
      alert('Por favor selecciona un archivo .zip válido');
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
    if (!archivoTxt) {
      alert('Por favor selecciona el archivo .txt con la información');
      return;
    }

    if (!archivoZip) {
      alert('Por favor selecciona el archivo .zip con los MP3 e imágenes');
      return;
    }

    setLoading(true);
    setResultado(null);
    setErrores([]);

    const formData = new FormData();
    formData.append('archivoMetadata', archivoTxt);
    formData.append('archivoMultimedia', archivoZip);

    try {
      const response = await fetch('http://localhost:8080/api/canciones/carga-masiva', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setResultado(data);
        setArchivoTxt(null);
        setArchivoZip(null);
      } else {
        const error = await response.text();
        setErrores([error]);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrores(['Error al procesar los archivos']);
    } finally {
      setLoading(false);
    }
  };

  const handleCargarAlbum = async () => {
    if (!archivoTxt) {
      alert('Por favor selecciona el archivo metadata.txt');
      return;
    }

    if (!imagenAlbum) {
      alert('Por favor selecciona la imagen de portada del álbum');
      return;
    }

    if (!archivoZip) {
      alert('Por favor selecciona el archivo ZIP con las canciones');
      return;
    }

    setLoading(true);
    setResultado(null);
    setErrores([]);

    const formData = new FormData();
    formData.append('archivoMetadata', archivoTxt);
    formData.append('imagenPortada', imagenAlbum);
    formData.append('archivoMultimedia', archivoZip);

    try {
      const response = await fetch('http://localhost:8080/api/albumes/carga-masiva', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setResultado(data);
        setArchivoTxt(null);
        setArchivoZip(null);
        setImagenAlbum(null);
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

  const resetForm = () => {
    setArchivoTxt(null);
    setArchivoZip(null);
    setImagenAlbum(null);
    setResultado(null);
    setErrores([]);
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
            resetForm();
          }}
        >
          <FaMusic /> Canciones Sueltas
        </button>
        <button 
          className={`tipo-btn ${tipoArchivo === 'album' ? 'active' : ''}`}
          onClick={() => {
            setTipoArchivo('album');
            resetForm();
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
                ? 'Carga Masiva de Canciones' 
                : 'Carga Masiva de Álbum'}
            </h3>
            
            {tipoArchivo === 'canciones' ? (
              <>
                <p>Para cargar canciones necesitas 2 archivos:</p>
                <div className="instrucciones">
                  <div className="instruccion-item">
                    <FaFileAlt size={24} color="#8a2be2" />
                    <div>
                      <h4>1. Archivo .txt con la metadata</h4>
                      <p>Formato: <code>Titulo;ArtistaId;AlbumId;Genero;Año;NombreArchivoImagen;NombreArchivoMP3</code></p>
                      <div className="formato-ejemplo">
                        <code>
                          Self Control;68fe886b5b18bf241dbe48f0;68fe89ec0b89c4bb48987a88;R&B;2016;Self Control.jpeg;Self Control.mp3<br/>
                          Ivy;68fe886b5b18bf241dbe48f0;68fe89ec0b89c4bb48987a88;Soul;2016;Ivy.jpeg;Ivy.mp3
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="instruccion-item">
                    <FaFileArchive size={24} color="#f39c12" />
                    <div>
                      <h4>2. Archivo .zip con MP3 e imágenes</h4>
                      <p>Debe contener todos los archivos mencionados en el .txt:</p>
                      <ul>
                        <li>Self Control.jpeg</li>
                        <li>Self Control.mp3</li>
                        <li>Ivy.jpeg</li>
                        <li>Ivy.mp3</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p>Para cargar un álbum completo necesitas 3 archivos:</p>
                <div className="instrucciones">
                  <div className="instruccion-item">
                    <FaFileAlt size={24} color="#8a2be2" />
                    <div>
                      <h4>1. Archivo metadata.txt con info del álbum y canciones</h4>
                      <div className="formato-ejemplo">
                        <code>
                          # Primera línea: Álbum<br/>
                          IGOR;68fef4656178bfb43caf8131;Álbum conceptual;#F8C8DC<br/>
                          <br/>
                          # Siguientes líneas: Canciones (sin nombres de imagen)<br/>
                          EARFQUAKE;R&B;2019;EARFQUAKE.mp3<br/>
                          I THINK;Hip-Hop;2019;I THINK.mp3<br/>
                          NEW MAGIC WAND;Hip-Hop;2019;NEW MAGIC WAND.mp3
                        </code>
                      </div>
                      <p style={{ fontSize: '13px', color: '#2196f3', marginTop: '8px', fontWeight: '600' }}>
                        ℹ️ Formato canciones: Título;Género;Año;ArchivoMP3
                      </p>
                    </div>
                  </div>

                  <div className="instruccion-item">
                    <FaImage size={24} color="#e91e63" />
                    <div>
                      <h4>2. Imagen de portada del álbum (archivo independiente)</h4>
                      <p>Imagen JPG/PNG que se usará como portada del álbum</p>
                      <p style={{ fontSize: '13px', color: '#2196f3', marginTop: '5px', fontWeight: '600' }}>
                        ℹ️ Esta imagen se aplicará a todas las canciones del álbum
                      </p>
                    </div>
                  </div>

                  <div className="instruccion-item">
                    <FaFileArchive size={24} color="#f39c12" />
                    <div>
                      <h4>3. Archivo .zip SOLO con archivos MP3</h4>
                      <p>Debe contener únicamente los archivos de audio:</p>
                      <ul>
                        <li>EARFQUAKE.mp3</li>
                        <li>I THINK.mp3</li>
                        <li>NEW MAGIC WAND.mp3</li>
                      </ul>
                      <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '8px', fontWeight: '600' }}>
                        ⚠️ NO incluir: imágenes, metadata.txt ni portada del álbum
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Upload de archivo .txt o metadata.txt según el tipo */}
          <div className="upload-box">
            <input
              type="file"
              id="txt-upload"
              accept=".txt"
              onChange={handleTxtChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="txt-upload" className="upload-label">
              <FaFileAlt size={32} />
              <p>{archivoTxt ? `✓ ${archivoTxt.name}` : `Seleccionar ${tipoArchivo === 'canciones' ? 'archivo .txt' : 'metadata.txt'}`}</p>
            </label>
          </div>

          {/* Upload de imagen del álbum (solo para álbum) */}
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
                <FaImage size={32} />
                <p>{imagenAlbum ? `✓ ${imagenAlbum.name}` : 'Seleccionar portada del álbum'}</p>
              </label>
            </div>
          )}

          {/* Upload de archivo .zip */}
          <div className="upload-box" style={{marginTop: '20px'}}>
            <input
              type="file"
              id="zip-upload"
              accept=".zip"
              onChange={handleZipChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="zip-upload" className="upload-label">
              <FaFileArchive size={48} />
              <p>
                {archivoZip 
                  ? `✓ ${archivoZip.name}` 
                  : tipoArchivo === 'canciones' 
                    ? 'Seleccionar archivo .zip con MP3 e imágenes'
                    : 'Seleccionar archivo .zip con archivos MP3'}
              </p>
              <span style={{fontSize: '13px', color: '#666'}}>
                {tipoArchivo === 'canciones' 
                  ? 'Debe contener MP3 + imágenes de cada canción'
                  : 'Solo archivos MP3 (sin imágenes)'}
              </span>
            </label>
          </div>

          {/* Botón de carga */}
          {archivoTxt && archivoZip && (tipoArchivo === 'canciones' || imagenAlbum) && (
            <button 
              className="btn-primary btn-cargar" 
              onClick={tipoArchivo === 'canciones' ? handleCargarCanciones : handleCargarAlbum}
              disabled={loading}
            >
              {loading ? 'Procesando...' : `Cargar ${tipoArchivo === 'canciones' ? 'Canciones' : 'Álbum'}`}
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
          max-width: 1000px;
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
          margin: 15px 0 20px;
          font-size: 24px;
          color: #333;
        }

        .upload-info p {
          color: #666;
          margin-bottom: 20px;
          font-size: 16px;
        }

        .instrucciones {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 20px;
        }

        .instruccion-item {
          display: flex;
          gap: 15px;
          align-items: flex-start;
          text-align: left;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .instruccion-item h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #333;
        }

        .instruccion-item p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .instruccion-item ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .instruccion-item li {
          font-size: 13px;
          color: #666;
          margin: 3px 0;
        }

        .formato-ejemplo {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin-top: 10px;
          border: 1px solid #e0e0e0;
        }

        .formato-ejemplo code {
          font-family: 'Courier New', monospace;
          font-size: 12px;
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
          padding: 30px 50px;
          border: 3px dashed #8a2be2;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8f4ff;
          width: 100%;
          max-width: 500px;
        }

        .upload-label:hover {
          background: #f0e7ff;
          border-color: #6a1bb2;
        }

        .upload-label p {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #8a2be2;
        }

        .btn-cargar {
          margin-top: 30px;
          width: 100%;
          max-width: 400px;
          padding: 15px;
          font-size: 18px;
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

        @media (max-width: 768px) {
          .tipo-selector {
            flex-direction: column;
          }

          .tipo-btn {
            width: 100%;
            justify-content: center;
          }

          .instruccion-item {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CargaMasiva;
