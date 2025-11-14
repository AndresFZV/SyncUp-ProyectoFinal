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
     * Inicializar el Trie cuando la aplicación esté lista
     */
    @EventListener(ApplicationReadyEvent.class)
    public void inicializarTrie() {
        System.out.println("🌳 Inicializando Trie para autocompletado...");
        reconstruirTrie();
    }

    /**
     * Reconstruir el Trie con todos los datos
     */
    public void reconstruirTrie() {
        long inicio = System.currentTimeMillis();
        trie.limpiar();

        // ========================================
        // INDEXAR CANCIONES
        // ========================================
        List<Cancion> canciones = cancionRepository.findAll();
        System.out.println("🎵 Indexando canciones: " + canciones.size());

        for (Cancion cancion : canciones) {
            if (cancion.getSongId() == null) {
                System.err.println("⚠️ Canción sin ID: " + cancion.getTitulo());
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

        // ========================================
        // INDEXAR ARTISTAS
        // ========================================
        List<Artista> artistas = artistaRepository.findAll();
        System.out.println("========================================");
        System.out.println("🎤 INDEXANDO ARTISTAS");
        System.out.println("========================================");
        System.out.println("Total de artistas en BD: " + artistas.size());

        int artistasIndexados = 0;
        for (Artista artista : artistas) {
            if (artista.getArtistId() == null) {
                System.err.println("⚠️ Artista sin ID: " + artista.getNombre());
                continue;
            }

            trie.insertarTexto(artista.getNombre(), artista.getArtistId(), "artista");
            artistasIndexados++;

            if (artista.getGeneroPrincipal() != null && !artista.getGeneroPrincipal().isEmpty()) {
                trie.insertarTexto(artista.getGeneroPrincipal(), artista.getArtistId(), "artista");
            }
        }

        System.out.println("✅ Artistas indexados: " + artistasIndexados + " de " + artistas.size());
        System.out.println("========================================");

        // ========================================
        // INDEXAR ÁLBUMES
        // ========================================
        List<Album> albums = albumRepository.findAll();
        System.out.println("💿 Indexando álbumes: " + albums.size());

        for (Album album : albums) {
            if (album.getId() == null) {
                System.err.println("⚠️ Álbum sin ID: " + album.getNombre());
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

        // ========================================
        // INDEXAR USUARIOS
        // ========================================
        List<Usuario> usuarios = usuarioRepository.findAll();
        System.out.println("========================================");
        System.out.println("👤 INDEXANDO USUARIOS");
        System.out.println("========================================");
        System.out.println("Total de usuarios en BD: " + usuarios.size());

        int usuariosIndexados = 0;
        for (Usuario usuario : usuarios) {
            System.out.println("---");
            System.out.println("Usuario: " + usuario.getNombre());
            System.out.println("  username (campo @Id): " + usuario.getUsername());
            System.out.println("  Correo: " + usuario.getCorreo());

            if (usuario.getUsername() == null) {
                System.err.println("  ❌ SIN USERNAME - NO SE INDEXA");
                continue;
            }

            // Indexar nombre del usuario
            if (usuario.getNombre() != null && !usuario.getNombre().isEmpty()) {
                System.out.println("  📝 Indexando nombre: '" + usuario.getNombre() + "'");
                trie.insertarTexto(usuario.getNombre(), usuario.getUsername(), "usuario");
            }

            // Indexar username
            System.out.println("  📝 Indexando username: '" + usuario.getUsername() + "'");
            trie.insertarTexto(usuario.getUsername(), usuario.getUsername(), "usuario");

            usuariosIndexados++;
            System.out.println("  ✅ Usuario indexado correctamente");
        }

        System.out.println("========================================");
        System.out.println("✅ Usuarios indexados: " + usuariosIndexados + " de " + usuarios.size());
        System.out.println("========================================");

        // ========================================
        // RESUMEN FINAL
        // ========================================
        long fin = System.currentTimeMillis();
        System.out.println("========================================");
        System.out.println("✅ Trie inicializado en " + (fin - inicio) + "ms");
        System.out.println("   📊 Palabras indexadas: " + trie.getTotalPalabras());
        System.out.println("   🎵 Canciones: " + canciones.size());
        System.out.println("   🎤 Artistas: " + artistas.size());
        System.out.println("   💿 Álbumes: " + albums.size());
        System.out.println("   👤 Usuarios: " + usuarios.size());
        System.out.println("========================================");
    }

    /**
     * RF-026: Buscar por prefijo y devolver resultados completos
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

        // Obtener canciones
        List<Cancion> canciones = entidades.get("canciones").stream()
                .limit(limite)
                .map(id -> cancionRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Obtener artistas
        List<Artista> artistas = entidades.get("artistas").stream()
                .limit(limite)
                .map(artistId -> artistaRepository.findById(artistId).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Obtener álbumes
        List<Album> albums = entidades.get("albums").stream()
                .limit(limite)
                .map(id -> albumRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Obtener usuarios
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

        System.out.println("🔍 Búsqueda: '" + prefijo + "' en " + tiempoBusqueda + "ms");
        System.out.println("   Canciones: " + canciones.size());
        System.out.println("   Artistas: " + artistas.size());
        System.out.println("   Álbumes: " + albums.size());
        System.out.println("   Usuarios: " + usuarios.size());

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
     * Obtener sugerencias de texto (solo palabras)
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
     * Obtener estadísticas del Trie
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
     * Verificar si una palabra existe
     */
    public boolean existe(String palabra) {
        return trie.existe(palabra);
    }

    // ========================================
    // MÉTODOS PARA BÚSQUEDA AVANZADA
    // ========================================

    public Set<String> obtenerIdsCanciones(String prefijo) {
        if (prefijo == null || prefijo.trim().isEmpty()) {
            return new HashSet<>();
        }
        Map<String, Set<String>> entidades = trie.buscarEntidadesPorPrefijo(prefijo);
        return entidades.get("canciones");
    }

    public Set<String> obtenerIdsArtistas(String prefijo) {
        if (prefijo == null || prefijo.trim().isEmpty()) {
            return new HashSet<>();
        }
        Map<String, Set<String>> entidades = trie.buscarEntidadesPorPrefijo(prefijo);
        return entidades.get("artistas");
    }

    public Set<String> obtenerIdsAlbumes(String prefijo) {
        if (prefijo == null || prefijo.trim().isEmpty()) {
            return new HashSet<>();
        }
        Map<String, Set<String>> entidades = trie.buscarEntidadesPorPrefijo(prefijo);
        return entidades.get("albums");
    }

    public Set<String> obtenerIdsUsuarios(String prefijo) {
        if (prefijo == null || prefijo.trim().isEmpty()) {
            return new HashSet<>();
        }
        Map<String, Set<String>> entidades = trie.buscarEntidadesPorPrefijo(prefijo);
        return entidades.get("usuarios");
    }
}