package com.uniquindio.edu.co.SyncUp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.dto.CancionDTO;
import com.uniquindio.edu.co.SyncUp.dto.SolicitudCancion;
import com.uniquindio.edu.co.SyncUp.services.CancionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/canciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CancionController {

    private final CancionService cancionService;

    // Listar todas las canciones
    @GetMapping
    public ResponseEntity<List<CancionDTO>> listarCanciones() {
        return ResponseEntity.ok(cancionService.listarCanciones());
    }


    // Obtener canción por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerCancion(@PathVariable String id) {
        try {
            return ResponseEntity.ok(cancionService.obtenerCancion(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Agregar canción con archivos
    @PostMapping
    public ResponseEntity<?> agregarCancion(
            @RequestPart("solicitud") String solicitud,
            @RequestPart("imagen") MultipartFile imagen,
            @RequestPart("musica") MultipartFile musica) {
        try {
            System.out.println("=== RECIBIENDO CANCIÓN ===");
            System.out.println("Solicitud: " + solicitud);
            System.out.println("Imagen: " + imagen.getOriginalFilename() + " - " + imagen.getSize() + " bytes");
            System.out.println("Música: " + musica.getOriginalFilename() + " - " + musica.getSize() + " bytes");

            ObjectMapper mapper = new ObjectMapper();
            SolicitudCancion solicitudCancion = mapper.readValue(solicitud, SolicitudCancion.class);
            solicitudCancion.setArchivoImagen(imagen);
            solicitudCancion.setMusica(musica);

            Cancion cancionGuardada = cancionService.addCancion(solicitudCancion);

            System.out.println("✓ Canción guardada exitosamente: " + cancionGuardada.getTitulo());

            return ResponseEntity.status(HttpStatus.CREATED).body(cancionGuardada);
        } catch (Exception e) {
            System.err.println("✗ ERROR al guardar canción: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // Actualizar canción
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCancion(@PathVariable String id, @RequestBody Cancion cancion) {
        try {
            return ResponseEntity.ok(cancionService.actualizarCancion(id, cancion));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Eliminar canción
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCancion(@PathVariable String id) {
        try {
            cancionService.eliminarCancion(id);
            return ResponseEntity.ok("Canción eliminada exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Carga masiva
    @PostMapping("/carga-masiva")
    public ResponseEntity<?> cargaMasiva(@RequestParam("archivo") MultipartFile archivo) {
        try {
            int cancionesCargadas = cancionService.cargaMasiva(archivo);
            Map<String, Object> response = new HashMap<>();
            response.put("cancionesCargadas", cancionesCargadas);
            response.put("total", cancionesCargadas);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}