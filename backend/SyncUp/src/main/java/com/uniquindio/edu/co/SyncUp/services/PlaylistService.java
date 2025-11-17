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

@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final UsuarioRepository usuarioRepository;
    private final CancionRepository cancionRepository;

    /**
     * Generar "Descubrimiento Semanal" basado en géneros favoritos
     */
    public List<CancionDTO> generarDescubrimientoSemanal(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Obtener géneros de canciones favoritas
        Set<String> generosFavoritos = new HashSet<>();

        if (usuario.getListaFavoritos() != null && !usuario.getListaFavoritos().isEmpty()) {
            for (Cancion cancion : usuario.getListaFavoritos()) {
                if (cancion.getGenero() != null) {
                    generosFavoritos.add(cancion.getGenero());
                }
            }
        }

        // Si no tiene favoritas, usar géneros populares
        if (generosFavoritos.isEmpty()) {
            generosFavoritos.addAll(Arrays.asList("Pop", "Rock", "Hip-Hop", "R&B", "Electronic"));
        }

        System.out.println("🎵 Géneros favoritos del usuario: " + generosFavoritos);

        // Buscar canciones de esos géneros que NO estén en favoritas
        List<Cancion> candidatas = new ArrayList<>();
        for (String genero : generosFavoritos) {
            List<Cancion> porGenero = cancionRepository.findByGenero(genero);
            candidatas.addAll(porGenero);
        }

        // Obtener IDs de canciones favoritas para filtrar
        Set<String> favoritasIds = usuario.getListaFavoritos().stream()
                .map(Cancion::getSongId)
                .collect(Collectors.toSet());

        // Filtrar las que ya tiene en favoritas
        List<Cancion> descubrimiento = candidatas.stream()
                .filter(c -> !favoritasIds.contains(c.getSongId()))
                .distinct()
                .collect(Collectors.toList());

        // Mezclar y limitar a 30 canciones
        Collections.shuffle(descubrimiento);
        descubrimiento = descubrimiento.stream()
                .limit(30)
                .collect(Collectors.toList());

        System.out.println("✅ Descubrimiento semanal generado: " + descubrimiento.size() + " canciones");

        return descubrimiento.stream()
                .map(this::convertirCancionADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener mixes por género basados en favoritas
     */
    public Map<String, List<CancionDTO>> obtenerMixesPorGenero(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Contar géneros en favoritas
        Map<String, Integer> conteoPorGenero = new HashMap<>();

        if (usuario.getListaFavoritos() != null) {
            for (Cancion cancion : usuario.getListaFavoritos()) {
                String genero = cancion.getGenero();
                if (genero != null) {
                    conteoPorGenero.put(genero, conteoPorGenero.getOrDefault(genero, 0) + 1);
                }
            }
        }

        // Obtener top 3 géneros
        List<String> topGeneros = conteoPorGenero.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(6)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // Si no tiene favoritas, usar géneros por defecto
        if (topGeneros.isEmpty()) {
            topGeneros = Arrays.asList("Pop", "Rock", "Hip-Hop", "Reggae", "Electrónica", "R&B");
        }

        System.out.println("🎵 Top géneros del usuario: " + topGeneros);

        // Crear mixes por género
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
     * Obtener canciones escuchadas recientemente (últimas favoritas agregadas)
     */
    public List<CancionDTO> obtenerCancionesRecientes(String username, int limite) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getListaFavoritos() == null || usuario.getListaFavoritos().isEmpty()) {
            System.out.println("⚠️ Usuario no tiene canciones favoritas");
            return Collections.emptyList();
        }

        // LinkedList permite acceso eficiente al final (últimas agregadas)
        List<Cancion> recientes = new ArrayList<>(usuario.getListaFavoritos());

        // Invertir para obtener las más recientes primero
        Collections.reverse(recientes);

        List<CancionDTO> resultado = recientes.stream()
                .limit(limite)
                .map(this::convertirCancionADTO)
                .collect(Collectors.toList());

        System.out.println("✅ Canciones recientes: " + resultado.size());

        return resultado;
    }

    /**
     * Obtener recomendaciones basadas en favoritas y artistas favoritos
     */
    public List<CancionDTO> obtenerRecomendaciones(String username, int limite) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Set<String> generosFavoritos = new HashSet<>();
        Set<String> artistasFavoritos = new HashSet<>();

        // Analizar canciones favoritas
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

        // Agregar artistas favoritos del usuario
        if (usuario.getArtistasFavoritos() != null) {
            usuario.getArtistasFavoritos().forEach(artista ->
                    artistasFavoritos.add(artista.getArtistId())
            );
        }

        System.out.println("🎵 Géneros para recomendaciones: " + generosFavoritos);
        System.out.println("🎵 Artistas para recomendaciones: " + artistasFavoritos.size());

        // Buscar recomendaciones
        List<Cancion> recomendaciones = new ArrayList<>();

        // Por género
        for (String genero : generosFavoritos) {
            recomendaciones.addAll(cancionRepository.findByGenero(genero));
        }

        // Por artista
        for (String artistaId : artistasFavoritos) {
            recomendaciones.addAll(cancionRepository.findByArtistaId(artistaId));
        }

        // Filtrar favoritas que ya tiene
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

        System.out.println("✅ Recomendaciones generadas: " + recomendacionesDTO.size());

        return recomendacionesDTO;
    }

    /**
     * Obtener artistas más escuchados (basado en canciones favoritas)
     */
    public List<Map<String, Object>> obtenerArtistasPopulares(String username, int limite) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Contar canciones por artista
        Map<String, Integer> conteoArtistas = new HashMap<>();
        Map<String, String> nombresArtistas = new HashMap<>();
        Map<String, String> imagenesArtistas = new HashMap<>();

        if (usuario.getListaFavoritos() != null) {
            for (Cancion cancion : usuario.getListaFavoritos()) {
                if (cancion.getArtista() != null) {
                    String artistaId = cancion.getArtista().getArtistId();
                    conteoArtistas.put(artistaId, conteoArtistas.getOrDefault(artistaId, 0) + 1);
                    nombresArtistas.put(artistaId, cancion.getArtista().getNombre());

                    // Guardar imagen si está disponible
                    if (cancion.getArtista().getImagenUrl() != null) {
                        imagenesArtistas.put(artistaId, cancion.getArtista().getImagenUrl());
                    }
                }
            }
        }

        // Ordenar por cantidad y tomar los top
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

        System.out.println("✅ Top artistas: " + topArtistas.size());

        return topArtistas;
    }

    /**
     * Convertir Cancion a DTO
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