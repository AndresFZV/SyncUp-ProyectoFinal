package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SolicitudAlbum {
    private String id;
    private String nombre;
    private String descripcion;
    private String bgColor;
    private MultipartFile archivoImagen;
    private String artistId;
    private List<String> songIds;
}
