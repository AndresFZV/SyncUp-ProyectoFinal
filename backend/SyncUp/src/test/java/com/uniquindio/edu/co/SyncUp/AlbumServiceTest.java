package com.uniquindio.edu.co.SyncUp;
import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.dto.SolicitudAlbum;
import com.uniquindio.edu.co.SyncUp.repository.AlbumRepository;
import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository;
import com.uniquindio.edu.co.SyncUp.services.AlbumService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AlbumServiceTest {

    @Mock
    private ArtistaRepository artistaRepository;

    @Mock
    private AlbumRepository albumRepository;

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploaderMock;

    @InjectMocks
    private AlbumService albumService;

    private Artista artistaMock;
    private SolicitudAlbum solicitudMock;
    private Album albumGuardado;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);

        // 🧩 Crear un artista simulado SIN setId()
        artistaMock = new Artista();
        artistaMock.setAlbumes(new ArrayList<>()); // si esta propiedad existe

        // 📸 Imagen simulada (no se guarda realmente)
        MockMultipartFile imagen = new MockMultipartFile(
                "imagen",
                "test.jpg",
                "image/jpeg",
                "fakeimage".getBytes()
        );

        // 📝 Datos de solicitud
        solicitudMock = new SolicitudAlbum();
        solicitudMock.setArtistId("artista1");
        solicitudMock.setNombre("Mi álbum");
        solicitudMock.setDescripcion("Descripción del álbum");
        solicitudMock.setBgColor("#FFFFFF");
        solicitudMock.setArchivoImagen(imagen);
        solicitudMock.setSongIds(Arrays.asList("s1", "s2"));

        // 💾 Álbum simulado que se guardará
        albumGuardado = Album.builder()
                .nombre("Mi álbum")
                .artistId("artista1")
                .imagenUrl("http://fakeurl.com/image.jpg")
                .songIds(Arrays.asList("s1", "s2"))
                .build();

        // 🌩️ Configurar mocks Cloudinary
        when(cloudinary.uploader()).thenReturn(uploaderMock);
    }

    // ✅ Caso exitoso
    @Test
    void addAlbum_ArtistaExisteYSubidaExitosa_GuardaAlbum() throws Exception {
        // Arrange
        when(artistaRepository.findById("artista1"))
                .thenReturn(Optional.of(artistaMock));

        when(uploaderMock.upload(any(byte[].class), anyMap()))
                .thenReturn(Map.of("secure_url", "http://fakeurl.com/image.jpg"));

        when(albumRepository.save(any(Album.class)))
                .thenReturn(albumGuardado);

        when(artistaRepository.save(any(Artista.class)))
                .thenReturn(artistaMock);

        // Act
        Album resultado = albumService.addAlbum(solicitudMock);

        // Assert
        assertNotNull(resultado);
        assertEquals("Mi álbum", resultado.getNombre());
        assertEquals("http://fakeurl.com/image.jpg", resultado.getImagenUrl());

        verify(artistaRepository).findById("artista1");
        verify(albumRepository).save(any(Album.class));
        verify(artistaRepository).save(any(Artista.class));
    }

    // ❌ Artista no existe
    @Test
    void addAlbum_ArtistaNoExiste_LanzaExcepcion() {
        // Arrange
        solicitudMock.setArtistId("inexistente");
        when(artistaRepository.findById("inexistente"))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                albumService.addAlbum(solicitudMock)
        );

        assertEquals("Artista no encontrado", ex.getMessage());
        verify(albumRepository, never()).save(any());
    }

    // ⚠️ Error de subida
    @Test
    void addAlbum_ErrorAlSubirImagen_LanzaIOException() throws Exception {
        // Arrange
        when(artistaRepository.findById("artista1"))
                .thenReturn(Optional.of(artistaMock));

        when(uploaderMock.upload(any(byte[].class), anyMap()))
                .thenThrow(new IOException("Error de subida"));

        // Act & Assert
        assertThrows(IOException.class, () ->
                albumService.addAlbum(solicitudMock)
        );

        verify(albumRepository, never()).save(any());
    }
}
