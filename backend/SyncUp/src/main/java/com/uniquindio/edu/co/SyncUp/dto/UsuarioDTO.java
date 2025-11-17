package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Objeto de Transferencia de Datos (DTO) para representar un usuario.
 * Proporciona una vista simplificada de un usuario con información básica y estadísticas sociales.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {

    /**
     * Nombre de usuario único.
     */
    private String username;

    /**
     * Nombre completo del usuario.
     */
    private String nombre;

    /**
     * Correo electrónico del usuario.
     */
    private String correo;

    /**
     * Edad del usuario.
     */
    private int edad;

    /**
     * Número de seguidores del usuario.
     */
    private int cantidadSeguidores;

    /**
     * Número de usuarios que este usuario sigue.
     */
    private int cantidadSiguiendo;

    /**
     * Crea un UsuarioDTO a partir de una entidad Usuario.
     *
     * @param usuario Entidad Usuario de la cual extraer los datos
     * @return Instancia de UsuarioDTO con los datos del usuario
     */
    public static UsuarioDTO fromUsuario(com.uniquindio.edu.co.SyncUp.document.Usuario usuario) {
        return UsuarioDTO.builder()
                .username(usuario.getUsername())
                .nombre(usuario.getNombre())
                .correo(usuario.getCorreo())
                .edad(usuario.getEdad())
                .cantidadSeguidores(usuario.getSeguidores() != null ? usuario.getSeguidores().size() : 0)
                .cantidadSiguiendo(usuario.getSiguiendo() != null ? usuario.getSiguiendo().size() : 0)
                .build();
    }
}