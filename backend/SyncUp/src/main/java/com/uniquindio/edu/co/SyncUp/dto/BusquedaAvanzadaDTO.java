package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Objeto de Transferencia de Datos (DTO) para búsquedas avanzadas con múltiples criterios.
 * Permite realizar búsquedas complejas combinando diferentes filtros y lógicas.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusquedaAvanzadaDTO {

    /**
     * Término de búsqueda general para autocompletado.
     */
    private String query;

    /**
     * Filtro por nombre de artista.
     */
    private String artista;

    /**
     * Filtro por género musical.
     */
    private String genero;

    /**
     * Año mínimo de lanzamiento para filtrar.
     */
    private Integer anioMin;

    /**
     * Año máximo de lanzamiento para filtrar.
     */
    private Integer anioMax;

    /**
     * Lógica de combinación de filtros ("AND" o "OR").
     */
    private String logica;

    /**
     * Límite máximo de resultados a retornar.
     */
    private Integer limite;

    /**
     * Verifica si existe un término de búsqueda general activo.
     *
     * @return true si hay un query no vacío, false en caso contrario
     */
    public boolean tieneQuery() {
        return query != null && !query.trim().isEmpty();
    }

    /**
     * Verifica si hay filtros específicos activos.
     *
     * @return true si hay al menos un filtro activo, false en caso contrario
     */
    public boolean tieneFiltros() {
        return (artista != null && !artista.trim().isEmpty()) ||
                (genero != null && !genero.trim().isEmpty()) ||
                anioMin != null ||
                anioMax != null;
    }

    /**
     * Verifica si la lógica de combinación es AND.
     *
     * @return true si la lógica es AND, false en caso contrario
     */
    public boolean esAND() {
        return "AND".equalsIgnoreCase(logica);
    }

    /**
     * Verifica si la lógica de combinación es OR (valor por defecto).
     *
     * @return true si la lógica es OR o no está definida, false en caso contrario
     */
    public boolean esOR() {
        return "OR".equalsIgnoreCase(logica) || logica == null;
    }
}