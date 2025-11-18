package com.uniquindio.edu.co.SyncUp.test;

import com.uniquindio.edu.co.SyncUp.document.Usuario;
import com.uniquindio.edu.co.SyncUp.repository.UsuarioRepository;
import com.uniquindio.edu.co.SyncUp.services.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioServiceTest {

    private UsuarioRepository usuarioRepository;
    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        usuarioRepository = Mockito.mock(UsuarioRepository.class);
        // Si el constructor tiene más dependencias, pásalas como null
        usuarioService = new UsuarioService(usuarioRepository);
    }

    @Test
    void login_exitoso() {
        // given
        String username = "usuario1";
        String password = "12345";

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setPassword(password);

        when(usuarioRepository.findByUsernameAndPassword(username, password))
                .thenReturn(Optional.of(usuario));

        // when
        Usuario resultado = usuarioService.login(username, password);

        // then
        assertNotNull(resultado);
        assertEquals(username, resultado.getUsername());
        assertEquals(password, resultado.getPassword());
        verify(usuarioRepository, times(1)).findByUsernameAndPassword(username, password);
    }

    @Test
    void login_credencialesIncorrectas_debeLanzarExcepcion() {
        // given
        String username = "usuario1";
        String password = "claveInvalida";

        when(usuarioRepository.findByUsernameAndPassword(username, password))
                .thenReturn(Optional.empty());

        // when + then
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> usuarioService.login(username, password));

        assertEquals("Credenciales incorrectas", ex.getMessage());
        verify(usuarioRepository, times(1)).findByUsernameAndPassword(username, password);
    }
}

