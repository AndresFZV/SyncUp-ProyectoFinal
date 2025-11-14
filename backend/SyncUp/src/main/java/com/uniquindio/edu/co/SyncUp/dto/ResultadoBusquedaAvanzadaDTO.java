package com.uniquindio.edu.co.SyncUp.dto;

import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import com.uniquindio.edu.co.SyncUp.document.Usuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * RF-004: Resultado de búsqueda avanzada
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoBusquedaAvanzadaDTO {
    private List<Cancion> canciones;
    private List<Artista> artistas;
    private List<Album> albums;
    private List<UsuarioDTO> usuarios;
    private int totalResultados;
    private Long tiempoBusqueda;

    // Información de concurrencia (RF-030)
    private Map<String, Long> tiemposPorHilo;
    private int hilosUtilizados;
}