package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CancionDTO {
    private String songId;
    private String titulo;
    private String genero;
    private int anio;
    private double duracion;
    private String imagenUrl;
    private String musica;

    // Info del artista (sin ciclos)
    private String artistaId;
    private String artistaNombre;

    // Info del álbum (sin ciclos)
    private String albumId;
    private String albumNombre;
}