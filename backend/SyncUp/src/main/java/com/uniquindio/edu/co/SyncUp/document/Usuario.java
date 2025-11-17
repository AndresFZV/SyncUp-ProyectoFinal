package com.uniquindio.edu.co.SyncUp.document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

/**
 * Representa un usuario del sistema SyncUp.
 * Contiene información personal, preferencias musicales y relaciones sociales.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Document(collection = "usuarios")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties({"siguiendo", "seguidores", "listaFavoritos", "artistasFavoritos", "albumesFavoritos"})
public class Usuario {

    /**
     * Nombre de usuario único que identifica al usuario en el sistema.
     */
    @Id
    private String username;

    /**
     * Contraseña del usuario (mínimo 8 caracteres, números y letras).
     */
    private String password;

    /**
     * Nombre completo del usuario.
     */
    private String nombre;

    /**
     * Correo electrónico del usuario.
     */
    private String correo;

    /**
     * Edad del usuario.
     */
    private int edad;

    /**
     * Palabra secreta para recuperación de cuenta.
     */
    private String palabraSecreta;

    /**
     * Lista de canciones marcadas como favoritas por el usuario.
     */
    @DBRef
    @Builder.Default
    private LinkedList<Cancion> listaFavoritos = new LinkedList<>();

    /**
     * Lista de artistas marcados como favoritos por el usuario.
     */
    @DBRef
    @Builder.Default
    private LinkedList<Artista> artistasFavoritos = new LinkedList<>();

    /**
     * Lista de álbumes marcados como favoritos por el usuario.
     */
    @DBRef
    @Builder.Default
    private LinkedList<Album> albumesFavoritos = new LinkedList<>();

    /**
     * Conjunto de usuarios que este usuario sigue.
     */
    @DBRef
    @Builder.Default
    private Set<Usuario> siguiendo = new HashSet<>();

    /**
     * Conjunto de usuarios que siguen a este usuario.
     */
    @DBRef
    @Builder.Default
    private Set<Usuario> seguidores = new HashSet<>();

    /**
     * Calcula el código hash del usuario basado en su username.
     *
     * @return Código hash del usuario
     */
    @Override
    public int hashCode() {
        return Objects.hash(username);
    }

    /**
     * Compara este usuario con otro objeto para determinar igualdad.
     * Dos usuarios se consideran iguales si tienen el mismo username.
     *
     * @param obj Objeto a comparar con este usuario
     * @return true si los objetos son iguales, false en caso contrario
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Usuario usuario = (Usuario) obj;
        return Objects.equals(username, usuario.username);
    }
}