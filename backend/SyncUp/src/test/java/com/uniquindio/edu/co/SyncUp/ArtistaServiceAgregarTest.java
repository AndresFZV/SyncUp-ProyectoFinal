package com.uniquindio.edu.co.SyncUp;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.cloudinary.utils.ObjectUtils;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository;
import com.uniquindio.edu.co.SyncUp.services.ArtistaService;
import com.uniquindio.edu.co.SyncUp.dto.SolicitudArtista;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ArtistaServiceAgregarTest {

    private ArtistaRepository artistaRepository;
    private Cloudinary cloudinary;
    private Uploader uploader;
    private ArtistaService artistaService;

    @BeforeEach
    void setUp() {
        artistaRepository = Mockito.mock(ArtistaRepository.class);
        cloudinary = Mockito.mock(Cloudinary.class);
        uploader = Mockito.mock(Uploader.class);

        // Simula que cloudinary.uploader() devuelve el mock uploader
        when(cloudinary.uploader()).thenReturn(uploader);

        // Constructor con dos parámetros
        artistaService = new ArtistaService(artistaRepository, cloudinary);
    }

    @Test
    void addArtista_exitoso() throws IOException {
        // given
        SolicitudArtista solicitud = new SolicitudArtista();
        solicitud.setNombre("Coldplay");
        solicitud.setPais("Reino Unido");
        solicitud.setGeneroPrincipal("Rock");
        solicitud.setBiografia("Banda británica de rock alternativo.");
        solicitud.setImagenUrl(new MockMultipartFile("file", "foto.jpg", "image/jpeg", "imagen".getBytes()));

        // simular la subida de imagen
        when(uploader.upload(any(byte[].class), any(Map.class)))
                .thenReturn(Map.of("secure_url", "https://cloudinary.com/foto.jpg"));

        Artista artistaGuardado = Artista.builder()
                .nombre("Coldplay")
                .pais("Reino Unido")
                .generoPrincipal("Rock")
                .biografia("Banda británica de rock alternativo.")
                .imagenUrl("https://cloudinary.com/foto.jpg")
                .build();

        when(artistaRepository.save(any(Artista.class))).thenReturn(artistaGuardado);

        // when
        Artista resultado = artistaService.addArtista(solicitud);

        // then
        assertNotNull(resultado);
        assertEquals("Coldplay", resultado.getNombre());
        assertEquals("https://cloudinary.com/foto.jpg", resultado.getImagenUrl());
        verify(uploader, times(1)).upload(any(byte[].class), any(Map.class));
        verify(artistaRepository, times(1)).save(any(Artista.class));
    }

    @Test
    void addArtista_errorEnCloudinary_debeLanzarIOException() throws IOException {
        // given
        SolicitudArtista solicitud = new SolicitudArtista();
        solicitud.setNombre("Imagine Dragons");
        solicitud.setImagenUrl(new MockMultipartFile("file", "foto.jpg", "image/jpeg", "img".getBytes()));

        when(uploader.upload(any(byte[].class), any(Map.class))).thenThrow(new IOException("Error al subir imagen"));

        // when + then
        assertThrows(IOException.class, () -> artistaService.addArtista(solicitud));

        verify(uploader, times(1)).upload(any(byte[].class), any(Map.class));
        verify(artistaRepository, never()).save(any());
    }
}
