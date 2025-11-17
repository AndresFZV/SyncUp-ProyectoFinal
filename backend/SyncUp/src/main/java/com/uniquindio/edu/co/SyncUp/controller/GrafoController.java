package com.uniquindio.edu.co.SyncUp.controller;

import com.uniquindio.edu.co.SyncUp.dto.CancionDTO;
import com.uniquindio.edu.co.SyncUp.services.GrafoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestionar las operaciones del grafo de similitud entre canciones.
 * Proporciona endpoints para reconstrucción del grafo, búsqueda de canciones similares y rutas.
 */
@RestController
@RequestMapping("/api/grafo")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GrafoController {

    private final GrafoService grafoService;

    /**
     * Reconstruye el grafo de similitud entre canciones.
     * Útil después de agregar o eliminar canciones del sistema.
     *
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @PostMapping("/reconstruir")
    public ResponseEntity<?> reconstruirGrafo() {
        try {
            grafoService.reconstruirGrafo();
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Grafo reconstruido exitosamente"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", true,
                    "mensaje", e.getMessage()
            ));
        }
    }

    /**
     * Obtiene canciones similares a una canción específica basado en el grafo de similitud.
     *
     * @param cancionId ID de la canción de referencia
     * @param limite Número máximo de canciones similares a retornar (por defecto 10)
     * @return ResponseEntity con la lista de canciones similares o error en caso de fallo
     */
    @GetMapping("/similares/{cancionId}")
    public ResponseEntity<?> obtenerCancionesSimilares(
            @PathVariable String cancionId,
            @RequestParam(defaultValue = "10") int limite) {
        try {
            List<CancionDTO> similares = grafoService.obtenerCancionesSimilares(cancionId, limite);
            return ResponseEntity.ok(similares);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", true,
                    "mensaje", e.getMessage()
            ));
        }
    }

    /**
     * Encuentra la ruta de máxima similitud entre dos canciones usando el algoritmo de Dijkstra.
     *
     * @param origen ID de la canción de origen
     * @param destino ID de la canción de destino
     * @return ResponseEntity con la ruta encontrada o error en caso de fallo
     */
    @GetMapping("/ruta")
    public ResponseEntity<?> encontrarRuta(
            @RequestParam String origen,
            @RequestParam String destino) {
        try {
            Map<String, Object> resultado = grafoService.encontrarRutaSimilitud(origen, destino);
            return ResponseEntity.ok(resultado);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", "Error interno del servidor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Obtiene estadísticas del grafo actual.
     *
     * @return ResponseEntity con las estadísticas del grafo o error en caso de fallo
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            return ResponseEntity.ok(grafoService.obtenerEstadisticas());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", true,
                    "mensaje", e.getMessage()
            ));
        }
    }
}