// src/services/usuarioService.js
export const registrarUsuario = async (usuario) => {
  try {
    const response = await fetch("http://localhost:8080/api/usuarios/registro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
    });
    return await response.json();
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error;
  }
};

export const loginUsuario = async (username, password) => {
  try {
    const response = await fetch(`http://localhost:8080/api/usuarios/login?username=${username}&password=${password}`, {
      method: "POST"
    });
    return await response.json();
  } catch (error) {
    console.error("Error al hacer login:", error);
    throw error;
  }
};
