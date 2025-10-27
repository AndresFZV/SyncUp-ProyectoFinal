import React, { useState } from 'react';
import './RecuperarPassword.css';
import { FaUser, FaKey, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RecuperarPassword = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Buscar usuario, 2: Palabra secreta, 3: Nueva contraseña
  const [identifier, setIdentifier] = useState(""); // username o correo
  const [palabraSecreta, setPalabraSecreta] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);

  // Paso 1: Buscar usuario por username o correo
  const handleBuscarUsuario = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!identifier.trim()) {
      setError("Por favor ingresa tu username o correo electrónico");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/usuarios/buscar?identificador=${identifier}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Usuario no encontrado");
      }

      const data = await response.json();
      setUsuarioEncontrado(data);
      setSuccess("Usuario encontrado. Ahora verifica tu identidad.");
      
      setTimeout(() => {
        setStep(2);
        setSuccess("");
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.message || "Usuario no encontrado. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar palabra secreta
  const handleVerificarPalabraSecreta = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!palabraSecreta.trim()) {
      setError("Por favor ingresa tu palabra secreta");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/usuarios/verificar-palabra-secreta`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: usuarioEncontrado.username,
            palabraSecreta: palabraSecreta
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Palabra secreta incorrecta");
      }

      setSuccess("Palabra secreta correcta. Ahora puedes cambiar tu contraseña.");
      
      setTimeout(() => {
        setStep(3);
        setSuccess("");
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.message || "Palabra secreta incorrecta");
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: Actualizar contraseña
  const handleActualizarPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!nuevaPassword || !confirmarPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (nuevaPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!regex.test(nuevaPassword)) {
      setError("La contraseña debe incluir letras y números");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/usuarios/actualizar-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: usuarioEncontrado.username,
            nuevaPassword: nuevaPassword
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar la contraseña");
      }

      setSuccess("¡Contraseña actualizada exitosamente! Redirigiendo al login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (err) {
      console.error(err);
      setError(err.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='recuperar-page'>
      <div className='recuperar-wrapper'>
        
        {/* Paso 1: Buscar usuario */}
        {step === 1 && (
          <form onSubmit={handleBuscarUsuario}>
            <h1>Recuperar Contraseña</h1>
            <p className="subtitle">Paso 1: Identifica tu cuenta</p>

            <div className='input-box'>
              <input
                type="text"
                placeholder='Username o correo electrónico'
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
                required
              />
              <FaUser className='icon'/>
            </div>

            <button type='submit' disabled={loading} className={loading ? 'loading' : ''}>
              {loading ? 'Buscando...' : 'Buscar cuenta'}
            </button>

            {error && <p className="error">⚠️ {error}</p>}
            {success && <p className="success">✓ {success}</p>}

            <div className="back-link">
              <p><a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>← Volver al login</a></p>
            </div>
          </form>
        )}

        {/* Paso 2: Verificar palabra secreta */}
        {step === 2 && (
          <form onSubmit={handleVerificarPalabraSecreta}>
            <h1>Verificación de Identidad</h1>
            <p className="subtitle">Paso 2: Ingresa tu palabra secreta</p>

            <div className="user-info">
              <p>Usuario: <strong>{usuarioEncontrado?.username}</strong></p>
            </div>

            <div className='input-box'>
              <input
                type="text"
                placeholder='Palabra secreta'
                value={palabraSecreta}
                onChange={(e) => setPalabraSecreta(e.target.value)}
                disabled={loading}
                required
              />
              <FaKey className='icon'/>
            </div>

            <button type='submit' disabled={loading} className={loading ? 'loading' : ''}>
              {loading ? 'Verificando...' : 'Verificar'}
            </button>

            {error && <p className="error">⚠️ {error}</p>}
            {success && <p className="success">✓ {success}</p>}

            <div className="back-link">
              <p><a href="#" onClick={(e) => { e.preventDefault(); setStep(1); setError(""); }}>← Volver atrás</a></p>
            </div>
          </form>
        )}

        {/* Paso 3: Nueva contraseña */}
        {step === 3 && (
          <form onSubmit={handleActualizarPassword}>
            <h1>Nueva Contraseña</h1>
            <p className="subtitle">Paso 3: Crea tu nueva contraseña</p>

            <div className="user-info">
              <p>Usuario: <strong>{usuarioEncontrado?.username}</strong></p>
            </div>

            <div className='input-box'>
              <input
                type={showPassword ? "text" : "password"}
                placeholder='Nueva contraseña (mín. 8 caracteres)'
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                disabled={loading}
                required
              />
              <FaLock className='icon' />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className='input-box'>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder='Confirmar nueva contraseña'
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                disabled={loading}
                required
              />
              <FaLock className='icon' />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button type='submit' disabled={loading} className={loading ? 'loading' : ''}>
              {loading ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>

            {error && <p className="error">⚠️ {error}</p>}
            {success && <p className="success">✓ {success}</p>}
          </form>
        )}

      </div>
    </div>
  );
};

export default RecuperarPassword;