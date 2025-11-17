package com.uniquindio.edu.co.SyncUp.controller;

import com.uniquindio.edu.co.SyncUp.dto.CancionDTO;
import com.uniquindio.edu.co.SyncUp.services.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestionar las operaciones de playlists y recomendaciones.
 * Proporciona endpoints para generación de playlists personalizadas y recomendaciones de contenido.
 */
@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlaylistController {

    private final PlaylistService playlistService;

    /**
     * Genera una playlist de descubrimiento semanal personalizada para un usuario.
     *
     * @param username Nombre de usuario para el cual generar el descubrimiento semanal
     * @return ResponseEntity con la lista de canciones del descubrimiento semanal o error en caso de fallo
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
     * Obtiene mixes personalizados organizados por género favorito del usuario.
     *
     * @param username Nombre de usuario para el cual obtener los mixes por género
     * @return ResponseEntity con los mixes organizados por género o error en caso de fallo
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
     * Obtiene las canciones escuchadas recientemente por un usuario.
     *
     * @param username Nombre de usuario del cual obtener las canciones recientes
     * @return ResponseEntity con la lista de canciones recientes o error en caso de fallo
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
     * Obtiene canciones recomendadas basadas en las preferencias y favoritos del usuario.
     *
     * @param username Nombre de usuario para el cual obtener recomendaciones
     * @return ResponseEntity con la lista de canciones recomendadas o error en caso de fallo
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
     * Obtiene los artistas más escuchados por un usuario.
     *
     * @param username Nombre de usuario del cual obtener los artistas populares
     * @return ResponseEntity con la lista de artistas populares o error en caso de fallo
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
     * Obtiene los álbumes favoritos de un usuario.
     *
     * @param username Nombre de usuario del cual obtener los álbumes favoritos
     * @return ResponseEntity con la lista de álbumes favoritos o error en caso de fallo
     */
    @GetMapping("/favorite-albums/{username}")
    public ResponseEntity<?> obtenerAlbumesFavoritos(@PathVariable String username) {
        try {
            return ResponseEntity.ok(List.of());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtiene múltiples tipos de recomendaciones en una sola respuesta.
     *
     * @param username Nombre de usuario para el cual obtener las recomendaciones múltiples
     * @return ResponseEntity con diferentes tipos de recomendaciones o error en caso de fallo
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