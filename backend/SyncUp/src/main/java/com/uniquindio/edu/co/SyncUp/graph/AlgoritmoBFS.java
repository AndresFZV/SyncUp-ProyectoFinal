package com.uniquindio.edu.co.SyncUp.graph;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.*;

/**
 * Implementación del algoritmo BFS (Breadth-First Search)
 * para recorrer el grafo social
 */
public class AlgoritmoBFS {

    /**
     * Resultado de un recorrido BFS
     */
    @Data
    @AllArgsConstructor
    public static class ResultadoBFS {
        private Map<String, Integer> distancias;      // Distancia desde origen
        private Map<String, String> predecesores;     // Para reconstruir caminos
        private Map<Integer, Set<String>> niveles;    // Usuarios por nivel
    }

    /**
     * Ejecutar BFS desde un nodo origen
     *
     * @param grafo Mapa de adyacencias del grafo
     * @param origen Username del nodo origen
     * @param maxNivel Profundidad máxima del recorrido
     * @return Resultado del BFS con distancias y niveles
     */
    public static ResultadoBFS ejecutarBFS(Map<String, Set<String>> grafo,
                                           String origen,
                                           int maxNivel) {

        // Estructuras para el resultado
        Map<String, Integer> distancias = new HashMap<>();
        Map<String, String> predecesores = new HashMap<>();
        Map<Integer, Set<String>> niveles = new HashMap<>();

        // Verificar que el origen existe
        if (!grafo.containsKey(origen)) {
            return new ResultadoBFS(distancias, predecesores, niveles);
        }

        // Cola para BFS
        Queue<String> cola = new LinkedList<>();
        Set<String> visitados = new HashSet<>();

        // Inicializar con el origen
        cola.offer(origen);
        visitados.add(origen);
        distancias.put(origen, 0);
        predecesores.put(origen, null);

        // Inicializar nivel 0
        niveles.put(0, new HashSet<>());
        niveles.get(0).add(origen);

        // Recorrido BFS
        while (!cola.isEmpty()) {
            String actual = cola.poll();
            int distanciaActual = distancias.get(actual);

            // Límite de profundidad
            if (distanciaActual >= maxNivel) {
                continue;
            }

            // Obtener vecinos del nodo actual
            Set<String> vecinos = grafo.getOrDefault(actual, new HashSet<>());

            for (String vecino : vecinos) {
                if (!visitados.contains(vecino)) {
                    visitados.add(vecino);
                    int nuevaDistancia = distanciaActual + 1;

                    distancias.put(vecino, nuevaDistancia);
                    predecesores.put(vecino, actual);
                    cola.offer(vecino);

                    // Agregar al nivel correspondiente
                    niveles.putIfAbsent(nuevaDistancia, new HashSet<>());
                    niveles.get(nuevaDistancia).add(vecino);
                }
            }
        }

        return new ResultadoBFS(distancias, predecesores, niveles);
    }

    /**
     * Obtener usuarios a una distancia específica (nivel)
     *
     * @param grafo Mapa de adyacencias
     * @param origen Username origen
     * @param nivel Nivel deseado (1 = amigos, 2 = amigos de amigos)
     * @return Set de usernames en ese nivel
     */
    public static Set<String> obtenerUsuariosEnNivel(Map<String, Set<String>> grafo,
                                                     String origen,
                                                     int nivel) {
        ResultadoBFS resultado = ejecutarBFS(grafo, origen, nivel);
        return resultado.getNiveles().getOrDefault(nivel, new HashSet<>());
    }

    /**
     * Encontrar el camino más corto entre dos usuarios
     *
     * @param grafo Mapa de adyacencias
     * @param origen Username origen
     * @param destino Username destino
     * @return Lista ordenada del camino, o null si no existe
     */
    public static List<String> encontrarCaminoMasCorto(Map<String, Set<String>> grafo,
                                                       String origen,
                                                       String destino) {

        ResultadoBFS resultado = ejecutarBFS(grafo, origen, Integer.MAX_VALUE);

        // Verificar si existe camino
        if (!resultado.getDistancias().containsKey(destino)) {
            return null;
        }

        // Reconstruir camino desde destino hasta origen
        List<String> camino = new ArrayList<>();
        String actual = destino;

        while (actual != null) {
            camino.add(actual);
            actual = resultado.getPredecesores().get(actual);
        }

        // Invertir para tener el camino de origen a destino
        Collections.reverse(camino);
        return camino;
    }

    /**
     * Calcular la distancia (grado de separación) entre dos usuarios
     *
     * @param grafo Mapa de adyacencias
     * @param origen Username origen
     * @param destino Username destino
     * @return Distancia, o -1 si no están conectados
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
     * Obtener todos los usuarios alcanzables desde un origen
     *
     * @param grafo Mapa de adyacencias
     * @param origen Username origen
     * @param maxDistancia Distancia máxima
     * @return Set de usernames alcanzables
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