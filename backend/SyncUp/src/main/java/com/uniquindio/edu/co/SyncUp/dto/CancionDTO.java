package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Objeto de Transferencia de Datos (DTO) para representar una canción.
 * Proporciona una vista simplificada de una canción sin referencias cíclicas.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CancionDTO {

    /**
     * Identificador único de la canción.
     */
    private String songId;

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
     * URL de la imagen de portada de la canción.
     */
    private String imagenUrl;

    /**
     * URL o identificador del archivo de audio de la canción.
     */
    private String musica;

    /**
     * Identificador del artista de la canción.
     */
    private String artistaId;

    /**
     * Nombre del artista de la canción.
     */
    private String artistaNombre;

    /**
     * Identificador del álbum al que pertenece la canción.
     */
    private String albumId;

    /**
     * Nombre del álbum al que pertenece la canción.
     */
    private String albumNombre;
}