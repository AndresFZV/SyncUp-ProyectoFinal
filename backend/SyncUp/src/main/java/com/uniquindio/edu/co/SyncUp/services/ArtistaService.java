package com.uniquindio.edu.co.SyncUp.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.dto.AlbumDTO;
import com.uniquindio.edu.co.SyncUp.dto.ArtistaDTO;
import com.uniquindio.edu.co.SyncUp.dto.CancionDTO;
import com.uniquindio.edu.co.SyncUp.dto.SolicitudArtista;
import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ArtistaService {
    private final ArtistaRepository artistaRepository;
    private final Cloudinary cloudinary;

    // Listar todos los artistas
    public List<Artista> listarArtistas() {
        return artistaRepository.findAll();
    }

    // Obtener artista por ID (objeto Artista - para uso interno/admin)
    public Artista obtenerArtista(String id) {
        return artistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));
    }

    // ← NUEVO: Obtener artista con detalles completos (para frontend de usuario)
    public ArtistaDTO obtenerArtistaDetalle(String id) {
        Artista artista = artistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));

        // Mapear álbumes usando AlbumDTO
        List<AlbumDTO> albumesDTO = new ArrayList<>();
        if (artista.getAlbumes() != null && !artista.getAlbumes().isEmpty()) {
            albumesDTO = artista.getAlbumes().stream()
                    .map(album -> AlbumDTO.builder()
                            .id(album.getId())
                            .nombre(album.getNombre())
                            .descripcion(album.getDescripcion())
                            .imagenUrl(album.getImagenUrl())
                            .bgColor(album.getBgColor())
                            .artistaId(album.getArtistId())
                            .artistaNombre(artista.getNombre())
                            .totalCanciones(album.getSongIds() != null ? album.getSongIds().size() : 0)
                            .build())
                    .collect(Collectors.toList());
        }

        // Mapear canciones usando CancionDTO
        List<CancionDTO> cancionesDTO = new ArrayList<>();
        if (artista.getCanciones() != null && !artista.getCanciones().isEmpty()) {
            cancionesDTO = artista.getCanciones().stream()
                    .map(cancion -> CancionDTO.builder()
                            .songId(cancion.getSongId())
                            .titulo(cancion.getTitulo())
                            .genero(cancion.getGenero())
                            .anio(cancion.getAnio())
                            .duracion(cancion.getDuracion())
                            .imagenUrl(cancion.getImagenUrl())
                            .musica(cancion.getMusica())
                            .artistaId(artista.getArtistId())
                            .artistaNombre(artista.getNombre())
                            .albumId(cancion.getAlbum() != null ? cancion.getAlbum().getId() : null)
                            .albumNombre(cancion.getAlbum() != null ? cancion.getAlbum().getNombre() : null)
                            .build())
                    .collect(Collectors.toList());
        }

        return ArtistaDTO.builder()
                .artistId(artista.getArtistId())
                .nombre(artista.getNombre())
                .pais(artista.getPais())
                .generoPrincipal(artista.getGeneroPrincipal())
                .biografia(artista.getBiografia())
                .imagenUrl(artista.getImagenUrl())
                .totalCanciones(cancionesDTO.size())
                .totalAlbumes(albumesDTO.size())
                .oyentesMensuales(34746428) // Valor de ejemplo
                .albumes(albumesDTO)
                .canciones(cancionesDTO)
                .build();
    }

    // Agregar artista
    public Artista addArtista(SolicitudArtista solicitudArtista) throws IOException {
        Map<String, Object> imagenSubida = cloudinary.uploader().upload(
                solicitudArtista.getImagenUrl().getBytes(),
                ObjectUtils.asMap("resource_type", "image")
        );

        Artista nuevoArtista = Artista.builder()
                .nombre(solicitudArtista.getNombre())
                .pais(solicitudArtista.getPais())
                .generoPrincipal(solicitudArtista.getGeneroPrincipal())
                .biografia(solicitudArtista.getBiografia())
                .imagenUrl(imagenSubida.get("secure_url").toString())
                .build();

        return artistaRepository.save(nuevoArtista);
    }

    // Actualizar artista
    public Artista actualizarArtista(String id, SolicitudArtista solicitudArtista) throws IOException {
        Artista artista = artistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));

        artista.setNombre(solicitudArtista.getNombre());
        artista.setPais(solicitudArtista.getPais());
        artista.setGeneroPrincipal(solicitudArtista.getGeneroPrincipal());
        artista.setBiografia(solicitudArtista.getBiografia());

        if (solicitudArtista.getImagenUrl() != null && !solicitudArtista.getImagenUrl().isEmpty()) {
            Map<String, Object> imagenSubida = cloudinary.uploader().upload(
                    solicitudArtista.getImagenUrl().getBytes(),
                    ObjectUtils.asMap("resource_type", "image")
            );
            artista.setImagenUrl(imagenSubida.get("secure_url").toString());
        }

        return artistaRepository.save(artista);
    }

    // Eliminar artista
    public void eliminarArtista(String id) {
        if (!artistaRepository.existsById(id)) {
            throw new RuntimeException("Artista no encontrado");
        }
        artistaRepository.deleteById(id);
    }

    // Listar artistas como DTO (sin detalles de álbumes/canciones - para listados)
    public List<ArtistaDTO> listarArtistasDTO() {
        List<Artista> artistas = artistaRepository.findAll();

        return artistas.stream().map(artista -> ArtistaDTO.builder()
                .artistId(artista.getArtistId())
                .nombre(artista.getNombre())
                .pais(artista.getPais())
                .generoPrincipal(artista.getGeneroPrincipal())
                .biografia(artista.getBiografia())
                .imagenUrl(artista.getImagenUrl())
                .totalCanciones(artista.getCanciones() != null ? artista.getCanciones().size() : 0)
                .totalAlbumes(artista.getAlbumes() != null ? artista.getAlbumes().size() : 0)
                .build()
        ).collect(Collectors.toList());
    }
}