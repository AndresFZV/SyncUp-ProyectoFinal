package com.uniquindio.edu.co.SyncUp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.dto.ArtistaDTO;
import com.uniquindio.edu.co.SyncUp.dto.SolicitudArtista;
import com.uniquindio.edu.co.SyncUp.services.ArtistaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/artistas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ArtistaController {
    private final ArtistaService artistaService;

    // GET - Listar todos los artistas
    @GetMapping
    public ResponseEntity<List<ArtistaDTO>> listarArtistas() {
        return ResponseEntity.ok(artistaService.listarArtistasDTO());
    }

    // Los demás métodos (POST, PUT, DELETE) quedan igual
    // GET - Obtener artista por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerArtista(@PathVariable String id) {
        try {
            return ResponseEntity.ok(artistaService.obtenerArtista(id));
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    // POST - Crear artista
    @PostMapping
    public ResponseEntity<?> addArtista(@RequestPart("solicitud") String solicitud,
                                        @RequestPart("archivo") MultipartFile archivo) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            SolicitudArtista solicitudArtista = mapper.readValue(solicitud, SolicitudArtista.class);
            solicitudArtista.setImagenUrl(archivo);
            return ResponseEntity.status(HttpStatus.CREATED).body(artistaService.addArtista(solicitudArtista));
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // PUT - Actualizar artista
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarArtista(@PathVariable String id,
                                               @RequestPart("solicitud") String solicitud,
                                               @RequestPart(value = "archivo", required = false) MultipartFile archivo) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            SolicitudArtista solicitudArtista = mapper.readValue(solicitud, SolicitudArtista.class);
            if (archivo != null) {
                solicitudArtista.setImagenUrl(archivo);
            }
            return ResponseEntity.ok(artistaService.actualizarArtista(id, solicitudArtista));
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // DELETE - Eliminar artista
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarArtista(@PathVariable String id) {
        try {
            artistaService.eliminarArtista(id);
            return ResponseEntity.ok("Artista eliminado exitosamente");
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }


}