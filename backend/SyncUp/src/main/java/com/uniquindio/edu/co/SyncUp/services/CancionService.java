package com.uniquindio.edu.co.SyncUp.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.dto.CancionDTO;
import com.uniquindio.edu.co.SyncUp.dto.SolicitudCancion;
import com.uniquindio.edu.co.SyncUp.repository.AlbumRepository;
import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository;
import com.uniquindio.edu.co.SyncUp.repository.CancionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Servicio para gestionar las operaciones de canciones.
 * Proporciona lógica de negocio para CRUD de canciones, carga masiva y búsquedas relacionadas.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class CancionService {

    private final ArtistaRepository artistaRepository;
    private final AlbumRepository albumRepository;
    private final CancionRepository cancionRepository;
    private final Cloudinary cloudinary;

    /**
     * Agrega una nueva canción al sistema.
     *
     * @param solicitud DTO con los datos de la canción a crear
     * @return Canción creada
     * @throws IOException si hay error al subir los archivos multimedia
     * @throws RuntimeException si el artista no existe
     */
    public Cancion addCancion(SolicitudCancion solicitud) throws IOException {
        Map<String, Object> subidaAudio = cloudinary.uploader().upload(
                solicitud.getMusica().getBytes(),
                ObjectUtils.asMap("resource_type", "video")
        );

        Map<String, Object> subidaImagen = cloudinary.uploader().upload(
                solicitud.getArchivoImagen().getBytes(),
                ObjectUtils.asMap("resource_type", "image")
        );

        Double duracionSeg = (Double) subidaAudio.get("duration");
        double duracionMinutos = duracionSeg / 60.0;

        Artista artista = artistaRepository.findById(solicitud.getArtistaId())
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));

        Album album = null;
        if (solicitud.getAlbumId() != null
                && !solicitud.getAlbumId().isEmpty()
                && !solicitud.getAlbumId().equals("null")) {

            album = albumRepository.findById(solicitud.getAlbumId())
                    .orElse(null);
        }

        Cancion nuevaCancion = Cancion.builder()
                .titulo(solicitud.getTitulo())
                .genero(solicitud.getGenero())
                .anio(solicitud.getAnio())
                .duracion(duracionMinutos)
                .imagenUrl(subidaImagen.get("secure_url").toString())
                .musica(subidaAudio.get("secure_url").toString())
                .artista(artista)
                .album(album)
                .build();

        Cancion cancionGuardada = cancionRepository.save(nuevaCancion);

        if (artista.getCanciones() == null) {
            artista.setCanciones(new LinkedList<>());
        }
        artista.getCanciones().add(cancionGuardada);
        artistaRepository.save(artista);

        if (album != null) {
            if (album.getSongIds() == null) {
                album.setSongIds(new ArrayList<>());
            }
            album.getSongIds().add(cancionGuardada.getSongId());
            albumRepository.save(album);
        }

        return cancionGuardada;
    }

    /**
     * Obtiene la lista de todas las canciones en formato DTO.
     *
     * @return Lista de canciones DTO
     */
    public List<CancionDTO> listarCanciones() {
        List<Cancion> canciones = cancionRepository.findAll();

        return canciones.stream().map(cancion -> CancionDTO.builder()
                .songId(cancion.getSongId())
                .titulo(cancion.getTitulo())
                .genero(cancion.getGenero())
                .anio(cancion.getAnio())
                .duracion(cancion.getDuracion())
                .imagenUrl(cancion.getImagenUrl())
                .musica(cancion.getMusica())
                .artistaId(cancion.getArtista() != null ? cancion.getArtista().getArtistId() : null)
                .artistaNombre(cancion.getArtista() != null ? cancion.getArtista().getNombre() : "Sin artista")
                .albumId(cancion.getAlbum() != null ? cancion.getAlbum().getId() : null)
                .albumNombre(cancion.getAlbum() != null ? cancion.getAlbum().getNombre() : "Sin álbum")
                .build()
        ).collect(Collectors.toList());
    }

    /**
     * Obtiene una canción por su identificador.
     *
     * @param id Identificador único de la canción
     * @return Canción encontrada
     * @throws RuntimeException si la canción no existe
     */
    public Cancion obtenerCancion(String id) {
        return cancionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canción no encontrada"));
    }

    /**
     * Agrega una canción al sistema.
     *
     * @param cancion Canción a agregar
     * @return Canción guardada
     */
    public Cancion agregarCancion(Cancion cancion) {
        return cancionRepository.save(cancion);
    }

    /**
     * Actualiza una canción existente.
     *
     * @param id Identificador de la canción a actualizar
     * @param cancionActualizada Canción con los nuevos datos
     * @return Canción actualizada
     * @throws RuntimeException si la canción no existe
     */
    public Cancion actualizarCancion(String id, Cancion cancionActualizada) {
        Cancion cancion = cancionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canción no encontrada"));

        cancion.setTitulo(cancionActualizada.getTitulo());
        cancion.setArtista(cancionActualizada.getArtista());
        cancion.setAlbum(cancionActualizada.getAlbum());
        cancion.setGenero(cancionActualizada.getGenero());
        cancion.setDuracion(cancionActualizada.getDuracion());
        cancion.setAnio(cancionActualizada.getAnio());

        return cancionRepository.save(cancion);
    }

    /**
     * Elimina una canción del sistema.
     *
     * @param id Identificador de la canción a eliminar
     * @throws RuntimeException si la canción no existe
     */
    public void eliminarCancion(String id) {
        Cancion cancion = cancionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canción no encontrada"));

        if (cancion.getArtista() != null) {
            Artista artista = cancion.getArtista();
            if (artista.getCanciones() != null) {
                artista.getCanciones().removeIf(c -> c.getSongId().equals(id));
                artistaRepository.save(artista);
            }
        }

        if (cancion.getAlbum() != null) {
            Album album = cancion.getAlbum();
            if (album.getSongIds() != null) {
                album.getSongIds().remove(id);
                albumRepository.save(album);
            }
        }

        cancionRepository.deleteById(id);
    }

    /**
     * Realiza una carga masiva de canciones desde archivos.
     *
     * @param archivoMetadata Archivo con metadatos de las canciones
     * @param archivoZip Archivo ZIP con archivos multimedia
     * @return Número de canciones cargadas exitosamente
     * @throws IOException si hay error al procesar los archivos
     */
    public int cargaMasivaConArchivos(MultipartFile archivoMetadata, MultipartFile archivoZip) throws IOException {
        Path tempDir = Files.createTempDirectory("carga-masiva");

        try {
            Map<String, File> archivosExtraidos = extraerZip(archivoZip, tempDir);

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(archivoMetadata.getInputStream(), StandardCharsets.UTF_8)
            );

            int contador = 0;
            String linea;

            while ((linea = reader.readLine()) != null) {
                if (linea.trim().isEmpty() || linea.startsWith("#")) {
                    continue;
                }

                String[] datos = linea.split(";");

                if (datos.length >= 7) {
                    try {
                        String titulo = datos[0].trim();
                        String artistaId = datos[1].trim();
                        String albumId = datos[2].trim();
                        String genero = datos[3].trim();
                        int anio = Integer.parseInt(datos[4].trim());
                        String nombreImagen = datos[5].trim();
                        String nombreMP3 = datos[6].trim();

                        File archivoImagen = archivosExtraidos.get(nombreImagen);
                        File archivoMP3 = archivosExtraidos.get(nombreMP3);

                        if (archivoImagen == null || archivoMP3 == null) {
                            continue;
                        }

                        Artista artista = artistaRepository.findById(artistaId)
                                .orElseThrow(() -> new RuntimeException("Artista no encontrado: " + artistaId));

                        Album album = null;
                        if (!albumId.isEmpty() && !albumId.equals("null")) {
                            album = albumRepository.findById(albumId).orElse(null);
                        }

                        Map<String, Object> subidaImagen = cloudinary.uploader().upload(
                                archivoImagen,
                                ObjectUtils.asMap("resource_type", "image")
                        );

                        Map<String, Object> subidaAudio = cloudinary.uploader().upload(
                                archivoMP3,
                                ObjectUtils.asMap("resource_type", "video")
                        );

                        Double duracionSeg = (Double) subidaAudio.get("duration");
                        double duracionMinutos = duracionSeg / 60.0;

                        Cancion nuevaCancion = Cancion.builder()
                                .titulo(titulo)
                                .genero(genero)
                                .anio(anio)
                                .duracion(duracionMinutos)
                                .imagenUrl(subidaImagen.get("secure_url").toString())
                                .musica(subidaAudio.get("secure_url").toString())
                                .artista(artista)
                                .album(album)
                                .build();

                        Cancion cancionGuardada = cancionRepository.save(nuevaCancion);

                        if (artista.getCanciones() == null) {
                            artista.setCanciones(new LinkedList<>());
                        }
                        artista.getCanciones().add(cancionGuardada);
                        artistaRepository.save(artista);

                        if (album != null) {
                            if (album.getSongIds() == null) {
                                album.setSongIds(new ArrayList<>());
                            }
                            album.getSongIds().add(cancionGuardada.getSongId());
                            albumRepository.save(album);
                        }

                        contador++;

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }

            reader.close();
            return contador;

        } finally {
            eliminarDirectorio(tempDir.toFile());
        }
    }

    /**
     * Extrae los archivos de un archivo ZIP.
     *
     * @param archivoZip Archivo ZIP a extraer
     * @param directorioDestino Directorio donde extraer los archivos
     * @return Mapa de nombres de archivo a archivos extraídos
     * @throws IOException si hay error al extraer el ZIP
     */
    private Map<String, File> extraerZip(MultipartFile archivoZip, Path directorioDestino) throws IOException {
        Map<String, File> archivos = new HashMap<>();

        try (ZipInputStream zis = new ZipInputStream(archivoZip.getInputStream())) {
            ZipEntry entry;

            while ((entry = zis.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    String nombreArchivo = new File(entry.getName()).getName();
                    File archivoDestino = directorioDestino.resolve(nombreArchivo).toFile();

                    try (FileOutputStream fos = new FileOutputStream(archivoDestino)) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }

                    archivos.put(nombreArchivo, archivoDestino);
                }
                zis.closeEntry();
            }
        }

        return archivos;
    }

    /**
     * Elimina un directorio y todo su contenido recursivamente.
     *
     * @param directorio Directorio a eliminar
     */
    private void eliminarDirectorio(File directorio) {
        if (directorio.exists()) {
            File[] archivos = directorio.listFiles();
            if (archivos != null) {
                for (File archivo : archivos) {
                    if (archivo.isDirectory()) {
                        eliminarDirectorio(archivo);
                    } else {
                        archivo.delete();
                    }
                }
            }
            directorio.delete();
        }
    }

    /**
     * Obtiene las canciones de un álbum específico.
     *
     * @param albumId Identificador del álbum
     * @return Lista de canciones DTO del álbum
     */
    public List<CancionDTO> obtenerCancionesPorAlbum(String albumId) {
        List<Cancion> canciones = cancionRepository.findByAlbumId(albumId);
        return canciones.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Convierte una entidad Cancion a un DTO CancionDTO.
     *
     * @param cancion Entidad Cancion a convertir
     * @return DTO CancionDTO convertido
     */
    private CancionDTO convertirADTO(Cancion cancion) {
        CancionDTO.CancionDTOBuilder builder = CancionDTO.builder()
                .songId(cancion.getSongId())
                .titulo(cancion.getTitulo())
                .genero(cancion.getGenero())
                .anio(cancion.getAnio())
                .duracion(cancion.getDuracion())
                .imagenUrl(cancion.getImagenUrl())
                .musica(cancion.getMusica());

        if (cancion.getArtista() != null) {
            builder.artistaId(cancion.getArtista().getArtistId());
            builder.artistaNombre(cancion.getArtista().getNombre());
        }

        if (cancion.getAlbum() != null) {
            builder.albumId(cancion.getAlbum().getId());
            builder.albumNombre(cancion.getAlbum().getNombre());
        }

        return builder.build();
    }

    /**
     * Obtiene canciones similares basadas en el género de una canción.
     *
     * @param cancionId Identificador de la canción de referencia
     * @param limite Número máximo de canciones similares a retornar
     * @return Lista de canciones similares en formato DTO
     * @throws RuntimeException si la canción no existe
     */
    public List<CancionDTO> obtenerCancionesSimilares(String cancionId, int limite) {
        Cancion cancionBase = cancionRepository.findById(cancionId)
                .orElseThrow(() -> new RuntimeException("Canción no encontrada"));

        String genero = cancionBase.getGenero();

        List<Cancion> todasDelGenero = cancionRepository.findByGenero(genero);

        List<Cancion> similares = todasDelGenero.stream()
                .filter(c -> !c.getSongId().equals(cancionId))
                .collect(Collectors.toList());

        Collections.shuffle(similares);

        similares = similares.stream()
                .limit(limite)
                .collect(Collectors.toList());

        return similares.stream()
                .map(this::convertirCancionADTO)
                .collect(Collectors.toList());
    }

    /**
     * Convierte una entidad Cancion a un DTO CancionDTO.
     *
     * @param cancion Entidad Cancion a convertir
     * @return DTO CancionDTO convertido
     */
    private CancionDTO convertirCancionADTO(Cancion cancion) {
        CancionDTO.CancionDTOBuilder builder = CancionDTO.builder()
                .songId(cancion.getSongId())
                .titulo(cancion.getTitulo())
                .genero(cancion.getGenero())
                .anio(cancion.getAnio())
                .duracion(cancion.getDuracion())
                .imagenUrl(cancion.getImagenUrl())
                .musica(cancion.getMusica());

        if (cancion.getArtista() != null) {
            builder.artistaId(cancion.getArtista().getArtistId());
            builder.artistaNombre(cancion.getArtista().getNombre());
        }

        if (cancion.getAlbum() != null) {
            builder.albumId(cancion.getAlbum().getId());
            builder.albumNombre(cancion.getAlbum().getNombre());
        }

        return builder.build();
    }

    /**
     * Obtiene las canciones de un artista específico.
     *
     * @param artistaId Identificador del artista
     * @return Lista de canciones DTO del artista
     */
    public List<CancionDTO> obtenerCancionesPorArtista(String artistaId) {
        List<Cancion> canciones = cancionRepository.findByArtistaId(artistaId);
        return canciones.stream()
                .map(this::convertirCancionADTO)
                .collect(Collectors.toList());
    }
}