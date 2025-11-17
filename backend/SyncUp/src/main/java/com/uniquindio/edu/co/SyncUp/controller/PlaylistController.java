package com.uniquindio.edu.co.SyncUp.controller;

import com.uniquindio.edu.co.SyncUp.dto.CancionDTO;
import com.uniquindio.edu.co.SyncUp.services.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlaylistController {

    private final PlaylistService playlistService;

    /**
     * Generar "Descubrimiento Semanal" para un usuario
     * GET /api/playlists/weekly-discovery/{username}
     */
    @GetMapping("/weekly-discovery/{username}")
    public ResponseEntity<?> generarDescubrimientoSemanal(@PathVariable String username) {
        try {
            List<CancionDTO> descubrimiento = playlistService.generarDescubrimientoSemanal(username);
            return ResponseEntity.ok(descubrimiento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener mix personalizado por género favorito
     * GET /api/playlists/genre-mix/{username}
     */
    @GetMapping("/genre-mix/{username}")
    public ResponseEntity<?> obtenerMixPorGenero(@PathVariable String username) {
        try {
            Map<String, List<CancionDTO>> mixes = playlistService.obtenerMixesPorGenero(username);
            return ResponseEntity.ok(mixes);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener canciones escuchadas recientemente
     * GET /api/playlists/recently-played/{username}
     */
    @GetMapping("/recently-played/{username}")
    public ResponseEntity<?> obtenerRecientes(@PathVariable String username) {
        try {
            List<CancionDTO> recientes = playlistService.obtenerCancionesRecientes(username, 10);
            return ResponseEntity.ok(recientes);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener canciones recomendadas basadas en favoritas
     * GET /api/playlists/recommendations/{username}
     */
    @GetMapping("/recommendations/{username}")
    public ResponseEntity<?> obtenerRecomendaciones(@PathVariable String username) {
        try {
            List<CancionDTO> recomendaciones = playlistService.obtenerRecomendaciones(username, 20);
            return ResponseEntity.ok(recomendaciones);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener artistas más escuchados del usuario
     * GET /api/playlists/top-artists/{username}
     */
    @GetMapping("/top-artists/{username}")
    public ResponseEntity<?> obtenerArtistasPopulares(@PathVariable String username) {
        try {
            List<Map<String, Object>> artistas = playlistService.obtenerArtistasPopulares(username, 6);
            return ResponseEntity.ok(artistas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

        /**
         * Obtener álbumes favoritos del usuario
         * GET /api/playlists/favorite-albums/{username}
         */
        @GetMapping("/favorite-albums/{username}")
        public ResponseEntity<?> obtenerAlbumesFavoritos(@PathVariable String username) {
            try {
                // Por ahora retornar lista vacía o implementar lógica
                return ResponseEntity.ok(List.of());
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", e.getMessage()));
            }
        }


        /**
         * Obtener múltiples recomendaciones
         * GET /api/playlists/multiple-recommendations/{username}
         */
        @GetMapping("/multiple-recommendations/{username}")
        public ResponseEntity<?> obtenerMultiplesRecomendaciones(@PathVariable String username) {
            try {
                Map<String, Object> recomendaciones = Map.of(
                        "canciones", playlistService.obtenerRecomendaciones(username, 20),
                        "artistas", playlistService.obtenerArtistasPopulares(username, 6),
                        "descubrimiento", playlistService.generarDescubrimientoSemanal(username)
                );
                return ResponseEntity.ok(recomendaciones);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", e.getMessage()));
            }
        }
}