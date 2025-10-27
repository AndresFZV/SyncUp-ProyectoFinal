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

@Service
@RequiredArgsConstructor
public class CancionService {

    private final ArtistaRepository artistaRepository; // ← Agregar
    private final AlbumRepository albumRepository; // ← Agregar
    private final CancionRepository cancionRepository;
    private final Cloudinary cloudinary;

    public Cancion addCancion(SolicitudCancion solicitud) throws IOException {
        // 1. Subir el audio a Cloudinary
        Map<String, Object> subidaAudio = cloudinary.uploader().upload(
                solicitud.getMusica().getBytes(),
                ObjectUtils.asMap("resource_type", "video")
        );

        // 2. Subir la imagen a Cloudinary
        Map<String, Object> subidaImagen = cloudinary.uploader().upload(
                solicitud.getArchivoImagen().getBytes(),
                ObjectUtils.asMap("resource_type", "image")
        );

        // 3. Obtener duración del audio y formatearla
        Double duracionSeg = (Double) subidaAudio.get("duration");
        double duracionMinutos = duracionSeg / 60.0;

        // 4. Buscar el artista por ID
        Artista artista = artistaRepository.findById(solicitud.getArtistaId())
                .orElseThrow(() -> new RuntimeException("Artista no encontrado"));

        // 5. Buscar el álbum si se proporcionó (opcional)
        // 5. Buscar el álbum si se proporcionó (opcional)
        Album album = null;
        if (solicitud.getAlbumId() != null
                && !solicitud.getAlbumId().isEmpty()
                && !solicitud.getAlbumId().equals("null")) {

            // IMPORTANTE: usar albumRepository.findById, no album.getId()
            album = albumRepository.findById(solicitud.getAlbumId())
                    .orElse(null);

            System.out.println("Álbum encontrado: " + (album != null ? album.getNombre() : "null"));
        }

        // 6. Crear la canción
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

        // 7. Guardar la canción en la BD
        Cancion cancionGuardada = cancionRepository.save(nuevaCancion);

        // 8. ACTUALIZAR RELACIONES BIDIRECCIONALES

        // Agregar canción a la lista del artista
        if (artista.getCanciones() == null) {
            artista.setCanciones(new LinkedList<>());
        }
        artista.getCanciones().add(cancionGuardada);
        artistaRepository.save(artista);

        // Agregar canción al álbum (si existe)
        if (album != null) {
            if (album.getSongIds() == null) {
                album.setSongIds(new ArrayList<>());
            }
            album.getSongIds().add(cancionGuardada.getSongId());
            albumRepository.save(album);
        }

        System.out.println("✓ Relaciones actualizadas correctamente");

        return cancionGuardada;
    }

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

    public Cancion obtenerCancion(String id) {
        return cancionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canción no encontrada"));
    }

    public Cancion agregarCancion(Cancion cancion) {
        return cancionRepository.save(cancion);
    }

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

    public void eliminarCancion(String id) {
        Cancion cancion = cancionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canción no encontrada"));

        // Eliminar la canción de las listas del artista
        if (cancion.getArtista() != null) {
            Artista artista = cancion.getArtista();
            if (artista.getCanciones() != null) {
                artista.getCanciones().removeIf(c -> c.getSongId().equals(id));
                artistaRepository.save(artista);
            }
        }

        // Eliminar la canción del álbum
        if (cancion.getAlbum() != null) {
            Album album = cancion.getAlbum();
            if (album.getSongIds() != null) {
                album.getSongIds().remove(id);
                albumRepository.save(album);
            }
        }

        // Finalmente eliminar la canción
        cancionRepository.deleteById(id);
    }

    // Agregar este método al CancionService
    public int cargaMasivaConArchivos(MultipartFile archivoMetadata, MultipartFile archivoZip) throws IOException {
        // Crear directorio temporal
        Path tempDir = Files.createTempDirectory("carga-masiva");

        try {
            // 1. Extraer el ZIP a un directorio temporal
            Map<String, File> archivosExtraidos = extraerZip(archivoZip, tempDir);
            System.out.println("═══════════════════════════════════════");
            System.out.println("📦 ARCHIVOS EXTRAÍDOS DEL ZIP:");
            System.out.println("═══════════════════════════════════════");
            if (archivosExtraidos.isEmpty()) {
                System.out.println("⚠️ ¡EL ZIP ESTÁ VACÍO O NO SE EXTRAJO NADA!");
            } else {
                archivosExtraidos.forEach((nombre, archivo) -> {
                    System.out.println("  ✓ [" + nombre + "] → " + archivo.getAbsolutePath());
                });
            }
            System.out.println("═══════════════════════════════════════");
            System.out.println("Total archivos extraídos: " + archivosExtraidos.size());
            System.out.println("═══════════════════════════════════════");

            // 2. Leer el archivo de metadata
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

                // Formato: Titulo;ArtistaId;AlbumId;Genero;Año;NombreImagen;NombreMP3
                if (datos.length >= 7) {
                    try {
                        String titulo = datos[0].trim();
                        String artistaId = datos[1].trim();
                        String albumId = datos[2].trim();
                        String genero = datos[3].trim();
                        int anio = Integer.parseInt(datos[4].trim());
                        String nombreImagen = datos[5].trim();
                        String nombreMP3 = datos[6].trim();

                        // Verificar que los archivos existen
                        File archivoImagen = archivosExtraidos.get(nombreImagen);
                        File archivoMP3 = archivosExtraidos.get(nombreMP3);

                        if (archivoImagen == null || archivoMP3 == null) {
                            System.err.println("Archivos no encontrados para: " + titulo);
                            continue;
                        }

                        // Buscar artista
                        Artista artista = artistaRepository.findById(artistaId)
                                .orElseThrow(() -> new RuntimeException("Artista no encontrado: " + artistaId));

                        // Buscar álbum (opcional)
                        Album album = null;
                        if (!albumId.isEmpty() && !albumId.equals("null")) {
                            album = albumRepository.findById(albumId).orElse(null);
                        }

                        // Subir imagen a Cloudinary
                        Map<String, Object> subidaImagen = cloudinary.uploader().upload(
                                archivoImagen,
                                ObjectUtils.asMap("resource_type", "image")
                        );

                        // Subir MP3 a Cloudinary
                        Map<String, Object> subidaAudio = cloudinary.uploader().upload(
                                archivoMP3,
                                ObjectUtils.asMap("resource_type", "video")
                        );

                        // Calcular duración
                        Double duracionSeg = (Double) subidaAudio.get("duration");
                        double duracionMinutos = duracionSeg / 60.0;

                        // Crear canción
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

                        // Actualizar relaciones
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
                        System.out.println("✓ Canción cargada: " + titulo);

                    } catch (Exception e) {
                        System.err.println("Error al procesar línea: " + linea + " - " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }

            reader.close();
            return contador;

        } finally {
            // Limpiar archivos temporales
            eliminarDirectorio(tempDir.toFile());
        }
    }

    // Método auxiliar para extraer ZIP
    private Map<String, File> extraerZip(MultipartFile archivoZip, Path directorioDestino) throws IOException {
        Map<String, File> archivos = new HashMap<>();

        try (ZipInputStream zis = new ZipInputStream(archivoZip.getInputStream())) {
            ZipEntry entry;

            while ((entry = zis.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    String nombreArchivo = new File(entry.getName()).getName();
                    File archivoDestino = directorioDestino.resolve(nombreArchivo).toFile();

                    // Copiar el contenido
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

    // Método auxiliar para eliminar directorio temporal
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
}