package com.uniquindio.edu.co.SyncUp.document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@Document(collection = "canciones")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Cancion {

    @Id
    @JsonProperty("_id")
    private String songId;
    private String titulo;
    private String genero;
    private int anio;
    private double duracion; // en minutos o segundos
    private String imagenUrl;
    private String musica;

    // Relación con Artista y Álbum
    @DBRef
    @JsonIgnoreProperties({"canciones", "albumes"}) // ← AGREGAR ESTO
    private Artista artista;

    @DBRef
    @JsonIgnoreProperties({"canciones"}) // ← AGREGAR ESTO
    private Album album;

    @Override
    public int hashCode() {
        return Objects.hash(songId);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Cancion cancion = (Cancion) obj;
        return Objects.equals(songId, cancion.songId);
    }
}
