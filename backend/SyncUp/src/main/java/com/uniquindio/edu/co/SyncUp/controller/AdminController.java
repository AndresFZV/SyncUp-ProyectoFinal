package com.uniquindio.edu.co.SyncUp.controller;

import com.uniquindio.edu.co.SyncUp.document.Administrador;
import com.uniquindio.edu.co.SyncUp.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para gestionar las operaciones de administradores.
 * Proporciona endpoints para registro y autenticación de administradores.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    /**
     * Registra un nuevo administrador en el sistema.
     *
     * @param admin Objeto Administrador con los datos del administrador a registrar
     * @return ResponseEntity con el administrador registrado y estado CREATED
     */
    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Administrador admin) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.registrarAdmin(admin));
    }
    /**
     * Autentica a un administrador mediante username y password.
     *
     * @param username Nombre de usuario del administrador
     * @param password Contraseña del administrador
     * @return ResponseEntity con el resultado del proceso de autenticación
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String password) {
        return ResponseEntity.ok(adminService.login(username, password));
    }
}