package com.uniquindio.edu.co.SyncUp.dto;

import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Objeto de Transferencia de Datos (DTO) para el resultado de búsquedas avanzadas.
 * Contiene los resultados organizados por tipo y métricas de rendimiento.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoBusquedaAvanzadaDTO {

    /**
     * Lista de canciones que coinciden con los criterios de búsqueda.
     */
    private List<Cancion> canciones;

    /**
     * Lista de artistas que coinciden con los criterios de búsqueda.
     */
    private List<Artista> artistas;

    /**
     * Lista de álbumes que coinciden con los criterios de búsqueda.
     */
    private List<Album> albums;

    /**
     * Lista de usuarios que coinciden con los criterios de búsqueda.
     */
    private List<UsuarioDTO> usuarios;

    /**
     * Número total de resultados encontrados.
     */
    private int totalResultados;

    /**
     * Tiempo total de búsqueda en milisegundos.
     */
    private Long tiempoBusqueda;

    /**
     * Tiempos de ejecución por hilo individual (para análisis de concurrencia).
     */
    private Map<String, Long> tiemposPorHilo;

    /**
     * Número de hilos utilizados en la búsqueda concurrente.
     */
    private int hilosUtilizados;
}