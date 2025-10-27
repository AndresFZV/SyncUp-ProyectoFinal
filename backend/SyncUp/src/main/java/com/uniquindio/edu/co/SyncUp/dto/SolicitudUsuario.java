package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SolicitudUsuario {
    private String username;           // Nombre único de usuario
    private String password;           // Contraseña
    private String nombre;             // Nombre completo
    private String correo;             // Correo electrónico
    private int edad;                  // Edad del usuario
    private String palabraSecreta; // Palabra secreta del usuario
    private List<String> listaFavoritosIds;      // IDs de canciones favoritas
    private List<String> artistasFavoritosIds;  // IDs de artistas favoritos
    private List<String> siguiendoIds;           // IDs de usuarios a seguir
}
