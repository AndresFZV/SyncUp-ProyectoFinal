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

@RestController
@RequestMapping("/api/grafo")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GrafoController {

    private final GrafoService grafoService;

    /**
     * Reconstruir el grafo (útil después de agregar/eliminar canciones)
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
     * Obtener canciones similares
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
     * Encontrar ruta de máxima similitud (Dijkstra)
     */
    @GetMapping("/ruta")
    public ResponseEntity<?> encontrarRuta(
            @RequestParam String origen,
            @RequestParam String destino) {
        try {
            System.out.println("\n════════════════════════════════════════");
            System.out.println("📥 REQUEST RECIBIDO EN CONTROLLER");
            System.out.println("   Origen: " + origen);
            System.out.println("   Destino: " + destino);
            System.out.println("════════════════════════════════════════");

            Map<String, Object> resultado = grafoService.encontrarRutaSimilitud(origen, destino);

            System.out.println("✅ Respuesta enviada al frontend");
            System.out.println("════════════════════════════════════════\n");

            return ResponseEntity.ok(resultado);

        } catch (RuntimeException e) {
            System.err.println("❌ ERROR EN CONTROLLER: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            System.err.println("❌ ERROR INESPERADO EN CONTROLLER: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", "Error interno del servidor: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Obtener estadísticas del grafo
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