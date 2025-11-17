package com.uniquindio.edu.co.SyncUp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uniquindio.edu.co.SyncUp.dto.AlbumDTO;
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

/**
 * Controlador REST para gestionar las operaciones de álbumes.
 * Proporciona endpoints para CRUD de álbumes y carga masiva.
 */
@RestController
@RequestMapping("/api/albumes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlbumController {
    private final AlbumService albumService;

    /**
     * Obtiene la lista de todos los álbumes en formato DTO.
     *
     * @return ResponseEntity con la lista de álbumes DTO
     */
    @GetMapping
    public ResponseEntity<List<AlbumDTO>> listarAlbumes() {
        return ResponseEntity.ok(albumService.listarAlbumesDTO());
    }

    /**
     * Obtiene un álbum específico por su ID.
     *
     * @param id ID del álbum a buscar
     * @return ResponseEntity con el álbum encontrado o error si no existe
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerAlbum(@PathVariable String id) {
        try {
            return ResponseEntity.ok(albumService.obtenerAlbumDTO(id));
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Crea un nuevo álbum con imagen de portada.
     *
     * @param solicitud JSON con los datos del álbum
     * @param archivo Archivo de imagen para la portada
     * @return ResponseEntity con el álbum creado o error en caso de fallo
     */
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

    /**
     * Actualiza un álbum existente.
     *
     * @param id ID del álbum a actualizar
     * @param solicitud JSON con los nuevos datos del álbum
     * @param archivo Nuevo archivo de imagen (opcional)
     * @return ResponseEntity con el álbum actualizado o error en caso de fallo
     */
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

    /**
     * Elimina un álbum por su ID.
     *
     * @param id ID del álbum a eliminar
     * @return ResponseEntity con mensaje de éxito o error si no se encuentra
     */
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

    /**
     * Realiza una carga masiva de álbumes con tres archivos: metadata, imagen de portada y multimedia.
     *
     * @param archivoMetadata Archivo con los metadatos de los álbumes
     * @param imagenPortada Archivo de imagen para la portada
     * @param archivoMultimedia Archivo con contenido multimedia
     * @return ResponseEntity con el resultado de la carga masiva o error en caso de fallo
     */
    @PostMapping("/carga-masiva")
    public ResponseEntity<?> cargaMasivaAlbum(
            @RequestParam("archivoMetadata") MultipartFile archivoMetadata,
            @RequestParam("imagenPortada") MultipartFile imagenPortada,
            @RequestParam("archivoMultimedia") MultipartFile archivoMultimedia) {
        try {
            Map<String, Object> resultado = albumService.cargaMasivaAlbumConTresArchivos(
                    archivoMetadata,
                    imagenPortada,
                    archivoMultimedia
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