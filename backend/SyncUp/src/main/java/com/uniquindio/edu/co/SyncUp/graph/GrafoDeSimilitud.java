package com.uniquindio.edu.co.SyncUp.graph;

import com.uniquindio.edu.co.SyncUp.document.Cancion;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Grafo Ponderado No Dirigido para conectar canciones similares
 */
@Component
@Data
public class GrafoDeSimilitud {

    // Estructura: Map<cancionId, Map<cancionVecinaId, pesoSimilitud>>
    // Ejemplo: {"song1": {"song2": 80, "song3": 60}, "song2": {"song1": 80}}
    private Map<String, Map<String, Integer>> grafo;

    public GrafoDeSimilitud() {
        this.grafo = new HashMap<>();
    }

    /**
     * RF-019: Agregar un nodo (canción) al grafo
     */
    public void agregarNodo(String cancionId) {
        grafo.putIfAbsent(cancionId, new HashMap<>());
    }

    /**
     * RF-021: Agregar arista en grafo NO DIRIGIDO
     * La conexión se hace en ambas direcciones
     */
    public void agregarArista(String cancionId1, String cancionId2, int peso) {
        grafo.get(cancionId1).put(cancionId2, peso);
        grafo.get(cancionId2).put(cancionId1, peso); // ← No dirigido
    }

    /**
     * Calcular similitud entre dos canciones (0-100)
     */
    /**
     * Calcular similitud entre dos canciones
     */
    public int calcularSimilitud(Cancion c1, Cancion c2) {
        int similitud = 0;

        // Mismo género (+40 puntos)
        if (c1.getGenero() != null && c2.getGenero() != null &&
                c1.getGenero().trim().equalsIgnoreCase(c2.getGenero().trim())) {
            similitud += 40;
            System.out.println("   ✓ Mismo género: " + c1.getGenero());
        }

        // Mismo artista (+30 puntos)
        if (c1.getArtista() != null && c2.getArtista() != null &&
                c1.getArtista().getArtistId() != null && c2.getArtista().getArtistId() != null &&
                c1.getArtista().getArtistId().equals(c2.getArtista().getArtistId())) {
            similitud += 30;
            System.out.println("   ✓ Mismo artista: " + c1.getArtista().getNombre());
        }

        // Mismo álbum (+20 puntos)
        if (c1.getAlbum() != null && c2.getAlbum() != null &&
                c1.getAlbum().getId() != null && c2.getAlbum().getId() != null &&
                c1.getAlbum().getId().equals(c2.getAlbum().getId())) {
            similitud += 20;
            System.out.println("   ✓ Mismo álbum: " + c1.getAlbum().getNombre());
        }

        // Año similar ±3 años (+10 puntos)
        if (c1.getAnio() > 0 && c2.getAnio() > 0 &&
                Math.abs(c1.getAnio() - c2.getAnio()) <= 3) {
            similitud += 10;
            System.out.println("   ✓ Años similares: " + c1.getAnio() + " ~ " + c2.getAnio());
        }

        if (similitud > 0) {
            System.out.println("   → Total similitud: " + similitud);
        }

        return similitud;
    }

