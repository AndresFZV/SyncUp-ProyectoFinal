package com.uniquindio.edu.co.SyncUp.services;

import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.document.Usuario;
import com.uniquindio.edu.co.SyncUp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public Usuario registrarUsuario(Usuario usuario) {
        if (usuarioRepository.existsById(usuario.getUsername())) {
            throw new RuntimeException("El username ya existe");
        }
        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }
        return usuarioRepository.save(usuario);
    }

    public Usuario login(String username, String password) {
        return usuarioRepository.findByUsernameAndPassword(username, password)
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));
    }

    public Usuario actualizarPerfil(String username, String nombre, String correo, String password) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (nombre != null) usuario.setNombre(nombre);
        if (correo != null) usuario.setCorreo(correo);
        if (password != null) usuario.setPassword(password);

        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(String username) {
        if (!usuarioRepository.existsById(username)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(username);
    }

    public Usuario agregarCancionFavorita(String username, Cancion cancion) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.getListaFavoritos().add(cancion);
        return usuarioRepository.save(usuario);
    }

    public Usuario agregarArtistaFavorito(String username, Artista artista) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.getArtistasFavoritos().add(artista);
        return usuarioRepository.save(usuario);
    }

    // 🔹 Versión original del método seguirUsuario (sin DBRef)
    public Usuario seguirUsuario(String username, Usuario aSeguir) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.getSiguiendo().add(aSeguir);
        aSeguir.getSeguidores().add(usuario);

        usuarioRepository.save(aSeguir); // actualizar usuario seguido
        return usuarioRepository.save(usuario);
    }

    public Usuario dejarDeSeguirUsuario(String username, Usuario aDejar) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.getSiguiendo().remove(aDejar);
        aDejar.getSeguidores().remove(usuario);

        usuarioRepository.save(aDejar);
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarIdentificador(String identificador) {
        Optional<Usuario> usuario = usuarioRepository.findByUsername(identificador);
        if (usuario.isEmpty()) {
            usuario = usuarioRepository.findByCorreo(identificador);
        }
        return usuario.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public boolean verificarPalabraSecreta(String username, String palabraSecreta) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return usuario.getPalabraSecreta().equals(palabraSecreta);
    }

    public Usuario actualizarPassword(String username, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setPassword(nuevaPassword);
        return usuarioRepository.save(usuario);
    }
}
