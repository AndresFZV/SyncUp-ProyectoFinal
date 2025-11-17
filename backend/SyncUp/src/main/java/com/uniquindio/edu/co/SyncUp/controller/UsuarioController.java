package com.uniquindio.edu.co.SyncUp.controller;

import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Usuario;
import com.uniquindio.edu.co.SyncUp.services.AdminService;
import com.uniquindio.edu.co.SyncUp.services.GrafoSocialService;
import com.uniquindio.edu.co.SyncUp.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Controlador REST para gestionar las operaciones de usuarios.
 * Proporciona endpoints para registro, autenticación, perfil, favoritos y relaciones sociales.
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AdminService adminService;

    @Autowired
    private GrafoSocialService grafoSocialService;

    /**
     * Registra un nuevo usuario en el sistema.
     *
     * @param usuario Objeto Usuario con los datos del usuario a registrar
     * @return ResponseEntity con el usuario registrado o error en caso de fallo
     */
    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Autentica a un usuario o administrador mediante username y password.
     *
     * @param username Nombre de usuario
     * @param password Contraseña
     * @return ResponseEntity con el resultado del proceso de autenticación
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String password) {
        try {
            return ResponseEntity.ok(usuarioService.login(username, password));
        } catch (RuntimeException e) {
            try {
                return ResponseEntity.ok(adminService.login(username, password));
            } catch (RuntimeException ex) {
                throw new RuntimeException("Credenciales incorrectas");
            }
        }
    }

    /**
     * Actualiza el perfil de un usuario existente.
     *
     * @param username Nombre de usuario a actualizar
     * @param nombre Nuevo nombre (opcional)
     * @param correo Nuevo correo (opcional)
     * @param password Nueva contraseña (opcional)
     * @return ResponseEntity con el usuario actualizado
     */
    @PutMapping("/{username}")
    public ResponseEntity<?> actualizarPerfil(
            @PathVariable String username,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String correo,
            @RequestParam(required = false) String password) {
        return ResponseEntity.ok(usuarioService.actualizarPerfil(username, nombre, correo, password));
    }

    /**
     * Elimina un usuario del sistema.
     *
     * @param username Nombre de usuario a eliminar
     * @return ResponseEntity con mensaje de éxito o error si no se encuentra
     */
    @DeleteMapping("/{username}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable String username) {
        try {
            usuarioService.eliminarUsuario(username);
            return ResponseEntity.ok("Usuario eliminado exitosamente");
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Agrega una canción a la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario
     * @param body Cuerpo de la solicitud con el ID de la canción
     * @return ResponseEntity con el usuario actualizado o error en caso de fallo
     */
    @PostMapping("/{username}/favoritos/canciones")
    public ResponseEntity<?> agregarCancionFavorita(
            @PathVariable String username,
            @RequestBody Map<String, String> body) {
        try {
            String cancionId = body.get("cancionId");
            if (cancionId == null || cancionId.isEmpty()) {
                throw new RuntimeException("Se requiere el ID de la canción");
            }

            Usuario usuario = usuarioService.agregarCancionFavorita(username, cancionId);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Agrega un artista a la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario
     * @param artista Objeto Artista a agregar a favoritos
     * @return ResponseEntity con el usuario actualizado
     */
    @PostMapping("/{username}/favoritos/artistas")
    public ResponseEntity<?> agregarArtistaFavorito(@PathVariable String username, @RequestBody Artista artista) {
        return ResponseEntity.ok(usuarioService.agregarArtistaFavorito(username, artista));
    }

    /**
     * Sigue a otro usuario en el sistema.
     *
     * @param username Nombre de usuario que realiza el seguimiento
     * @param aSeguir Objeto Usuario a seguir
     * @return ResponseEntity con el usuario actualizado
     */
    @PostMapping("/{username}/seguir")
    public ResponseEntity<?> seguirUsuario(@PathVariable String username, @RequestBody Usuario aSeguir) {
        return ResponseEntity.ok(usuarioService.seguirUsuario(username, aSeguir));
    }

    /**
     * Sigue a un usuario por su username.
     *
     * @param username Nombre de usuario que realiza el seguimiento
     * @param usernameASeguir Nombre de usuario a seguir
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @PostMapping("/{username}/seguir/{usernameASeguir}")
    public ResponseEntity<?> seguirUsuarioPorUsername(
            @PathVariable String username,
            @PathVariable String usernameASeguir) {
        try {
            Usuario usuarioASeguir = usuarioService.buscarIdentificador(usernameASeguir);
            usuarioService.seguirUsuario(username, usuarioASeguir);

            try {
                grafoSocialService.actualizarSeguimiento(username, usernameASeguir);
            } catch (Exception e) {
                System.err.println("No se pudo actualizar grafo: " + e.getMessage());
            }

            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Ahora sigues a " + usernameASeguir);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Deja de seguir a otro usuario.
     *
     * @param username Nombre de usuario que deja de seguir
     * @param aDejar Objeto Usuario a dejar de seguir
     * @return ResponseEntity con el usuario actualizado
     */
    @PostMapping("/{username}/dejar-seguir")
    public ResponseEntity<?> dejarDeSeguirUsuario(@PathVariable String username, @RequestBody Usuario aDejar) {
        return ResponseEntity.ok(usuarioService.dejarDeSeguirUsuario(username, aDejar));
    }

    /**
     * Deja de seguir a un usuario por su username.
     *
     * @param username Nombre de usuario que deja de seguir
     * @param usernameADejarDeSeguir Nombre de usuario a dejar de seguir
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @PostMapping("/{username}/dejar-seguir/{usernameADejarDeSeguir}")
    public ResponseEntity<?> dejarDeSeguirUsuarioPorUsername(
            @PathVariable String username,
            @PathVariable String usernameADejarDeSeguir) {
        try {
            Usuario usuarioADejarDeSeguir = usuarioService.buscarIdentificador(usernameADejarDeSeguir);
            usuarioService.dejarDeSeguirUsuario(username, usuarioADejarDeSeguir);

            try {
                grafoSocialService.actualizarDejarDeSeguir(username, usernameADejarDeSeguir);
            } catch (Exception e) {
                System.err.println("No se pudo actualizar grafo: " + e.getMessage());
            }

            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Has dejado de seguir a " + usernameADejarDeSeguir);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Obtiene la lista de todos los usuarios del sistema.
     *
     * @return ResponseEntity con la lista de usuarios simplificada
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarUsuarios() {
        try {
            List<Usuario> usuarios = usuarioService.listarUsuarios();
            List<Map<String, Object>> usuariosSimples = usuarios.stream()
                    .map(usuario -> {
                        Map<String, Object> data = new HashMap<>();
                        data.put("username", usuario.getUsername());
                        data.put("nombre", usuario.getNombre());
                        data.put("correo", usuario.getCorreo());
                        data.put("edad", usuario.getEdad());

                        int cantidadSeguidores = 0;
                        List<String> seguidoresNombres = new ArrayList<>();
                        if (usuario.getSeguidores() != null) {
                            cantidadSeguidores = usuario.getSeguidores().size();
                            seguidoresNombres = usuario.getSeguidores().stream()
                                    .filter(Objects::nonNull)
                                    .map(Usuario::getUsername)
                                    .filter(Objects::nonNull)
                                    .collect(Collectors.toList());
                        }
                        data.put("cantidadSeguidores", cantidadSeguidores);
                        data.put("seguidoresNombres", seguidoresNombres);

                        int cantidadSiguiendo = 0;
                        List<String> siguiendoNombres = new ArrayList<>();
                        if (usuario.getSiguiendo() != null) {
                            cantidadSiguiendo = usuario.getSiguiendo().size();
                            siguiendoNombres = usuario.getSiguiendo().stream()
                                    .filter(Objects::nonNull)
                                    .map(Usuario::getUsername)
                                    .filter(Objects::nonNull)
                                    .collect(Collectors.toList());
                        }
                        data.put("cantidadSiguiendo", cantidadSiguiendo);
                        data.put("siguiendoNombres", siguiendoNombres);
                        return data;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(usuariosSimples);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    /**
     * Busca un usuario por su identificador (username o correo).
     *
     * @param identificador Username o correo del usuario a buscar
     * @return ResponseEntity con la información básica del usuario o error si no existe
     */
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarUsuario(@RequestParam String identificador) {
        try {
            Usuario usuario = usuarioService.buscarIdentificador(identificador);
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("username", usuario.getUsername());
            respuesta.put("correo", usuario.getCorreo());
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Verifica la palabra secreta de un usuario.
     *
     * @param datos Mapa con username y palabra secreta
     * @return ResponseEntity con mensaje de éxito o error
     */
    @PostMapping("/verificar-palabra-secreta")
    public ResponseEntity<?> verificarPalabraSecreta(@RequestBody Map<String, String> datos) {
        try {
            String username = datos.get("username");
            String palabraSecreta = datos.get("palabraSecreta");
            boolean esValida = usuarioService.verificarPalabraSecreta(username, palabraSecreta);
            if (esValida) {
                return ResponseEntity.ok("Palabra secreta correcta");
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Palabra secreta incorrecta");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Actualiza la contraseña de un usuario.
     *
     * @param datos Mapa con username y nueva contraseña
     * @return ResponseEntity con mensaje de éxito o error
     */
    @PutMapping("/actualizar-password")
    public ResponseEntity<?> actualizarPassword(@RequestBody Map<String, String> datos) {
        try {
            String username = datos.get("username");
            String nuevaPassword = datos.get("nuevaPassword");
            usuarioService.actualizarPassword(username, nuevaPassword);
            return ResponseEntity.ok("Contraseña actualizada exitosamente");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Obtiene los usuarios más seguidos del sistema.
     *
     * @return ResponseEntity con la lista de usuarios más seguidos
     */
    @GetMapping("/mas-seguidos")
    public ResponseEntity<List<Map<String, Object>>> getUsuariosMasSeguidos() {
        try {
            List<Usuario> usuarios = usuarioService.listarUsuarios();
            List<Map<String, Object>> usuariosMasSeguidos = usuarios.stream()
                    .map(usuario -> {
                        Map<String, Object> data = new HashMap<>();
                        data.put("username", usuario.getUsername());
                        data.put("nombre", usuario.getNombre());
                        int cantidadSeguidores = 0;
                        List<String> nombresSeguidores = new ArrayList<>();
                        if (usuario.getSeguidores() != null) {
                            cantidadSeguidores = usuario.getSeguidores().size();
                            nombresSeguidores = usuario.getSeguidores().stream()
                                    .filter(Objects::nonNull)
                                    .map(Usuario::getUsername)
                                    .filter(Objects::nonNull)
                                    .collect(Collectors.toList());
                        }
                        data.put("seguidores", cantidadSeguidores);
                        data.put("listaSeguidores", nombresSeguidores);
                        return data;
                    })
                    .sorted((a, b) -> Integer.compare((Integer)
                            b.get("seguidores"), (Integer) a.get("seguidores")))
                    .limit(10)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(usuariosMasSeguidos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    /**
     * Obtiene el perfil completo de un usuario.
     *
     * @param username Nombre de usuario del cual obtener el perfil
     * @return ResponseEntity con el perfil del usuario o error si no existe
     */
    @GetMapping("/{username}/perfil")
    public ResponseEntity<?> obtenerPerfil(@PathVariable String username) {
        try {
            Usuario usuario = usuarioService.buscarIdentificador(username);

            Map<String, Object> perfil = new HashMap<>();
            perfil.put("username", usuario.getUsername());
            perfil.put("nombre", usuario.getNombre());
            perfil.put("correo", usuario.getCorreo());
            perfil.put("edad", usuario.getEdad());

            Map<String, Object> estadisticas = new HashMap<>();
            estadisticas.put("seguidores", usuario.getSeguidores() != null ? usuario.getSeguidores().size() : 0);
            estadisticas.put("siguiendo", usuario.getSiguiendo() != null ? usuario.getSiguiendo().size() : 0);
            estadisticas.put("cancionesFavoritas", usuario.getListaFavoritos() != null ? usuario.getListaFavoritos().size() : 0);
            estadisticas.put("artistasFavoritos", usuario.getArtistasFavoritos() != null ? usuario.getArtistasFavoritos().size() : 0);
            estadisticas.put("albumesFavoritos", usuario.getAlbumesFavoritos() != null ? usuario.getAlbumesFavoritos().size() : 0);
            estadisticas.put("playlistsPublicas", 0);

            perfil.put("estadisticas", estadisticas);

            return ResponseEntity.ok(perfil);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Obtiene los artistas favoritos de un usuario.
     *
     * @param username Nombre de usuario del cual obtener los artistas favoritos
     * @return ResponseEntity con la lista de artistas favoritos o error si no existe
     */
    @GetMapping("/{username}/favoritos/artistas")
    public ResponseEntity<?> obtenerArtistasFavoritos(@PathVariable String username) {
        try {
            Usuario usuario = usuarioService.buscarIdentificador(username);

            List<Map<String, Object>> artistasFavoritos = new ArrayList<>();

            if (usuario.getArtistasFavoritos() != null) {
                artistasFavoritos = usuario.getArtistasFavoritos().stream()
                        .filter(Objects::nonNull)
                        .map(artista -> {
                            Map<String, Object> data = new HashMap<>();
                            data.put("artistaId", artista.getArtistId());
                            data.put("nombre", artista.getNombre());
                            data.put("imagenUrl", artista.getImagenUrl());
                            data.put("pais", artista.getPais());
                            data.put("generoPrincipal", artista.getGeneroPrincipal());
                            return data;
                        })
                        .collect(Collectors.toList());
            }

            return ResponseEntity.ok(artistasFavoritos);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Obtiene las canciones favoritas de un usuario.
     *
     * @param username Nombre de usuario del cual obtener las canciones favoritas
     * @return ResponseEntity con la lista de canciones favoritas o error si no existe
     */
    @GetMapping("/{username}/favoritos/canciones")
    public ResponseEntity<?> obtenerCancionesFavoritas(@PathVariable String username) {
        try {
            Usuario usuario = usuarioService.buscarIdentificador(username);

            List<Map<String, Object>> cancionesFavoritas = new ArrayList<>();

            if (usuario.getListaFavoritos() != null) {
                cancionesFavoritas = usuario.getListaFavoritos().stream()
                        .filter(Objects::nonNull)
                        .map(cancion -> {
                            Map<String, Object> data = new HashMap<>();
                            data.put("cancionId", cancion.getSongId());
                            data.put("titulo", cancion.getTitulo());
                            data.put("genero", cancion.getGenero());
                            data.put("anio", cancion.getAnio());
                            data.put("duracion", cancion.getDuracion());
                            data.put("imagenUrl", cancion.getImagenUrl());
                            data.put("musica", cancion.getMusica());

                            if (cancion.getArtista() != null) {
                                data.put("artistaId", cancion.getArtista().getArtistId());
                                data.put("artistaNombre", cancion.getArtista().getNombre());
                            } else {
                                data.put("artistaNombre", "Desconocido");
                            }

                            if (cancion.getAlbum() != null) {
                                data.put("albumId", cancion.getAlbum().getId());
                                data.put("albumNombre", cancion.getAlbum().getNombre());
                                data.put("albumCover", cancion.getAlbum().getImagenUrl());
                            }

                            return data;
                        })
                        .collect(Collectors.toList());
            }

            return ResponseEntity.ok(cancionesFavoritas);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Obtiene los usuarios que sigue un usuario específico.
     *
     * @param username Nombre de usuario del cual obtener la lista de seguidos
     * @return ResponseEntity con la lista de usuarios seguidos o error si no existe
     */
    @GetMapping("/{username}/siguiendo")
    public ResponseEntity<?> obtenerSiguiendo(@PathVariable String username) {
        try {
            Usuario usuario = usuarioService.buscarIdentificador(username);

            List<Map<String, Object>> siguiendo = new ArrayList<>();

            if (usuario.getSiguiendo() != null) {
                siguiendo = usuario.getSiguiendo().stream()
                        .filter(Objects::nonNull)
                        .map(u -> {
                            Map<String, Object> data = new HashMap<>();
                            data.put("username", u.getUsername());
                            data.put("nombre", u.getNombre());
                            return data;
                        })
                        .collect(Collectors.toList());
            }

            return ResponseEntity.ok(siguiendo);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Obtiene los seguidores de un usuario específico.
     *
     * @param username Nombre de usuario del cual obtener los seguidores
     * @return ResponseEntity con la lista de seguidores o error si no existe
     */
    @GetMapping("/{username}/seguidores")
    public ResponseEntity<?> obtenerSeguidores(@PathVariable String username) {
        try {
            Usuario usuario = usuarioService.buscarIdentificador(username);

            List<Map<String, Object>> seguidores = new ArrayList<>();

            if (usuario.getSeguidores() != null) {
                seguidores = usuario.getSeguidores().stream()
                        .filter(Objects::nonNull)
                        .map(u -> {
                            Map<String, Object> data = new HashMap<>();
                            data.put("username", u.getUsername());
                            data.put("nombre", u.getNombre());
                            return data;
                        })
                        .collect(Collectors.toList());
            }

            return ResponseEntity.ok(seguidores);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Elimina una canción de la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario
     * @param cancionId ID de la canción a eliminar de favoritos
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @DeleteMapping("/{username}/favoritos/canciones/{cancionId}")
    public ResponseEntity<?> eliminarCancionFavorita(
            @PathVariable String username,
            @PathVariable String cancionId) {
        try {
            usuarioService.eliminarCancionFavorita(username, cancionId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Canción eliminada de favoritos");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Elimina un artista de la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario
     * @param artistaId ID del artista a eliminar de favoritos
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @DeleteMapping("/{username}/favoritos/artistas/{artistaId}")
    public ResponseEntity<?> eliminarArtistaFavorito(
            @PathVariable String username,
            @PathVariable String artistaId) {
        try {
            usuarioService.eliminarArtistaFavorito(username, artistaId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Artista eliminado de favoritos");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Obtiene los álbumes favoritos de un usuario.
     *
     * @param username Nombre de usuario del cual obtener los álbumes favoritos
     * @return ResponseEntity con la lista de álbumes favoritos o error si no existe
     */
    @GetMapping("/{username}/favoritos/albums")
    public ResponseEntity<?> obtenerAlbumesFavoritos(@PathVariable String username) {
        try {
            Usuario usuario = usuarioService.buscarIdentificador(username);

            List<Map<String, Object>> albumesFavoritos = new ArrayList<>();

            if (usuario.getAlbumesFavoritos() != null) {
                albumesFavoritos = usuario.getAlbumesFavoritos().stream()
                        .filter(Objects::nonNull)
                        .map(album -> {
                            Map<String, Object> data = new HashMap<>();
                            data.put("albumId", album.getId());
                            data.put("nombre", album.getNombre());
                            data.put("imagenUrl", album.getImagenUrl());
                            data.put("artistaId", album.getArtistId());
                            return data;
                        })
                        .collect(Collectors.toList());
            }

            return ResponseEntity.ok(albumesFavoritos);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Elimina un álbum de la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario
     * @param albumId ID del álbum a eliminar de favoritos
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @DeleteMapping("/{username}/favoritos/albums/{albumId}")
    public ResponseEntity<?> eliminarAlbumFavorito(
            @PathVariable String username,
            @PathVariable String albumId) {
        try {
            usuarioService.eliminarAlbumFavorito(username, albumId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Álbum eliminado de favoritos");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Verifica si un usuario sigue a otro usuario.
     *
     * @param username Nombre de usuario que realiza la verificación
     * @param usernameObjetivo Nombre de usuario objetivo a verificar
     * @return ResponseEntity con el resultado de la verificación o error si no existe
     */
    @GetMapping("/{username}/sigue/{usernameObjetivo}")
    public ResponseEntity<?> verificarSiSigue(
            @PathVariable String username,
            @PathVariable String usernameObjetivo) {
        try {
            Usuario usuario = usuarioService.buscarIdentificador(username);
            Usuario usuarioObjetivo = usuarioService.buscarIdentificador(usernameObjetivo);

            boolean siguiendo = false;
            if (usuario.getSiguiendo() != null) {
                siguiendo = usuario.getSiguiendo().stream()
                        .anyMatch(u -> u.getUsername() != null &&
                                u.getUsername().equals(usernameObjetivo));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("siguiendo", siguiendo);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Descarga un reporte completo del usuario en formato CSV.
     *
     * @param username Nombre de usuario del cual generar el reporte
     * @return ResponseEntity con el archivo CSV o error en caso de fallo
     */
    @GetMapping(value = "/reporte/{username}", produces = "text/csv")
    public ResponseEntity<byte[]> descargarReporteUsuario(@PathVariable String username) {
        try {
            String csv = usuarioService.generarReporteCSV(username);
            byte[] csvBytes = ("\uFEFF" + csv).getBytes(StandardCharsets.UTF_8);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
            headers.setContentDispositionFormData("attachment",
                    "SyncUp_Reporte_" + username + "_" + LocalDate.now() + ".csv");
            headers.setContentLength(csvBytes.length);
            return ResponseEntity.ok()
                    .headers(headers).body(csvBytes);

        } catch (RuntimeException e) {
            String errorCsv = "Error al generar el reporte: " + e.getMessage();
            byte[] errorBytes = errorCsv.getBytes(StandardCharsets.UTF_8);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBytes);
        }
    }

    /**
     * Descarga un reporte global del sistema en formato CSV (solo para administradores).
     *
     * @return ResponseEntity con el archivo CSV del reporte global o error en caso de fallo
     */
    @GetMapping(value = "/reporte-global", produces = "text/csv")
    public ResponseEntity<byte[]> descargarReporteGlobal() {
        try {
            String csv = usuarioService.generarReporteGlobalCSV();
            byte[] csvBytes = ("\uFEFF" + csv).getBytes(StandardCharsets.UTF_8);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
            headers.setContentDispositionFormData("attachment",
                    "SyncUp_Reporte_Global_" + LocalDate.now() + ".csv");
            headers.setContentLength(csvBytes.length);
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvBytes);
        } catch (Exception e) {
            String errorCsv = "Error al generar el reporte global: " + e.getMessage();
            byte[] errorBytes = errorCsv.getBytes(StandardCharsets.UTF_8);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorBytes);
        }
    }

    /**
     * Agrega una canción a la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario
     * @param cancionId ID de la canción a agregar a favoritos
     * @return ResponseEntity con mensaje de éxito o error en caso de fallo
     */
    @PostMapping("/{username}/favoritos/canciones/{cancionId}")
    public ResponseEntity<Map<String, String>> agregarCancionFavorita(
            @PathVariable String username,
            @PathVariable String cancionId) {
        try {
            usuarioService.agregarCancionFavorita(username, cancionId);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Canción agregada a favoritas");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Verifica si una canción está en la lista de favoritos de un usuario.
     *
     * @param username Nombre de usuario
     * @param cancionId ID de la canción a verificar
     * @return ResponseEntity con el resultado de la verificación
     */
    @GetMapping("/{username}/favoritos/canciones/{cancionId}/check")
    public ResponseEntity<Map<String, Boolean>> verificarCancionFavorita(
            @PathVariable String username,
            @PathVariable String cancionId) {
        try {
            Usuario usuario = usuarioService.buscarIdentificador(username);

            boolean esFavorita = false;
            if (usuario.getListaFavoritos() != null) {
                esFavorita = usuario.getListaFavoritos().stream()
                        .anyMatch(c -> c.getSongId().equals(cancionId));
            }

            Map<String, Boolean> response = new HashMap<>();
            response.put("esFavorita", esFavorita);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Boolean> response = new HashMap<>();
            response.put("esFavorita", false);
            return ResponseEntity.ok(response);
        }
    }
}