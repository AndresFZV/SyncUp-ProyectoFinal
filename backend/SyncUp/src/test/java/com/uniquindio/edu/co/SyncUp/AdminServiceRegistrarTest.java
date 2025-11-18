package com.uniquindio.edu.co.SyncUp;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.uniquindio.edu.co.SyncUp.document.Administrador;
import com.uniquindio.edu.co.SyncUp.repository.AdminRepository;
import com.uniquindio.edu.co.SyncUp.services.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

public class AdminServiceRegistrarTest {

    @Mock
    private AdminRepository adminRepository;

    @InjectMocks
    private AdminService adminService;

    private Administrador adminMock;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        adminMock = new Administrador();
        adminMock.setUsername("admin");
        adminMock.setPassword("1234");
    }

    @Test
    void registrarAdmin_NuevoAdmin_GuardaCorrectamente() {
        // Arrange
        when(adminRepository.existsById("admin")).thenReturn(false);
        when(adminRepository.save(adminMock)).thenReturn(adminMock);

        // Act
        Administrador resultado = adminService.registrarAdmin(adminMock);

        // Assert
        assertNotNull(resultado);
        assertEquals("admin", resultado.getUsername());
        verify(adminRepository).existsById("admin");
        verify(adminRepository).save(adminMock);
    }

    @Test
    void registrarAdmin_UsernameYaExiste_LanzaExcepcion() {
        // Arrange
        when(adminRepository.existsById("admin")).thenReturn(true);

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                adminService.registrarAdmin(adminMock)
        );

        assertEquals("El username ya existe", ex.getMessage());
        verify(adminRepository).existsById("admin");
        verify(adminRepository, never()).save(any());
    }

    @Test
    void registrarAdmin_AdminSinUsername_NoLanzaExcepcion() {
        Administrador admin = new Administrador(); // username null
        when(adminRepository.existsById(null)).thenReturn(false);
        when(adminRepository.save(admin)).thenReturn(admin);

        assertDoesNotThrow(() -> adminService.registrarAdmin(admin));
    }
}
