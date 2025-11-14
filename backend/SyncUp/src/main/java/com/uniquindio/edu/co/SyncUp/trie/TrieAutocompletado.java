package com.uniquindio.edu.co.SyncUp.trie;

import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * RF-025: Implementación de Árbol de Prefijos (Trie)
 * RF-026: Devolver todas las palabras que comiencen con un prefijo dado
 */
@Component
@Getter
public class TrieAutocompletado {

    private final TrieNode raiz;
    private int totalPalabras;

    public TrieAutocompletado() {
        this.raiz = new TrieNode();
        this.totalPalabras = 0;
    }

    /**
     * RF-025: Insertar una palabra en el Trie
     *
     * @param palabra Palabra a insertar (se normaliza a minúsculas)
     * @param entidadId ID de la entidad asociada
     * @param tipo Tipo: "cancion", "artista", "album"
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
     * Insertar múltiples palabras de un texto
     */
    /**
     * Insertar múltiples palabras de un texto
     */
    public void insertarTexto(String texto, String entidadId, String tipo) {
        if (texto == null || texto.trim().isEmpty()) {
            return;
        }

        // Normalizar el texto completo
        String textoNormalizado = normalizar(texto);

        System.out.println("📝 [TRIE] Insertando: '" + texto + "' → '" + textoNormalizado + "' (Tipo: " + tipo + ", ID: " + entidadId + ")");

        // 1. Insertar cada palabra individual
        String[] palabras = textoNormalizado.split("\\s+");
        for (String palabra : palabras) {
            if (palabra.length() >= 2) {
                System.out.println("   └─ Palabra: '" + palabra + "'");
                insertar(palabra, entidadId, tipo);
            }
        }

        // 2. Insertar el texto completo SIN ESPACIOS (para usernames)
        String textoSinEspacios = textoNormalizado.replaceAll("\\s+", "");
        if (textoSinEspacios.length() >= 2) {
            System.out.println("   └─ Texto sin espacios: '" + textoSinEspacios + "'");
            insertar(textoSinEspacios, entidadId, tipo);
        }

        // 3. Insertar el texto completo CON ESPACIOS (para nombres completos)
        if (textoNormalizado.contains(" ") && textoNormalizado.length() >= 2) {
            System.out.println("   └─ Texto completo: '" + textoNormalizado + "'");
            insertar(textoNormalizado, entidadId, tipo);
        }
    }

    /**
     * RF-026: Buscar todas las palabras que comienzan con un prefijo
     *
     * @param prefijo Prefijo a buscar
     * @return Lista de palabras que coinciden
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
     * Buscar entidades asociadas a un prefijo
     *
     * @param prefijo Prefijo a buscar
     * @return Mapa con tipo de entidad y IDs asociados
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
     * Buscar el nodo correspondiente a un prefijo
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
     * Recolectar recursivamente todas las palabras desde un nodo
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
     * Recolectar recursivamente todas las entidades desde un nodo
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

        // ✅ AHORA SÍ FUNCIONA: Obtener IDs por tipo del nodo
        resultado.get("canciones").addAll(nodo.getCancionIds());
        resultado.get("artistas").addAll(nodo.getArtistaIds());
        resultado.get("albums").addAll(nodo.getAlbumIds());
        resultado.get("usuarios").addAll(nodo.getUsuarioIds());

        // Recorrer recursivamente los hijos
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
     * Normalizar texto: minúsculas, sin acentos, sin caracteres especiales
     */
    /**
     * Normalizar texto: minúsculas, sin acentos, sin caracteres especiales
     */
    private String normalizar(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return "";
        }

        // 1. Convertir a minúsculas PRIMERO
        String resultado = texto.toLowerCase();

        // 2. Reemplazar acentos
        resultado = resultado
                .replaceAll("[áàäâ]", "a")
                .replaceAll("[éèëê]", "e")
                .replaceAll("[íìïî]", "i")
                .replaceAll("[óòöô]", "o")
                .replaceAll("[úùüû]", "u")
                .replaceAll("ñ", "n");

        // 3. Mantener solo letras, números y espacios
        resultado = resultado.replaceAll("[^a-z0-9\\s]", "");

        // 4. Eliminar espacios múltiples
        resultado = resultado.replaceAll("\\s+", " ").trim();

        System.out.println("🔄 Normalización: '" + texto + "' → '" + resultado + "'");

        return resultado;
    }

    /**
     * Verificar si una palabra existe en el Trie
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
     * Obtener estadísticas del Trie
     */
    public Map<String, Object> obtenerEstadisticas() {
        return Map.of(
                "totalPalabras", totalPalabras,
                "profundidadMaxima", calcularProfundidadMaxima(raiz, 0),
                "totalNodos", contarNodos(raiz)
        );
    }

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

    private int contarNodos(TrieNode nodo) {
        if (nodo == null) return 0;

        int count = 1;
        for (TrieNode hijo : nodo.getHijos().values()) {
            count += contarNodos(hijo);
        }

        return count;
    }

    /**
     * Limpiar el Trie
     */
    public void limpiar() {
        raiz.getHijos().clear();
        totalPalabras = 0;
    }
}