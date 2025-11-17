package com.uniquindio.edu.co.SyncUp.graph;

import com.uniquindio.edu.co.SyncUp.document.Cancion;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Grafo Ponderado No Dirigido para conectar canciones similares.
 * Implementa algoritmos de similitud y búsqueda de rutas entre canciones.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Component
@Data
public class GrafoDeSimilitud {

    /**
     * Estructura del grafo: Map<cancionId, Map<cancionVecinaId, pesoSimilitud>>
     */
    private Map<String, Map<String, Integer>> grafo;

    /**
     * Constructor que inicializa el grafo vacío.
     */
    public GrafoDeSimilitud() {
        this.grafo = new HashMap<>();
    }

    /**
     * Agrega un nodo (canción) al grafo.
     *
     * @param cancionId Identificador único de la canción
     */
    public void agregarNodo(String cancionId) {
        grafo.putIfAbsent(cancionId, new HashMap<>());
    }

    /**
     * Agrega una arista no dirigida entre dos canciones con un peso de similitud.
     *
     * @param cancionId1 Identificador de la primera canción
     * @param cancionId2 Identificador de la segunda canción
     * @param peso Peso de similitud entre las canciones
     */
    public void agregarArista(String cancionId1, String cancionId2, int peso) {
        grafo.get(cancionId1).put(cancionId2, peso);
        grafo.get(cancionId2).put(cancionId1, peso);
    }

    /**
     * Calcula la similitud entre dos canciones basada en diferentes criterios.
     *
     * @param c1 Primera canción a comparar
     * @param c2 Segunda canción a comparar
     * @return Puntuación de similitud entre 0 y 100
     */
    public int calcularSimilitud(Cancion c1, Cancion c2) {
        int similitud = 0;

        if (c1.getGenero() != null && c2.getGenero() != null &&
                c1.getGenero().trim().equalsIgnoreCase(c2.getGenero().trim())) {
            similitud += 40;
        }

        if (c1.getArtista() != null && c2.getArtista() != null &&
                c1.getArtista().getArtistId() != null && c2.getArtista().getArtistId() != null &&
                c1.getArtista().getArtistId().equals(c2.getArtista().getArtistId())) {
            similitud += 30;
        }

        if (c1.getAlbum() != null && c2.getAlbum() != null &&
                c1.getAlbum().getId() != null && c2.getAlbum().getId() != null &&
                c1.getAlbum().getId().equals(c2.getAlbum().getId())) {
            similitud += 20;
        }

        if (c1.getAnio() > 0 && c2.getAnio() > 0 &&
                Math.abs(c1.getAnio() - c2.getAnio()) <= 3) {
            similitud += 10;
        }

        return similitud;
    }

    /**
     * Construye el grafo completo con todas las canciones proporcionadas.
     *
     * @param canciones Lista de todas las canciones a incluir en el grafo
     */
    public void construirGrafo(List<Cancion> canciones) {
        grafo.clear();

        for (Cancion cancion : canciones) {
            agregarNodo(cancion.getSongId());
        }

        int aristasCreadas = 0;
        int similitudesBajas = 0;

        for (int i = 0; i < canciones.size(); i++) {
            for (int j = i + 1; j < canciones.size(); j++) {
                Cancion c1 = canciones.get(i);
                Cancion c2 = canciones.get(j);

                int similitud = calcularSimilitud(c1, c2);

                if (similitud >= 10) {
                    agregarArista(c1.getSongId(), c2.getSongId(), similitud);
                    aristasCreadas++;
                } else if (similitud > 0) {
                    similitudesBajas++;
                }
            }
        }
    }

