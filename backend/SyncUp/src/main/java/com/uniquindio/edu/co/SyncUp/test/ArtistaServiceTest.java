package com.uniquindio.edu.co.SyncUp.test;

import com.uniquindio.edu.co.SyncUp.repository.ArtistaRepository;
import com.uniquindio.edu.co.SyncUp.services.ArtistaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ArtistaServiceTest {

    private ArtistaRepository artistaRepository;
    private ArtistaService artistaService;

    @BeforeEach
    void setUp() {
        artistaRepository = Mockito.mock(ArtistaRepository.class);
        // Si el constructor tiene más dependencias, pásalas como null o mocks
        artistaService = new ArtistaService(artistaRepository, null);
    }

    @Test
    void eliminarArtista_exitoso() {
        // given
        String id = "artista123";
        when(artistaRepository.existsById(id)).thenReturn(true);

        // when
        artistaService.eliminarArtista(id);

        // then
        verify(artistaRepository, times(1)).existsById(id);
        verify(artistaRepository, times(1)).deleteById(id);
    }

    @Test
    void eliminarArtista_noExiste_debeLanzarExcepcion() {
        // given
        String id = "noExiste";
        when(artistaRepository.existsById(id)).thenReturn(false);

        // when + then
        RuntimeException ex = assertThrows(RuntimeException.class, () -> artistaService.eliminarArtista(id));
        assertEquals("Artista no encontrado", ex.getMessage());

        verify(artistaRepository, times(1)).existsById(id);
        verify(artistaRepository, never()).deleteById(anyString());
    }
}
