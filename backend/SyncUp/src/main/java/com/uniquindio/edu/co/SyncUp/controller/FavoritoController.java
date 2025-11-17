package com.uniquindio.edu.co.SyncUp.controller;

import com.uniquindio.edu.co.SyncUp.dto.AlbumDTO;
import com.uniquindio.edu.co.SyncUp.dto.ArtistaDTO;
import com.uniquindio.edu.co.SyncUp.services.FavoritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestionar las operaciones de favoritos.
 * Proporciona endpoints para manejar artistas y álbumes favoritos de los usuarios.
 */
@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FavoritoController {

    private final FavoritoService favoritoService;

    /**
     * Obtiene la lista de artistas favoritos de un usuario.
     *
     * @param username Nombre de usuario del cual obtener los artistas favoritos
     * @return ResponseEntity con la lista de artistas favoritos o error en caso de fallo
     */
    @GetMapping("/artistas/{username}")
    public ResponseEntity<?> obtenerArtistasFavoritos(@PathVariable String username) {
        try {
            List<ArtistaDTO> artistas = favoritoService.obtenerArtistasFavoritos(username);
            return ResponseEntity.ok(artistas);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Obtiene la lista de álbumes favoritos de un usuario.
     *
     * @param username Nombre de usuario del cual obtener los álbumes favoritos
     * @return ResponseEntity con la lista de álbumes favoritos o error en caso de fallo
     */
    @GetMapping("/albumes/{username}")
    public ResponseEntity<?> obtenerAlbumesFavoritos(@PathVariable String username) {
        try {
            List<AlbumDTO> albumes = favoritoService.obtenerAlbumesFavoritos(username);
            return ResponseEntity.ok(albumes);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Verifica si un artista está marcado como favorito por un usuario.
     *
     * @param username Nombre de usuario a verificar
     * @param artistaId ID del artista a verificar
     * @return ResponseEntity con el resultado de la verificación o error en caso de fallo
     */
    @GetMapping("/artistas/{username}/{artistaId}/check")
    public ResponseEntity<?> verificarArtistaFavorito(
            @PathVariable String username,
            @PathVariable String artistaId) {
        try {
            boolean esFavorito = favoritoService.esArtistaFavorito(username, artistaId);
            Map<String, Object> response = new HashMap<>();
            response.put("esFavorito", esFavorito);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Verifica si un álbum está marcado como favorito por un usuario.
     *
     * @param username Nombre de usuario a verificar
     * @param albumId ID del álbum a verificar
     * @return ResponseEntity con el resultado de la verificación o error en caso de fallo
     */
    @GetMapping("/albumes/{username}/{albumId}/check")
    public ResponseEntity<?> verificarAlbumFavorito(
            @PathVariable String username,
            @PathVariable String albumId) {
        try {
            boolean esFavorito = favoritoService.esAlbumFavorito(username, albumId);
            Map<String, Object> response = new HashMap<>();
            response.put("esFavorito", esFavorito);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Agrega un artista a la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario al cual agregar el artista favorito
     * @param artistaId ID del artista a agregar a favoritos
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @PostMapping("/artistas/{username}/{artistaId}")
    public ResponseEntity<?> agregarArtistaFavorito(
            @PathVariable String username,
            @PathVariable String artistaId) {
        try {
            favoritoService.agregarArtistaFavorito(username, artistaId);
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Artista agregado a favoritos");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Agrega un álbum a la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario al cual agregar el álbum favorito
     * @param albumId ID del álbum a agregar a favoritos
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @PostMapping("/albumes/{username}/{albumId}")
    public ResponseEntity<?> agregarAlbumFavorito(
            @PathVariable String username,
            @PathVariable String albumId) {
        try {
            favoritoService.agregarAlbumFavorito(username, albumId);
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Álbum agregado a favoritos");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Elimina un artista de la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario del cual eliminar el artista favorito
     * @param artistaId ID del artista a eliminar de favoritos
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @DeleteMapping("/artistas/{username}/{artistaId}")
    public ResponseEntity<?> eliminarArtistaFavorito(
            @PathVariable String username,
            @PathVariable String artistaId) {
        try {
            favoritoService.eliminarArtistaFavorito(username, artistaId);
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Artista eliminado de favoritos");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Elimina un álbum de la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario del cual eliminar el álbum favorito
     * @param albumId ID del álbum a eliminar de favoritos
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @DeleteMapping("/albumes/{username}/{albumId}")
    public ResponseEntity<?> eliminarAlbumFavorito(
            @PathVariable String username,
            @PathVariable String albumId) {
        try {
            favoritoService.eliminarAlbumFavorito(username, albumId);
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Álbum eliminado de favoritos");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}