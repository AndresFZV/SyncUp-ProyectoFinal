package com.uniquindio.edu.co.SyncUp.controller;
import com.uniquindio.edu.co.SyncUp.dto.BusquedaAvanzadaDTO;
import com.uniquindio.edu.co.SyncUp.dto.ResultadoBusquedaAvanzadaDTO;
import com.uniquindio.edu.co.SyncUp.services.BusquedaAvanzadaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para gestionar las operaciones de búsqueda avanzada.
 * Proporciona endpoints para búsquedas con múltiples criterios y autocompletado.
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
     * Realiza una búsqueda avanzada con múltiples criterios.
     * Implementa funcionalidades de autocompletado y búsqueda concurrente.
     *
     * @param criterios DTO con los criterios de búsqueda avanzada
     * @return ResponseEntity con los resultados de la búsqueda o error en caso de fallo
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