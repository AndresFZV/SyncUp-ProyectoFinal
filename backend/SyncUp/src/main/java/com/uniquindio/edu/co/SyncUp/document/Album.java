package com.uniquindio.edu.co.SyncUp.document;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * Representa un álbum musical en el sistema SyncUp.
 * Contiene información sobre el álbum, sus canciones y metadatos asociados.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Document(collection = "albums")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
public class Album {

    /**
     * Identificador único del álbum en la base de datos.
     */
    @Id
    @JsonProperty("_id")
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
    private String artistId;

    /**
     * Lista de identificadores de las canciones que contiene el álbum.
     */
    private List<String> songIds;
}