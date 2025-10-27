package com.uniquindio.edu.co.SyncUp.document;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

@Document(collection = "artistas")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Artista {

    @Id
    private String artistId;
    private String nombre;
    private String pais;
    private String generoPrincipal;
    private String biografia;
    private String imagenUrl;

    // Álbumes asociados al artista
    @DBRef
    @Builder.Default
    private List<Album> albumes = new LinkedList<>();

    // Canciones sueltas (que podrían no pertenecer a un álbum)
    @DBRef
    @Builder.Default
    private List<Cancion> canciones = new LinkedList<>();

    @Override
    public int hashCode() {
        return Objects.hash(artistId);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Artista artista = (Artista) obj;
        return Objects.equals(artistId, artista.artistId);
    }
}

