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

/**
 * Controlador REST para gestionar las operaciones de canciones.
 * Proporciona endpoints para CRUD de canciones, carga masiva y búsqueda de canciones similares.
 */
@RestController
@RequestMapping("/api/canciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CancionController {

    private final CancionService cancionService;

    /**
     * Obtiene la lista de todas las canciones en formato DTO.
     *
     * @return ResponseEntity con la lista de canciones DTO
     */
    @GetMapping
    public ResponseEntity<List<CancionDTO>> listarCanciones() {
        return ResponseEntity.ok(cancionService.listarCanciones());
    }

    /**
     * Obtiene una canción específica por su ID.
     *
     * @param id ID de la canción a buscar
     * @return ResponseEntity con la canción encontrada o error si no existe
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerCancion(@PathVariable String id) {
        try {
            return ResponseEntity.ok(cancionService.obtenerCancion(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Obtiene todas las canciones pertenecientes a un álbum específico.
     *
     * @param albumId ID del álbum del cual se quieren obtener las canciones
     * @return ResponseEntity con la lista de canciones del álbum o error si no existe
     */
    @GetMapping("/album/{albumId}")
    public ResponseEntity<?> obtenerCancionesPorAlbum(@PathVariable String albumId) {
        try {
            List<CancionDTO> canciones = cancionService.obtenerCancionesPorAlbum(albumId);
            return ResponseEntity.ok(canciones);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Crea una nueva canción con archivos de imagen y audio.
     *
     * @param solicitud JSON con los datos de la canción
     * @param imagen Archivo de imagen para la portada de la canción
     * @param musica Archivo de audio de la canción
     * @return ResponseEntity con la canción creada o error en caso de fallo
     */
    @PostMapping
    public ResponseEntity<?> agregarCancion(
            @RequestPart("solicitud") String solicitud,
            @RequestPart("imagen") MultipartFile imagen,
            @RequestPart("musica") MultipartFile musica) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            SolicitudCancion solicitudCancion = mapper.readValue(solicitud, SolicitudCancion.class);
            solicitudCancion.setArchivoImagen(imagen);
            solicitudCancion.setMusica(musica);
            Cancion cancionGuardada = cancionService.addCancion(solicitudCancion);
            return ResponseEntity.status(HttpStatus.CREATED).body(cancionGuardada);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Actualiza una canción existente.
     *
     * @param id ID de la canción a actualizar
     * @param cancion Objeto Cancion con los nuevos datos
     * @return ResponseEntity con la canción actualizada o error si no se encuentra
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCancion(@PathVariable String id, @RequestBody Cancion cancion) {
        try {
            return ResponseEntity.ok(cancionService.actualizarCancion(id, cancion));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Elimina una canción por su ID.
     *
     * @param id ID de la canción a eliminar
     * @return ResponseEntity con mensaje de éxito o error si no se encuentra
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCancion(@PathVariable String id) {
        try {
            cancionService.eliminarCancion(id);
            return ResponseEntity.ok("Canción eliminada exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Realiza una carga masiva de canciones desde archivos de metadata y multimedia.
     *
     * @param archivoMetadata Archivo con los metadatos de las canciones
     * @param archivoMultimedia Archivo con el contenido multimedia de las canciones
     * @return ResponseEntity con el número de canciones cargadas o error en caso de fallo
     */
    @PostMapping("/carga-masiva")
    public ResponseEntity<?> cargaMasiva(
            @RequestParam("archivoMetadata") MultipartFile archivoMetadata,
            @RequestParam("archivoMultimedia") MultipartFile archivoMultimedia) {
        try {
            int cancionesCargadas = cancionService.cargaMasivaConArchivos(archivoMetadata, archivoMultimedia);
            Map<String, Object> response = new HashMap<>();
            response.put("cancionesCargadas", cancionesCargadas);
            response.put("total", cancionesCargadas);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Obtiene canciones similares basadas en el género de una canción específica.
     *
     * @param cancionId ID de la canción de referencia
     * @param limite Número máximo de canciones similares a retornar (por defecto 20)
     * @return ResponseEntity con la lista de canciones similares o error en caso de fallo
     */
    @GetMapping("/{cancionId}/similares")
    public ResponseEntity<?> obtenerCancionesSimilares(
            @PathVariable String cancionId,
            @RequestParam(defaultValue = "20") int limite) {
        try {
            List<CancionDTO> similares = cancionService.obtenerCancionesSimilares(cancionId, limite);
            return ResponseEntity.ok(similares);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}