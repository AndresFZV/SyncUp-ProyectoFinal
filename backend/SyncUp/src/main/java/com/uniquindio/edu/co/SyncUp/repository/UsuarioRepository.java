package com.uniquindio.edu.co.SyncUp.repository;

import com.uniquindio.edu.co.SyncUp.document.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

/**
 * Repositorio para gestionar las operaciones de base de datos de usuarios.
 * Proporciona métodos para acceso, autenticación y consulta de entidades Usuario.
 *
 * @author SyncUp Team
 * @version 1.0
 */
public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    /**
     * Busca un usuario por su nombre de usuario.
     *
     * @param username Nombre de usuario a buscar
     * @return Optional con el usuario encontrado o vacío si no existe
     */
    Optional<Usuario> findByUsername(String username);

    /**
     * Valida las credenciales de login de un usuario.
     *
     * @param username Nombre de usuario
     * @param password Contraseña del usuario
     * @return Optional con el usuario autenticado o vacío si las credenciales son incorrectas
     */
    Optional<Usuario> findByUsernameAndPassword(String username, String password);

    /**
     * Verifica si existe un usuario con el correo electrónico especificado.
     *
     * @param correo Correo electrónico a verificar
     * @return true si existe un usuario con ese correo, false en caso contrario
     */
    boolean existsByCorreo(String correo);

    /**
     * Busca un usuario por su correo electrónico.
     *
     * @param correo Correo electrónico del usuario
     * @return Optional con el usuario encontrado o vacío si no existe
     */
    Optional<Usuario> findByCorreo(String correo);
}