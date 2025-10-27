package com.uniquindio.edu.co.SyncUp.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista; // ← AGREGAR
import com.uniquindio.edu.co.SyncUp.dto.SolicitudAlbum;
import com.uniquindio.edu.co.SyncUp.repository.AlbumRepository;
import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository; // ← AGREGAR
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AlbumService {
    private final AlbumRepository albumRepository;
    private final ArtistaRepository artistaRepository; // ← AGREGAR
    private final Cloudinary cloudinary;

    // Listar todos los álbumes
    public List<Album> listarAlbumes() {
        return albumRepository.findAll();
    }

    // Obtener álbum por ID
    public Album obtenerAlbum(String id) {
        return albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));
    }

    // Agregar álbum
    public Album addAlbum(SolicitudAlbum solicitudAlbum) throws IOException {
        // Verificar que el artista existe
        Artista artista = artistaRepository.findById(solicitudAlbum.getArtistId())
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));

        Map<String, Object> imagenSubida = cloudinary.uploader().upload(
                solicitudAlbum.getArchivoImagen().getBytes(),
                ObjectUtils.asMap("resource_type", "image")
        );

        Album nuevoAlbum = Album.builder()
                .nombre(solicitudAlbum.getNombre())
                .descripcion(solicitudAlbum.getDescripcion())
                .bgColor(solicitudAlbum.getBgColor())
                .imagenUrl(imagenSubida.get("secure_url").toString())
                .artistId(solicitudAlbum.getArtistId())
                .songIds(solicitudAlbum.getSongIds() != null ? solicitudAlbum.getSongIds() : new ArrayList<>())
                .build();

        Album albumGuardado = albumRepository.save(nuevoAlbum);

        // 🔥 ACTUALIZAR LA RELACIÓN EN EL ARTISTA
        if (artista.getAlbumes() == null) {
            artista.setAlbumes(new ArrayList<>());
        }
        artista.getAlbumes().add(albumGuardado);
        artistaRepository.save(artista);

        return albumGuardado;
    }
    // Actualizar álbum
    public Album actualizarAlbum(String id, SolicitudAlbum solicitudAlbum) throws IOException {
        Album albumExistente = albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        String artistaIdAnterior = albumExistente.getArtistId();
        String artistaIdNuevo = solicitudAlbum.getArtistId();

        // Actualizar campos
        albumExistente.setNombre(solicitudAlbum.getNombre());
        albumExistente.setDescripcion(solicitudAlbum.getDescripcion());
        albumExistente.setBgColor(solicitudAlbum.getBgColor());
        albumExistente.setArtistId(artistaIdNuevo);

        // Solo actualizar imagen si hay una nueva
        if (solicitudAlbum.getArchivoImagen() != null) {
            Map<String, Object> imagenSubida = cloudinary.uploader().upload(
                    solicitudAlbum.getArchivoImagen().getBytes(),
                    ObjectUtils.asMap("resource_type", "image")
            );
            albumExistente.setImagenUrl(imagenSubida.get("secure_url").toString());
        }

        Album albumActualizado = albumRepository.save(albumExistente);

        // 🔥 Si cambió el artista, actualizar relaciones
        if (!artistaIdAnterior.equals(artistaIdNuevo)) {
            // Eliminar del artista anterior
            artistaRepository.findById(artistaIdAnterior).ifPresent(artistaAnterior -> {
                if (artistaAnterior.getAlbumes() != null) {
                    artistaAnterior.getAlbumes().removeIf(a -> a.getId().equals(id));
                    artistaRepository.save(artistaAnterior);
                }
            });

            // Agregar al nuevo artista
            Artista artistaNuevo = artistaRepository.findById(artistaIdNuevo)
                    .orElseThrow(() -> new RuntimeException("Artista no encontrado"));
            if (artistaNuevo.getAlbumes() == null) {
                artistaNuevo.setAlbumes(new ArrayList<>());
            }
            artistaNuevo.getAlbumes().add(albumActualizado);
            artistaRepository.save(artistaNuevo);
        }

        return albumActualizado;
    }

    // Eliminar álbum
    public void eliminarAlbum(String id) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        // 🔥 ELIMINAR LA RELACIÓN DEL ARTISTA TAMBIÉN
        artistaRepository.findById(album.getArtistId()).ifPresent(artista -> {
            if (artista.getAlbumes() != null) {
                artista.getAlbumes().removeIf(a -> a.getId().equals(id));
                artistaRepository.save(artista);
            }
        });

        albumRepository.deleteById(id);
    }

    // Carga masiva
    public Map<String, Object> cargaMasivaAlbum(MultipartFile archivoCanciones, MultipartFile imagenAlbum) throws IOException {
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(archivoCanciones.getInputStream(), StandardCharsets.UTF_8)
        );

        // Primera línea: información del álbum
        String lineaAlbum = reader.readLine();
        String[] datosAlbum = lineaAlbum.split(";");

        if (datosAlbum.length < 4) {
            throw new RuntimeException("Formato de álbum incorrecto");
        }

        String artistId = datosAlbum[1].trim();

        // Verificar que el artista existe
        Artista artista = artistaRepository.findById(artistId)
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));

        // Subir imagen del álbum a Cloudinary
        Map<String, Object> imagenSubida = cloudinary.uploader().upload(
                imagenAlbum.getBytes(),
                ObjectUtils.asMap("resource_type", "image")
        );

        // Crear el álbum
        Album nuevoAlbum = Album.builder()
                .nombre(datosAlbum[0].trim())
                .artistId(artistId)
                .descripcion(datosAlbum[2].trim())
                .bgColor(datosAlbum[3].trim())
                .imagenUrl(imagenSubida.get("secure_url").toString())
                .songIds(new ArrayList<>())
                .build();
        Album albumGuardado = albumRepository.save(nuevoAlbum);

        // 🔥 ACTUALIZAR LA RELACIÓN EN EL ARTISTA
        if (artista.getAlbumes() == null) {
            artista.setAlbumes(new ArrayList<>());
        }
        artista.getAlbumes().add(albumGuardado);
        artistaRepository.save(artista);

        // Procesar canciones
        int contadorCanciones = 0;
        String linea;
        while ((linea = reader.readLine()) != null) {
            if (linea.trim().isEmpty() || linea.startsWith("#")) continue;

            String[] datosCan = linea.split(";");

            if (datosCan.length >= 4) {
                try {
                    // Crear canción y asociarla al álbum
                    // Aquí necesitarías tu lógica para crear canciones
                    contadorCanciones++;
                } catch (Exception e) {
                    System.err.println("Error al procesar canción: " + linea);
                }
            }
        }
        reader.close();
        Map<String, Object> response = new HashMap<>();
        response.put("albumNombre", albumGuardado.getNombre());
        response.put("totalCanciones", contadorCanciones);
        return response;
    }
}