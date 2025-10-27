package com.uniquindio.edu.co.SyncUp.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.dto.CancionDTO;
import com.uniquindio.edu.co.SyncUp.dto.SolicitudCancion;
import com.uniquindio.edu.co.SyncUp.repository.AlbumRepository;
import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository;
import com.uniquindio.edu.co.SyncUp.repository.CancionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CancionService {

    private final ArtistaRepository artistaRepository; // ← Agregar
    private final AlbumRepository albumRepository; // ← Agregar
    private final CancionRepository cancionRepository;
    private final Cloudinary cloudinary;

    public Cancion addCancion(SolicitudCancion solicitud) throws IOException {
        // 1. Subir el audio a Cloudinary
        Map<String, Object> subidaAudio = cloudinary.uploader().upload(
                solicitud.getMusica().getBytes(),
                ObjectUtils.asMap("resource_type", "video")
        );

        // 2. Subir la imagen a Cloudinary
        Map<String, Object> subidaImagen = cloudinary.uploader().upload(
                solicitud.getArchivoImagen().getBytes(),
                ObjectUtils.asMap("resource_type", "image")
        );

        // 3. Obtener duración del audio y formatearla
        Double duracionSeg = (Double) subidaAudio.get("duration");
        double duracionMinutos = duracionSeg / 60.0;

        // 4. Buscar el artista por ID
        Artista artista = artistaRepository.findById(solicitud.getArtistaId())
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));

        // 5. Buscar el álbum si se proporcionó (opcional)
        // 5. Buscar el álbum si se proporcionó (opcional)
        Album album = null;
        if (solicitud.getAlbumId() != null
                && !solicitud.getAlbumId().isEmpty()
                && !solicitud.getAlbumId().equals("null")) {

            // IMPORTANTE: usar albumRepository.findById, no album.getId()
            album = albumRepository.findById(solicitud.getAlbumId())
                    .orElse(null);

            System.out.println("Álbum encontrado: " + (album != null ? album.getNombre() : "null"));
        }

        // 6. Crear la canción
        Cancion nuevaCancion = Cancion.builder()
                .titulo(solicitud.getTitulo())
                .genero(solicitud.getGenero())
                .anio(solicitud.getAnio())
                .duracion(duracionMinutos)
                .imagenUrl(subidaImagen.get("secure_url").toString())
                .musica(subidaAudio.get("secure_url").toString())
                .artista(artista)
                .album(album)
                .build();

        // 7. Guardar la canción en la BD
        Cancion cancionGuardada = cancionRepository.save(nuevaCancion);

        // 8. ACTUALIZAR RELACIONES BIDIRECCIONALES

        // Agregar canción a la lista del artista
        if (artista.getCanciones() == null) {
            artista.setCanciones(new LinkedList<>());
        }
        artista.getCanciones().add(cancionGuardada);
        artistaRepository.save(artista);

        // Agregar canción al álbum (si existe)
        if (album != null) {
            if (album.getSongIds() == null) {
                album.setSongIds(new ArrayList<>());
            }
            album.getSongIds().add(cancionGuardada.getSongId());
            albumRepository.save(album);
        }

        System.out.println("✓ Relaciones actualizadas correctamente");

        return cancionGuardada;
    }

    public List<CancionDTO> listarCanciones() {
        List<Cancion> canciones = cancionRepository.findAll();

        return canciones.stream().map(cancion -> CancionDTO.builder()
                .songId(cancion.getSongId())
                .titulo(cancion.getTitulo())
                .genero(cancion.getGenero())
                .anio(cancion.getAnio())
                .duracion(cancion.getDuracion())
                .imagenUrl(cancion.getImagenUrl())
                .musica(cancion.getMusica())
                .artistaId(cancion.getArtista() != null ? cancion.getArtista().getArtistId() : null)
                .artistaNombre(cancion.getArtista() != null ? cancion.getArtista().getNombre() : "Sin artista")
                .albumId(cancion.getAlbum() != null ? cancion.getAlbum().getId() : null)
                .albumNombre(cancion.getAlbum() != null ? cancion.getAlbum().getNombre() : "Sin álbum")
                .build()
        ).collect(Collectors.toList());
    }

    public Cancion obtenerCancion(String id) {
        return cancionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canción no encontrada"));
    }

    public Cancion agregarCancion(Cancion cancion) {
        return cancionRepository.save(cancion);
    }

    public Cancion actualizarCancion(String id, Cancion cancionActualizada) {
        Cancion cancion = cancionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canción no encontrada"));

        cancion.setTitulo(cancionActualizada.getTitulo());
        cancion.setArtista(cancionActualizada.getArtista());
        cancion.setAlbum(cancionActualizada.getAlbum());
        cancion.setGenero(cancionActualizada.getGenero());
        cancion.setDuracion(cancionActualizada.getDuracion());
        cancion.setAnio(cancionActualizada.getAnio());

        return cancionRepository.save(cancion);
    }

    public void eliminarCancion(String id) {
        Cancion cancion = cancionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canción no encontrada"));

        // Eliminar la canción de las listas del artista
        if (cancion.getArtista() != null) {
            Artista artista = cancion.getArtista();
            if (artista.getCanciones() != null) {
                artista.getCanciones().removeIf(c -> c.getSongId().equals(id));
                artistaRepository.save(artista);
            }
        }

        // Eliminar la canción del álbum
        if (cancion.getAlbum() != null) {
            Album album = cancion.getAlbum();
            if (album.getSongIds() != null) {
                album.getSongIds().remove(id);
                albumRepository.save(album);
            }
        }

        // Finalmente eliminar la canción
        cancionRepository.deleteById(id);
    }

    // Agregar este método al CancionService

    public int cargaMasiva(MultipartFile archivo) throws IOException {
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(archivo.getInputStream(), StandardCharsets.UTF_8)
        );

        int contador = 0;
        String linea;

        while ((linea = reader.readLine()) != null) {
            String[] datos = linea.split(";");

            if (datos.length >= 7) {
                try {
                    Cancion cancion = new Cancion();
                    cancion.setTitulo(datos[0].trim());

                    // Artista
                    if (!datos[1].trim().isEmpty()) {
                        Artista artista = new Artista();
                        artista.setArtistId(datos[1].trim());
                        cancion.setArtista(artista);
                    }

                    // Álbum (opcional)
                    if (!datos[2].trim().isEmpty()) {
                        Album album = new Album();
                        album.setId(datos[2].trim());
                        cancion.setAlbum(album);
                    }

                    cancion.setGenero(datos[3].trim());
                    cancion.setDuracion(Double.parseDouble(datos[4].trim()));
                    cancion.setAnio(Integer.parseInt(datos[5].trim()));
                    cancion.setImagenUrl(datos[6].trim());

                    cancionRepository.save(cancion);
                    contador++;
                } catch (Exception e) {
                    // Log del error pero continuar con las siguientes
                    System.err.println("Error al procesar línea: " + linea + " - " + e.getMessage());
                }
            }
        }

        reader.close();
        return contador;
    }
}