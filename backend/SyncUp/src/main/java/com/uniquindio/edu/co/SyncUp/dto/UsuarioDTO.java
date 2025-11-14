package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private String username;
    private String nombre;
    private String correo;
    private int edad;
    private int cantidadSeguidores;
    private int cantidadSiguiendo;

    // Constructor desde Usuario
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