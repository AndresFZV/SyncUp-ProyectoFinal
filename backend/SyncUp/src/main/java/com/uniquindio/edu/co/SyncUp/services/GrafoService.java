package com.uniquindio.edu.co.SyncUp.services;

import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.dto.CancionDTO;
import com.uniquindio.edu.co.SyncUp.graph.GrafoDeSimilitud;
import com.uniquindio.edu.co.SyncUp.repository.CancionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar las operaciones del grafo de similitud entre canciones.
 * Proporciona funcionalidades para búsqueda de canciones similares y rutas de similitud.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class GrafoService {

    private final GrafoDeSimilitud grafo;
    private final CancionRepository cancionRepository;

    /**
     * Inicializa el grafo cuando la aplicación está lista.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void inicializarGrafo() {
        System.out.println("Inicializando grafo de similitud...");
        reconstruirGrafo();
    }

    /**
     * Reconstruye el grafo completo con todas las canciones disponibles.
     */
    public void reconstruirGrafo() {
        List<Cancion> canciones = cancionRepository.findAll();
        grafo.construirGrafo(canciones);
    }

    /**
     * Obtiene canciones similares a una canción específica.
     *
     * @param cancionId Identificador de la canción de referencia
     * @param limite Número máximo de canciones similares a retornar
     * @return Lista de canciones similares en formato DTO
     */
    public List<CancionDTO> obtenerCancionesSimilares(String cancionId, int limite) {
        List<String> idsCancionesSimilares = grafo.obtenerCancionesSimilares(cancionId, limite);

        return idsCancionesSimilares.stream()
                .map(id -> cancionRepository.findById(id).orElse(null))
                .filter(cancion -> cancion != null)
                .map(this::convertirACancionDTO)
                .collect(Collectors.toList());
    }

    /**
     * Encuentra la ruta de máxima similitud entre dos canciones usando el algoritmo de Dijkstra.
     *
     * @param origenId Identificador de la canción de origen
     * @param destinoId Identificador de la canción de destino
     * @return Mapa con información de la ruta encontrada
     * @throws RuntimeException si no se encuentra una ruta válida
     */
    public Map<String, Object> encontrarRutaSimilitud(String origenId, String destinoId) {
        System.out.println("\nBUSCANDO RUTA:");
        System.out.println("   Origen: " + origenId);
        System.out.println("   Destino: " + destinoId);

        List<String> ruta = grafo.encontrarRutaMaximaSimilitud(origenId, destinoId);

        System.out.println("   Ruta encontrada: " + ruta.size() + " nodos");

        Set<String> rutaSet = new HashSet<>(ruta);
        if (rutaSet.size() != ruta.size()) {
            System.out.println("   ERROR: Ruta contiene duplicados");
            throw new RuntimeException("Error en el algoritmo: ruta con nodos duplicados");
        }

        if (ruta.size() > 100) {
            System.out.println("   Ruta demasiado larga: " + ruta.size() + " pasos");
            throw new RuntimeException("La ruta es demasiado larga. Puede haber un error.");
        }

        if (ruta.isEmpty() || ruta.size() < 2) {
            System.out.println("   No se encontró ruta válida");
            throw new RuntimeException("No se encontró una ruta entre estas canciones");
        }

        List<CancionDTO> cancionesRuta = ruta.stream()
                .map(id -> cancionRepository.findById(id).orElse(null))
                .filter(cancion -> cancion != null)
                .map(this::convertirACancionDTO)
                .collect(Collectors.toList());

        int similitudTotal = calcularSimilitudRuta(ruta);

        System.out.println("   Ruta construida:");
        for (int i = 0; i < cancionesRuta.size(); i++) {
            System.out.println("      " + (i + 1) + ". " + cancionesRuta.get(i).getTitulo());
        }
        System.out.println("   Similitud total: " + similitudTotal);

        return Map.of(
                "origen", origenId,
                "destino", destinoId,
                "cantidadPasos", ruta.size() - 1,
                "similitudTotal", similitudTotal,
                "ruta", cancionesRuta
        );
    }

    /**
     * Obtiene estadísticas del grafo actual.
     *
     * @return Mapa con estadísticas del grafo
     */
    public Map<String, Object> obtenerEstadisticas() {
        return grafo.obtenerEstadisticas();
    }

    /**
     * Calcula la similitud total de una ruta específica.
     *
     * @param ruta Lista de identificadores de canciones que forman la ruta
     * @return Puntuación total de similitud de la ruta
     */
    private int calcularSimilitudRuta(List<String> ruta) {
        int similitudTotal = 0;
        Map<String, Map<String, Integer>> grafoData = grafo.getGrafo();

        for (int i = 0; i < ruta.size() - 1; i++) {
            String actual = ruta.get(i);
            String siguiente = ruta.get(i + 1);

            if (grafoData.containsKey(actual)) {
                similitudTotal += grafoData.get(actual).getOrDefault(siguiente, 0);
            }
        }

        return similitudTotal;
    }

    /**
     * Convierte una entidad Cancion a un DTO CancionDTO.
     *
     * @param cancion Entidad Cancion a convertir
     * @return DTO CancionDTO convertido
     */
    private CancionDTO convertirACancionDTO(Cancion cancion) {
        return CancionDTO.builder()
                .songId(cancion.getSongId())
                .titulo(cancion.getTitulo())
                .genero(cancion.getGenero())
                .anio(cancion.getAnio())
                .duracion(cancion.getDuracion())
                .imagenUrl(cancion.getImagenUrl())
                .musica(cancion.getMusica())
                .artistaId(cancion.getArtista() != null ? cancion.getArtista().getArtistId() : null)
                .artistaNombre(cancion.getArtista() != null ? cancion.getArtista().getNombre() : null)
                .albumId(cancion.getAlbum() != null ? cancion.getAlbum().getId() : null)
                .albumNombre(cancion.getAlbum() != null ? cancion.getAlbum().getNombre() : null)
                .build();
    }
}