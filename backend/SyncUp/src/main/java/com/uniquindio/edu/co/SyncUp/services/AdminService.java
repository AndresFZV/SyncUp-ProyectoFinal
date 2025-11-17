package com.uniquindio.edu.co.SyncUp.services;

import com.uniquindio.edu.co.SyncUp.document.Administrador;
import com.uniquindio.edu.co.SyncUp.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Servicio para gestionar las operaciones de administradores.
 * Proporciona lógica de negocio para autenticación y registro de administradores.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;

    /**
     * Autentica a un administrador mediante username y password.
     *
     * @param username Nombre de usuario del administrador
     * @param password Contraseña del administrador
     * @return Administrador autenticado
     * @throws RuntimeException si las credenciales son incorrectas
     */
    public Administrador login(String username, String password) {
        return adminRepository.findByUsernameAndPassword(username, password)
                .filter(admin -> admin.getPassword().equals(password))
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));
    }

    /**
     * Registra un nuevo administrador en el sistema.
     *
     * @param admin Objeto Administrador con los datos del administrador a registrar
     * @return Administrador registrado
     * @throws RuntimeException si el username ya existe en el sistema
     */
    public Administrador registrarAdmin(Administrador admin) {
        if (adminRepository.existsById(admin.getUsername())) {
            throw new RuntimeException("El username ya existe");
        }
        return adminRepository.save(admin);
    }
}