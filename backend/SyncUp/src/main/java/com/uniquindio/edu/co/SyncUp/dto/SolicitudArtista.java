package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

/**
 * Objeto de Transferencia de Datos (DTO) para solicitudes de creación o actualización de artistas.
 * Contiene los datos necesarios para procesar artistas junto con archivos de imagen.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SolicitudArtista {

    /**
     * Identificador único del artista (para actualizaciones).
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
     * Archivo de imagen del artista.
     */
    private MultipartFile imagenUrl;
}