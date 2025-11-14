package com.uniquindio.edu.co.SyncUp.trie;

import lombok.Getter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Nodo del Trie (Árbol de Prefijos)
 * Cada nodo representa un carácter en el árbol
 */
@Getter
public class TrieNode {

    // Mapa de caracteres hijos: 'a' -> TrieNode('a')
    private final Map<Character, TrieNode> hijos;

    // Indica si este nodo marca el fin de una palabra
    private boolean esFinalDePalabra;

    // ← CAMBIO: En lugar de dos Sets separados, usar un Map por tipo
    private final Map<String, Set<String>> entidadesPorTipo;

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
     * Obtener el nodo hijo para un carácter específico
     */
    public TrieNode obtenerHijo(char c) {
        return hijos.get(c);
    }

    /**
     * Agregar un nodo hijo para un carácter
     */
    public void agregarHijo(char c, TrieNode nodo) {
        hijos.put(c, nodo);
    }

    /**
     * Verificar si existe un hijo para un carácter
     */
    public boolean tieneHijo(char c) {
        return hijos.containsKey(c);
    }

    /**
     * Marcar este nodo como fin de palabra
     */
    public void marcarComoFinal() {
        this.esFinalDePalabra = true;
    }

    /**
     * Agregar una entidad asociada a esta palabra
     */
    public void agregarEntidad(String entidadId, String tipo) {
        String tipoKey = tipo.toLowerCase();

        if (entidadesPorTipo.containsKey(tipoKey)) {
            entidadesPorTipo.get(tipoKey).add(entidadId);
        }
    }

    /**
     * Verificar si este nodo tiene hijos
     */
    public boolean tieneHijos() {
        return !hijos.isEmpty();
    }

    /**
     * Obtener cantidad de hijos
     */
    public int cantidadHijos() {
        return hijos.size();
    }

    /**
     * ← NUEVO: Obtener IDs de canciones
     */
    public Set<String> getCancionIds() {
        return entidadesPorTipo.get("cancion");
    }

    /**
     * ← NUEVO: Obtener IDs de artistas
     */
    public Set<String> getArtistaIds() {
        return entidadesPorTipo.get("artista");
    }

    /**
     * ← NUEVO: Obtener IDs de álbumes
     */
    public Set<String> getAlbumIds() {
        return entidadesPorTipo.get("album");
    }

    /**
     * ← NUEVO: Obtener IDs de usuarios
     */
    public Set<String> getUsuarioIds() {
        return entidadesPorTipo.get("usuario");
    }

    /**
     * ← MANTENER POR COMPATIBILIDAD (deprecated)
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
     * ← MANTENER POR COMPATIBILIDAD (deprecated)
     */
    @Deprecated
    public Set<String> getTiposEntidad() {
        return entidadesPorTipo.keySet();
    }

    /**
     * Verificar si es final de palabra
     */
    public boolean isEsFinalDePalabra() {
        return esFinalDePalabra;
    }
}