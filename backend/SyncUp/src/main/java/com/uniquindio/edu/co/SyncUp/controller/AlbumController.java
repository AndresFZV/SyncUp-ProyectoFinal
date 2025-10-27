package com.uniquindio.edu.co.SyncUp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.dto.SolicitudAlbum;
import com.uniquindio.edu.co.SyncUp.services.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/albumes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlbumController {
    private final AlbumService albumService;

    // GET - Listar todos los álbumes
    @GetMapping
    public ResponseEntity<List<Album>> listarAlbumes() {
        return ResponseEntity.ok(albumService.listarAlbumes());
    }

    // GET - Obtener álbum por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerAlbum(@PathVariable String id) {
        try {
            return ResponseEntity.ok(albumService.obtenerAlbum(id));
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    // POST - Crear álbum
    @PostMapping
    public ResponseEntity<?> addAlbum(@RequestPart("solicitud") String solicitud,
                                      @RequestPart("archivo") MultipartFile archivo) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            SolicitudAlbum solicitudAlbum = mapper.readValue(solicitud, SolicitudAlbum.class);
            solicitudAlbum.setArchivoImagen(archivo);
            return ResponseEntity.status(HttpStatus.CREATED).body(albumService.addAlbum(solicitudAlbum));
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // PUT - Actualizar álbum
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarAlbum(
            @PathVariable String id,
            @RequestPart("solicitud") String solicitud,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            SolicitudAlbum solicitudAlbum = mapper.readValue(solicitud, SolicitudAlbum.class);
            solicitudAlbum.setArchivoImagen(archivo);
            return ResponseEntity.ok(albumService.actualizarAlbum(id, solicitudAlbum));
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // DELETE - Eliminar álbum
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarAlbum(@PathVariable String id) {
        try {
            albumService.eliminarAlbum(id);
            return ResponseEntity.ok("Álbum eliminado exitosamente");
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    // Agregar este método al AlbumController
    @PostMapping("/carga-masiva")
    public ResponseEntity<?> cargaMasivaAlbum(
            @RequestParam("archivoMetadata") MultipartFile archivoMetadata,
            @RequestParam("imagenPortada") MultipartFile imagenPortada,
            @RequestParam("archivoMultimedia") MultipartFile archivoMultimedia) {
        try {
            Map<String, Object> resultado = albumService.cargaMasivaAlbumConTresArchivos(
                    archivoMetadata,      // metadata.txt
                    imagenPortada,        // portada del álbum
                    archivoMultimedia     // ZIP con MP3 e imágenes
            );
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}