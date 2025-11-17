package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Objeto de Transferencia de Datos (DTO) para solicitudes de creación o actualización de álbumes.
 * Contiene los datos necesarios para procesar álbumes junto con archivos multimedia.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SolicitudAlbum {

    /**
     * Identificador único del álbum (para actualizaciones).
     */
    private String id;

    /**
     * Nombre del álbum.
     */
    private String nombre;

    /**
     * Descripción del álbum.
     */
    private String descripcion;

    /**
     * Color de fondo asociado al álbum para representación visual.
     */
    private String bgColor;

    /**
     * Archivo de imagen de portada del álbum.
     */
    private MultipartFile archivoImagen;

    /**
     * Identificador del artista al que pertenece el álbum.
     */
    private String artistId;

    /**
     * Lista de identificadores de canciones que pertenecen al álbum.
     */
    private List<String> songIds;
}