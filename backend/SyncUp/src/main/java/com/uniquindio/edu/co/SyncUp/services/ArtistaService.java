package com.uniquindio.edu.co.SyncUp.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.dto.ArtistaDTO;
import com.uniquindio.edu.co.SyncUp.dto.SolicitudArtista;
import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
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

    // Obtener artista por ID
    public Artista obtenerArtista(String id) {
        return artistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));
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

        // Si hay nueva imagen, subirla
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

    // Agregar este método NUEVO
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

// Mantén los otros métodos como están
}