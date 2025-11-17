package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Objeto de Transferencia de Datos (DTO) para representar un álbum.
 * Proporciona una vista simplificada de un álbum con información básica y estadísticas.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AlbumDTO {

    /**
     * Identificador único del álbum.
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
     * URL de la imagen de portada del álbum.
     */
    private String imagenUrl;

    /**
     * Identificador del artista al que pertenece el álbum.
     */
    private String artistaId;

    /**
     * Nombre del artista al que pertenece el álbum.
     */
    private String artistaNombre;

    /**
     * Número total de canciones que contiene el álbum.
     */
    private int totalCanciones;
}