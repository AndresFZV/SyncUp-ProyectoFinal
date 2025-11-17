package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Objeto de Transferencia de Datos (DTO) para representar un artista.
 * Proporciona una vista completa del artista con información detallada y estadísticas.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ArtistaDTO {

    /**
     * Identificador único del artista.
     */
    private String artistId;

    /**
     * Nombre del artista.
     */
    private String nombre;

    /**
     * País de origen del artista.
     */
    private String pais;

    /**
     * Género musical principal del artista.
     */
    private String generoPrincipal;

    /**
     * Biografía o descripción del artista.
     */
    private String biografia;

    /**
     * URL de la imagen del artista.
     */
    private String imagenUrl;

    /**
     * Número total de canciones del artista.
     */
    private int totalCanciones;

    /**
     * Número total de álbumes del artista.
     */
    private int totalAlbumes;

    /**
     * Número estimado de oyentes mensuales del artista.
     */
    private Integer oyentesMensuales;

    /**
     * Lista de álbumes del artista en formato DTO.
     */
    private List<AlbumDTO> albumes;

    /**
     * Lista de canciones del artista en formato DTO.
     */
    private List<CancionDTO> canciones;
}