package com.uniquindio.edu.co.SyncUp.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.dto.AlbumDTO;
import com.uniquindio.edu.co.SyncUp.dto.SolicitudAlbum;
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
 * Servicio para gestionar las operaciones de álbumes.
 * Proporciona lógica de negocio para CRUD de álbumes, carga masiva y conversión a DTO.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class AlbumService {
    private final AlbumRepository albumRepository;
    private final ArtistaRepository artistaRepository;
    private final CancionRepository cancionRepository;
    private final Cloudinary cloudinary;

    /**
     * Obtiene la lista de todos los álbumes.
     *
     * @return Lista de todos los álbumes en el sistema
     */
    public List<Album> listarAlbumes() {
        return albumRepository.findAll();
    }

    /**
     * Obtiene un álbum por su identificador.
     *
     * @param id Identificador único del álbum
     * @return Álbum encontrado
     * @throws RuntimeException si el álbum no existe
     */
    public Album obtenerAlbum(String id) {
        return albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));
    }

    /**
     * Agrega un nuevo álbum al sistema.
     *
     * @param solicitudAlbum DTO con los datos del álbum a crear
     * @return Álbum creado
     * @throws IOException si hay error al subir la imagen
     * @throws RuntimeException si el artista no existe
     */
    public Album addAlbum(SolicitudAlbum solicitudAlbum) throws IOException {
        Artista artista = artistaRepository.findById(solicitudAlbum.getArtistId())
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));

        Map<String, Object> imagenSubida = cloudinary.uploader().upload(
                solicitudAlbum.getArchivoImagen().getBytes(),
                ObjectUtils.asMap("resource_type", "image")
        );

        Album nuevoAlbum = Album.builder()
                .nombre(solicitudAlbum.getNombre())
                .descripcion(solicitudAlbum.getDescripcion())
                .bgColor(solicitudAlbum.getBgColor())
                .imagenUrl(imagenSubida.get("secure_url").toString())
                .artistId(solicitudAlbum.getArtistId())
                .songIds(solicitudAlbum.getSongIds() != null ? solicitudAlbum.getSongIds() : new ArrayList<>())
                .build();

        Album albumGuardado = albumRepository.save(nuevoAlbum);

        if (artista.getAlbumes() == null) {
            artista.setAlbumes(new ArrayList<>());
        }
        artista.getAlbumes().add(albumGuardado);
        artistaRepository.save(artista);

        return albumGuardado;
    }

    /**
     * Actualiza un álbum existente.
     *
     * @param id Identificador del álbum a actualizar
     * @param solicitudAlbum DTO con los nuevos datos del álbum
     * @return Álbum actualizado
     * @throws IOException si hay error al subir la nueva imagen
     * @throws RuntimeException si el álbum o artista no existen
     */
    public Album actualizarAlbum(String id, SolicitudAlbum solicitudAlbum) throws IOException {
        Album albumExistente = albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        String artistaIdAnterior = albumExistente.getArtistId();
        String artistaIdNuevo = solicitudAlbum.getArtistId();

        albumExistente.setNombre(solicitudAlbum.getNombre());
        albumExistente.setDescripcion(solicitudAlbum.getDescripcion());
        albumExistente.setBgColor(solicitudAlbum.getBgColor());
        albumExistente.setArtistId(artistaIdNuevo);

        if (solicitudAlbum.getArchivoImagen() != null) {
            Map<String, Object> imagenSubida = cloudinary.uploader().upload(
                    solicitudAlbum.getArchivoImagen().getBytes(),
                    ObjectUtils.asMap("resource_type", "image")
            );
            albumExistente.setImagenUrl(imagenSubida.get("secure_url").toString());
        }

        Album albumActualizado = albumRepository.save(albumExistente);

        if (!artistaIdAnterior.equals(artistaIdNuevo)) {
            artistaRepository.findById(artistaIdAnterior).ifPresent(artistaAnterior -> {
                if (artistaAnterior.getAlbumes() != null) {
                    artistaAnterior.getAlbumes().removeIf(a -> a.getId().equals(id));
                    artistaRepository.save(artistaAnterior);
                }
            });

            Artista artistaNuevo = artistaRepository.findById(artistaIdNuevo)
                    .orElseThrow(() -> new RuntimeException("Artista no encontrado"));
            if (artistaNuevo.getAlbumes() == null) {
                artistaNuevo.setAlbumes(new ArrayList<>());
            }
            artistaNuevo.getAlbumes().add(albumActualizado);
            artistaRepository.save(artistaNuevo);
        }

        return albumActualizado;
    }

    /**
     * Elimina un álbum y todas sus canciones asociadas.
     *
     * @param id Identificador del álbum a eliminar
     * @throws RuntimeException si el álbum no existe
     */
    public void eliminarAlbum(String id) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        List<Cancion> cancionesDelAlbum = cancionRepository.findAll().stream()
                .filter(cancion -> {
                    if (cancion.getAlbum() != null && cancion.getAlbum().getId() != null) {
                        return cancion.getAlbum().getId().equals(id);
                    }
                    return false;
                })
                .collect(Collectors.toList());

        for (Cancion cancion : cancionesDelAlbum) {
            if (cancion.getArtista() != null) {
                Artista artista = artistaRepository.findById(cancion.getArtista().getArtistId()).orElse(null);
                if (artista != null && artista.getCanciones() != null) {
                    artista.getCanciones().removeIf(c -> c.getSongId().equals(cancion.getSongId()));
                    artistaRepository.save(artista);
                }
            }
            cancionRepository.deleteById(cancion.getSongId());
        }

        artistaRepository.findById(album.getArtistId()).ifPresent(artista -> {
            if (artista.getAlbumes() != null) {
                artista.getAlbumes().removeIf(a -> a.getId().equals(id));
                artistaRepository.save(artista);
            }
        });

        albumRepository.deleteById(id);
    }

    /**
     * Realiza una carga masiva de álbumes desde archivos.
     *
     * @param archivoMetadata Archivo con metadatos del álbum y canciones
     * @param imagenPortada Archivo de imagen de portada del álbum
     * @param archivoZip Archivo ZIP con archivos de audio e imágenes
     * @return Mapa con información del resultado de la carga
     * @throws IOException si hay error al procesar los archivos
     */
    public Map<String, Object> cargaMasivaAlbumConTresArchivos(
            MultipartFile archivoMetadata,
            MultipartFile imagenPortada,
            MultipartFile archivoZip) throws IOException {

        Path tempDir = Files.createTempDirectory("carga-masiva-album");

        try {
            Map<String, File> archivosExtraidos = extraerZip(archivoZip, tempDir);

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(archivoMetadata.getInputStream(), StandardCharsets.UTF_8)
            );

            String lineaAlbum = reader.readLine();
            while (lineaAlbum != null && (lineaAlbum.trim().isEmpty() || lineaAlbum.startsWith("#"))) {
                lineaAlbum = reader.readLine();
            }

            if (lineaAlbum == null) {
                throw new RuntimeException("El archivo metadata.txt está vacío");
            }

            String[] datosAlbum = lineaAlbum.split(";");
            if (datosAlbum.length < 4) {
                throw new RuntimeException("Formato de álbum incorrecto. Esperado: NombreAlbum;ArtistaId;Descripcion;ColorFondo");
            }

            String nombreAlbum = datosAlbum[0].trim();
            String artistaId = datosAlbum[1].trim();
            String descripcion = datosAlbum[2].trim();
            String bgColor = datosAlbum[3].trim();

            Artista artista = artistaRepository.findById(artistaId)
                    .orElseThrow(() -> new RuntimeException("Artista no encontrado: " + artistaId));

            Map<String, Object> imagenSubida = cloudinary.uploader().upload(
                    imagenPortada.getBytes(),
                    ObjectUtils.asMap("resource_type", "image")
            );

            Album nuevoAlbum = Album.builder()
                    .nombre(nombreAlbum)
                    .artistId(artistaId)
                    .descripcion(descripcion)
                    .bgColor(bgColor)
                    .imagenUrl(imagenSubida.get("secure_url").toString())
                    .songIds(new ArrayList<>())
                    .build();

            Album albumGuardado = albumRepository.save(nuevoAlbum);

            if (artista.getAlbumes() == null) {
                artista.setAlbumes(new ArrayList<>());
            }
            artista.getAlbumes().add(albumGuardado);
            artistaRepository.save(artista);

            int contadorCanciones = 0;
            String linea;

            while ((linea = reader.readLine()) != null) {
                if (linea.trim().isEmpty() || linea.startsWith("#")) {
                    continue;
                }

                String[] datosCan = linea.split(";");

                if (datosCan.length >= 4) {
                    try {
                        String titulo = datosCan[0].trim();
                        String genero = datosCan[1].trim();
                        int anio = Integer.parseInt(datosCan[2].trim());

                        String imagenUrlCancion;
                        String nombreMP3;

                        if (datosCan.length >= 5) {
                            String nombreImagen = datosCan[3].trim();
                            nombreMP3 = datosCan[4].trim();

                            File archivoImagen = archivosExtraidos.get(nombreImagen);
                            if (archivoImagen == null) {
                                continue;
                            }

                            Map<String, Object> subidaImagen = cloudinary.uploader().upload(
                                    archivoImagen,
                                    ObjectUtils.asMap("resource_type", "image")
                            );
                            imagenUrlCancion = subidaImagen.get("secure_url").toString();
                        } else {
                            nombreMP3 = datosCan[3].trim();
                            imagenUrlCancion = albumGuardado.getImagenUrl();
                        }

                        File archivoMP3 = archivosExtraidos.get(nombreMP3);
                        if (archivoMP3 == null) {
                            continue;
                        }

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
                                .imagenUrl(imagenUrlCancion)
                                .musica(subidaAudio.get("secure_url").toString())
                                .artista(artista)
                                .album(albumGuardado)
                                .build();

                        Cancion cancionGuardada = cancionRepository.save(nuevaCancion);

                        if (artista.getCanciones() == null) {
                            artista.setCanciones(new LinkedList<>());
                        }
                        artista.getCanciones().add(cancionGuardada);
                        artistaRepository.save(artista);

                        albumGuardado.getSongIds().add(cancionGuardada.getSongId());
                        albumRepository.save(albumGuardado);

                        contadorCanciones++;

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }

            reader.close();

            Map<String, Object> response = new HashMap<>();
            response.put("albumNombre", nombreAlbum);
            response.put("totalCanciones", contadorCanciones);
            return response;

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
     * Obtiene la lista de todos los álbumes en formato DTO.
     *
     * @return Lista de álbumes DTO
     */
    public List<AlbumDTO> listarAlbumesDTO() {
        List<Album> albumes = albumRepository.findAll();
        return albumes.stream()
                .map(this::convertirAlbumADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un álbum específico en formato DTO.
     *
     * @param id Identificador del álbum
     * @return Álbum DTO
     * @throws RuntimeException si el álbum no existe
     */
    public AlbumDTO obtenerAlbumDTO(String id) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));
        return convertirAlbumADTO(album);
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