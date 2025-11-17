package com.uniquindio.edu.co.SyncUp.graph;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * Representa un nodo (usuario) en el grafo social
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Nodo {

    private String username;
    private String nombre;
    private int seguidores;
    private int siguiendo;

    // Conexiones del nodo (usuarios conectados)
    private Set<String> conexiones;

    public Nodo(String username, String nombre) {
        this.username = username;
        this.nombre = nombre;
        this.conexiones = new HashSet<>();
        this.seguidores = 0;
        this.siguiendo = 0;
    }

    /**
     * Agregar una conexión a este nodo
     */
    public void agregarConexion(String usernameConexion) {
        if (conexiones == null) {
            conexiones = new HashSet<>();
        }
        conexiones.add(usernameConexion);
    }

    /**
     * Eliminar una conexión de este nodo
     */
    public void eliminarConexion(String usernameConexion) {
        if (conexiones != null) {
            conexiones.remove(usernameConexion);
        }
    }

    /**
     * Verificar si está conectado con otro usuario
     */
    public boolean estaConectadoCon(String usernameConexion) {
        return conexiones != null && conexiones.contains(usernameConexion);
    }

    /**
     * Obtener el grado del nodo (número de conexiones)
     */
    public int getGrado() {
        return conexiones != null ? conexiones.size() : 0;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Nodo nodo = (Nodo) o;
        return Objects.equals(username, nodo.username);
    }

    @Override
    public int hashCode() {
        return Objects.hash(username);
    }

    @Override
    public String toString() {
        return "Nodo{" +
                "username='" + username + '\'' +
                ", nombre='" + nombre + '\'' +
                ", grado=" + getGrado() +
                '}';
    }
}