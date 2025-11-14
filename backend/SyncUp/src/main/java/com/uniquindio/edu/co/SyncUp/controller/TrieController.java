package com.uniquindio.edu.co.SyncUp.controller;

import com.uniquindio.edu.co.SyncUp.dto.ResultadoBusquedaDTO;
import com.uniquindio.edu.co.SyncUp.services.TrieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * RF-025 y RF-026: API REST para búsquedas con Trie
 */
@RestController
@RequestMapping("/api/trie")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrieController {

    private final TrieService trieService;

    /**
     * RF-026: Buscar por prefijo
     * GET /api/trie/buscar?q=frank&limite=10
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
     * Obtener solo sugerencias de palabras
     * GET /api/trie/sugerencias?q=frank&limite=5
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
     * Verificar si una palabra existe
     * GET /api/trie/existe?palabra=frank
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
     * Reconstruir el Trie
     * POST /api/trie/reconstruir
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
     * Obtener estadísticas del Trie
     * GET /api/trie/estadisticas
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