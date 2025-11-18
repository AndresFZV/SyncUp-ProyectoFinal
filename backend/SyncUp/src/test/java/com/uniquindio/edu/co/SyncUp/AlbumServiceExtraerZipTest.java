package com.uniquindio.edu.co.SyncUp;

import static org.junit.jupiter.api.Assertions.*;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.zip.*;

import com.uniquindio.edu.co.SyncUp.services.AlbumService;
import org.junit.jupiter.api.*;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.FileSystemUtils;

public class AlbumServiceExtraerZipTest {

    private Path tempDir;
    private AlbumService albumService; // Clase real donde está el método

    @BeforeEach
    void setUp() throws IOException {
        // Crear directorio temporal donde se extraerán los archivos
        tempDir = Files.createTempDirectory("ziptest_");

        // Instancia de  clase a probar
        albumService = new AlbumService(null, null, null, null);

    }

    @AfterEach
    void tearDown() throws IOException {
        // Limpia el directorio temporal después de cada test
        FileSystemUtils.deleteRecursively(tempDir);
    }

    // Caso 1: ZIP válido se extrae correctamente
    @Test
    void extraerZip_ArchivoValido_CreaArchivosCorrectos() throws Exception {
        // Arrange
        byte[] zipBytes = crearZipEnMemoria(Map.of(
                "archivo1.txt", "Contenido 1",
                "archivo2.txt", "Contenido 2"
        ));
        MockMultipartFile zipFile = new MockMultipartFile(
                "zip", "test.zip", "application/zip", zipBytes
        );

        // Act
        Map<String, File> resultado = invocarExtraerZip(albumService, zipFile, tempDir);

        // Assert
        assertEquals(2, resultado.size());
        assertTrue(resultado.containsKey("archivo1.txt"));
        assertTrue(resultado.containsKey("archivo2.txt"));

        // Verificar que los archivos se hayan creado realmente
        assertTrue(resultado.get("archivo1.txt").exists());
        assertTrue(resultado.get("archivo2.txt").exists());
    }

    // Caso 2: ZIP vacío → retorna mapa vacío
    @Test
    void extraerZip_ArchivoVacio_RetornaMapaVacio() throws Exception {
        // Arrange
        byte[] zipBytes = crearZipEnMemoria(Collections.emptyMap());
        MockMultipartFile zipFile = new MockMultipartFile(
                "zip", "vacio.zip", "application/zip", zipBytes
        );

        // Act
        Map<String, File> resultado = invocarExtraerZip(albumService, zipFile, tempDir);

        // Assert
        assertTrue(resultado.isEmpty());
    }

    // Caso 3: Archivo no es ZIP → lanza IOException
    @Test
    void extraerZip_ArchivoInvalido_LanzaIOException() {
        // Arrange
        MockMultipartFile zipFile = new MockMultipartFile(
                "zip", "invalido.txt", "text/plain", "no es un zip".getBytes()
        );

        // Act & Assert
        assertThrows(IOException.class, () ->
                invocarExtraerZip(albumService, zipFile, tempDir)
        );
    }

    // Método auxiliar: crear ZIP en memoria
    private byte[] crearZipEnMemoria(Map<String, String> archivos) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            for (Map.Entry<String, String> entry : archivos.entrySet()) {
                zos.putNextEntry(new ZipEntry(entry.getKey()));
                zos.write(entry.getValue().getBytes());
                zos.closeEntry();
            }
        }
        return baos.toByteArray();
    }

    // Método para invocar el método privado mediante reflexión
    @SuppressWarnings("unchecked")
    private Map<String, File> invocarExtraerZip(AlbumService service, MockMultipartFile archivoZip, Path destino)
            throws Exception {
        var metodo = AlbumService.class.getDeclaredMethod("extraerZip",
                org.springframework.web.multipart.MultipartFile.class, Path.class);
        metodo.setAccessible(true);
        return (Map<String, File>) metodo.invoke(service, archivoZip, destino);
    }
}
