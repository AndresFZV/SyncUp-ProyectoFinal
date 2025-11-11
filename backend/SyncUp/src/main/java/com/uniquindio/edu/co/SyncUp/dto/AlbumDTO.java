package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AlbumDTO {
    private String id;
    private String nombre;
    private String descripcion;
    private String bgColor;
    private String imagenUrl;

    // Info del artista
    private String artistaId;
    private String artistaNombre;

    // Cantidad de canciones
    private int totalCanciones;
}