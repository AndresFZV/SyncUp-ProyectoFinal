package com.uniquindio.edu.co.SyncUp.services;

import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.document.Usuario;
import com.uniquindio.edu.co.SyncUp.repository.AlbumRepository;
import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository;
import com.uniquindio.edu.co.SyncUp.repository.CancionRepository;
import com.uniquindio.edu.co.SyncUp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final CancionRepository cancionRepository;
    private final AlbumRepository albumRepository;
    private final ArtistaRepository artistaRepository;
    
    public Usuario registrarUsuario(Usuario usuario) {
        if (usuarioRepository.existsById(usuario.getUsername())) {
            throw new RuntimeException("El username ya existe");
        }
        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }
        return usuarioRepository.save(usuario);
    }

    public Usuario login(String username, String password) {
        return usuarioRepository.findByUsernameAndPassword(username, password)
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));
    }

    public Usuario actualizarPerfil(String username, String nombre, String correo, String password) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (nombre != null) usuario.setNombre(nombre);
        if (correo != null) usuario.setCorreo(correo);
        if (password != null) usuario.setPassword(password);
        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(String username) {
        if (!usuarioRepository.existsById(username)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(username);
    }

    public Usuario agregarCancionFavorita(String username, String cancionId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Buscar la canción existente en la base de datos
        Cancion cancionExistente = cancionRepository.findById(cancionId)
                .orElseThrow(() -> new RuntimeException("Canción no encontrada"));

        // Inicializar la lista si es null
        if (usuario.getListaFavoritos() == null) {
            usuario.setListaFavoritos(new LinkedList<>());
        }

        // Verificar que no esté duplicada
        boolean yaExiste = usuario.getListaFavoritos().stream()
                .anyMatch(c -> c.getSongId().equals(cancionId));

        if (yaExiste) {
            throw new RuntimeException("La canción ya está en favoritos");
        }

        // Agregar la canción existente (con todas sus referencias intactas)
        usuario.getListaFavoritos().add(cancionExistente);
        return usuarioRepository.save(usuario);
    }

    public Usuario agregarArtistaFavorito(String username, Artista artista) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.getArtistasFavoritos().add(artista);
        return usuarioRepository.save(usuario);
    }

    public Usuario seguirUsuario(String username, Usuario aSeguir) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.getSiguiendo().add(aSeguir);
        aSeguir.getSeguidores().add(usuario);
        usuarioRepository.save(aSeguir); // actualizar usuario que se sigue
        return usuarioRepository.save(usuario);
    }

    public Usuario dejarDeSeguirUsuario(String username, Usuario aDejar) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.getSiguiendo().remove(aDejar);
        aDejar.getSeguidores().remove(usuario);
        usuarioRepository.save(aDejar);
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarIdentificador(String identificador) {
        Optional<Usuario> usuario = usuarioRepository.findByUsername(identificador);
        if (usuario.isEmpty()) {
            usuario = usuarioRepository.findByCorreo(identificador);
        }
        return usuario.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public boolean verificarPalabraSecreta(String username, String palabraSecreta) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return usuario.getPalabraSecreta().equals(palabraSecreta);
    }

    public Usuario actualizarPassword(String username, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setPassword(nuevaPassword);
        return usuarioRepository.save(usuario);
    }

    /**
     * Eliminar canción de favoritos
     */
    public void eliminarCancionFavorita(String username, String cancionId) {
        Usuario usuario = buscarIdentificador(username);
        if (usuario.getListaFavoritos() != null) {
            usuario.getListaFavoritos().removeIf(c ->
                    c.getSongId().equals(cancionId)
            );
            usuarioRepository.save(usuario);
        } else {
            throw new RuntimeException("El usuario no tiene canciones favoritas");
        }
    }

    /**
     * Eliminar artista de favoritos
     */
    public void eliminarArtistaFavorito(String username, String artistaId) {
        Usuario usuario = buscarIdentificador(username);
        if (usuario.getArtistasFavoritos() != null) {
            usuario.getArtistasFavoritos().removeIf(a ->
                    a.getArtistId().equals(artistaId)
            );
            usuarioRepository.save(usuario);
        } else {
            throw new RuntimeException("El usuario no tiene artistas favoritos");
        }
    }

    /**
     * Eliminar álbum de favoritos
     */
    public void eliminarAlbumFavorito(String username, String albumId) {
        Usuario usuario = usuarioRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        if (usuario.getAlbumesFavoritos() == null) {
            throw new RuntimeException("El usuario no tiene álbumes favoritos");
        }

        boolean eliminado = usuario.getAlbumesFavoritos().remove(album);

        if (!eliminado) {
            throw new RuntimeException("El álbum no estaba en favoritos");
        }

        usuarioRepository.save(usuario);
        System.out.println("✅ Álbum eliminado de favoritos: " + album.getNombre());
    }

    /**
     * RF-009: Generar reporte CSV completo del usuario
     * Incluye: información del usuario, canciones favoritas, artistas favoritos,
     * álbumes favoritos, seguidores y seguidos
     */
    public String generarReporteCSV(String username) {
        Usuario usuario = buscarIdentificador(username);
        StringBuilder csv = new StringBuilder();
        LocalDateTime ahora = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        // ============================================
        // ENCABEZADO DEL REPORTE
        // ============================================
        csv.append("╔════════════════════════════════════════════════════════════╗\n");
        csv.append("║          REPORTE DE USUARIO - SYNCUP                       ║\n");
        csv.append("║          Sistema de Streaming Musical                      ║\n");
        csv.append("╚════════════════════════════════════════════════════════════╝\n");
        csv.append("\n");
        csv.append("Fecha de Generación:,").append(ahora.format(formatter)).append("\n");
        csv.append("Usuario:,").append(usuario.getUsername()).append("\n");
        csv.append("\n");
        csv.append("════════════════════════════════════════════════════════════\n");
        csv.append("\n");
        // ============================================
        // SECCIÓN 1: INFORMACIÓN DEL USUARIO
        // ============================================
        csv.append("━━━ INFORMACIÓN DEL USUARIO ━━━\n");
        csv.append("\n");
        csv.append("Campo,Valor\n");
        csv.append("Username,\"").append(usuario.getUsername()).append("\"\n");
        csv.append("Nombre,\"").append(usuario.getNombre()).append("\"\n");
        csv.append("Correo,\"").append(usuario.getCorreo()).append("\"\n");
        csv.append("Edad,").append(usuario.getEdad()).append("\n");
        csv.append("Fecha del Reporte,\"").append(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("\"\n");
        csv.append("\n");

        // ============================================
        // SECCIÓN 2: ESTADÍSTICAS GENERALES
        // ============================================
        int totalCanciones = usuario.getListaFavoritos() != null ? usuario.getListaFavoritos().size() : 0;
        int totalArtistas = usuario.getArtistasFavoritos() != null ? usuario.getArtistasFavoritos().size() : 0;
        int totalAlbumes = usuario.getAlbumesFavoritos() != null ? usuario.getAlbumesFavoritos().size() : 0;
        int totalSeguidores = usuario.getSeguidores() != null ? usuario.getSeguidores().size() : 0;
        int totalSiguiendo = usuario.getSiguiendo() != null ? usuario.getSiguiendo().size() : 0;

        csv.append("━━━ ESTADÍSTICAS GENERALES ━━━\n");
        csv.append("\n");
        csv.append("Categoría,Cantidad\n");
        csv.append("Canciones Favoritas,").append(totalCanciones).append("\n");
        csv.append("Artistas Favoritos,").append(totalArtistas).append("\n");
        csv.append("Álbumes Favoritos,").append(totalAlbumes).append("\n");
        csv.append("Seguidores,").append(totalSeguidores).append("\n");
        csv.append("Siguiendo,").append(totalSiguiendo).append("\n");
        csv.append("\n");
        // ============================================
        // SECCIÓN 3: CANCIONES FAVORITAS
        // ============================================
        csv.append("━━━ CANCIONES FAVORITAS (").append(totalCanciones).append(") ━━━\n");
        csv.append("\n");

        if (usuario.getListaFavoritos() != null && !usuario.getListaFavoritos().isEmpty()) {
            csv.append("#,Título,Artista,Álbum,Género,Año,Duración (min),URL Imagen\n");
            int index = 1;
            for (Cancion cancion : usuario.getListaFavoritos()) {
                String titulo = escaparCSV(cancion.getTitulo());
                String artista = cancion.getArtista() != null ? escaparCSV(cancion.getArtista().getNombre()) : "Artista desconocido";
                String album = cancion.getAlbum() != null ? escaparCSV(cancion.getAlbum().getNombre()) : "Álbum desconocido";
                String genero = escaparCSV(cancion.getGenero());
                int anio = cancion.getAnio();
                double duracion = cancion.getDuracion();
                String imagenUrl = cancion.getImagenUrl() != null ? cancion.getImagenUrl() : "N/A";
                csv.append(index++).append(",")
                        .append("\"").append(titulo).append("\",")
                        .append("\"").append(artista).append("\",")
                        .append("\"").append(album).append("\",")
                        .append("\"").append(genero).append("\",")
                        .append(anio).append(",")
                        .append(String.format("%.2f", duracion)).append(",")
                        .append("\"").append(imagenUrl).append("\"\n");
            }
        } else {
            csv.append("No hay canciones favoritas registradas\n");
        }
        csv.append("\n");

        // ============================================
        // SECCIÓN 4: ARTISTAS FAVORITOS
        // ============================================
        csv.append("━━━ ARTISTAS FAVORITOS (").append(totalArtistas).append(") ━━━\n");
        csv.append("\n");
        if (usuario.getArtistasFavoritos() != null && !usuario.getArtistasFavoritos().isEmpty()) {
            csv.append("#,Nombre,País,Género Principal,Total Álbumes,Total Canciones,URL Imagen\n");
            int index = 1;
            for (Artista artista : usuario.getArtistasFavoritos()) {
                String nombre = escaparCSV(artista.getNombre());
                String pais = escaparCSV(artista.getPais());
                String genero = escaparCSV(artista.getGeneroPrincipal());
                int totalAlbumesArtista = artista.getAlbumes() != null ? artista.getAlbumes().size() : 0;
                int totalCancionesArtista = artista.getCanciones() != null ? artista.getCanciones().size() : 0;
                String imagenUrl = artista.getImagenUrl() != null ? artista.getImagenUrl() : "N/A";
                csv.append(index++).append(",")
                        .append("\"").append(nombre).append("\",")
                        .append("\"").append(pais).append("\",")
                        .append("\"").append(genero).append("\",")
                        .append(totalAlbumesArtista).append(",")
                        .append(totalCancionesArtista).append(",")
                        .append("\"").append(imagenUrl).append("\"\n");
            }
        } else {
            csv.append("No hay artistas favoritos registrados\n");
        }
        csv.append("\n");

        // ============================================
        // SECCIÓN 5: ÁLBUMES FAVORITOS
        // ============================================
        csv.append("━━━ ÁLBUMES FAVORITOS (").append(totalAlbumes).append(") ━━━\n");
        csv.append("\n");

        if (usuario.getAlbumesFavoritos() != null && !usuario.getAlbumesFavoritos().isEmpty()) {
            csv.append("#,Título,Descripción,Color de Fondo,Total Canciones,URL Imagen\n");

            int index = 1;
            for (Album album : usuario.getAlbumesFavoritos()) {
                String titulo = escaparCSV(album.getNombre());
                String descripcion = escaparCSV(album.getDescripcion());
                String bgColor = album.getBgColor() != null ? album.getBgColor() : "N/A";
                int totalCancionesAlbum = album.getSongIds() != null ? album.getSongIds().size() : 0;
                String imagenUrl = album.getImagenUrl() != null ? album.getImagenUrl() : "N/A";

                csv.append(index++).append(",")
                        .append("\"").append(titulo).append("\",")
                        .append("\"").append(descripcion).append("\",")
                        .append("\"").append(bgColor).append("\",")
                        .append(totalCancionesAlbum).append(",")
                        .append("\"").append(imagenUrl).append("\"\n");
            }
        } else {
            csv.append("No hay álbumes favoritos registrados\n");
        }
        csv.append("\n");

        // ============================================
        // SECCIÓN 6: SEGUIDORES
        // ============================================
        csv.append("━━━ SEGUIDORES (").append(totalSeguidores).append(") ━━━\n");
        csv.append("\n");

        if (usuario.getSeguidores() != null && !usuario.getSeguidores().isEmpty()) {
            csv.append("#,Username,Nombre,Correo,Edad\n");

            int index = 1;
            for (Usuario seguidor : usuario.getSeguidores()) {
                String usernameSeguidores = escaparCSV(seguidor.getUsername());
                String nombre = escaparCSV(seguidor.getNombre());
                String correo = escaparCSV(seguidor.getCorreo());
                int edad = seguidor.getEdad();

                csv.append(index++).append(",")
                        .append("\"").append(usernameSeguidores).append("\",")
                        .append("\"").append(nombre).append("\",")
                        .append("\"").append(correo).append("\",")
                        .append(edad).append("\n");
            }
        } else {
            csv.append("No tienes seguidores aún\n");
        }
        csv.append("\n");

        // ============================================
        // SECCIÓN 7: SIGUIENDO
        // ============================================
        csv.append("━━━ SIGUIENDO (").append(totalSiguiendo).append(") ━━━\n");
        csv.append("\n");

        if (usuario.getSiguiendo() != null && !usuario.getSiguiendo().isEmpty()) {
            csv.append("#,Username,Nombre,Correo,Edad\n");

            int index = 1;
            for (Usuario seguido : usuario.getSiguiendo()) {
                String usernameSiguiendo = escaparCSV(seguido.getUsername());
                String nombre = escaparCSV(seguido.getNombre());
                String correo = escaparCSV(seguido.getCorreo());
                int edad = seguido.getEdad();

                csv.append(index++).append(",")
                        .append("\"").append(usernameSiguiendo).append("\",")
                        .append("\"").append(nombre).append("\",")
                        .append("\"").append(correo).append("\",")
                        .append(edad).append("\n");
            }
        } else {
            csv.append("No sigues a nadie aún\n");
        }
        csv.append("\n");

        // ============================================
        // SECCIÓN 8: RESUMEN FINAL
        // ============================================
        csv.append("════════════════════════════════════════════════════════════\n");
        csv.append("\n");
        csv.append("━━━ RESUMEN FINAL ━━━\n");
        csv.append("\n");
        csv.append("Métrica,Valor\n");
        csv.append("Total de Canciones Favoritas,").append(totalCanciones).append("\n");
        csv.append("Total de Artistas Favoritos,").append(totalArtistas).append("\n");
        csv.append("Total de Álbumes Favoritos,").append(totalAlbumes).append("\n");
        csv.append("Total de Seguidores,").append(totalSeguidores).append("\n");
        csv.append("Total Siguiendo,").append(totalSiguiendo).append("\n");
        csv.append("Total de Items Favoritos,").append(totalCanciones + totalArtistas + totalAlbumes).append("\n");
        csv.append("Red Social (Seguidores + Siguiendo),").append(totalSeguidores + totalSiguiendo).append("\n");
        csv.append("\n");
        csv.append("════════════════════════════════════════════════════════════\n");
        csv.append("\n");
        csv.append("Reporte generado por SyncUp - Sistema de Streaming Musical\n");
        csv.append("RF-009: Descargar reporte del usuario\n");
        csv.append("Desarrollado en la Universidad del Quindío\n");
        csv.append("\n");
        csv.append("════════════════════════════════════════════════════════════\n");
        return csv.toString();
    }

    /**
     * Escapar comillas dobles en valores CSV
     */
    private String escaparCSV(String valor) {
        if (valor == null) {
            return "N/A";
        }
        return valor.replace("\"", "\"\"");
    }

    /**
     * RF-010: Generar reporte global CSV del sistema (Administrador)
     * Incluye: todos los usuarios, canciones, artistas y álbumes
     */
    public String generarReporteGlobalCSV() {
        StringBuilder csv = new StringBuilder();
        LocalDateTime ahora = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        // Obtener todos los datos
        List<Usuario> todosLosUsuarios = usuarioRepository.findAll();
        List<Cancion> todasLasCanciones = cancionRepository.findAll();
        List<Artista> todosLosArtistas = artistaRepository.findAll();
        List<Album> todosLosAlbumes = albumRepository.findAll();
        // ============================================
        // ENCABEZADO DEL REPORTE
        // ============================================
        csv.append("╔════════════════════════════════════════════════════════════╗\n");
        csv.append("║       REPORTE GLOBAL DEL SISTEMA - SYNCUP                  ║\n");
        csv.append("║          Sistema de Streaming Musical                      ║\n");
        csv.append("║              REPORTE DE ADMINISTRADOR                       ║\n");
        csv.append("╚════════════════════════════════════════════════════════════╝\n");
        csv.append("\n");
        csv.append("Fecha de Generación:,").append(ahora.format(formatter)).append("\n");
        csv.append("Tipo de Reporte:,Global - Administrador\n");
        csv.append("\n");
        csv.append("════════════════════════════════════════════════════════════\n");
        csv.append("\n");
        // ============================================
        // SECCIÓN 1: RESUMEN EJECUTIVO
        // ============================================
        csv.append("━━━ RESUMEN EJECUTIVO ━━━\n");
        csv.append("\n");
        csv.append("Métrica,Cantidad\n");
        csv.append("Total de Usuarios,").append(todosLosUsuarios.size()).append("\n");
        csv.append("Total de Canciones,").append(todasLasCanciones.size()).append("\n");
        csv.append("Total de Artistas,").append(todosLosArtistas.size()).append("\n");
        csv.append("Total de Álbumes,").append(todosLosAlbumes.size()).append("\n");
        csv.append("\n");
        // Estadísticas adicionales
        long usuariosActivos = todosLosUsuarios.stream()
                .filter(u -> u.getListaFavoritos() != null && !u.getListaFavoritos().isEmpty())
                .count();
        int totalSeguidoresGlobal = todosLosUsuarios.stream()
                .mapToInt(u -> u.getSeguidores() != null ? u.getSeguidores().size() : 0)
                .sum();
        csv.append("Usuarios con Favoritos,").append(usuariosActivos).append("\n");
        csv.append("Total de Conexiones Sociales,").append(totalSeguidoresGlobal).append("\n");
        csv.append("\n");
        // ============================================
        // SECCIÓN 2: USUARIOS
        // ============================================
        csv.append("━━━ TODOS LOS USUARIOS (").append(todosLosUsuarios.size()).append(") ━━━\n");
        csv.append("\n");
        csv.append("#,Username,Nombre,Correo,Edad,Canciones Fav,Artistas Fav,Álbumes Fav,Seguidores,Siguiendo\n");
        int index = 1;
        for (Usuario user : todosLosUsuarios) {
            String usernameUser = escaparCSV(user.getUsername());
            String nombreUser = escaparCSV(user.getNombre());
            String correoUser = escaparCSV(user.getCorreo());
            int edadUser = user.getEdad();
            int cancionesFav = user.getListaFavoritos() != null ? user.getListaFavoritos().size() : 0;
            int artistasFav = user.getArtistasFavoritos() != null ? user.getArtistasFavoritos().size() : 0;
            int albumesFav = user.getAlbumesFavoritos() != null ? user.getAlbumesFavoritos().size() : 0;
            int seguidoresCount = user.getSeguidores() != null ? user.getSeguidores().size() : 0;
            int siguiendoCount = user.getSiguiendo() != null ? user.getSiguiendo().size() : 0;
            csv.append(index++).append(",")
                    .append("\"").append(usernameUser).append("\",")
                    .append("\"").append(nombreUser).append("\",")
                    .append("\"").append(correoUser).append("\",")
                    .append(edadUser).append(",")
                    .append(cancionesFav).append(",")
                    .append(artistasFav).append(",")
                    .append(albumesFav).append(",")
                    .append(seguidoresCount).append(",")
                    .append(siguiendoCount).append("\n");
        }
        csv.append("\n");
        // ============================================
        // SECCIÓN 3: CANCIONES
        // ============================================
        csv.append("━━━ TODAS LAS CANCIONES (").append(todasLasCanciones.size()).append(") ━━━\n");
        csv.append("\n");
        csv.append("#,ID,Título,Artista,Álbum,Género,Año,Duración (min),URL Imagen,URL Audio\n");
        index = 1;
        for (Cancion cancion : todasLasCanciones) {
            String songId = cancion.getSongId() != null ? cancion.getSongId() : "N/A";
            String titulo = escaparCSV(cancion.getTitulo());
            String artista = cancion.getArtista() != null ? escaparCSV(cancion.getArtista().getNombre()) : "Sin artista";
            String album = cancion.getAlbum() != null ? escaparCSV(cancion.getAlbum().getNombre()) : "Sin álbum";
            String genero = escaparCSV(cancion.getGenero());
            int anio = cancion.getAnio();
            double duracion = cancion.getDuracion();
            String imagenUrl = cancion.getImagenUrl() != null ? cancion.getImagenUrl() : "N/A";
            String audioUrl = cancion.getMusica() != null ? cancion.getMusica() : "N/A";
            csv.append(index++).append(",")
                    .append("\"").append(songId).append("\",")
                    .append("\"").append(titulo).append("\",")
                    .append("\"").append(artista).append("\",")
                    .append("\"").append(album).append("\",")
                    .append("\"").append(genero).append("\",")
                    .append(anio).append(",")
                    .append(String.format("%.2f", duracion)).append(",")
                    .append("\"").append(imagenUrl).append("\",")
                    .append("\"").append(audioUrl).append("\"\n");
        }
        csv.append("\n");
        // ============================================
        // SECCIÓN 4: ARTISTAS
        // ============================================
        csv.append("━━━ TODOS LOS ARTISTAS (").append(todosLosArtistas.size()).append(") ━━━\n");
        csv.append("\n");
        csv.append("#,ID,Nombre,País,Género Principal,Total Álbumes,Total Canciones,URL Imagen\n");
        index = 1;
        for (Artista artista : todosLosArtistas) {
            String artistId = artista.getArtistId() != null ? artista.getArtistId() : "N/A";
            String nombreArtista = escaparCSV(artista.getNombre());
            String pais = escaparCSV(artista.getPais());
            String genero = escaparCSV(artista.getGeneroPrincipal());
            int totalAlbumes = artista.getAlbumes() != null ? artista.getAlbumes().size() : 0;
            int totalCanciones = artista.getCanciones() != null ? artista.getCanciones().size() : 0;
            String imagenUrl = artista.getImagenUrl() != null ? artista.getImagenUrl() : "N/A";
            csv.append(index++).append(",")
                    .append("\"").append(artistId).append("\",")
                    .append("\"").append(nombreArtista).append("\",")
                    .append("\"").append(pais).append("\",")
                    .append("\"").append(genero).append("\",")
                    .append(totalAlbumes).append(",")
                    .append(totalCanciones).append(",")
                    .append("\"").append(imagenUrl).append("\"\n");
        }
        csv.append("\n");
        // ============================================
        // SECCIÓN 5: ÁLBUMES
        // ============================================
        csv.append("━━━ TODOS LOS ÁLBUMES (").append(todosLosAlbumes.size()).append(") ━━━\n");
        csv.append("\n");
        csv.append("#,ID,Nombre,Descripción,Artista ID,Total Canciones,Color BG,URL Imagen\n");
        index = 1;
        for (Album album : todosLosAlbumes) {
            String albumId = album.getId() != null ? album.getId() : "N/A";
            String nombreAlbum = escaparCSV(album.getNombre());
            String descripcion = escaparCSV(album.getDescripcion());
            String artistId = album.getArtistId() != null ? album.getArtistId() : "N/A";
            int totalCanciones = album.getSongIds() != null ? album.getSongIds().size() : 0;
            String bgColor = album.getBgColor() != null ? album.getBgColor() : "N/A";
            String imagenUrl = album.getImagenUrl() != null ? album.getImagenUrl() : "N/A";

            csv.append(index++).append(",")
                    .append("\"").append(albumId).append("\",")
                    .append("\"").append(nombreAlbum).append("\",")
                    .append("\"").append(descripcion).append("\",")
                    .append("\"").append(artistId).append("\",")
                    .append(totalCanciones).append(",")
                    .append("\"").append(bgColor).append("\",")
                    .append("\"").append(imagenUrl).append("\"\n");
        }
        csv.append("\n");
        // ===========================================
        // SECCIÓN 6: ESTADÍSTICAS POR GÉNERO
        // ============================================
        csv.append("━━━ ESTADÍSTICAS POR GÉNERO ━━━\n");
        csv.append("\n");
        csv.append("Género,Total Canciones\n");
        Map<String, Long> cancionesPorGenero = todasLasCanciones.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getGenero() != null ? c.getGenero() : "Sin género",
                        Collectors.counting()
                ));
        cancionesPorGenero.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .forEach(entry ->
                        csv.append("\"").append(escaparCSV(entry.getKey())).append("\",")
                                .append(entry.getValue()).append("\n")
                );
        csv.append("\n");
        // ============================================
        // SECCIÓN 7: TOP ARTISTAS MÁS POPULARES
        // ============================================
        csv.append("━━━ TOP 20 ARTISTAS MÁS POPULARES ━━━\n");
        csv.append("\n");
        csv.append("#,Artista,Veces en Favoritos\n");
        Map<String, Long> artistasPopulares = todosLosUsuarios.stream()
                .flatMap(u -> u.getArtistasFavoritos() != null ? u.getArtistasFavoritos().stream() : Stream.empty())
                .collect(Collectors.groupingBy(Artista::getNombre, Collectors.counting()));
        AtomicInteger rankArtista = new AtomicInteger(1);
        artistasPopulares.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(20)
                .forEach(entry ->
                        csv.append(rankArtista.getAndIncrement()).append(",")
                                .append("\"").append(escaparCSV(entry.getKey())).append("\",")
                                .append(entry.getValue()).append("\n")
                );
        csv.append("\n");
        // ============================================
        // SECCIÓN 8: TOP CANCIONES MÁS POPULARES
        // ============================================
        csv.append("━━━ TOP 20 CANCIONES MÁS POPULARES ━━━\n");
        csv.append("\n");
        csv.append("#,Canción,Artista,Veces en Favoritos\n");
        Map<Cancion, Long> cancionesPopulares = todosLosUsuarios.stream()
                .flatMap(u -> u.getListaFavoritos() != null ? u.getListaFavoritos().stream() : Stream.empty())
                .collect(Collectors.groupingBy(c -> c, Collectors.counting()));
        AtomicInteger rankCancion = new AtomicInteger(1);
        cancionesPopulares.entrySet().stream()
                .sorted(Map.Entry.<Cancion, Long>comparingByValue().reversed())
                .limit(20)
                .forEach(entry -> {
                    Cancion c = entry.getKey();
                    csv.append(rankCancion.getAndIncrement()).append(",")
                            .append("\"").append(escaparCSV(c.getTitulo())).append("\",")
                            .append("\"").append(c.getArtista() != null ? escaparCSV(c.getArtista().getNombre()) : "N/A").append("\",")
                            .append(entry.getValue()).append("\n");
                });
        csv.append("\n");
        // ============================================
        // SECCIÓN 9: RESUMEN FINAL
        // ============================================
        csv.append("════════════════════════════════════════════════════════════\n");
        csv.append("\n");
        csv.append("━━━ RESUMEN FINAL DEL SISTEMA ━━━\n");
        csv.append("\n");
        csv.append("Métrica,Valor\n");
        csv.append("Total de Usuarios,").append(todosLosUsuarios.size()).append("\n");
        csv.append("Total de Canciones,").append(todasLasCanciones.size()).append("\n");
        csv.append("Total de Artistas,").append(todosLosArtistas.size()).append("\n");
        csv.append("Total de Álbumes,").append(todosLosAlbumes.size()).append("\n");
        csv.append("Usuarios Activos (con favoritos),").append(usuariosActivos).append("\n");
        csv.append("Total de Conexiones Sociales,").append(totalSeguidoresGlobal).append("\n");
        csv.append("Géneros Musicales Únicos,").append(cancionesPorGenero.size()).append("\n");
        csv.append("\n");
        csv.append("════════════════════════════════════════════════════════════\n");
        csv.append("\n");
        csv.append("Reporte generado por SyncUp - Sistema de Streaming Musical\n");
        csv.append("RF-010: Reporte Global del Sistema (Administrador)\n");
        csv.append("Desarrollado en la Universidad del Quindío\n");
        csv.append("\n");
        csv.append("════════════════════════════════════════════════════════════\n");
        return csv.toString();
    }

}