package com.uniquindio.edu.co.SyncUp.services;

import com.uniquindio.edu.co.SyncUp.document.Administrador;
import com.uniquindio.edu.co.SyncUp.document.Usuario;
import com.uniquindio.edu.co.SyncUp.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;

    public Administrador login(String username, String password) {
        return adminRepository.findByUsernameAndPassword(username, password)
                .filter(admin -> admin.getPassword().equals(password))
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));
    }

    public Administrador registrarAdmin(Administrador admin) {
        if (adminRepository.existsById(admin.getUsername())) {
            throw new RuntimeException("El username ya existe");
        }
        return adminRepository.save(admin);
    }

}
