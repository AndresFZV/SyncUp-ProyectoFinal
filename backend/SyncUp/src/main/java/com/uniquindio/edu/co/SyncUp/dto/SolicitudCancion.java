package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

/**
 * Objeto de Transferencia de Datos (DTO) para solicitudes de creación o actualización de canciones.
 * Contiene los datos necesarios para procesar canciones junto con archivos multimedia.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SolicitudCancion {

    /**
     * Identificador único de la canción (para actualizaciones).
     */
    private String id;

    /**
     * Título de la canción.
     */
    private String titulo;

    /**
     * Género musical de la canción.
     */
    private String genero;

    /**
     * Año de lanzamiento de la canción.
     */
    private int anio;

    /**
     * Duración de la canción en minutos o segundos.
     */
    private double duracion;

    /**
     * Archivo de imagen de portada de la canción.
     */
    private MultipartFile archivoImagen;

    /**
     * Archivo de audio de la canción.
     */
    private MultipartFile musica;

    /**
     * Identificador del artista de la canción.
     */
    private String artistaId;

    /**
     * Identificador del álbum al que pertenece la canción.
     */
    private String albumId;
}