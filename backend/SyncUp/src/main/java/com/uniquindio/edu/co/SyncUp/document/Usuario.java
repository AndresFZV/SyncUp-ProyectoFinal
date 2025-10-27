package com.uniquindio.edu.co.SyncUp.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

@Document(collection = "usuarios")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Usuario {

    @Id
    private String username; // único
    private String password; // minimo 8 caracteres - números y letras
    private String nombre;
    private String correo;
    private int edad;
    private String palabraSecreta;

    // Lista de canciones favoritas
    @DBRef
    @Builder.Default
    private LinkedList<Cancion> listaFavoritos = new LinkedList<>();

    // Lista de artistas favoritos
    @DBRef
    @Builder.Default
    private LinkedList<Artista> artistasFavoritos = new LinkedList<>();

    // Usuarios que sigue
    @DBRef
    @Builder.Default
    private Set<Usuario> siguiendo = new HashSet<>();

    // Usuarios que lo siguen
    @DBRef
    @Builder.Default
    private Set<Usuario> seguidores = new HashSet<>();

    @Override
    public int hashCode() {
        return Objects.hash(username);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Usuario usuario = (Usuario) obj;
        return Objects.equals(username, usuario.username);
    }
}
