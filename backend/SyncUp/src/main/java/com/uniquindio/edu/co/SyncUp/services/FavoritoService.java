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

import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar las operaciones de favoritos de usuarios.
 * Proporciona funcionalidades para manejar artistas y álbumes favoritos.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final UsuarioRepository usuarioRepository;
    private final ArtistaRepository artistaRepository;
    private final AlbumRepository albumRepository;

    /**
     * Obtiene la lista de artistas favoritos de un usuario.
     *
     * @param username Nombre de usuario del cual obtener los artistas favoritos
     * @return Lista de artistas favoritos en formato DTO
     * @throws RuntimeException si el usuario no existe
     */
    public List<ArtistaDTO> obtenerArtistasFavoritos(String username) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getArtistasFavoritos() == null || usuario.getArtistasFavoritos().isEmpty()) {
            return new LinkedList<>();
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

    /**
     * Obtiene la lista de álbumes favoritos de un usuario.
     *
     * @param username Nombre de usuario del cual obtener los álbumes favoritos
     * @return Lista de álbumes favoritos en formato DTO
     * @throws RuntimeException si el usuario no existe
     */
    public List<AlbumDTO> obtenerAlbumesFavoritos(String username) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getAlbumesFavoritos() == null || usuario.getAlbumesFavoritos().isEmpty()) {
            return new LinkedList<>();
        }

        return usuario.getAlbumesFavoritos().stream()
                .map(this::convertirAlbumADTO)
                .collect(Collectors.toList());
    }

    /**
     * Verifica si un artista está en la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario a verificar
     * @param artistaId Identificador del artista a verificar
     * @return true si el artista es favorito, false en caso contrario
     * @throws RuntimeException si el usuario no existe
     */
    public boolean esArtistaFavorito(String username, String artistaId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getArtistasFavoritos() == null) {
            return false;
        }

        return usuario.getArtistasFavoritos().stream()
                .anyMatch(a -> a.getArtistId().equals(artistaId));
    }

    /**
     * Verifica si un álbum está en la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario a verificar
     * @param albumId Identificador del álbum a verificar
     * @return true si el álbum es favorito, false en caso contrario
     * @throws RuntimeException si el usuario no existe
     */
    public boolean esAlbumFavorito(String username, String albumId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getAlbumesFavoritos() == null) {
            return false;
        }

        return usuario.getAlbumesFavoritos().stream()
                .anyMatch(a -> a.getId().equals(albumId));
    }

    /**
     * Agrega un artista a la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario al cual agregar el artista favorito
     * @param artistaId Identificador del artista a agregar
     * @throws RuntimeException si el usuario o artista no existen
     */
    public void agregarArtistaFavorito(String username, String artistaId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Artista artista = artistaRepository.findById(artistaId)
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));

        if (usuario.getArtistasFavoritos() == null) {
            usuario.setArtistasFavoritos(new LinkedList<>());
        }

        boolean yaExiste = usuario.getArtistasFavoritos().stream()
                .anyMatch(a -> a.getArtistId().equals(artistaId));

        if (!yaExiste) {
            usuario.getArtistasFavoritos().add(artista);
            usuarioRepository.save(usuario);
        }
    }

    /**
     * Agrega un álbum a la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario al cual agregar el álbum favorito
     * @param albumId Identificador del álbum a agregar
     * @throws RuntimeException si el usuario o álbum no existen
     */
    public void agregarAlbumFavorito(String username, String albumId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        if (usuario.getAlbumesFavoritos() == null) {
            usuario.setAlbumesFavoritos(new LinkedList<>());
        }

        boolean yaExiste = usuario.getAlbumesFavoritos().stream()
                .anyMatch(a -> a.getId().equals(albumId));

        if (!yaExiste) {
            usuario.getAlbumesFavoritos().add(album);
            usuarioRepository.save(usuario);
        }
    }

    /**
     * Elimina un artista de la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario del cual eliminar el artista favorito
     * @param artistaId Identificador del artista a eliminar
     * @throws RuntimeException si el usuario no existe
     */
    public void eliminarArtistaFavorito(String username, String artistaId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getArtistasFavoritos() != null) {
            usuario.getArtistasFavoritos().removeIf(a -> a.getArtistId().equals(artistaId));
            usuarioRepository.save(usuario);
        }
    }

    /**
     * Elimina un álbum de la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario del cual eliminar el álbum favorito
     * @param albumId Identificador del álbum a eliminar
     * @throws RuntimeException si el usuario no existe
     */
    public void eliminarAlbumFavorito(String username, String albumId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getAlbumesFavoritos() != null) {
            usuario.getAlbumesFavoritos().removeIf(a -> a.getId().equals(albumId));
            usuarioRepository.save(usuario);
        }
    }

    /**
     * Convierte una entidad Album a un DTO AlbumDTO.
     *
     * @param album Entidad Album a convertir
     * @return DTO AlbumDTO convertido
     */
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