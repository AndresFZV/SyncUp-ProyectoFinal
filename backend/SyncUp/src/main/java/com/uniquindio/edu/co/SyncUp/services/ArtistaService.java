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

/**
 * Servicio para gestionar las operaciones de artistas.
 * Proporciona lógica de negocio para CRUD de artistas y conversión a DTO.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class ArtistaService {
    private final ArtistaRepository artistaRepository;
    private final Cloudinary cloudinary;

    /**
     * Obtiene la lista de todos los artistas.
     *
     * @return Lista de todos los artistas en el sistema
     */
    public List<Artista> listarArtistas() {
        return artistaRepository.findAll();
    }

    /**
     * Obtiene un artista por su identificador.
     *
     * @param id Identificador único del artista
     * @return Artista encontrado
     * @throws RuntimeException si el artista no existe
     */
    public Artista obtenerArtista(String id) {
        return artistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));
    }

    /**
     * Obtiene un artista con detalles completos en formato DTO.
     *
     * @param id Identificador único del artista
     * @return ArtistaDTO con información detallada del artista
     * @throws RuntimeException si el artista no existe
     */
    public ArtistaDTO obtenerArtistaDetalle(String id) {
        Artista artista = artistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));

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
                .oyentesMensuales(34746428)
                .albumes(albumesDTO)
                .canciones(cancionesDTO)
                .build();
    }

    /**
     * Agrega un nuevo artista al sistema.
     *
     * @param solicitudArtista DTO con los datos del artista a crear
     * @return Artista creado
     * @throws IOException si hay error al subir la imagen
     */
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

    /**
     * Actualiza un artista existente.
     *
     * @param id Identificador del artista a actualizar
     * @param solicitudArtista DTO con los nuevos datos del artista
     * @return Artista actualizado
     * @throws IOException si hay error al subir la nueva imagen
     * @throws RuntimeException si el artista no existe
     */
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

    /**
     * Elimina un artista del sistema.
     *
     * @param id Identificador del artista a eliminar
     * @throws RuntimeException si el artista no existe
     */
    public void eliminarArtista(String id) {
        if (!artistaRepository.existsById(id)) {
            throw new RuntimeException("Artista no encontrado");
        }
        artistaRepository.deleteById(id);
    }

    /**
     * Obtiene la lista de todos los artistas en formato DTO.
     *
     * @return Lista de artistas DTO
     */
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