import React, { useState } from 'react';
import './Login.css';
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!loginData.username || !loginData.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/usuarios/login?username=${loginData.username}&password=${loginData.password}`,
        { method: "POST" }
      );

      if (!response.ok) throw new Error("Usuario o contraseña incorrectos");

      const data = await response.json();
      console.log("Login exitoso:", data);
      console.log("¿Es admin?", data.rol === 'ADMIN' || data.esAdmin === true);

      setSuccess("¡Inicio de sesión exitoso!");
      
      // Verificar si es admin
      if (data.rol === 'ADMIN' || data.esAdmin === true || data.username === 'admin') {
        console.log("Redirigiendo a panel admin...");
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        console.log("Redirigiendo a home...");
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
      
      setLoginData({ username: "", password: "" });
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-page'>
      <div className='Wrapper'>
        <form onSubmit={handleLogin}>
          <h1>Inicio de sesión</h1>

          <div className='input-box'>
            <input
              type="text"
              placeholder='Usuario'
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              disabled={loading}
              required
            />
            <FaUser className='icon'/>
          </div>

          <div className='input-box'>
            <input
              type={showPassword ? "text" : "password"}
              placeholder='Contraseña'
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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

          <div className="remember-forgot">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/recuperar-password"); }}>¿Olvidaste la contraseña?</a>
          </div>

          <button type='submit' disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </button>

          {error && <p className="error">⚠️ {error}</p>}
          {success && <p className="success">✓ {success}</p>}

          <div className="register-link">
            <p>¿No tienes una cuenta? <a href="#" onClick={(e) => { e.preventDefault(); navigate("/registro"); }}>Regístrate</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;