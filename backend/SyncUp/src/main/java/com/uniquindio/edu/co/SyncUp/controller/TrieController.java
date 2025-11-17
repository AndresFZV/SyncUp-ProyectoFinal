package com.uniquindio.edu.co.SyncUp.controller;

import com.uniquindio.edu.co.SyncUp.dto.ResultadoBusquedaDTO;
import com.uniquindio.edu.co.SyncUp.services.TrieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestionar las operaciones de búsqueda usando la estructura Trie.
 * Proporciona endpoints para búsqueda por prefijo, sugerencias y gestión del Trie.
 */
@RestController
@RequestMapping("/api/trie")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrieController {

    private final TrieService trieService;

    /**
     * Realiza una búsqueda por prefijo en la estructura Trie.
     *
     * @param prefijo Prefijo a buscar en los términos indexados
     * @param limite Número máximo de resultados a retornar (por defecto 10)
     * @return ResponseEntity con los resultados de búsqueda o error en caso de fallo
     */
    @GetMapping("/buscar")
    public ResponseEntity<ResultadoBusquedaDTO> buscarPorPrefijo(
            @RequestParam(name = "q") String prefijo,
            @RequestParam(defaultValue = "10") int limite) {

        try {
            ResultadoBusquedaDTO resultado = trieService.buscarPorPrefijo(prefijo, limite);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Obtiene sugerencias de palabras basadas en un prefijo.
     *
     * @param prefijo Prefijo para generar sugerencias
     * @param limite Número máximo de sugerencias a retornar (por defecto 5)
     * @return ResponseEntity con la lista de sugerencias o error en caso de fallo
     */
    @GetMapping("/sugerencias")
    public ResponseEntity<List<String>> obtenerSugerencias(
            @RequestParam(name = "q") String prefijo,
            @RequestParam(defaultValue = "5") int limite) {

        try {
            List<String> sugerencias = trieService.obtenerSugerencias(prefijo, limite);
            return ResponseEntity.ok(sugerencias);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Verifica si una palabra específica existe en el Trie.
     *
     * @param palabra Palabra a verificar en el Trie
     * @return ResponseEntity con el resultado de la verificación o error en caso de fallo
     */
    @GetMapping("/existe")
    public ResponseEntity<Map<String, Boolean>> existe(@RequestParam String palabra) {
        try {
            boolean existe = trieService.existe(palabra);
            return ResponseEntity.ok(Map.of("existe", existe));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Reconstruye la estructura Trie desde la base de datos.
     *
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @PostMapping("/reconstruir")
    public ResponseEntity<Map<String, String>> reconstruirTrie() {
        try {
            trieService.reconstruirTrie();
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Trie reconstruido exitosamente"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Obtiene estadísticas de la estructura Trie actual.
     *
     * @return ResponseEntity con las estadísticas del Trie o error en caso de fallo
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        try {
            Map<String, Object> stats = trieService.obtenerEstadisticas();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}