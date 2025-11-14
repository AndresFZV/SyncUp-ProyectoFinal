package com.uniquindio.edu.co.SyncUp.controller;

import com.uniquindio.edu.co.SyncUp.dto.BusquedaAvanzadaDTO;
import com.uniquindio.edu.co.SyncUp.dto.ResultadoBusquedaAvanzadaDTO;
import com.uniquindio.edu.co.SyncUp.services.BusquedaAvanzadaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * RF-003, RF-004, RF-030: API para búsquedas avanzadas
 */
@RestController
@RequestMapping("/api/busqueda")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BusquedaController {

    private final BusquedaAvanzadaService busquedaAvanzadaService;

    /**
     * RF-003: Autocompletado
     * RF-004: Búsqueda avanzada con múltiples atributos
     * RF-030: Implementado con concurrencia
     *
     * POST /api/busqueda/avanzada
     * Body: BusquedaAvanzadaDTO
     */
    @PostMapping("/avanzada")
    public ResponseEntity<ResultadoBusquedaAvanzadaDTO> busquedaAvanzada(
            @RequestBody BusquedaAvanzadaDTO criterios) {

        try {
            ResultadoBusquedaAvanzadaDTO resultado =
                    busquedaAvanzadaService.busquedaAvanzada(criterios);

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}