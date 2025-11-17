package com.uniquindio.edu.co.SyncUp.repository;

import com.uniquindio.edu.co.SyncUp.document.Administrador;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

/**
 * Repositorio para gestionar las operaciones de base de datos de administradores.
 * Proporciona métodos para acceso y consulta de entidades Administrador.
 *
 * @author SyncUp Team
 * @version 1.0
 */
public interface AdminRepository extends MongoRepository<Administrador, String> {

    /**
     * Busca un administrador por su nombre de usuario y contraseña.
     *
     * @param username Nombre de usuario del administrador
     * @param password Contraseña del administrador
     * @return Optional con el administrador encontrado o vacío si no existe
     */
    Optional<Administrador> findByUsernameAndPassword(String username, String password);
}