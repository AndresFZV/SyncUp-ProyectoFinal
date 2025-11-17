package com.uniquindio.edu.co.SyncUp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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

/**
 * Controlador REST para gestionar las operaciones de artistas.
 * Proporciona endpoints para CRUD de artistas.
 */
@RestController
@RequestMapping("/api/artistas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ArtistaController {
    private final ArtistaService artistaService;

    /**
     * Obtiene la lista de todos los artistas en formato DTO.
     *
     * @return ResponseEntity con la lista de artistas DTO
     */
    @GetMapping
    public ResponseEntity<List<ArtistaDTO>> listarArtistas() {
        return ResponseEntity.ok(artistaService.listarArtistasDTO());
    }

    /**
     * Obtiene un artista específico por su ID con detalles completos.
     *
     * @param id ID del artista a buscar
     * @return ResponseEntity con el artista encontrado o error si no existe
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerArtista(@PathVariable String id) {
        try {
            ArtistaDTO artista = artistaService.obtenerArtistaDetalle(id);
            return ResponseEntity.ok(artista);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Crea un nuevo artista con imagen de perfil.
     *
     * @param solicitud JSON con los datos del artista
     * @param archivo Archivo de imagen para el perfil del artista
     * @return ResponseEntity con el artista creado o error en caso de fallo
     */
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

    /**
     * Actualiza un artista existente.
     *
     * @param id ID del artista a actualizar
     * @param solicitud JSON con los nuevos datos del artista
     * @param archivo Nuevo archivo de imagen (opcional)
     * @return ResponseEntity con el artista actualizado o error en caso de fallo
     */
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

    /**
     * Elimina un artista por su ID.
     *
     * @param id ID del artista a eliminar
     * @return ResponseEntity con mensaje de éxito o error si no se encuentra
     */
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