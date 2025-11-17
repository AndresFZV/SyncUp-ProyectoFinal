package com.uniquindio.edu.co.SyncUp.graph;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * Representa un nodo (usuario) en el grafo social.
 * Contiene información del usuario y sus conexiones con otros usuarios.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Nodo {

    /**
     * Nombre de usuario único que identifica al nodo.
     */
    private String username;

    /**
     * Nombre completo del usuario.
     */
    private String nombre;

    /**
     * Número de seguidores del usuario.
     */
    private int seguidores;

    /**
     * Número de usuarios que este usuario sigue.
     */
    private int siguiendo;

    /**
     * Conjunto de usernames de usuarios conectados a este nodo.
     */
    private Set<String> conexiones;

    /**
     * Constructor que inicializa un nodo con username y nombre.
     *
     * @param username Nombre de usuario único
     * @param nombre Nombre completo del usuario
     */
    public Nodo(String username, String nombre) {
        this.username = username;
        this.nombre = nombre;
        this.conexiones = new HashSet<>();
        this.seguidores = 0;
        this.siguiendo = 0;
    }

    /**
     * Agrega una conexión a este nodo.
     *
     * @param usernameConexion Username del usuario a conectar
     */
    public void agregarConexion(String usernameConexion) {
        if (conexiones == null) {
            conexiones = new HashSet<>();
        }
        conexiones.add(usernameConexion);
    }

    /**
     * Elimina una conexión de este nodo.
     *
     * @param usernameConexion Username del usuario a desconectar
     */
    public void eliminarConexion(String usernameConexion) {
        if (conexiones != null) {
            conexiones.remove(usernameConexion);
        }
    }

    /**
     * Verifica si este nodo está conectado con otro usuario.
     *
     * @param usernameConexion Username del usuario a verificar
     * @return true si están conectados, false en caso contrario
     */
    public boolean estaConectadoCon(String usernameConexion) {
        return conexiones != null && conexiones.contains(usernameConexion);
    }

    /**
     * Obtiene el grado del nodo (número de conexiones).
     *
     * @return Número de conexiones del nodo
     */
    public int getGrado() {
        return conexiones != null ? conexiones.size() : 0;
    }

    /**
     * Compara este nodo con otro objeto para determinar igualdad.
     * Dos nodos se consideran iguales si tienen el mismo username.
     *
     * @param o Objeto a comparar con este nodo
     * @return true si los objetos son iguales, false en caso contrario
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Nodo nodo = (Nodo) o;
        return Objects.equals(username, nodo.username);
    }

    /**
     * Calcula el código hash del nodo basado en su username.
     *
     * @return Código hash del nodo
     */
    @Override
    public int hashCode() {
        return Objects.hash(username);
    }

    /**
     * Retorna una representación en cadena del nodo.
     *
     * @return Cadena que representa el nodo
     */
    @Override
    public String toString() {
        return "Nodo{" +
                "username='" + username + '\'' +
                ", nombre='" + nombre + '\'' +
                ", grado=" + getGrado() +
                '}';
    }
}