package com.uniquindio.edu.co.SyncUp.test;

import com.uniquindio.edu.co.SyncUp.document.Usuario;
import com.uniquindio.edu.co.SyncUp.repository.UsuarioRepository;
import com.uniquindio.edu.co.SyncUp.services.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioServiceRegistrarTest {

    private UsuarioRepository usuarioRepository;
    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        usuarioRepository = Mockito.mock(UsuarioRepository.class);
        usuarioService = new UsuarioService(usuarioRepository);
    }

    @Test
    void registrarUsuario_exitoso() {
        // given
        Usuario nuevo = new Usuario();
        nuevo.setUsername("usuario1");
        nuevo.setCorreo("correo@correo.com");
        nuevo.setPassword("1234");

        when(usuarioRepository.existsById(nuevo.getUsername())).thenReturn(false);
        when(usuarioRepository.existsByCorreo(nuevo.getCorreo())).thenReturn(false);
        when(usuarioRepository.save(nuevo)).thenReturn(nuevo);

        // when
        Usuario resultado = usuarioService.registrarUsuario(nuevo);

        // then
        assertNotNull(resultado);
        assertEquals("usuario1", resultado.getUsername());
        assertEquals("correo@correo.com", resultado.getCorreo());
        verify(usuarioRepository).save(nuevo);
    }

    @Test
    void registrarUsuario_usernameExistente_lanzaExcepcion() {
        // given
        Usuario usuario = new Usuario();
        usuario.setUsername("repetido");
        usuario.setCorreo("nuevo@correo.com");

        when(usuarioRepository.existsById(usuario.getUsername())).thenReturn(true);

        // when + then
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> usuarioService.registrarUsuario(usuario));

        assertEquals("El username ya existe", ex.getMessage());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void registrarUsuario_correoExistente_lanzaExcepcion() {
        // given
        Usuario usuario = new Usuario();
        usuario.setUsername("nuevo");
        usuario.setCorreo("correo@repetido.com");

        when(usuarioRepository.existsById(usuario.getUsername())).thenReturn(false);
        when(usuarioRepository.existsByCorreo(usuario.getCorreo())).thenReturn(true);

        // when + then
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> usuarioService.registrarUsuario(usuario));

        assertEquals("El correo ya está registrado", ex.getMessage());
        verify(usuarioRepository, never()).save(any());
    }
}
