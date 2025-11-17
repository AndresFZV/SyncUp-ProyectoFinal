package com.uniquindio.edu.co.SyncUp.dto;

import com.uniquindio.edu.co.SyncUp.document.Album;
import com.uniquindio.edu.co.SyncUp.document.Artista;
import com.uniquindio.edu.co.SyncUp.document.Cancion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Objeto de Transferencia de Datos (DTO) para resultados de búsqueda con Trie.
 * Contiene los resultados organizados por tipo y métricas de la búsqueda por prefijo.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoBusquedaDTO {

    /**
     * Prefijo utilizado para la búsqueda.
     */
    private String prefijo;

    /**
     * Lista de canciones que coinciden con el prefijo de búsqueda.
     */
    private List<Cancion> canciones;

    /**
     * Lista de artistas que coinciden con el prefijo de búsqueda.
     */
    private List<Artista> artistas;

    /**
     * Lista de álbumes que coinciden con el prefijo de búsqueda.
     */
    private List<Album> albums;

    /**
     * Lista de usuarios que coinciden con el prefijo de búsqueda.
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
}