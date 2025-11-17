package com.uniquindio.edu.co.SyncUp.document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

/**
 * Representa una canción musical en el sistema SyncUp.
 * Contiene información de la canción, su artista y álbum asociado.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Document(collection = "canciones")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Cancion {

    /**
     * Identificador único de la canción.
     */
    @Id
    @JsonProperty("_id")
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
     * Artista al que pertenece la canción.
     * Referencia a la entidad Artista con ignorancia de propiedades cíclicas.
     */
    @DBRef
    @JsonIgnoreProperties({"canciones", "albumes"})
    private Artista artista;

    /**
     * Álbum al que pertenece la canción.
     * Referencia a la entidad Album con ignorancia de propiedades cíclicas.
     */
    @DBRef
    @JsonIgnoreProperties({"canciones"})
    private Album album;

    /**
     * Calcula el código hash de la canción basado en su songId.
     *
     * @return Código hash de la canción
     */
    @Override
    public int hashCode() {
        return Objects.hash(songId);
    }

    /**
     * Compara esta canción con otro objeto para determinar igualdad.
     * Dos canciones se consideran iguales si tienen el mismo songId.
     *
     * @param obj Objeto a comparar con esta canción
     * @return true si los objetos son iguales, false en caso contrario
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Cancion cancion = (Cancion) obj;
        return Objects.equals(songId, cancion.songId);
    }
}