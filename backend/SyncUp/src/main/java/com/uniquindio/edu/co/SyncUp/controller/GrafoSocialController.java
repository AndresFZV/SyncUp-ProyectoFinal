package com.uniquindio.edu.co.SyncUp.controller;

import com.uniquindio.edu.co.SyncUp.services.GrafoSocialService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para el grafo social de usuarios.
 * Proporciona endpoints para sugerencias de usuarios, conexiones sociales y recorridos en el grafo.
 */
@Slf4j
@RestController
@RequestMapping("/api/grafo-social")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GrafoSocialController {

    private final GrafoSocialService grafoSocialService;

    /**
     * Obtiene sugerencias de usuarios para seguir basadas en conexiones sociales.
     *
     * @param username Nombre de usuario para el cual obtener sugerencias
     * @param limite Número máximo de sugerencias a retornar (por defecto 10)
     * @return ResponseEntity con la lista de sugerencias o error en caso de fallo
     */
    @GetMapping("/sugerencias/{username}")
    public ResponseEntity<?> obtenerSugerencias(
            @PathVariable String username,
            @RequestParam(defaultValue = "10") int limite) {
        try {
            log.info("Solicitud de sugerencias para: {}", username);
            List<Map<String, Object>> sugerencias =
                    grafoSocialService.obtenerSugerencias(username, limite);
            Map<String, Object> response = new HashMap<>();
            response.put("sugerencias", sugerencias);
            response.put("total", sugerencias.size());
            response.put("usuario", username);
            response.put("algoritmo", "BFS + Scoring");
            log.info("Devueltas {} sugerencias", sugerencias.size());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al obtener sugerencias: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Obtiene información de conexiones sociales de un usuario.
     *
     * @param username Nombre de usuario del cual obtener las conexiones
     * @return ResponseEntity con la información de conexiones o error en caso de fallo
     */
    @GetMapping("/conexiones/{username}")
    public ResponseEntity<?> obtenerConexiones(@PathVariable String username) {
        try {
            log.info("Solicitud de conexiones para: {}", username);
            Map<String, Object> conexiones =
                    grafoSocialService.obtenerInformacionConexiones(username);
            return ResponseEntity.ok(conexiones);
        } catch (RuntimeException e) {
            log.error("Error al obtener conexiones: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Encuentra el camino más corto entre dos usuarios usando BFS.
     *
     * @param origen Nombre de usuario de origen
     * @param destino Nombre de usuario de destino
     * @return ResponseEntity con el camino encontrado o error en caso de fallo
     */
    @GetMapping("/camino/{origen}/{destino}")
    public ResponseEntity<?> encontrarCamino(
            @PathVariable String origen,
            @PathVariable String destino) {
        try {
            log.info("Buscando camino: {} → {}", origen, destino);
            Map<String, Object> camino =
                    grafoSocialService.encontrarCamino(origen, destino);
            return ResponseEntity.ok(camino);
        } catch (RuntimeException e) {
            log.error("Error al buscar camino: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Obtiene estadísticas generales del grafo social.
     *
     * @return ResponseEntity con las estadísticas del grafo o error en caso de fallo
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            log.info("Solicitud de estadísticas del grafo");
            Map<String, Object> estadisticas =
                    grafoSocialService.obtenerEstadisticas();
            return ResponseEntity.ok(estadisticas);
        } catch (RuntimeException e) {
            log.error("Error al obtener estadísticas: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    /**
     * Reconstruye el grafo social manualmente.
     *
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @PostMapping("/reconstruir")
    public ResponseEntity<?> reconstruirGrafo() {
        try {
            log.info("Solicitud de reconstrucción del grafo");
            grafoSocialService.reconstruirGrafo();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Grafo reconstruido exitosamente");
            response.put("estadisticas", grafoSocialService.obtenerEstadisticas());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al reconstruir grafo: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    /**
     * Obtiene la estructura completa del grafo para visualización.
     *
     * @param username Nombre de usuario central para la estructura
     * @param profundidad Profundidad máxima de conexiones a mostrar (por defecto 2)
     * @return ResponseEntity con la estructura del grafo o error en caso de fallo
     */
    @GetMapping("/estructura/{username}")
    public ResponseEntity<?> obtenerEstructuraGrafo(
            @PathVariable String username,
            @RequestParam(defaultValue = "2") int profundidad) {
        try {
            log.info("Solicitud de estructura del grafo para: {}", username);
            Map<String, Object> estructura =
                    grafoSocialService.obtenerEstructuraGrafo(username, profundidad);
            return ResponseEntity.ok(estructura);
        } catch (RuntimeException e) {
            log.error("Error al obtener estructura del grafo: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}