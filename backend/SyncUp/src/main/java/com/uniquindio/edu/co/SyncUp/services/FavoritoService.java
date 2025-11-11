package com.uniquindio.edu.co.SyncUp.services;

import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Usuario;
import com.uniquindio.edu.co.SyncUp.dto.AlbumDTO;
import com.uniquindio.edu.co.SyncUp.dto.ArtistaDTO;
import com.uniquindio.edu.co.SyncUp.repository.AlbumRepository;
import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository;
import com.uniquindio.edu.co.SyncUp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedList;  // ← CAMBIAR: Usar LinkedList en lugar de ArrayList
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final UsuarioRepository usuarioRepository;
    private final ArtistaRepository artistaRepository;
    private final AlbumRepository albumRepository;

    // ========== OBTENER FAVORITOS ==========

    public List<ArtistaDTO> obtenerArtistasFavoritos(String username) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getArtistasFavoritos() == null || usuario.getArtistasFavoritos().isEmpty()) {
            return new LinkedList<>();  // ← CAMBIAR: LinkedList
        }

        return usuario.getArtistasFavoritos().stream()
                .map(artista -> ArtistaDTO.builder()
                        .artistId(artista.getArtistId())
                        .nombre(artista.getNombre())
                        .pais(artista.getPais())
                        .generoPrincipal(artista.getGeneroPrincipal())
                        .biografia(artista.getBiografia())
                        .imagenUrl(artista.getImagenUrl())
                        .totalAlbumes(artista.getAlbumes() != null ? artista.getAlbumes().size() : 0)
                        .totalCanciones(artista.getCanciones() != null ? artista.getCanciones().size() : 0)
                        .build())
                .collect(Collectors.toList());
    }

    public List<AlbumDTO> obtenerAlbumesFavoritos(String username) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getAlbumesFavoritos() == null || usuario.getAlbumesFavoritos().isEmpty()) {
            return new LinkedList<>();  // ← CAMBIAR: LinkedList
        }

        return usuario.getAlbumesFavoritos().stream()
                .map(this::convertirAlbumADTO)
                .collect(Collectors.toList());
    }

    // ========== VERIFICAR SI ES FAVORITO ==========

    public boolean esArtistaFavorito(String username, String artistaId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getArtistasFavoritos() == null) {
            return false;
        }

        return usuario.getArtistasFavoritos().stream()
                .anyMatch(a -> a.getArtistId().equals(artistaId));
    }

    public boolean esAlbumFavorito(String username, String albumId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getAlbumesFavoritos() == null) {
            return false;
        }

        return usuario.getAlbumesFavoritos().stream()
                .anyMatch(a -> a.getId().equals(albumId));
    }

    // ========== AGREGAR A FAVORITOS ==========

    public void agregarArtistaFavorito(String username, String artistaId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Artista artista = artistaRepository.findById(artistaId)
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));

        if (usuario.getArtistasFavoritos() == null) {
            usuario.setArtistasFavoritos(new LinkedList<>());  // ← CAMBIAR: LinkedList
        }

        boolean yaExiste = usuario.getArtistasFavoritos().stream()
                .anyMatch(a -> a.getArtistId().equals(artistaId));

        if (!yaExiste) {
            usuario.getArtistasFavoritos().add(artista);
            usuarioRepository.save(usuario);
        }
    }

    public void agregarAlbumFavorito(String username, String albumId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        if (usuario.getAlbumesFavoritos() == null) {
            usuario.setAlbumesFavoritos(new LinkedList<>());  // ← CAMBIAR: LinkedList
        }

        boolean yaExiste = usuario.getAlbumesFavoritos().stream()
                .anyMatch(a -> a.getId().equals(albumId));

        if (!yaExiste) {
            usuario.getAlbumesFavoritos().add(album);
            usuarioRepository.save(usuario);
        }
    }

    // ========== ELIMINAR DE FAVORITOS ==========

    public void eliminarArtistaFavorito(String username, String artistaId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getArtistasFavoritos() != null) {
            usuario.getArtistasFavoritos().removeIf(a -> a.getArtistId().equals(artistaId));
            usuarioRepository.save(usuario);
        }
    }

    public void eliminarAlbumFavorito(String username, String albumId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getAlbumesFavoritos() != null) {
            usuario.getAlbumesFavoritos().removeIf(a -> a.getId().equals(albumId));
            usuarioRepository.save(usuario);
        }
    }

    // ========== MÉTODO AUXILIAR ==========

    private AlbumDTO convertirAlbumADTO(Album album) {
        String artistaNombre = "Sin artista";

        if (album.getArtistId() != null && !album.getArtistId().isEmpty()) {
            try {
                Artista artista = artistaRepository.findById(album.getArtistId()).orElse(null);
                if (artista != null) {
                    artistaNombre = artista.getNombre();
                }
            } catch (Exception e) {
                System.err.println("Error al buscar artista: " + e.getMessage());
            }
        }

        return AlbumDTO.builder()
                .id(album.getId())
                .nombre(album.getNombre())
                .descripcion(album.getDescripcion())
                .bgColor(album.getBgColor())
                .imagenUrl(album.getImagenUrl())
                .artistaId(album.getArtistId())
                .artistaNombre(artistaNombre)
                .totalCanciones(album.getSongIds() != null ? album.getSongIds().size() : 0)
                .build();
    }
}