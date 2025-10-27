package com.uniquindio.edu.co.SyncUp.controller;

import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.document.Usuario;
import com.uniquindio.edu.co.SyncUp.services.AdminService;
import com.uniquindio.edu.co.SyncUp.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AdminService adminService;

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String password) {
        try {
            return ResponseEntity.ok(usuarioService.login(username, password));
        } catch (RuntimeException e) {
            try {
                return ResponseEntity.ok(adminService.login(username, password));
            } catch (RuntimeException ex) {
                throw new RuntimeException("Credenciales incorrectas");
            }
        }
    }

    @PutMapping("/{username}")
    public ResponseEntity<?> actualizarPerfil(
            @PathVariable String username,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String correo,
            @RequestParam(required = false) String password) {
        return ResponseEntity.ok(usuarioService.actualizarPerfil(username, nombre, correo, password));
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable String username) {
        try {
            usuarioService.eliminarUsuario(username);
            return ResponseEntity.ok("Usuario eliminado exitosamente");
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PostMapping("/{username}/favoritos/canciones")
    public ResponseEntity<?> agregarCancionFavorita(@PathVariable String username, @RequestBody Cancion cancion) {
        return ResponseEntity.ok(usuarioService.agregarCancionFavorita(username, cancion));
    }

    @PostMapping("/{username}/favoritos/artistas")
    public ResponseEntity<?> agregarArtistaFavorito(@PathVariable String username, @RequestBody Artista artista) {
        return ResponseEntity.ok(usuarioService.agregarArtistaFavorito(username, artista));
    }

    @PostMapping("/{username}/seguir")
    public ResponseEntity<?> seguirUsuario(@PathVariable String username, @RequestBody Usuario aSeguir) {
        return ResponseEntity.ok(usuarioService.seguirUsuario(username, aSeguir));
    }

    @PostMapping("/{username}/dejar-seguir")
    public ResponseEntity<?> dejarDeSeguirUsuario(@PathVariable String username, @RequestBody Usuario aDejar) {
        return ResponseEntity.ok(usuarioService.dejarDeSeguirUsuario(username, aDejar));
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscarUsuario(@RequestParam String identificador) {
        try {
            Usuario usuario = usuarioService.buscarIdentificador(identificador);
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("username", usuario.getUsername());
            respuesta.put("correo", usuario.getCorreo());
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/verificar-palabra-secreta")
    public ResponseEntity<?> verificarPalabraSecreta(@RequestBody Map<String, String> datos) {
        try {
            String username = datos.get("username");
            String palabraSecreta = datos.get("palabraSecreta");
            boolean esValida = usuarioService.verificarPalabraSecreta(username, palabraSecreta);
            if (esValida) {
                return ResponseEntity.ok("Palabra secreta correcta");
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Palabra secreta incorrecta");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/actualizar-password")
    public ResponseEntity<?> actualizarPassword(@RequestBody Map<String, String> datos) {
        try {
            String username = datos.get("username");
            String nuevaPassword = datos.get("nuevaPassword");
            usuarioService.actualizarPassword(username, nuevaPassword);
            return ResponseEntity.ok("Contraseña actualizada exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
