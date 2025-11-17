package com.uniquindio.edu.co.SyncUp.trie;

import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Implementación de un árbol de prefijos (Trie) para funcionalidades de autocompletado.
 * Proporciona inserción y búsqueda eficiente de palabras con soporte para múltiples tipos de entidades.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Component
@Getter
public class TrieAutocompletado {

    private final TrieNode raiz;
    private int totalPalabras;

    /**
     * Constructor que inicializa el Trie con un nodo raíz vacío.
     */
    public TrieAutocompletado() {
        this.raiz = new TrieNode();
        this.totalPalabras = 0;
    }

    /**
     * Inserta una palabra en el Trie asociada a una entidad específica.
     *
     * @param palabra La palabra a insertar (se normaliza a minúsculas)
     * @param entidadId El ID de la entidad asociada
     * @param tipo El tipo de entidad: "cancion", "artista", "album", "usuario"
     */
    public void insertar(String palabra, String entidadId, String tipo) {
        if (palabra == null || palabra.trim().isEmpty()) {
            return;
        }

        palabra = normalizar(palabra);
        TrieNode actual = raiz;

        for (char c : palabra.toCharArray()) {
            if (!actual.tieneHijo(c)) {
                actual.agregarHijo(c, new TrieNode());
            }
            actual = actual.obtenerHijo(c);
        }

        if (!actual.isEsFinalDePalabra()) {
            actual.marcarComoFinal();
            totalPalabras++;
        }

        actual.agregarEntidad(entidadId, tipo);
    }

    /**
     * Inserta múltiples palabras de un texto, incluyendo variaciones sin espacios y el texto completo.
     *
     * @param texto El texto a procesar e insertar
     * @param entidadId El ID de la entidad asociada
     * @param tipo El tipo de entidad: "cancion", "artista", "album", "usuario"
     */
    public void insertarTexto(String texto, String entidadId, String tipo) {
        if (texto == null || texto.trim().isEmpty()) {
            return;
        }

        String textoNormalizado = normalizar(texto);

        // Insertar cada palabra individual
        String[] palabras = textoNormalizado.split("\\s+");
        for (String palabra : palabras) {
            if (palabra.length() >= 2) {
                insertar(palabra, entidadId, tipo);
            }
        }

        // Insertar el texto completo SIN ESPACIOS (para usernames)
        String textoSinEspacios = textoNormalizado.replaceAll("\\s+", "");
        if (textoSinEspacios.length() >= 2) {
            insertar(textoSinEspacios, entidadId, tipo);
        }

        // Insertar el texto completo CON ESPACIOS (para nombres completos)
        if (textoNormalizado.contains(" ") && textoNormalizado.length() >= 2) {
            insertar(textoNormalizado, entidadId, tipo);
        }
    }

    /**
     * Busca todas las palabras que comienzan con un prefijo dado.
     *
     * @param prefijo El prefijo a buscar
     * @return Lista de palabras que coinciden con el prefijo
     */
    public List<String> buscarPorPrefijo(String prefijo) {
        if (prefijo == null || prefijo.trim().isEmpty()) {
            return new ArrayList<>();
        }

        prefijo = normalizar(prefijo);
        TrieNode nodo = buscarNodo(prefijo);

        if (nodo == null) {
            return new ArrayList<>();
        }

        List<String> resultados = new ArrayList<>();
        recolectarPalabras(nodo, prefijo, resultados, 20);

        return resultados;
    }

    /**
     * Busca entidades asociadas a un prefijo dado.
     *
     * @param prefijo El prefijo a buscar
     * @return Mapa con tipos de entidad y conjuntos de IDs asociados
     */
    public Map<String, Set<String>> buscarEntidadesPorPrefijo(String prefijo) {
        if (prefijo == null || prefijo.trim().isEmpty()) {
            return new HashMap<>();
        }

        prefijo = normalizar(prefijo);

        Map<String, Set<String>> resultado = new HashMap<>();
        resultado.put("canciones", new HashSet<>());
        resultado.put("artistas", new HashSet<>());
        resultado.put("albums", new HashSet<>());
        resultado.put("usuarios", new HashSet<>());
        TrieNode nodo = buscarNodo(prefijo);

        if (nodo == null) {
            return resultado;
        }

        recolectarEntidades(nodo, resultado, 50);

        return resultado;
    }

    /**
     * Busca el nodo correspondiente a un prefijo dado.
     *
     * @param prefijo El prefijo a buscar
     * @return El nodo correspondiente al prefijo, o null si no existe
     */
    private TrieNode buscarNodo(String prefijo) {
        TrieNode actual = raiz;

        for (char c : prefijo.toCharArray()) {
            if (!actual.tieneHijo(c)) {
                return null;
            }
            actual = actual.obtenerHijo(c);
        }

        return actual;
    }

