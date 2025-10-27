import React, { useState } from 'react';
import './Registro.css';
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaIdCard, FaCalendarAlt, FaKey } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Registro = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    correo: "",
    edad: "",
    palabraSecreta: ""
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones
  const validateUsername = (username) => {
    return username.length >= 4;
  };

  const validatePassword = (password) => {
    // Mínimo 8 caracteres, al menos una letra y un número
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateEdad = (edad) => {
    const num = parseInt(edad);
    return num >= 13 && num <= 120;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "El username es requerido";
    } else if (!validateUsername(formData.username)) {
      newErrors.username = "El username debe tener al menos 4 caracteres";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Mínimo 8 caracteres, debe incluir letras y números";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.nombre) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.correo) {
      newErrors.correo = "El correo es requerido";
    } else if (!validateEmail(formData.correo)) {
      newErrors.correo = "Ingresa un correo válido";
    }

    if (!formData.edad) {
      newErrors.edad = "La edad es requerida";
    } else if (!validateEdad(formData.edad)) {
      newErrors.edad = "Debes tener entre 13 y 120 años";
    }

    if (!formData.palabraSecreta) {
      newErrors.palabraSecreta = "La palabra secreta es requerida";
    } else if (formData.palabraSecreta.length < 3) {
      newErrors.palabraSecreta = "Mínimo 3 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setError("Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/usuarios/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          nombre: formData.nombre,
          correo: formData.correo,
          edad: parseInt(formData.edad),
          palabraSecreta: formData.palabraSecreta
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Error al registrar usuario");
      }

      setSuccess("¡Registro exitoso! Redirigiendo al login...");
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        nombre: "",
        correo: "",
        edad: "",
        palabraSecreta: ""
      });

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='registro-page'>
      <div className='registro-wrapper'>
        <form onSubmit={handleSubmit}>
          <h1>Registro</h1>
          <p className="subtitle">Únete a la comunidad SyncUp</p>

          <div className='input-box'>
            <input
              type="text"
              name="username"
              placeholder='Username (único)'
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className={errors.username ? 'input-error' : ''}
            />
            <FaUser className='icon'/>
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className='input-box'>
            <input
              type="text"
              name="nombre"
              placeholder='Nombre completo'
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
              className={errors.nombre ? 'input-error' : ''}
            />
            <FaIdCard className='icon'/>
            {errors.nombre && <span className="field-error">{errors.nombre}</span>}
          </div>

          <div className='input-box'>
            <input
              type="email"
              name="correo"
              placeholder='Correo electrónico'
              value={formData.correo}
              onChange={handleChange}
              disabled={loading}
              className={errors.correo ? 'input-error' : ''}
            />
            <FaEnvelope className='icon'/>
            {errors.correo && <span className="field-error">{errors.correo}</span>}
          </div>

          <div className='input-box'>
            <input
              type="number"
              name="edad"
              placeholder='Edad'
              value={formData.edad}
              onChange={handleChange}
              disabled={loading}
              min="13"
              max="120"
              className={errors.edad ? 'input-error' : ''}
            />
            <FaCalendarAlt className='icon'/>
            {errors.edad && <span className="field-error">{errors.edad}</span>}
          </div>

          <div className='input-box'>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder='Contraseña (mín. 8 caracteres)'
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className={errors.password ? 'input-error' : ''}
            />
            <FaLock className='icon' />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className='input-box'>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder='Confirmar contraseña'
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              className={errors.confirmPassword ? 'input-error' : ''}
            />
            <FaLock className='icon' />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <div className='input-box'>
            <input
              type="text"
              name="palabraSecreta"
              placeholder='Palabra secreta (recuperación)'
              value={formData.palabraSecreta}
              onChange={handleChange}
              disabled={loading}
              className={errors.palabraSecreta ? 'input-error' : ''}
            />
            <FaKey className='icon'/>
            {errors.palabraSecreta && <span className="field-error">{errors.palabraSecreta}</span>}
          </div>

          <button type='submit' disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>

          {error && <p className="error">⚠️ {error}</p>}
          {success && <p className="success">✓ {success}</p>}

          <div className="login-link">
            <p>¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Inicia sesión</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;