    /**
     * Obtiene las N canciones más similares a una canción específica.
     *
     * @param cancionId Identificador de la canción de referencia
     * @param limite Número máximo de canciones similares a retornar
     * @return Lista de identificadores de canciones similares ordenadas por similitud
     */
    public List<String> obtenerCancionesSimilares(String cancionId, int limite) {
        if (!grafo.containsKey(cancionId)) {
            return new ArrayList<>();
        }

        Map<String, Integer> vecinos = grafo.get(cancionId);

        return vecinos.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(limite)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Encuentra la ruta de máxima similitud entre dos canciones usando Dijkstra.
     *
     * @param origenId Identificador de la canción de origen
     * @param destinoId Identificador de la canción de destino
     * @return Lista ordenada de canciones que forman la ruta de máxima similitud
     */
    public List<String> encontrarRutaMaximaSimilitud(String origenId, String destinoId) {
        try {
            if (!grafo.containsKey(origenId)) {
                return new ArrayList<>();
            }

            if (!grafo.containsKey(destinoId)) {
                return new ArrayList<>();
            }

            if (origenId.equals(destinoId)) {
                return List.of(origenId);
            }

            Map<String, Integer> distancias = new HashMap<>();
            Map<String, String> predecesores = new HashMap<>();
            Set<String> visitados = new HashSet<>();
            PriorityQueue<NodoDistancia> cola = new PriorityQueue<>(
                    Comparator.comparingInt(nd -> -nd.similitud)
            );

            for (String nodo : grafo.keySet()) {
                distancias.put(nodo, Integer.MIN_VALUE);
            }
            distancias.put(origenId, 0);
            cola.offer(new NodoDistancia(origenId, 0));

            int iteraciones = 0;
            int maxIteraciones = grafo.size() * 2;

            while (!cola.isEmpty() && iteraciones < maxIteraciones) {
                iteraciones++;
                NodoDistancia actual = cola.poll();
                String nodoActual = actual.nodo;

                if (visitados.contains(nodoActual)) {
                    continue;
                }

                visitados.add(nodoActual);

                if (nodoActual.equals(destinoId)) {
                    break;
                }

                Map<String, Integer> vecinos = grafo.get(nodoActual);
                if (vecinos == null || vecinos.isEmpty()) {
                    continue;
                }

                for (Map.Entry<String, Integer> entry : vecinos.entrySet()) {
                    String vecino = entry.getKey();

                    if (visitados.contains(vecino)) {
                        continue;
                    }

                    int pesoArista = entry.getValue();
                    int nuevaSimilitud = distancias.get(nodoActual) + pesoArista;

                    if (nuevaSimilitud > distancias.getOrDefault(vecino, Integer.MIN_VALUE)) {
                        distancias.put(vecino, nuevaSimilitud);
                        predecesores.put(vecino, nodoActual);
                        cola.offer(new NodoDistancia(vecino, nuevaSimilitud));
                    }
                }
            }

            if (!predecesores.containsKey(destinoId) && !origenId.equals(destinoId)) {
                return new ArrayList<>();
            }

            List<String> ruta = new ArrayList<>();
            Set<String> nodosEnRuta = new HashSet<>();
            String actual = destinoId;
            int pasos = 0;
            int maxPasos = grafo.size();

            while (actual != null && pasos < maxPasos) {
                if (nodosEnRuta.contains(actual)) {
                    return new ArrayList<>();
                }

                ruta.add(0, actual);
                nodosEnRuta.add(actual);
                actual = predecesores.get(actual);
                pasos++;

                if (ruta.get(0).equals(origenId)) {
                    break;
                }
            }

            if (ruta.size() < 2) {
                return new ArrayList<>();
            }

            if (!ruta.get(0).equals(origenId)) {
                return new ArrayList<>();
            }

            if (!ruta.get(ruta.size() - 1).equals(destinoId)) {
                return new ArrayList<>();
            }

            Set<String> rutaSet = new HashSet<>(ruta);
            if (rutaSet.size() != ruta.size()) {
                return new ArrayList<>();
            }

            return ruta;

        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * Obtiene estadísticas del grafo actual.
     *
     * @return Mapa con estadísticas del grafo
     */
    public Map<String, Object> obtenerEstadisticas() {
        int totalNodos = grafo.size();
        int totalAristas = contarAristas();

        double densidad = 0;
        if (totalNodos > 1) {
            int aristasPosibles = totalNodos * (totalNodos - 1) / 2;
            densidad = (double) totalAristas / aristasPosibles;
        }

        return Map.of(
                "totalNodos", totalNodos,
                "totalAristas", totalAristas,
                "densidad", densidad,
                "descripcion", "Grafo Ponderado No Dirigido"
        );
    }

    /**
     * Cuenta el número total de aristas en el grafo.
     *
     * @return Número total de aristas
     */
    private int contarAristas() {
        return grafo.values().stream()
                .mapToInt(Map::size)
                .sum() / 2;
    }

    /**
     * Clase auxiliar para representar un nodo con su similitud acumulada.
     */
    @Data
    private static class NodoDistancia {
        String nodo;
        int similitud;

        public NodoDistancia(String nodo, int similitud) {
            this.nodo = nodo;
            this.similitud = similitud;
        }
    }
}