    /**
     * Construir el grafo completo con todas las canciones
     */
    public void construirGrafo(List<Cancion> canciones) {
        grafo.clear();

        // Agregar todos los nodos
        for (Cancion cancion : canciones) {
            agregarNodo(cancion.getSongId());
        }

        int aristasCreadas = 0;
        int similitudesBajas = 0;

        // Calcular similitudes y agregar aristas
        for (int i = 0; i < canciones.size(); i++) {
            for (int j = i + 1; j < canciones.size(); j++) {
                Cancion c1 = canciones.get(i);
                Cancion c2 = canciones.get(j);

                int similitud = calcularSimilitud(c1, c2);

                // ← LOG DE DEBUG
                if (similitud > 0) {
                    System.out.println("📊 Similitud entre '" + c1.getTitulo() +
                            "' y '" + c2.getTitulo() + "': " + similitud);
                }

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
     * Obtener las N canciones más similares a una canción
     */
    public List<String> obtenerCancionesSimilares(String cancionId, int limite) {
        if (!grafo.containsKey(cancionId)) {
            return new ArrayList<>();
        }

        Map<String, Integer> vecinos = grafo.get(cancionId);

        return vecinos.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue())) // Mayor a menor
                .limit(limite)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * RF-022: Algoritmo de Dijkstra adaptado
     * Encuentra la ruta de MAYOR similitud (no menor costo)
     */
    public List<String> encontrarRutaMaximaSimilitud(String origenId, String destinoId) {
        System.out.println("   🔍 Ejecutando Dijkstra...");

        try {
            // Validaciones iniciales
            if (!grafo.containsKey(origenId)) {
                System.out.println("   ❌ Nodo origen no existe: " + origenId);
                return new ArrayList<>();
            }

            if (!grafo.containsKey(destinoId)) {
                System.out.println("   ❌ Nodo destino no existe: " + destinoId);
                return new ArrayList<>();
            }

            if (origenId.equals(destinoId)) {
                System.out.println("   ⚠️ Origen = Destino");
                return List.of(origenId);
            }

            // Estructuras de datos para Dijkstra
            Map<String, Integer> distancias = new HashMap<>();
            Map<String, String> predecesores = new HashMap<>();
            Set<String> visitados = new HashSet<>();
            PriorityQueue<NodoDistancia> cola = new PriorityQueue<>(
                    Comparator.comparingInt(nd -> -nd.similitud) // Mayor similitud primero
            );

            // Inicialización
            for (String nodo : grafo.keySet()) {
                distancias.put(nodo, Integer.MIN_VALUE);
            }
            distancias.put(origenId, 0);
            cola.offer(new NodoDistancia(origenId, 0));

            int iteraciones = 0;
            int maxIteraciones = grafo.size() * 2; // Límite de seguridad

            // Ejecutar Dijkstra
            while (!cola.isEmpty() && iteraciones < maxIteraciones) {
                iteraciones++;
                NodoDistancia actual = cola.poll();
                String nodoActual = actual.nodo;

                // CRÍTICO: Si ya visitamos este nodo, lo saltamos
                if (visitados.contains(nodoActual)) {
                    continue;
                }

                // Marcar como visitado
                visitados.add(nodoActual);

                System.out.println("      [" + iteraciones + "] Visitando: " + nodoActual);

                // Si llegamos al destino, terminamos
                if (nodoActual.equals(destinoId)) {
                    System.out.println("   ✅ Destino alcanzado en " + iteraciones + " iteraciones");
                    break;
                }

                // Explorar vecinos
                Map<String, Integer> vecinos = grafo.get(nodoActual);
                if (vecinos == null || vecinos.isEmpty()) {
                    continue;
                }

                for (Map.Entry<String, Integer> entry : vecinos.entrySet()) {
                    String vecino = entry.getKey();

                    // CRÍTICO: No procesar vecinos ya visitados
                    if (visitados.contains(vecino)) {
                        continue;
                    }

                    int pesoArista = entry.getValue();
                    int nuevaSimilitud = distancias.get(nodoActual) + pesoArista;

                    // Actualizar si encontramos mejor camino
                    if (nuevaSimilitud > distancias.getOrDefault(vecino, Integer.MIN_VALUE)) {
                        distancias.put(vecino, nuevaSimilitud);
                        predecesores.put(vecino, nodoActual);
                        cola.offer(new NodoDistancia(vecino, nuevaSimilitud));
                    }
                }
            }

            // Verificar si se alcanzó el límite
            if (iteraciones >= maxIteraciones) {
                System.out.println("   ⚠️ Límite de iteraciones alcanzado");
            }

            // Reconstruir el camino desde destino hacia origen
            if (!predecesores.containsKey(destinoId) && !origenId.equals(destinoId)) {
                System.out.println("   ❌ No existe camino al destino");
                return new ArrayList<>();
            }

            List<String> ruta = new ArrayList<>();
            Set<String> nodosEnRuta = new HashSet<>();
            String actual = destinoId;
            int pasos = 0;
            int maxPasos = grafo.size(); // Máximo posible = número de nodos

            // Reconstruir ruta
            while (actual != null && pasos < maxPasos) {
                // CRÍTICO: Detectar ciclos durante reconstrucción
                if (nodosEnRuta.contains(actual)) {
                    System.out.println("   ❌ CICLO DETECTADO en reconstrucción: " + actual);
                    return new ArrayList<>();
                }

                ruta.add(0, actual); // Agregar al inicio
                nodosEnRuta.add(actual);
                actual = predecesores.get(actual);
                pasos++;

                // Si llegamos al origen, terminamos
                if (ruta.get(0).equals(origenId)) {
                    break;
                }
            }

            // Validaciones finales
            if (ruta.size() < 2) {
                System.out.println("   ⚠️ Ruta inválida: menos de 2 nodos");
                return new ArrayList<>();
            }

            if (!ruta.get(0).equals(origenId)) {
                System.out.println("   ⚠️ Ruta no inicia en origen");
                return new ArrayList<>();
            }

            if (!ruta.get(ruta.size() - 1).equals(destinoId)) {
                System.out.println("   ⚠️ Ruta no termina en destino");
                return new ArrayList<>();
            }

            // Verificar que no haya duplicados
            Set<String> rutaSet = new HashSet<>(ruta);
            if (rutaSet.size() != ruta.size()) {
                System.out.println("   ❌ ERROR: Ruta contiene duplicados");
                return new ArrayList<>();
            }

            System.out.println("   ✅ Ruta válida construida: " + ruta.size() + " nodos");

            return ruta;

        } catch (Exception e) {
            System.err.println("   ❌ ERROR EN DIJKSTRA: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * Obtener estadísticas del grafo
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
     * Contar el número total de aristas
     */
    private int contarAristas() {
        return grafo.values().stream()
                .mapToInt(Map::size)
                .sum() / 2; // Dividir por 2 porque es no dirigido
    }

    /**
     * Clase auxiliar para el algoritmo de Dijkstra
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