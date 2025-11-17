package com.uniquindio.edu.co.SyncUp.graph;

import com.uniquindio.edu.co.SyncUp.document.Usuario;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementación de Grafo No Dirigido para modelar conexiones sociales
 * RF-023: Grafo No Dirigido
 * RF-024: Recorridos BFS para "amigos de amigos"
 */
@Slf4j
@Component
public class GrafoSocial {

    // Representación del grafo como lista de adyacencias
    private Map<String, Nodo> nodos;
    private Map<String, Set<String>> adyacencias;

    // Configuración
    private static final int MAX_NIVEL_BFS = 3;
    private static final int MAX_SUGERENCIAS = 10;

    public GrafoSocial() {
        this.nodos = new HashMap<>();
        this.adyacencias = new HashMap<>();
    }

    /**
     * Construir el grafo desde una lista de usuarios
     * RF-023: Implementación como Grafo No Dirigido
     */
    public void construirGrafo(List<Usuario> usuarios) {
        log.info("🔨 Construyendo grafo social con {} usuarios", usuarios.size());

        // Limpiar grafo anterior
        nodos.clear();
        adyacencias.clear();

        // 1. Crear nodos
        for (Usuario usuario : usuarios) {
            if (usuario == null) continue;

            Nodo nodo = new Nodo(
                    usuario.getUsername(),
                    usuario.getNombre()
            );

            nodo.setSeguidores(usuario.getSeguidores() != null ?
                    usuario.getSeguidores().size() : 0);
            nodo.setSiguiendo(usuario.getSiguiendo() != null ?
                    usuario.getSiguiendo().size() : 0);

            nodos.put(usuario.getUsername(), nodo);
            adyacencias.put(usuario.getUsername(), new HashSet<>());
        }

        // 2. Crear aristas (conexiones bidireccionales)
        for (Usuario usuario : usuarios) {
            if (usuario == null || usuario.getSiguiendo() == null) continue;

            String username = usuario.getUsername();

            for (Usuario seguido : usuario.getSiguiendo()) {
                if (seguido == null) continue;

                String usernameSeguido = seguido.getUsername();

                // Conexión bidireccional (Grafo No Dirigido)
                agregarConexion(username, usernameSeguido);
            }
        }

        log.info("✅ Grafo construido: {} nodos, {} aristas",
                nodos.size(), contarAristas());
    }

    /**
     * Agregar una conexión bidireccional entre dos usuarios
     * RF-023: Grafo No Dirigido
     */
    public void agregarConexion(String username1, String username2) {
        if (!nodos.containsKey(username1) || !nodos.containsKey(username2)) {
            return;
        }

        // Agregar en ambas direcciones (No Dirigido)
        adyacencias.get(username1).add(username2);
        adyacencias.get(username2).add(username1);

        // Actualizar nodos
        nodos.get(username1).agregarConexion(username2);
        nodos.get(username2).agregarConexion(username1);
    }

    /**
     * Eliminar una conexión bidireccional
     */
    public void eliminarConexion(String username1, String username2) {
        if (adyacencias.containsKey(username1) && adyacencias.containsKey(username2)) {
            adyacencias.get(username1).remove(username2);
            adyacencias.get(username2).remove(username1);

            nodos.get(username1).eliminarConexion(username2);
            nodos.get(username2).eliminarConexion(username1);
        }
    }

    /**
     * Obtener vecinos (conexiones directas) de un usuario
     */
    public Set<String> obtenerVecinos(String username) {
        return new HashSet<>(adyacencias.getOrDefault(username, new HashSet<>()));
    }

    /**
     * Verificar si dos usuarios están conectados
     */
    public boolean estanConectados(String username1, String username2) {
        return adyacencias.containsKey(username1) &&
                adyacencias.get(username1).contains(username2);
    }

    /**
     * Obtener información de un nodo
     */
    public Nodo obtenerNodo(String username) {
        return nodos.get(username);
    }

    /**
     * Obtener el grado (número de conexiones) de un usuario
     */
    public int obtenerGrado(String username) {
        Nodo nodo = nodos.get(username);
        return nodo != null ? nodo.getGrado() : 0;
    }

    /**
     * Contar el total de aristas en el grafo
     */
    public int contarAristas() {
        int total = 0;
        for (Set<String> conexiones : adyacencias.values()) {
            total += conexiones.size();
        }
        return total / 2; // Dividir por 2 porque el grafo es no dirigido
    }

    /**
     * Obtener estadísticas del grafo
     */
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalNodos", nodos.size());
        stats.put("totalAristas", contarAristas());

        // Calcular grado promedio
        double gradoPromedio = nodos.values().stream()
                .mapToInt(Nodo::getGrado)
                .average()
                .orElse(0.0);
        stats.put("gradoPromedio", gradoPromedio);

        // Usuario con más conexiones
        Optional<Nodo> nodoMaxGrado = nodos.values().stream()
                .max(Comparator.comparingInt(Nodo::getGrado));

        if (nodoMaxGrado.isPresent()) {
            Nodo max = nodoMaxGrado.get();
            stats.put("usuarioMasConectado", max.getUsername());
            stats.put("maxGrado", max.getGrado());
        }

        return stats;
    }

    /**
     * RF-024: Obtener "amigos de amigos" usando BFS
     * Retorna usuarios a distancia 2 del usuario origen
     */
    public Set<String> obtenerAmigosDeAmigos(String username) {
        log.info("🔍 Buscando amigos de amigos para: {}", username);

        Set<String> amigosDeAmigos = AlgoritmoBFS.obtenerUsuariosEnNivel(
                adyacencias,
                username,
                2
        );

        log.info("✅ Encontrados {} amigos de amigos", amigosDeAmigos.size());
        return amigosDeAmigos;
    }

    /**
     * RF-024: Encontrar camino más corto usando BFS
     */
    public List<String> encontrarCamino(String origen, String destino) {
        return AlgoritmoBFS.encontrarCaminoMasCorto(adyacencias, origen, destino);
    }

    /**
     * RF-024: Calcular grado de separación usando BFS
     */
    public int calcularGradoSeparacion(String origen, String destino) {
        return AlgoritmoBFS.calcularDistancia(adyacencias, origen, destino);
    }

    /**
     * Obtener información de conexiones de un usuario
     */
    public Map<String, Object> obtenerInformacionConexiones(String username) {
        Map<String, Object> info = new HashMap<>();

        Nodo nodo = nodos.get(username);
        if (nodo == null) {
            return info;
        }

        info.put("username", username);
        info.put("nombre", nodo.getNombre());
        info.put("grado", nodo.getGrado());
        info.put("conexionesDirectas", obtenerVecinos(username));

        // Amigos de amigos
        Set<String> amigosDeAmigos = obtenerAmigosDeAmigos(username);
        info.put("amigosDeAmigos", amigosDeAmigos);
        info.put("totalAmigosDeAmigos", amigosDeAmigos.size());

        return info;
    }

    /**
     * Verificar si el grafo está vacío
     */
    public boolean estaVacio() {
        return nodos.isEmpty();
    }

    /**
     * Obtener el mapa de adyacencias (para algoritmos externos)
     */
    public Map<String, Set<String>> getAdyacencias() {
        return new HashMap<>(adyacencias);
    }

    /**
     * Obtener todos los nodos
     */
    public Map<String, Nodo> getNodos() {
        return new HashMap<>(nodos);
    }
}