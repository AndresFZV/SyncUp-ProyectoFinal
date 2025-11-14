package com.uniquindio.edu.co.SyncUp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * RF-004: DTO para búsquedas avanzadas con múltiples criterios
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusquedaAvanzadaDTO {

    // Término de búsqueda general (autocompletado)
    private String query;

    // Filtros específicos
    private String artista;
    private String genero;
    private Integer anioMin;
    private Integer anioMax;

    // Lógica de combinación
    private String logica; // "AND" o "OR"

    // Límite de resultados
    private Integer limite;

    /**
     * Verificar si hay filtros activos
     */
    public boolean tieneQuery() {
        return query != null && !query.trim().isEmpty();
    }

    public boolean tieneFiltros() {
        return (artista != null && !artista.trim().isEmpty()) ||
                (genero != null && !genero.trim().isEmpty()) ||
                anioMin != null ||
                anioMax != null;
    }

    public boolean esAND() {
        return "AND".equalsIgnoreCase(logica);
    }

    public boolean esOR() {
        return "OR".equalsIgnoreCase(logica) || logica == null;
    }
}