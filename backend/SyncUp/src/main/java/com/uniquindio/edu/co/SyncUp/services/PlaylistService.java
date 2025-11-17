package com.uniquindio.edu.co.SyncUp.services;

import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.document.Usuario;
import com.uniquindio.edu.co.SyncUp.dto.CancionDTO;
import com.uniquindio.edu.co.SyncUp.repository.CancionRepository;
import com.uniquindio.edu.co.SyncUp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar la generación de playlists y recomendaciones personalizadas.
 * Proporciona funcionalidades para descubrimiento musical y análisis de preferencias.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final UsuarioRepository usuarioRepository;
    private final CancionRepository cancionRepository;

    /**
     * Genera una playlist de "Descubrimiento Semanal" basada en los géneros favoritos del usuario.
     *
     * @param username Nombre de usuario para el cual generar el descubrimiento
     * @return Lista de canciones recomendadas para descubrimiento
     * @throws RuntimeException si el usuario no existe
     */
    public List<CancionDTO> generarDescubrimientoSemanal(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Set<String> generosFavoritos = new HashSet<>();

        if (usuario.getListaFavoritos() != null && !usuario.getListaFavoritos().isEmpty()) {
            for (Cancion cancion : usuario.getListaFavoritos()) {
                if (cancion.getGenero() != null) {
                    generosFavoritos.add(cancion.getGenero());
                }
            }
        }

        if (generosFavoritos.isEmpty()) {
            generosFavoritos.addAll(Arrays.asList("Pop", "Rock", "Hip-Hop", "R&B", "Electronic"));
        }

        List<Cancion> candidatas = new ArrayList<>();
        for (String genero : generosFavoritos) {
            List<Cancion> porGenero = cancionRepository.findByGenero(genero);
            candidatas.addAll(porGenero);
        }

        Set<String> favoritasIds = usuario.getListaFavoritos().stream()
                .map(Cancion::getSongId)
                .collect(Collectors.toSet());

        List<Cancion> descubrimiento = candidatas.stream()
                .filter(c -> !favoritasIds.contains(c.getSongId()))
                .distinct()
                .collect(Collectors.toList());

        Collections.shuffle(descubrimiento);
        descubrimiento = descubrimiento.stream()
                .limit(30)
                .collect(Collectors.toList());

        return descubrimiento.stream()
                .map(this::convertirCancionADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene mixes organizados por género basados en las preferencias del usuario.
     *
     * @param username Nombre de usuario para el cual generar los mixes
     * @return Mapa de géneros a listas de canciones recomendadas
     * @throws RuntimeException si el usuario no existe
     */
    public Map<String, List<CancionDTO>> obtenerMixesPorGenero(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Map<String, Integer> conteoPorGenero = new HashMap<>();

        if (usuario.getListaFavoritos() != null) {
            for (Cancion cancion : usuario.getListaFavoritos()) {
                String genero = cancion.getGenero();
                if (genero != null) {
                    conteoPorGenero.put(genero, conteoPorGenero.getOrDefault(genero, 0) + 1);
                }
            }
        }

        List<String> topGeneros = conteoPorGenero.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(6)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        if (topGeneros.isEmpty()) {
            topGeneros = Arrays.asList("Pop", "Rock", "Hip-Hop", "Reggae", "Electrónica", "R&B");
        }

        Map<String, List<CancionDTO>> mixes = new HashMap<>();
        for (String genero : topGeneros) {
            List<Cancion> canciones = cancionRepository.findByGenero(genero);
            Collections.shuffle(canciones);

            List<CancionDTO> mix = canciones.stream()
                    .limit(20)
                    .map(this::convertirCancionADTO)
                    .collect(Collectors.toList());

            mixes.put(genero, mix);
        }

        return mixes;
    }

    /**
     * Obtiene las canciones más recientemente agregadas a favoritos por el usuario.
     *
     * @param username Nombre de usuario del cual obtener las canciones recientes
     * @param limite Número máximo de canciones a retornar
     * @return Lista de canciones recientes en formato DTO
     * @throws RuntimeException si el usuario no existe
     */
    public List<CancionDTO> obtenerCancionesRecientes(String username, int limite) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getListaFavoritos() == null || usuario.getListaFavoritos().isEmpty()) {
            return Collections.emptyList();
        }

        List<Cancion> recientes = new ArrayList<>(usuario.getListaFavoritos());
        Collections.reverse(recientes);

        List<CancionDTO> resultado = recientes.stream()
                .limit(limite)
                .map(this::convertirCancionADTO)
                .collect(Collectors.toList());

        return resultado;
    }

    /**
     * Obtiene recomendaciones personalizadas basadas en las preferencias del usuario.
     *
     * @param username Nombre de usuario para el cual generar recomendaciones
     * @param limite Número máximo de recomendaciones a retornar
     * @return Lista de canciones recomendadas en formato DTO
     * @throws RuntimeException si el usuario no existe
     */
    public List<CancionDTO> obtenerRecomendaciones(String username, int limite) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Set<String> generosFavoritos = new HashSet<>();
        Set<String> artistasFavoritos = new HashSet<>();

        if (usuario.getListaFavoritos() != null) {
            for (Cancion cancion : usuario.getListaFavoritos()) {
                if (cancion.getGenero() != null) {
                    generosFavoritos.add(cancion.getGenero());
                }
                if (cancion.getArtista() != null) {
                    artistasFavoritos.add(cancion.getArtista().getArtistId());
                }
            }
        }

        if (usuario.getArtistasFavoritos() != null) {
            usuario.getArtistasFavoritos().forEach(artista ->
                    artistasFavoritos.add(artista.getArtistId())
            );
        }

        List<Cancion> recomendaciones = new ArrayList<>();

        for (String genero : generosFavoritos) {
            recomendaciones.addAll(cancionRepository.findByGenero(genero));
        }

        for (String artistaId : artistasFavoritos) {
            recomendaciones.addAll(cancionRepository.findByArtistaId(artistaId));
        }

        Set<String> favoritasIds = usuario.getListaFavoritos().stream()
                .map(Cancion::getSongId)
                .collect(Collectors.toSet());

        List<Cancion> resultado = recomendaciones.stream()
                .filter(c -> !favoritasIds.contains(c.getSongId()))
                .distinct()
                .collect(Collectors.toList());

        Collections.shuffle(resultado);

        List<CancionDTO> recomendacionesDTO = resultado.stream()
                .limit(limite)
                .map(this::convertirCancionADTO)
                .collect(Collectors.toList());

        return recomendacionesDTO;
    }

    /**
     * Obtiene los artistas más escuchados por el usuario basado en sus canciones favoritas.
     *
     * @param username Nombre de usuario del cual obtener los artistas populares
     * @param limite Número máximo de artistas a retornar
     * @return Lista de artistas populares con información de conteo
     * @throws RuntimeException si el usuario no existe
     */
    public List<Map<String, Object>> obtenerArtistasPopulares(String username, int limite) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Map<String, Integer> conteoArtistas = new HashMap<>();
        Map<String, String> nombresArtistas = new HashMap<>();
        Map<String, String> imagenesArtistas = new HashMap<>();

        if (usuario.getListaFavoritos() != null) {
            for (Cancion cancion : usuario.getListaFavoritos()) {
                if (cancion.getArtista() != null) {
                    String artistaId = cancion.getArtista().getArtistId();
                    conteoArtistas.put(artistaId, conteoArtistas.getOrDefault(artistaId, 0) + 1);
                    nombresArtistas.put(artistaId, cancion.getArtista().getNombre());

                    if (cancion.getArtista().getImagenUrl() != null) {
                        imagenesArtistas.put(artistaId, cancion.getArtista().getImagenUrl());
                    }
                }
            }
        }

        List<Map<String, Object>> topArtistas = conteoArtistas.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(limite)
                .map(entry -> {
                    Map<String, Object> artista = new HashMap<>();
                    artista.put("artistaId", entry.getKey());
                    artista.put("nombre", nombresArtistas.get(entry.getKey()));
                    artista.put("canciones", entry.getValue());
                    artista.put("imagenUrl", imagenesArtistas.get(entry.getKey()));
                    return artista;
                })
                .collect(Collectors.toList());

        return topArtistas;
    }

    /**
     * Convierte una entidad Cancion a un DTO CancionDTO.
     *
     * @param cancion Entidad Cancion a convertir
     * @return DTO CancionDTO convertido
     */
    private CancionDTO convertirCancionADTO(Cancion cancion) {
        CancionDTO.CancionDTOBuilder builder = CancionDTO.builder()
                .songId(cancion.getSongId())
                .titulo(cancion.getTitulo())
                .genero(cancion.getGenero())
                .anio(cancion.getAnio())
                .duracion(cancion.getDuracion())
                .imagenUrl(cancion.getImagenUrl())
                .musica(cancion.getMusica());

        if (cancion.getArtista() != null) {
            builder.artistaId(cancion.getArtista().getArtistId());
            builder.artistaNombre(cancion.getArtista().getNombre());
        }

        if (cancion.getAlbum() != null) {
            builder.albumId(cancion.getAlbum().getId());
            builder.albumNombre(cancion.getAlbum().getNombre());
        }

        return builder.build();
    }
}