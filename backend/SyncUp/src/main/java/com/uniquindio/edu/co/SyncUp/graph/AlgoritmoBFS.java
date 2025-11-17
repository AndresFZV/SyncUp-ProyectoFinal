package com.uniquindio.edu.co.SyncUp.graph;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.*;

/**
 * Implementación del algoritmo BFS (Breadth-First Search) para recorrer el grafo social.
 * Proporciona funcionalidades para análisis de conexiones y caminos entre usuarios.
 *
 * @author SyncUp Team
 * @version 1.0
 */
public class AlgoritmoBFS {

    /**
     * Resultado de un recorrido BFS que contiene distancias, predecesores y niveles.
     */
    @Data
    @AllArgsConstructor
    public static class ResultadoBFS {

        /**
         * Mapa de distancias desde el nodo origen a cada nodo alcanzable.
         */
        private Map<String, Integer> distancias;

        /**
         * Mapa de predecesores para reconstruir caminos.
         */
        private Map<String, String> predecesores;

        /**
         * Mapa de usuarios organizados por nivel de distancia.
         */
        private Map<Integer, Set<String>> niveles;
    }

    /**
     * Ejecuta un recorrido BFS desde un nodo origen en el grafo.
     *
     * @param grafo Mapa de adyacencias que representa el grafo social
     * @param origen Username del nodo origen del recorrido
     * @param maxNivel Profundidad máxima del recorrido
     * @return Resultado del BFS con distancias, predecesores y niveles
     */
    public static ResultadoBFS ejecutarBFS(Map<String, Set<String>> grafo,
                                           String origen,
                                           int maxNivel) {

        Map<String, Integer> distancias = new HashMap<>();
        Map<String, String> predecesores = new HashMap<>();
        Map<Integer, Set<String>> niveles = new HashMap<>();

        if (!grafo.containsKey(origen)) {
            return new ResultadoBFS(distancias, predecesores, niveles);
        }

        Queue<String> cola = new LinkedList<>();
        Set<String> visitados = new HashSet<>();

        cola.offer(origen);
        visitados.add(origen);
        distancias.put(origen, 0);
        predecesores.put(origen, null);

        niveles.put(0, new HashSet<>());
        niveles.get(0).add(origen);

        while (!cola.isEmpty()) {
            String actual = cola.poll();
            int distanciaActual = distancias.get(actual);

            if (distanciaActual >= maxNivel) {
                continue;
            }

            Set<String> vecinos = grafo.getOrDefault(actual, new HashSet<>());

            for (String vecino : vecinos) {
                if (!visitados.contains(vecino)) {
                    visitados.add(vecino);
                    int nuevaDistancia = distanciaActual + 1;

                    distancias.put(vecino, nuevaDistancia);
                    predecesores.put(vecino, actual);
                    cola.offer(vecino);

                    niveles.putIfAbsent(nuevaDistancia, new HashSet<>());
                    niveles.get(nuevaDistancia).add(vecino);
                }
            }
        }

        return new ResultadoBFS(distancias, predecesores, niveles);
    }

    /**
     * Obtiene los usuarios a una distancia específica (nivel) del origen.
     *
     * @param grafo Mapa de adyacencias del grafo
     * @param origen Username del nodo origen
     * @param nivel Nivel deseado (1 = amigos directos, 2 = amigos de amigos)
     * @return Conjunto de usernames en el nivel especificado
     */
    public static Set<String> obtenerUsuariosEnNivel(Map<String, Set<String>> grafo,
                                                     String origen,
                                                     int nivel) {
        ResultadoBFS resultado = ejecutarBFS(grafo, origen, nivel);
        return resultado.getNiveles().getOrDefault(nivel, new HashSet<>());
    }

    /**
     * Encuentra el camino más corto entre dos usuarios en el grafo.
     *
     * @param grafo Mapa de adyacencias del grafo
     * @param origen Username del nodo origen
     * @param destino Username del nodo destino
     * @return Lista ordenada del camino más corto, o null si no existe conexión
     */
    public static List<String> encontrarCaminoMasCorto(Map<String, Set<String>> grafo,
                                                       String origen,
                                                       String destino) {

        ResultadoBFS resultado = ejecutarBFS(grafo, origen, Integer.MAX_VALUE);

        if (!resultado.getDistancias().containsKey(destino)) {
            return null;
        }

        List<String> camino = new ArrayList<>();
        String actual = destino;

        while (actual != null) {
            camino.add(actual);
            actual = resultado.getPredecesores().get(actual);
        }

        Collections.reverse(camino);
        return camino;
    }

    /**
     * Calcula la distancia (grado de separación) entre dos usuarios.
     *
     * @param grafo Mapa de adyacencias del grafo
     * @param origen Username del nodo origen
     * @param destino Username del nodo destino
     * @return Distancia entre los usuarios, o -1 si no están conectados
     */
    public static int calcularDistancia(Map<String, Set<String>> grafo,
                                        String origen,
                                        String destino) {

        if (origen.equals(destino)) {
            return 0;
        }

        ResultadoBFS resultado = ejecutarBFS(grafo, origen, Integer.MAX_VALUE);
        return resultado.getDistancias().getOrDefault(destino, -1);
    }

    /**
     * Obtiene todos los usuarios alcanzables desde un origen dentro de una distancia máxima.
     *
     * @param grafo Mapa de adyacencias del grafo
     * @param origen Username del nodo origen
     * @param maxDistancia Distancia máxima desde el origen
     * @return Conjunto de usernames alcanzables dentro de la distancia especificada
     */
    public static Set<String> obtenerUsuariosAlcanzables(Map<String, Set<String>> grafo,
                                                         String origen,
                                                         int maxDistancia) {

        ResultadoBFS resultado = ejecutarBFS(grafo, origen, maxDistancia);
        Set<String> alcanzables = new HashSet<>();

        for (Map.Entry<String, Integer> entry : resultado.getDistancias().entrySet()) {
            if (entry.getValue() > 0 && entry.getValue() <= maxDistancia) {
                alcanzables.add(entry.getKey());
            }
        }

        return alcanzables;
    }
}