    /**
     * Recolecta recursivamente todas las palabras desde un nodo dado.
     *
     * @param nodo El nodo desde donde comenzar la búsqueda
     * @param prefijo El prefijo actual
     * @param resultados La lista donde almacenar los resultados
     * @param limite El número máximo de resultados a recolectar
     */
    private void recolectarPalabras(TrieNode nodo, String prefijo, List<String> resultados, int limite) {
        if (nodo == null || resultados.size() >= limite) {
            return;
        }

        if (nodo.isEsFinalDePalabra()) {
            resultados.add(prefijo);
        }

        for (Map.Entry<Character, TrieNode> entry : nodo.getHijos().entrySet()) {
            if (resultados.size() >= limite) {
                break;
            }
            recolectarPalabras(
                    entry.getValue(),
                    prefijo + entry.getKey(),
                    resultados,
                    limite
            );
        }
    }

    /**
     * Recolecta recursivamente todas las entidades desde un nodo dado.
     *
     * @param nodo El nodo desde donde comenzar la búsqueda
     * @param resultado El mapa donde almacenar las entidades encontradas
     * @param limite El número máximo de entidades a recolectar
     */
    private void recolectarEntidades(TrieNode nodo, Map<String, Set<String>> resultado, int limite) {
        if (nodo == null) {
            return;
        }

        int total = resultado.get("canciones").size() +
                resultado.get("artistas").size() +
                resultado.get("albums").size() +
                resultado.get("usuarios").size();

        if (total >= limite) {
            return;
        }

        resultado.get("canciones").addAll(nodo.getCancionIds());
        resultado.get("artistas").addAll(nodo.getArtistaIds());
        resultado.get("albums").addAll(nodo.getAlbumIds());
        resultado.get("usuarios").addAll(nodo.getUsuarioIds());

        for (TrieNode hijo : nodo.getHijos().values()) {
            recolectarEntidades(hijo, resultado, limite);

            total = resultado.get("canciones").size() +
                    resultado.get("artistas").size() +
                    resultado.get("albums").size() +
                    resultado.get("usuarios").size();

            if (total >= limite) {
                return;
            }
        }
    }

    /**
     * Normaliza un texto convirtiéndolo a minúsculas, eliminando acentos y caracteres especiales.
     *
     * @param texto El texto a normalizar
     * @return El texto normalizado
     */
    private String normalizar(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return "";
        }

        String resultado = texto.toLowerCase();

        resultado = resultado
                .replaceAll("[áàäâ]", "a")
                .replaceAll("[éèëê]", "e")
                .replaceAll("[íìïî]", "i")
                .replaceAll("[óòöô]", "o")
                .replaceAll("[úùüû]", "u")
                .replaceAll("ñ", "n");

        resultado = resultado.replaceAll("[^a-z0-9\\s]", "");
        resultado = resultado.replaceAll("\\s+", " ").trim();

        return resultado;
    }

    /**
     * Verifica si una palabra existe en el Trie.
     *
     * @param palabra La palabra a verificar
     * @return true si la palabra existe, false en caso contrario
     */
    public boolean existe(String palabra) {
        if (palabra == null || palabra.trim().isEmpty()) {
            return false;
        }

        palabra = normalizar(palabra);
        TrieNode nodo = buscarNodo(palabra);

        return nodo != null && nodo.isEsFinalDePalabra();
    }

    /**
     * Obtiene estadísticas del Trie.
     *
     * @return Mapa con estadísticas del Trie
     */
    public Map<String, Object> obtenerEstadisticas() {
        return Map.of(
                "totalPalabras", totalPalabras,
                "profundidadMaxima", calcularProfundidadMaxima(raiz, 0),
                "totalNodos", contarNodos(raiz)
        );
    }

    /**
     * Calcula la profundidad máxima del Trie.
     *
     * @param nodo El nodo actual
     * @param profundidadActual La profundidad actual
     * @return La profundidad máxima del Trie
     */
    private int calcularProfundidadMaxima(TrieNode nodo, int profundidadActual) {
        if (!nodo.tieneHijos()) {
            return profundidadActual;
        }

        int maxProfundidad = profundidadActual;
        for (TrieNode hijo : nodo.getHijos().values()) {
            int profundidad = calcularProfundidadMaxima(hijo, profundidadActual + 1);
            maxProfundidad = Math.max(maxProfundidad, profundidad);
        }

        return maxProfundidad;
    }

    /**
     * Cuenta el número total de nodos en el Trie.
     *
     * @param nodo El nodo actual
     * @return El número total de nodos
     */
    private int contarNodos(TrieNode nodo) {
        if (nodo == null) return 0;

        int count = 1;
        for (TrieNode hijo : nodo.getHijos().values()) {
            count += contarNodos(hijo);
        }

        return count;
    }

    /**
     * Limpia completamente el Trie, eliminando todas las palabras y entidades.
     */
    public void limpiar() {
        raiz.getHijos().clear();
        totalPalabras = 0;
    }
}