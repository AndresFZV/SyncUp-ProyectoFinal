package com.uniquindio.edu.co.SyncUp.repository;

import com.uniquindio.edu.co.SyncUp.document.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    // Buscar usuario por username
    Optional<Usuario> findByUsername(String username);

    // Validar login: buscar por username y password
    Optional<Usuario> findByUsernameAndPassword(String username, String password);

    // Validar existencia de correo único
    boolean existsByCorreo(String correo);

    Optional<Usuario> findByCorreo(String correo);
}
