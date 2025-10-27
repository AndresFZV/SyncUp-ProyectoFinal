package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ArtistaDTO {
    private String artistId;
    private String nombre;
    private String pais;
    private String generoPrincipal;
    private String biografia;
    private String imagenUrl;
    private int totalCanciones;
    private int totalAlbumes;
}