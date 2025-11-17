package com.uniquindio.edu.co.SyncUp.services;

import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.document.Usuario;
import com.uniquindio.edu.co.SyncUp.dto.ResultadoBusquedaDTO;
import com.uniquindio.edu.co.SyncUp.dto.UsuarioDTO;
import com.uniquindio.edu.co.SyncUp.repository.AlbumRepository;
import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository;
import com.uniquindio.edu.co.SyncUp.repository.CancionRepository;
import com.uniquindio.edu.co.SyncUp.repository.UsuarioRepository;
import com.uniquindio.edu.co.SyncUp.trie.TrieAutocompletado;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar las operaciones del Trie de autocompletado.
 * Proporciona funcionalidades para búsqueda por prefijo y gestión del índice de texto.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class TrieService {

    @Getter
    private final TrieAutocompletado trie;

    private final CancionRepository cancionRepository;
    private final ArtistaRepository artistaRepository;
    private final AlbumRepository albumRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Inicializa el Trie cuando la aplicación está lista.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void inicializarTrie() {
        System.out.println("Inicializando Trie para autocompletado...");
        reconstruirTrie();
    }

    /**
     * Reconstruye el Trie con todos los datos del sistema.
     */
    public void reconstruirTrie() {
        long inicio = System.currentTimeMillis();
        trie.limpiar();

        List<Cancion> canciones = cancionRepository.findAll();
        System.out.println("Indexando canciones: " + canciones.size());

        for (Cancion cancion : canciones) {
            if (cancion.getSongId() == null) {
                continue;
            }

            trie.insertarTexto(cancion.getTitulo(), cancion.getSongId(), "cancion");

            if (cancion.getGenero() != null && !cancion.getGenero().isEmpty()) {
                trie.insertarTexto(cancion.getGenero(), cancion.getSongId(), "cancion");
            }

            if (cancion.getArtista() != null && cancion.getArtista().getNombre() != null) {
                trie.insertarTexto(cancion.getArtista().getNombre(), cancion.getSongId(), "cancion");
            }
        }

        List<Artista> artistas = artistaRepository.findAll();
        System.out.println("Indexando artistas: " + artistas.size());

        int artistasIndexados = 0;
        for (Artista artista : artistas) {
            if (artista.getArtistId() == null) {
                continue;
            }

            trie.insertarTexto(artista.getNombre(), artista.getArtistId(), "artista");
            artistasIndexados++;

            if (artista.getGeneroPrincipal() != null && !artista.getGeneroPrincipal().isEmpty()) {
                trie.insertarTexto(artista.getGeneroPrincipal(), artista.getArtistId(), "artista");
            }
        }

        List<Album> albums = albumRepository.findAll();
        System.out.println("Indexando álbumes: " + albums.size());

        for (Album album : albums) {
            if (album.getId() == null) {
                continue;
            }

            trie.insertarTexto(album.getNombre(), album.getId(), "album");

            if (album.getArtistId() != null && !album.getArtistId().isEmpty()) {
                artistaRepository.findById(album.getArtistId()).ifPresent(artista -> {
                    if (artista.getNombre() != null) {
                        trie.insertarTexto(artista.getNombre(), album.getId(), "album");
                    }
                });
            }
        }

        List<Usuario> usuarios = usuarioRepository.findAll();
        System.out.println("Indexando usuarios: " + usuarios.size());

        int usuariosIndexados = 0;
        for (Usuario usuario : usuarios) {
            if (usuario.getUsername() == null) {
                continue;
            }

            if (usuario.getNombre() != null && !usuario.getNombre().isEmpty()) {
                trie.insertarTexto(usuario.getNombre(), usuario.getUsername(), "usuario");
            }

            trie.insertarTexto(usuario.getUsername(), usuario.getUsername(), "usuario");
            usuariosIndexados++;
        }

        long fin = System.currentTimeMillis();
        System.out.println("Trie inicializado en " + (fin - inicio) + "ms");
        System.out.println("Palabras indexadas: " + trie.getTotalPalabras());
        System.out.println("Canciones: " + canciones.size());
        System.out.println("Artistas: " + artistas.size());
        System.out.println("Álbumes: " + albums.size());
        System.out.println("Usuarios: " + usuarios.size());
    }

    /**
     * Busca por prefijo y devuelve resultados completos organizados por tipo de entidad.
     *
     * @param prefijo Prefijo a buscar
     * @param limite Número máximo de resultados por tipo de entidad
     * @return Resultado de búsqueda con todas las entidades encontradas
     */
    public ResultadoBusquedaDTO buscarPorPrefijo(String prefijo, int limite) {
        long inicio = System.currentTimeMillis();

        if (prefijo == null || prefijo.trim().isEmpty()) {
            return ResultadoBusquedaDTO.builder()
                    .prefijo("")
                    .canciones(new ArrayList<>())
                    .artistas(new ArrayList<>())
                    .albums(new ArrayList<>())
                    .usuarios(new ArrayList<>())
                    .totalResultados(0)
                    .tiempoBusqueda(0L)
                    .build();
        }

        Map<String, Set<String>> entidades = trie.buscarEntidadesPorPrefijo(prefijo);

        List<Cancion> canciones = entidades.get("canciones").stream()
                .limit(limite)
                .map(id -> cancionRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<Artista> artistas = entidades.get("artistas").stream()
                .limit(limite)
                .map(artistId -> artistaRepository.findById(artistId).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<Album> albums = entidades.get("albums").stream()
                .limit(limite)
                .map(id -> albumRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<UsuarioDTO> usuarios = entidades.get("usuarios").stream()
                .limit(limite)
                .map(username -> {
                    Usuario u = usuarioRepository.findById(username).orElse(null);
                    return u != null ? UsuarioDTO.fromUsuario(u) : null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        long fin = System.currentTimeMillis();
        long tiempoBusqueda = fin - inicio;

        return ResultadoBusquedaDTO.builder()
                .prefijo(prefijo)
                .canciones(canciones)
                .artistas(artistas)
                .albums(albums)
                .usuarios(usuarios)
                .totalResultados(canciones.size() + artistas.size() + albums.size() + usuarios.size())
                .tiempoBusqueda(tiempoBusqueda)
                .build();
    }

    /**
     * Obtiene sugerencias de texto basadas en un prefijo.
     *
     * @param prefijo Prefijo para generar sugerencias
     * @param limite Número máximo de sugerencias a retornar
     * @return Lista de sugerencias de texto
     */
    public List<String> obtenerSugerencias(String prefijo, int limite) {
        if (prefijo == null || prefijo.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<String> sugerencias = trie.buscarPorPrefijo(prefijo);
        return sugerencias.stream()
                .limit(limite)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene estadísticas del Trie y del sistema.
     *
     * @return Mapa con estadísticas del Trie y conteos de entidades
     */
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>(trie.obtenerEstadisticas());
        stats.put("totalCanciones", cancionRepository.count());
        stats.put("totalArtistas", artistaRepository.count());
        stats.put("totalAlbums", albumRepository.count());
        stats.put("totalUsuarios", usuarioRepository.count());
        return stats;
    }

    /**
     * Verifica si una palabra existe en el Trie.
     *
     * @param palabra Palabra a verificar
     * @return true si la palabra existe, false en caso contrario
     */
    public boolean existe(String palabra) {
        return trie.existe(palabra);
    }

    /**
     * Obtiene los identificadores de canciones que coinciden con un prefijo.
     *
     * @param prefijo Prefijo a buscar
     * @return Conjunto de identificadores de canciones
     */
    public Set<String> obtenerIdsCanciones(String prefijo) {
        if (prefijo == null || prefijo.trim().isEmpty()) {
            return new HashSet<>();
        }
        Map<String, Set<String>> entidades = trie.buscarEntidadesPorPrefijo(prefijo);
        return entidades.get("canciones");
    }

    /**
     * Obtiene los identificadores de artistas que coinciden con un prefijo.
     *
     * @param prefijo Prefijo a buscar
     * @return Conjunto de identificadores de artistas
     */
    public Set<String> obtenerIdsArtistas(String prefijo) {
        if (prefijo == null || prefijo.trim().isEmpty()) {
            return new HashSet<>();
        }
        Map<String, Set<String>> entidades = trie.buscarEntidadesPorPrefijo(prefijo);
        return entidades.get("artistas");
    }

    /**
     * Obtiene los identificadores de álbumes que coinciden con un prefijo.
     *
     * @param prefijo Prefijo a buscar
     * @return Conjunto de identificadores de álbumes
     */
    public Set<String> obtenerIdsAlbumes(String prefijo) {
        if (prefijo == null || prefijo.trim().isEmpty()) {
            return new HashSet<>();
        }
        Map<String, Set<String>> entidades = trie.buscarEntidadesPorPrefijo(prefijo);
        return entidades.get("albums");
    }

    /**
     * Obtiene los identificadores de usuarios que coinciden con un prefijo.
     *
     * @param prefijo Prefijo a buscar
     * @return Conjunto de identificadores de usuarios
     */
    public Set<String> obtenerIdsUsuarios(String prefijo) {
        if (prefijo == null || prefijo.trim().isEmpty()) {
            return new HashSet<>();
        }
        Map<String, Set<String>> entidades = trie.buscarEntidadesPorPrefijo(prefijo);
        return entidades.get("usuarios");
    }
}