package com.uniquindio.edu.co.SyncUp.test;

import java.util.Optional;

import com.uniquindio.edu.co.SyncUp.document.Administrador;
import com.uniquindio.edu.co.SyncUp.repository.AdminRepository;
import com.uniquindio.edu.co.SyncUp.services.AdminService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

public class AdminServiceTest {

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
    void login_DatosCorrectos_RetornaAdministrador() {
        // Arrange
        Mockito.when(adminRepository.findByUsernameAndPassword("admin", "1234"))
                .thenReturn(Optional.of(adminMock));

        // Act
        Administrador resultado = adminService.login("admin", "1234");

        // Assert
        Assertions.assertNotNull(resultado);
        Assertions.assertEquals("admin", resultado.getUsername());
        Mockito.verify(adminRepository).findByUsernameAndPassword("admin", "1234");
    }

    @Test
    void login_ContrasenaIncorrecta_LanzaExcepcion() {
        // Arrange
        adminMock.setPassword("9999");
        Mockito.when(adminRepository.findByUsernameAndPassword("admin", "1234"))
                .thenReturn(Optional.of(adminMock));

        // Act & Assert
        RuntimeException ex = Assertions.assertThrows(RuntimeException.class, () ->
                adminService.login("admin", "1234")
        );

        Assertions.assertEquals("Credenciales incorrectas", ex.getMessage());
    }

    @Test
    void login_UsuarioNoExiste_LanzaExcepcion() {
        // Arrange
        Mockito.when(adminRepository.findByUsernameAndPassword("noExiste", "1234"))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException ex = Assertions.assertThrows(RuntimeException.class, () ->
                adminService.login("noExiste", "1234")
        );

        Assertions.assertEquals("Credenciales incorrectas", ex.getMessage());
    }
}
