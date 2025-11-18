package com.uniquindio.edu.co.SyncUp;

import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.repository.CancionRepository;
import com.uniquindio.edu.co.SyncUp.services.CancionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


class CancionServiceTest {

    private CancionRepository cancionRepository;
    private CancionService cancionService;

    @BeforeEach
    void setUp() {
        cancionRepository = Mockito.mock(CancionRepository.class);
        // Si tu constructor tiene más dependencias, pásalas como null
        cancionService = new CancionService(null, null, cancionRepository, null);
    }

    @Test
    void actualizarCancion_exitoso() {
        // given
        String id = "c1";

        Artista artistaViejo = new Artista();
        artistaViejo.setNombre("Artista Viejo");

        Album albumViejo = new Album();
        albumViejo.setNombre("Álbum Viejo");

        Cancion existente = new Cancion();
        existente.setTitulo("Old Title");
        existente.setGenero("Pop");
        existente.setArtista(artistaViejo);
        existente.setAlbum(albumViejo);
        existente.setDuracion(180);
        existente.setAnio(2020);

        Artista nuevoArtista = new Artista();
        nuevoArtista.setNombre("Nuevo Artista");

        Album nuevoAlbum = new Album();
        nuevoAlbum.setNombre("Nuevo Álbum");

        Cancion actualizada = new Cancion();
        actualizada.setTitulo("New Title");
        actualizada.setGenero("Rock");
        actualizada.setArtista(nuevoArtista);
        actualizada.setAlbum(nuevoAlbum);
        actualizada.setDuracion(240);
        actualizada.setAnio(2024);

        when(cancionRepository.findById(id)).thenReturn(Optional.of(existente));
        when(cancionRepository.save(any(Cancion.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        Cancion resultado = cancionService.actualizarCancion(id, actualizada);

        // then
        assertNotNull(resultado);
        assertEquals("New Title", resultado.getTitulo());
        assertEquals("Rock", resultado.getGenero());
        assertEquals("Nuevo Artista", resultado.getArtista().getNombre());
        assertEquals("Nuevo Álbum", resultado.getAlbum().getNombre());
        assertEquals(240, resultado.getDuracion());
        assertEquals(2024, resultado.getAnio());

        verify(cancionRepository, times(1)).findById(id);
        verify(cancionRepository, times(1)).save(existente);
    }

    @Test
    void actualizarCancion_noExiste_debeLanzarExcepcion() {
        // given
        String id = "noExiste";
        Cancion actualizada = new Cancion();
        when(cancionRepository.findById(id)).thenReturn(Optional.empty());

        // when + then
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> cancionService.actualizarCancion(id, actualizada));

        assertEquals("Canción no encontrada", ex.getMessage());
        verify(cancionRepository, times(1)).findById(id);
        verify(cancionRepository, never()).save(any());
    }
}
