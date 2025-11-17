package com.uniquindio.edu.co.SyncUp.graph;

import com.uniquindio.edu.co.SyncUp.document.Usuario;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementación de Grafo No Dirigido para modelar conexiones sociales entre usuarios.
 * Proporciona funcionalidades para análisis de relaciones y sugerencias de conexiones.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Slf4j
@Component
public class GrafoSocial {

    /**
     * Mapa de nodos del grafo, donde la clave es el username del usuario.
     */
    private Map<String, Nodo> nodos;

    /**
     * Mapa de adyacencias que representa las conexiones entre usuarios.
     */
    private Map<String, Set<String>> adyacencias;

    /**
     * Configuración para límites de búsqueda en el grafo.
     */
    private static final int MAX_NIVEL_BFS = 3;
    private static final int MAX_SUGERENCIAS = 10;

    /**
     * Constructor que inicializa el grafo vacío.
     */
    public GrafoSocial() {
        this.nodos = new HashMap<>();
        this.adyacencias = new HashMap<>();
    }

    /**
     * Construye el grafo social a partir de una lista de usuarios.
     *
     * @param usuarios Lista de usuarios para construir el grafo
     */
    public void construirGrafo(List<Usuario> usuarios) {
        log.info("Construyendo grafo social con {} usuarios", usuarios.size());

        nodos.clear();
        adyacencias.clear();

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

        for (Usuario usuario : usuarios) {
            if (usuario == null || usuario.getSiguiendo() == null) continue;

            String username = usuario.getUsername();

            for (Usuario seguido : usuario.getSiguiendo()) {
                if (seguido == null) continue;

                String usernameSeguido = seguido.getUsername();
                agregarConexion(username, usernameSeguido);
            }
        }

        log.info("Grafo construido: {} nodos, {} aristas",
                nodos.size(), contarAristas());
    }

    /**
     * Agrega una conexión bidireccional entre dos usuarios.
     *
     * @param username1 Primer usuario de la conexión
     * @param username2 Segundo usuario de la conexión
     */
    public void agregarConexion(String username1, String username2) {
        if (!nodos.containsKey(username1) || !nodos.containsKey(username2)) {
            return;
        }

        adyacencias.get(username1).add(username2);
        adyacencias.get(username2).add(username1);

        nodos.get(username1).agregarConexion(username2);
        nodos.get(username2).agregarConexion(username1);
    }

    /**
     * Elimina una conexión bidireccional entre dos usuarios.
     *
     * @param username1 Primer usuario de la conexión
     * @param username2 Segundo usuario de la conexión
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
     * Obtiene los vecinos (conexiones directas) de un usuario.
     *
     * @param username Usuario del cual obtener los vecinos
     * @return Conjunto de usernames de los vecinos directos
     */
    public Set<String> obtenerVecinos(String username) {
        return new HashSet<>(adyacencias.getOrDefault(username, new HashSet<>()));
    }

    /**
     * Verifica si dos usuarios están conectados directamente.
     *
     * @param username1 Primer usuario
     * @param username2 Segundo usuario
     * @return true si están conectados, false en caso contrario
     */
    public boolean estanConectados(String username1, String username2) {
        return adyacencias.containsKey(username1) &&
                adyacencias.get(username1).contains(username2);
    }

    /**
     * Obtiene la información de un nodo específico.
     *
     * @param username Username del nodo a obtener
     * @return Objeto Nodo con la información del usuario
     */
    public Nodo obtenerNodo(String username) {
        return nodos.get(username);
    }

    /**
     * Obtiene el grado (número de conexiones) de un usuario.
     *
     * @param username Usuario del cual obtener el grado
     * @return Número de conexiones del usuario
     */
    public int obtenerGrado(String username) {
        Nodo nodo = nodos.get(username);
        return nodo != null ? nodo.getGrado() : 0;
    }

    /**
     * Cuenta el total de aristas en el grafo.
     *
     * @return Número total de aristas en el grafo
     */
    public int contarAristas() {
        int total = 0;
        for (Set<String> conexiones : adyacencias.values()) {
            total += conexiones.size();
        }
        return total / 2;
    }

    /**
     * Obtiene estadísticas generales del grafo.
     *
     * @return Mapa con estadísticas del grafo
     */
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalNodos", nodos.size());
        stats.put("totalAristas", contarAristas());

        double gradoPromedio = nodos.values().stream()
                .mapToInt(Nodo::getGrado)
                .average()
                .orElse(0.0);
        stats.put("gradoPromedio", gradoPromedio);

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
     * Obtiene los "amigos de amigos" de un usuario usando BFS.
     *
     * @param username Usuario de referencia
     * @return Conjunto de usernames de amigos de amigos
     */
    public Set<String> obtenerAmigosDeAmigos(String username) {
        log.info("Buscando amigos de amigos para: {}", username);

        Set<String> amigosDeAmigos = AlgoritmoBFS.obtenerUsuariosEnNivel(
                adyacencias,
                username,
                2
        );

        log.info("Encontrados {} amigos de amigos", amigosDeAmigos.size());
        return amigosDeAmigos;
    }

    /**
     * Encuentra el camino más corto entre dos usuarios usando BFS.
     *
     * @param origen Usuario de origen
     * @param destino Usuario de destino
     * @return Lista ordenada del camino más corto, o null si no existe
     */
    public List<String> encontrarCamino(String origen, String destino) {
        return AlgoritmoBFS.encontrarCaminoMasCorto(adyacencias, origen, destino);
    }

    /**
     * Calcula el grado de separación entre dos usuarios.
     *
     * @param origen Usuario de origen
     * @param destino Usuario de destino
     * @return Distancia entre los usuarios, o -1 si no están conectados
     */
    public int calcularGradoSeparacion(String origen, String destino) {
        return AlgoritmoBFS.calcularDistancia(adyacencias, origen, destino);
    }

    /**
     * Obtiene información completa de las conexiones de un usuario.
     *
     * @param username Usuario del cual obtener la información
     * @return Mapa con información de conexiones del usuario
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

        Set<String> amigosDeAmigos = obtenerAmigosDeAmigos(username);
        info.put("amigosDeAmigos", amigosDeAmigos);
        info.put("totalAmigosDeAmigos", amigosDeAmigos.size());

        return info;
    }

    /**
     * Verifica si el grafo está vacío.
     *
     * @return true si el grafo no contiene nodos, false en caso contrario
     */
    public boolean estaVacio() {
        return nodos.isEmpty();
    }

    /**
     * Obtiene una copia del mapa de adyacencias.
     *
     * @return Copia del mapa de adyacencias
     */
    public Map<String, Set<String>> getAdyacencias() {
        return new HashMap<>(adyacencias);
    }

    /**
     * Obtiene una copia de todos los nodos del grafo.
     *
     * @return Copia del mapa de nodos
     */
    public Map<String, Nodo> getNodos() {
        return new HashMap<>(nodos);
    }
}