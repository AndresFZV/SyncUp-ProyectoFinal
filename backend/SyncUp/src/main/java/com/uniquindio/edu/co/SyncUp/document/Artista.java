package com.uniquindio.edu.co.SyncUp.document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

/**
 * Representa un artista musical en el sistema SyncUp.
 * Contiene información del artista, sus álbumes y canciones.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Document(collection = "artistas")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Artista {

    /**
     * Identificador único del artista.
     */
    @Id
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
     * Lista de álbumes asociados al artista.
     * Referencia lazy para optimizar el rendimiento.
     */
    @DBRef(lazy = true)
    @Builder.Default
    @JsonIgnoreProperties({"artista", "canciones"})
    private List<Album> albumes = new LinkedList<>();

    /**
     * Lista de canciones sueltas del artista que no pertenecen a un álbum.
     * Referencia lazy para optimizar el rendimiento.
     */
    @DBRef(lazy = true)
    @Builder.Default
    @JsonIgnoreProperties({"artista", "album"})
    private List<Cancion> canciones = new LinkedList<>();

    /**
     * Calcula el código hash del artista basado en su artistId.
     *
     * @return Código hash del artista
     */
    @Override
    public int hashCode() {
        return Objects.hash(artistId);
    }

    /**
     * Compara este artista con otro objeto para determinar igualdad.
     * Dos artistas se consideran iguales si tienen el mismo artistId.
     *
     * @param obj Objeto a comparar con este artista
     * @return true si los objetos son iguales, false en caso contrario
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Artista artista = (Artista) obj;
        return Objects.equals(artistId, artista.artistId);
    }
}