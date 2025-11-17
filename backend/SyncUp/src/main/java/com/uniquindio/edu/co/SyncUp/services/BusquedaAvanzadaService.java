package com.uniquindio.edu.co.SyncUp.services;

import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.document.Usuario;
import com.uniquindio.edu.co.SyncUp.dto.BusquedaAvanzadaDTO;
import com.uniquindio.edu.co.SyncUp.dto.ResultadoBusquedaAvanzadaDTO;
import com.uniquindio.edu.co.SyncUp.dto.UsuarioDTO;
import com.uniquindio.edu.co.SyncUp.repository.AlbumRepository;
import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository;
import com.uniquindio.edu.co.SyncUp.repository.CancionRepository;
import com.uniquindio.edu.co.SyncUp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar búsquedas avanzadas con soporte para concurrencia.
 * Proporciona funcionalidades de búsqueda combinando múltiples criterios y tipos de entidades.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class BusquedaAvanzadaService {

    private final CancionRepository cancionRepository;
    private final ArtistaRepository artistaRepository;
    private final AlbumRepository albumRepository;
    private final UsuarioRepository usuarioRepository;
    private final TrieService trieService;

    /**
     * Realiza una búsqueda avanzada con múltiples criterios y concurrencia.
     *
     * @param criterios DTO con los criterios de búsqueda
     * @return Resultado de la búsqueda con métricas de rendimiento
     */
    public ResultadoBusquedaAvanzadaDTO busquedaAvanzada(BusquedaAvanzadaDTO criterios) {
        long inicio = System.currentTimeMillis();
        Map<String, Long> tiemposPorHilo = new HashMap<>();

        System.out.println("Búsqueda avanzada iniciada");
        System.out.println("   Query: " + criterios.getQuery());
        System.out.println("   Artista: " + criterios.getArtista());
        System.out.println("   Género: " + criterios.getGenero());
        System.out.println("   Lógica: " + criterios.getLogica());

        try {
            CompletableFuture<List<Cancion>> cancionesFuture =
                    buscarCancionesAsync(criterios, tiemposPorHilo);

            CompletableFuture<List<Artista>> artistasFuture =
                    buscarArtistasAsync(criterios, tiemposPorHilo);

            CompletableFuture<List<Album>> albumsFuture =
                    buscarAlbumsAsync(criterios, tiemposPorHilo);

            CompletableFuture<List<UsuarioDTO>> usuariosFuture =
                    buscarUsuariosAsync(criterios, tiemposPorHilo);

            CompletableFuture.allOf(cancionesFuture, artistasFuture, albumsFuture, usuariosFuture).join();

            List<Cancion> canciones = cancionesFuture.join();
            List<Artista> artistas = artistasFuture.join();
            List<Album> albums = albumsFuture.join();
            List<UsuarioDTO> usuarios = usuariosFuture.join();

            long fin = System.currentTimeMillis();
            long tiempoTotal = fin - inicio;

            System.out.println("Búsqueda completada en " + tiempoTotal + "ms");
            System.out.println("   Canciones: " + canciones.size());
            System.out.println("   Artistas: " + artistas.size());
            System.out.println("   Álbumes: " + albums.size());
            System.out.println("   Usuarios: " + usuarios.size());
            System.out.println("   Hilos utilizados: " + tiemposPorHilo.size());

            return ResultadoBusquedaAvanzadaDTO.builder()
                    .canciones(canciones)
                    .artistas(artistas)
                    .albums(albums)
                    .usuarios(usuarios)
                    .totalResultados(canciones.size() + artistas.size() + albums.size() + usuarios.size())
                    .tiempoBusqueda(tiempoTotal)
                    .tiemposPorHilo(tiemposPorHilo)
                    .hilosUtilizados(tiemposPorHilo.size())
                    .build();

        } catch (Exception e) {
            System.err.println("Error en búsqueda avanzada: " + e.getMessage());
            e.printStackTrace();

            return ResultadoBusquedaAvanzadaDTO.builder()
                    .canciones(new ArrayList<>())
                    .artistas(new ArrayList<>())
                    .albums(new ArrayList<>())
                    .usuarios(new ArrayList<>())
                    .totalResultados(0)
                    .tiempoBusqueda(System.currentTimeMillis() - inicio)
                    .build();
        }
    }

    /**
     * Busca canciones de forma asíncrona según los criterios especificados.
     *
     * @param criterios Criterios de búsqueda
     * @param tiemposPorHilo Mapa para registrar tiempos de ejecución
     * @return Future con la lista de canciones encontradas
     */
    @Async("searchTaskExecutor")
    public CompletableFuture<List<Cancion>> buscarCancionesAsync(
            BusquedaAvanzadaDTO criterios,
            Map<String, Long> tiemposPorHilo) {

        String threadName = Thread.currentThread().getName();
        long inicioHilo = System.currentTimeMillis();

        System.out.println("[" + threadName + "] Buscando canciones...");

        List<Cancion> resultado = buscarCanciones(criterios);

        long finHilo = System.currentTimeMillis();
        tiemposPorHilo.put(threadName + "-canciones", finHilo - inicioHilo);

        System.out.println("[" + threadName + "] Canciones: " + resultado.size() +
                " (" + (finHilo - inicioHilo) + "ms)");

        return CompletableFuture.completedFuture(resultado);
    }

    /**
     * Busca artistas de forma asíncrona según los criterios especificados.
     *
     * @param criterios Criterios de búsqueda
     * @param tiemposPorHilo Mapa para registrar tiempos de ejecución
     * @return Future con la lista de artistas encontrados
     */
    @Async("searchTaskExecutor")
    public CompletableFuture<List<Artista>> buscarArtistasAsync(
            BusquedaAvanzadaDTO criterios,
            Map<String, Long> tiemposPorHilo) {

        String threadName = Thread.currentThread().getName();
        long inicioHilo = System.currentTimeMillis();

        System.out.println("[" + threadName + "] Buscando artistas...");

        List<Artista> resultado = buscarArtistas(criterios);

        long finHilo = System.currentTimeMillis();
        tiemposPorHilo.put(threadName + "-artistas", finHilo - inicioHilo);

        System.out.println("[" + threadName + "] Artistas: " + resultado.size() +
                " (" + (finHilo - inicioHilo) + "ms)");

        return CompletableFuture.completedFuture(resultado);
    }

    /**
     * Busca álbumes de forma asíncrona según los criterios especificados.
     *
     * @param criterios Criterios de búsqueda
     * @param tiemposPorHilo Mapa para registrar tiempos de ejecución
     * @return Future con la lista de álbumes encontrados
     */
    @Async("searchTaskExecutor")
    public CompletableFuture<List<Album>> buscarAlbumsAsync(
            BusquedaAvanzadaDTO criterios,
            Map<String, Long> tiemposPorHilo) {

        String threadName = Thread.currentThread().getName();
        long inicioHilo = System.currentTimeMillis();

        System.out.println("[" + threadName + "] Buscando álbumes...");

        List<Album> resultado = buscarAlbums(criterios);

        long finHilo = System.currentTimeMillis();
        tiemposPorHilo.put(threadName + "-albums", finHilo - inicioHilo);

        System.out.println("[" + threadName + "] Álbumes: " + resultado.size() +
                " (" + (finHilo - inicioHilo) + "ms)");

        return CompletableFuture.completedFuture(resultado);
    }

    /**
     * Busca usuarios de forma asíncrona según los criterios especificados.
     *
     * @param criterios Criterios de búsqueda
     * @param tiemposPorHilo Mapa para registrar tiempos de ejecución
     * @return Future con la lista de usuarios encontrados
     */
    @Async("searchTaskExecutor")
    public CompletableFuture<List<UsuarioDTO>> buscarUsuariosAsync(
            BusquedaAvanzadaDTO criterios,
            Map<String, Long> tiemposPorHilo) {

        String threadName = Thread.currentThread().getName();
        long inicioHilo = System.currentTimeMillis();

        System.out.println("[" + threadName + "] Buscando usuarios...");

        List<UsuarioDTO> resultado = buscarUsuarios(criterios);

        long finHilo = System.currentTimeMillis();
        tiemposPorHilo.put(threadName + "-usuarios", finHilo - inicioHilo);

        System.out.println("[" + threadName + "] Usuarios: " + resultado.size() +
                " (" + (finHilo - inicioHilo) + "ms)");

        return CompletableFuture.completedFuture(resultado);
    }

    /**
     * Busca canciones según los criterios especificados.
     *
     * @param criterios Criterios de búsqueda
     * @return Lista de canciones que cumplen con los criterios
     */
    private List<Cancion> buscarCanciones(BusquedaAvanzadaDTO criterios) {
        List<Cancion> canciones;

        if (criterios.tieneQuery()) {
            Map<String, Set<String>> entidades =
                    trieService.getTrie().buscarEntidadesPorPrefijo(criterios.getQuery());

            canciones = entidades.get("canciones").stream()
                    .map(id -> cancionRepository.findById(id).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } else {
            canciones = cancionRepository.findAll();
        }

        if (criterios.tieneFiltros()) {
            if (criterios.esAND()) {
                canciones = aplicarFiltrosAND(canciones, criterios);
            } else {
                canciones = aplicarFiltrosOR(canciones, criterios);
            }
        }

        int limite = criterios.getLimite() != null ? criterios.getLimite() : 50;
        return canciones.stream().limit(limite).collect(Collectors.toList());
    }

    /**
     * Aplica filtros con lógica AND a la lista de canciones.
     *
     * @param canciones Lista de canciones a filtrar
     * @param criterios Criterios de filtrado
     * @return Lista de canciones filtradas
     */
    private List<Cancion> aplicarFiltrosAND(List<Cancion> canciones, BusquedaAvanzadaDTO criterios) {
        return canciones.stream()
                .filter(c -> {
                    boolean cumple = true;

                    if (criterios.getArtista() != null && !criterios.getArtista().isEmpty()) {
                        cumple = cumple && c.getArtista() != null &&
                                c.getArtista().getNombre().toLowerCase()
                                        .contains(criterios.getArtista().toLowerCase());
                    }

                    if (criterios.getGenero() != null && !criterios.getGenero().isEmpty()) {
                        cumple = cumple && c.getGenero() != null &&
                                c.getGenero().toLowerCase()
                                        .contains(criterios.getGenero().toLowerCase());
                    }

                    if (criterios.getAnioMin() != null) {
                        cumple = cumple && c.getAnio() >= criterios.getAnioMin();
                    }

                    if (criterios.getAnioMax() != null) {
                        cumple = cumple && c.getAnio() <= criterios.getAnioMax();
                    }

                    return cumple;
                })
                .collect(Collectors.toList());
    }

    /**
     * Aplica filtros con lógica OR a la lista de canciones.
     *
     * @param canciones Lista de canciones a filtrar
     * @param criterios Criterios de filtrado
     * @return Lista de canciones filtradas
     */
    private List<Cancion> aplicarFiltrosOR(List<Cancion> canciones, BusquedaAvanzadaDTO criterios) {
        return canciones.stream()
                .filter(c -> {
                    boolean cumple = false;

                    if (criterios.getArtista() != null && !criterios.getArtista().isEmpty()) {
                        cumple = cumple || (c.getArtista() != null &&
                                c.getArtista().getNombre().toLowerCase()
                                        .contains(criterios.getArtista().toLowerCase()));
                    }

                    if (criterios.getGenero() != null && !criterios.getGenero().isEmpty()) {
                        cumple = cumple || (c.getGenero() != null &&
                                c.getGenero().toLowerCase()
                                        .contains(criterios.getGenero().toLowerCase()));
                    }

                    if (criterios.getAnioMin() != null && criterios.getAnioMax() != null) {
                        cumple = cumple || (c.getAnio() >= criterios.getAnioMin() &&
                                c.getAnio() <= criterios.getAnioMax());
                    }

                    return cumple;
                })
                .collect(Collectors.toList());
    }

    /**
     * Busca artistas según los criterios especificados.
     *
     * @param criterios Criterios de búsqueda
     * @return Lista de artistas que cumplen con los criterios
     */
    private List<Artista> buscarArtistas(BusquedaAvanzadaDTO criterios) {
        if (!criterios.tieneQuery()) {
            return new ArrayList<>();
        }

        Map<String, Set<String>> entidades =
                trieService.getTrie().buscarEntidadesPorPrefijo(criterios.getQuery());

        return entidades.get("artistas").stream()
                .limit(criterios.getLimite() != null ? criterios.getLimite() : 20)
                .map(id -> artistaRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Busca álbumes según los criterios especificados.
     *
     * @param criterios Criterios de búsqueda
     * @return Lista de álbumes que cumplen con los criterios
     */
    private List<Album> buscarAlbums(BusquedaAvanzadaDTO criterios) {
        if (!criterios.tieneQuery()) {
            return new ArrayList<>();
        }

        Map<String, Set<String>> entidades =
                trieService.getTrie().buscarEntidadesPorPrefijo(criterios.getQuery());

        return entidades.get("albums").stream()
                .limit(criterios.getLimite() != null ? criterios.getLimite() : 20)
                .map(id -> albumRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Busca usuarios según los criterios especificados.
     *
     * @param criterios Criterios de búsqueda
     * @return Lista de usuarios que cumplen con los criterios
     */
    private List<UsuarioDTO> buscarUsuarios(BusquedaAvanzadaDTO criterios) {
        if (!criterios.tieneQuery()) {
            return new ArrayList<>();
        }

        Map<String, Set<String>> entidades =
                trieService.getTrie().buscarEntidadesPorPrefijo(criterios.getQuery());

        return entidades.get("usuarios").stream()
                .limit(criterios.getLimite() != null ? criterios.getLimite() : 20)
                .map(username -> {
                    Usuario u = usuarioRepository.findById(username).orElse(null);
                    return u != null ? UsuarioDTO.fromUsuario(u) : null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}