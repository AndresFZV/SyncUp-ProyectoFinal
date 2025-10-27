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
public class SolicitudArtista {
    private String artistId;
    private String nombre;
    private String pais;
    private String generoPrincipal;
    private String biografia;
    private MultipartFile imagenUrl;
}
