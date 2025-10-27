package com.uniquindio.edu.co.SyncUp.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista; // ← AGREGAR
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.dto.SolicitudAlbum;
import com.uniquindio.edu.co.SyncUp.repository.AlbumRepository;
import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository; // ← AGREGAR
import com.uniquindio.edu.co.SyncUp.repository.CancionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@RequiredArgsConstructor
public class AlbumService {
    private final AlbumRepository albumRepository;
    private final ArtistaRepository artistaRepository;
    private final CancionRepository cancionRepository;
    private final Cloudinary cloudinary;

    // Listar todos los álbumes
    public List<Album> listarAlbumes() {
        return albumRepository.findAll();
    }

    // Obtener álbum por ID
    public Album obtenerAlbum(String id) {
        return albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));
    }

    // Agregar álbum
    public Album addAlbum(SolicitudAlbum solicitudAlbum) throws IOException {
        // Verificar que el artista existe
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

        // 🔥 ACTUALIZAR LA RELACIÓN EN EL ARTISTA
        if (artista.getAlbumes() == null) {
            artista.setAlbumes(new ArrayList<>());
        }
        artista.getAlbumes().add(albumGuardado);
        artistaRepository.save(artista);

        return albumGuardado;
    }
    // Actualizar álbum
    public Album actualizarAlbum(String id, SolicitudAlbum solicitudAlbum) throws IOException {
        Album albumExistente = albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        String artistaIdAnterior = albumExistente.getArtistId();
        String artistaIdNuevo = solicitudAlbum.getArtistId();

        // Actualizar campos
        albumExistente.setNombre(solicitudAlbum.getNombre());
        albumExistente.setDescripcion(solicitudAlbum.getDescripcion());
        albumExistente.setBgColor(solicitudAlbum.getBgColor());
        albumExistente.setArtistId(artistaIdNuevo);

        // Solo actualizar imagen si hay una nueva
        if (solicitudAlbum.getArchivoImagen() != null) {
            Map<String, Object> imagenSubida = cloudinary.uploader().upload(
                    solicitudAlbum.getArchivoImagen().getBytes(),
                    ObjectUtils.asMap("resource_type", "image")
            );
            albumExistente.setImagenUrl(imagenSubida.get("secure_url").toString());
        }

        Album albumActualizado = albumRepository.save(albumExistente);

        // 🔥 Si cambió el artista, actualizar relaciones
        if (!artistaIdAnterior.equals(artistaIdNuevo)) {
            // Eliminar del artista anterior
            artistaRepository.findById(artistaIdAnterior).ifPresent(artistaAnterior -> {
                if (artistaAnterior.getAlbumes() != null) {
                    artistaAnterior.getAlbumes().removeIf(a -> a.getId().equals(id));
                    artistaRepository.save(artistaAnterior);
                }
            });

            // Agregar al nuevo artista
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

    // Eliminar álbum
    public void eliminarAlbum(String id) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        // 🔥 ELIMINAR LA RELACIÓN DEL ARTISTA TAMBIÉN
        artistaRepository.findById(album.getArtistId()).ifPresent(artista -> {
            if (artista.getAlbumes() != null) {
                artista.getAlbumes().removeIf(a -> a.getId().equals(id));
                artistaRepository.save(artista);
            }
        });

        albumRepository.deleteById(id);
    }

    // Carga masiva
    public Map<String, Object> cargaMasivaAlbumConTresArchivos(
            MultipartFile archivoMetadata,
            MultipartFile imagenPortada,
            MultipartFile archivoZip) throws IOException {

        // Crear directorio temporal
        Path tempDir = Files.createTempDirectory("carga-masiva-album");

        try {
            // 1. Extraer el ZIP (solo tiene MP3 e imágenes de canciones)
            Map<String, File> archivosExtraidos = extraerZip(archivoZip, tempDir);

            System.out.println("═══════════════════════════════════════");
            System.out.println("📦 ARCHIVOS EXTRAÍDOS DEL ZIP:");
            System.out.println("═══════════════════════════════════════");
            archivosExtraidos.forEach((nombre, archivo) -> {
                System.out.println("  ✓ [" + nombre + "]");
            });
            System.out.println("═══════════════════════════════════════");

            // 2. Leer metadata.txt (viene separado)
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(archivoMetadata.getInputStream(), StandardCharsets.UTF_8)
            );

            // 3. Primera línea: Info del álbum
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

            System.out.println("📀 Creando álbum: " + nombreAlbum);

            // 4. Verificar que el artista existe
            Artista artista = artistaRepository.findById(artistaId)
                    .orElseThrow(() -> new RuntimeException("Artista no encontrado: " + artistaId));

            System.out.println("✓ Artista encontrado: " + artista.getNombre());

            // 5. Subir imagen de portada del álbum a Cloudinary
            System.out.println("☁️ Subiendo portada del álbum...");
            Map<String, Object> imagenSubida = cloudinary.uploader().upload(
                    imagenPortada.getBytes(),
                    ObjectUtils.asMap("resource_type", "image")
            );
            System.out.println("✓ Portada subida");

            // 6. Crear el álbum
            Album nuevoAlbum = Album.builder()
                    .nombre(nombreAlbum)
                    .artistId(artistaId)
                    .descripcion(descripcion)
                    .bgColor(bgColor)
                    .imagenUrl(imagenSubida.get("secure_url").toString())
                    .songIds(new ArrayList<>())
                    .build();

            Album albumGuardado = albumRepository.save(nuevoAlbum);
            System.out.println("✓ Álbum guardado en BD");

            // 7. Actualizar relación con artista
            if (artista.getAlbumes() == null) {
                artista.setAlbumes(new ArrayList<>());
            }
            artista.getAlbumes().add(albumGuardado);
            artistaRepository.save(artista);
            System.out.println("✓ Relación artista-álbum actualizada");

            // 8. Procesar canciones
            int contadorCanciones = 0;
            String linea;

            while ((linea = reader.readLine()) != null) {
                if (linea.trim().isEmpty() || linea.startsWith("#")) {
                    continue;
                }

                String[] datosCan = linea.split(";");

                // Formato: TituloCancion;Genero;Año;NombreImagen;NombreMP3
                if (datosCan.length >= 5) {
                    try {
                        String titulo = datosCan[0].trim();
                        String genero = datosCan[1].trim();
                        int anio = Integer.parseInt(datosCan[2].trim());
                        String nombreImagen = datosCan[3].trim();
                        String nombreMP3 = datosCan[4].trim();

                        System.out.println("🎵 Procesando canción: " + titulo);
                        System.out.println("   Buscando: " + nombreImagen + " y " + nombreMP3);

                        // Verificar archivos
                        File archivoImagen = archivosExtraidos.get(nombreImagen);
                        File archivoMP3 = archivosExtraidos.get(nombreMP3);

                        if (archivoImagen == null) {
                            System.err.println("❌ No se encontró imagen: " + nombreImagen);
                            continue;
                        }
                        if (archivoMP3 == null) {
                            System.err.println("❌ No se encontró audio: " + nombreMP3);
                            continue;
                        }

                        System.out.println("✓ Archivos encontrados");

                        // Subir archivos a Cloudinary
                        Map<String, Object> subidaImagen = cloudinary.uploader().upload(
                                archivoImagen,
                                ObjectUtils.asMap("resource_type", "image")
                        );

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
                                .album(albumGuardado)
                                .build();

                        Cancion cancionGuardada = cancionRepository.save(nuevaCancion);

                        // Actualizar relaciones
                        if (artista.getCanciones() == null) {
                            artista.setCanciones(new LinkedList<>());
                        }
                        artista.getCanciones().add(cancionGuardada);
                        artistaRepository.save(artista);

                        albumGuardado.getSongIds().add(cancionGuardada.getSongId());
                        albumRepository.save(albumGuardado);

                        contadorCanciones++;
                        System.out.println("✅ Canción cargada: " + titulo);

                    } catch (Exception e) {
                        System.err.println("❌ Error al procesar canción: " + linea);
                        e.printStackTrace();
                    }
                }
            }

            reader.close();

            System.out.println("🎉 Álbum completo cargado exitosamente");
            System.out.println("   Álbum: " + nombreAlbum);
            System.out.println("   Canciones: " + contadorCanciones);

            Map<String, Object> response = new HashMap<>();
            response.put("albumNombre", nombreAlbum);
            response.put("totalCanciones", contadorCanciones);
            return response;

        } finally {
            // Limpiar archivos temporales
            eliminarDirectorio(tempDir.toFile());
        }
    }

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