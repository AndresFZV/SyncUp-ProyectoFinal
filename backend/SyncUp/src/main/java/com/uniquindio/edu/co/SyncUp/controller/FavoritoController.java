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

@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FavoritoController {

    private final FavoritoService favoritoService;

    // ========== OBTENER FAVORITOS ==========

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

    // ========== VERIFICAR SI ES FAVORITO ==========

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

    // ========== AGREGAR A FAVORITOS ==========

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

    // ========== ELIMINAR DE FAVORITOS ==========

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