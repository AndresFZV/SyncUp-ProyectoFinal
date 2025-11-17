package com.uniquindio.edu.co.SyncUp.trie;

import lombok.Getter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Representa un nodo en la estructura de datos Trie (Árbol de Prefijos).
 * Cada nodo almacena caracteres, información de fin de palabra y entidades asociadas.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Getter
public class TrieNode {

    private final Map<Character, TrieNode> hijos;
    private boolean esFinalDePalabra;
    private final Map<String, Set<String>> entidadesPorTipo;

    /**
     * Constructor que inicializa un nodo vacío.
     */
    public TrieNode() {
        this.hijos = new HashMap<>();
        this.esFinalDePalabra = false;
        this.entidadesPorTipo = new HashMap<>();
        this.entidadesPorTipo.put("cancion", new HashSet<>());
        this.entidadesPorTipo.put("artista", new HashSet<>());
        this.entidadesPorTipo.put("album", new HashSet<>());
        this.entidadesPorTipo.put("usuario", new HashSet<>());
    }

    /**
     * Obtiene el nodo hijo para un carácter específico.
     *
     * @param c El carácter a buscar
     * @return El nodo hijo correspondiente al carácter, o null si no existe
     */
    public TrieNode obtenerHijo(char c) {
        return hijos.get(c);
    }

    /**
     * Agrega un nodo hijo para un carácter específico.
     *
     * @param c El carácter a agregar
     * @param nodo El nodo hijo a asociar con el carácter
     */
    public void agregarHijo(char c, TrieNode nodo) {
        hijos.put(c, nodo);
    }

    /**
     * Verifica si existe un nodo hijo para un carácter específico.
     *
     * @param c El carácter a verificar
     * @return true si existe un hijo para el carácter, false en caso contrario
     */
    public boolean tieneHijo(char c) {
        return hijos.containsKey(c);
    }

    /**
     * Marca este nodo como el final de una palabra válida.
     */
    public void marcarComoFinal() {
        this.esFinalDePalabra = true;
    }

    /**
     * Agrega una entidad asociada a este nodo.
     *
     * @param entidadId El ID de la entidad a agregar
     * @param tipo El tipo de entidad: "cancion", "artista", "album", "usuario"
     */
    public void agregarEntidad(String entidadId, String tipo) {
        String tipoKey = tipo.toLowerCase();

        if (entidadesPorTipo.containsKey(tipoKey)) {
            entidadesPorTipo.get(tipoKey).add(entidadId);
        }
    }

    /**
     * Verifica si este nodo tiene nodos hijos.
     *
     * @return true si tiene hijos, false en caso contrario
     */
    public boolean tieneHijos() {
        return !hijos.isEmpty();
    }

    /**
     * Obtiene la cantidad de nodos hijos.
     *
     * @return El número de hijos del nodo
     */
    public int cantidadHijos() {
        return hijos.size();
    }

    /**
     * Obtiene los IDs de canciones asociados a este nodo.
     *
     * @return Conjunto de IDs de canciones
     */
    public Set<String> getCancionIds() {
        return entidadesPorTipo.get("cancion");
    }

    /**
     * Obtiene los IDs de artistas asociados a este nodo.
     *
     * @return Conjunto de IDs de artistas
     */
    public Set<String> getArtistaIds() {
        return entidadesPorTipo.get("artista");
    }

    /**
     * Obtiene los IDs de álbumes asociados a este nodo.
     *
     * @return Conjunto de IDs de álbumes
     */
    public Set<String> getAlbumIds() {
        return entidadesPorTipo.get("album");
    }

    /**
     * Obtiene los IDs de usuarios asociados a este nodo.
     *
     * @return Conjunto de IDs de usuarios
     */
    public Set<String> getUsuarioIds() {
        return entidadesPorTipo.get("usuario");
    }

    /**
     * Obtiene todas las entidades asociadas a este nodo (método deprecated).
     *
     * @return Conjunto de todas las entidades asociadas
     * @deprecated Usar los métodos específicos por tipo en su lugar
     */
    @Deprecated
    public Set<String> getEntidadesAsociadas() {
        Set<String> todas = new HashSet<>();
        todas.addAll(entidadesPorTipo.get("cancion"));
        todas.addAll(entidadesPorTipo.get("artista"));
        todas.addAll(entidadesPorTipo.get("album"));
        return todas;
    }

    /**
     * Obtiene los tipos de entidad asociados a este nodo (método deprecated).
     *
     * @return Conjunto de tipos de entidad
     * @deprecated Usar los métodos específicos por tipo en su lugar
     */
    @Deprecated
    public Set<String> getTiposEntidad() {
        return entidadesPorTipo.keySet();
    }

    /**
     * Verifica si este nodo marca el final de una palabra.
     *
     * @return true si es final de palabra, false en caso contrario
     */
    public boolean isEsFinalDePalabra() {
        return esFinalDePalabra;
    }
}