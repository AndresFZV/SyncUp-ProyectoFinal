package com.uniquindio.edu.co.SyncUp.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SolicitudCancion {
    private String id;
    private String titulo;
    private String genero;
    private int anio;
    private double duracion;
    private MultipartFile archivoImagen; //Imagen de la canción
    private MultipartFile musica;
    private String artistaId;
    private String albumId;
}
