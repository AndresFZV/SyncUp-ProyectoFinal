package com.uniquindio.edu.co.SyncUp.services;

import com.uniquindio.edu.co.SyncUp.document.Usuario;
import com.uniquindio.edu.co.SyncUp.graph.AlgoritmoBFS;
import com.uniquindio.edu.co.SyncUp.graph.GrafoSocial;
import com.uniquindio.edu.co.SyncUp.graph.Nodo;
import com.uniquindio.edu.co.SyncUp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar el Grafo Social y generar sugerencias
 * RF-008: Sugerencias de usuarios para seguir
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GrafoSocialService {

    private final GrafoSocial grafoSocial;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    // Configuración
    private static final int MAX_SUGERENCIAS = 10;
    private static final int MIN_CONEXIONES_COMUNES = 1;
    private static final double PESO_CONEXIONES_COMUNES = 0.5;
    private static final double PESO_SEGUIDORES = 0.3;
    private static final double PESO_DISTANCIA = 0.2;

    /**
     * Inicializar o reconstruir el grafo social
     */
    public void reconstruirGrafo() {
        log.info("🔄 Reconstruyendo grafo social...");
        List<Usuario> todosLosUsuarios = usuarioRepository.findAll();
        grafoSocial.construirGrafo(todosLosUsuarios);
        log.info("✅ Grafo reconstruido exitosamente");
    }

    /**
     * RF-008: Obtener sugerencias de usuarios para seguir
     * Basado en amigos de amigos (BFS nivel 2) y scoring
     */
    public List<Map<String, Object>> obtenerSugerencias(String username, int limite) {
        log.info("🎯 Generando sugerencias para: {}", username);

        // Verificar si el grafo está construido
        if (grafoSocial.estaVacio()) {
            reconstruirGrafo();
        }

        Usuario usuario = usuarioService.buscarIdentificador(username);

        // Obtener usuarios ya seguidos
        Set<String> yaSigue = new HashSet<>();
        if (usuario.getSiguiendo() != null) {
            yaSigue = usuario.getSiguiendo().stream()
                    .filter(Objects::nonNull)
                    .map(Usuario::getUsername)
                    .collect(Collectors.toSet());
        }
        yaSigue.add(username); // No sugerirse a sí mismo

        // 1. Obtener candidatos usando BFS (amigos de amigos - nivel 2)
        Set<String> amigosDeAmigos = grafoSocial.obtenerAmigosDeAmigos(username);

        // 2. Si no hay suficientes candidatos, expandir a nivel 3
        Set<String> candidatos = new HashSet<>(amigosDeAmigos);
        if (candidatos.size() < limite) {
            Set<String> nivel3 = AlgoritmoBFS.obtenerUsuariosEnNivel(
                    grafoSocial.getAdyacencias(),
                    username,
                    3
            );
            candidatos.addAll(nivel3);
        }

        // 3. Si aún no hay suficientes, agregar usuarios populares
        if (candidatos.size() < limite) {
            List<Usuario> populares = obtenerUsuariosPopulares(yaSigue, limite - candidatos.size());
            candidatos.addAll(populares.stream()
                    .map(Usuario::getUsername)
                    .collect(Collectors.toSet()));
        }

        // 4. Calcular score para cada candidato
        List<SugerenciaUsuario> sugerencias = new ArrayList<>();

        for (String candidato : candidatos) {
            if (yaSigue.contains(candidato)) continue;

            Usuario usuarioCandidato = usuarioService.buscarIdentificador(candidato);
            if (usuarioCandidato == null) continue;

            // Calcular conexiones en común
            int conexionesComunes = calcularConexionesComunes(usuario, usuarioCandidato);

            // Filtrar si no cumple mínimo de conexiones comunes
            if (amigosDeAmigos.contains(candidato) && conexionesComunes < MIN_CONEXIONES_COMUNES) {
                continue;
            }

            // Calcular score de relevancia
            double score = calcularScore(
                    conexionesComunes,
                    usuarioCandidato.getSeguidores() != null ? usuarioCandidato.getSeguidores().size() : 0,
                    grafoSocial.calcularGradoSeparacion(username, candidato)
            );

            // Obtener amigos en común (para mostrar al usuario)
            List<String> amigosEnComun = obtenerAmigosEnComun(usuario, usuarioCandidato);

            sugerencias.add(new SugerenciaUsuario(
                    candidato,
                    usuarioCandidato.getNombre(),
                    usuarioCandidato.getSeguidores() != null ? usuarioCandidato.getSeguidores().size() : 0,
                    usuarioCandidato.getSiguiendo() != null ? usuarioCandidato.getSiguiendo().size() : 0,
                    conexionesComunes,
                    amigosEnComun,
                    grafoSocial.calcularGradoSeparacion(username, candidato),
                    score
            ));
        }

        // 5. Ordenar por score y limitar
        List<Map<String, Object>> resultado = sugerencias.stream()
                .sorted(Comparator.comparingDouble(SugerenciaUsuario::getScore).reversed())
                .limit(limite)
                .map(this::convertirSugerenciaAMap)
                .collect(Collectors.toList());

        log.info("✅ Generadas {} sugerencias para {}", resultado.size(), username);
        return resultado;
    }

    /**
     * Calcular score de relevancia para una sugerencia
     */
    private double calcularScore(int conexionesComunes, int seguidores, int distancia) {
        // Normalizar valores
        double scoreConexiones = Math.min(conexionesComunes / 10.0, 1.0);
        double scoreSeguidores = Math.min(seguidores / 1000.0, 1.0);
        double scoreDistancia = distancia > 0 ? 1.0 / distancia : 0.0;

        // Calcular score ponderado
        return (scoreConexiones * PESO_CONEXIONES_COMUNES) +
                (scoreSeguidores * PESO_SEGUIDORES) +
                (scoreDistancia * PESO_DISTANCIA);
    }

    /**
     * Calcular conexiones en común entre dos usuarios
     */
    private int calcularConexionesComunes(Usuario usuario1, Usuario usuario2) {
        if (usuario1.getSiguiendo() == null || usuario2.getSeguidores() == null) {
            return 0;
        }

        Set<String> siguiendo1 = usuario1.getSiguiendo().stream()
                .filter(Objects::nonNull)
                .map(Usuario::getUsername)
                .collect(Collectors.toSet());

        Set<String> seguidores2 = usuario2.getSeguidores().stream()
                .filter(Objects::nonNull)
                .map(Usuario::getUsername)
                .collect(Collectors.toSet());

        siguiendo1.retainAll(seguidores2);
        return siguiendo1.size();
    }

    /**
     * Obtener lista de amigos en común
     */
    private List<String> obtenerAmigosEnComun(Usuario usuario1, Usuario usuario2) {
        if (usuario1.getSiguiendo() == null || usuario2.getSeguidores() == null) {
            return new ArrayList<>();
        }

        Set<String> siguiendo1 = usuario1.getSiguiendo().stream()
                .filter(Objects::nonNull)
                .map(Usuario::getUsername)
                .collect(Collectors.toSet());

        return usuario2.getSeguidores().stream()
                .filter(Objects::nonNull)
                .map(Usuario::getUsername)
                .filter(siguiendo1::contains)
                .limit(5) // Limitar a 5 para no saturar
                .collect(Collectors.toList());
    }

    /**
     * Obtener usuarios populares como fallback
     */
    private List<Usuario> obtenerUsuariosPopulares(Set<String> excluir, int limite) {
        return usuarioRepository.findAll().stream()
                .filter(u -> !excluir.contains(u.getUsername()))
                .filter(Objects::nonNull)
                .sorted((u1, u2) -> {
                    int seg1 = u1.getSeguidores() != null ? u1.getSeguidores().size() : 0;
                    int seg2 = u2.getSeguidores() != null ? u2.getSeguidores().size() : 0;
                    return Integer.compare(seg2, seg1);
                })
                .limit(limite)
                .collect(Collectors.toList());
    }

    /**
     * Convertir sugerencia a Map para respuesta JSON
     */
    private Map<String, Object> convertirSugerenciaAMap(SugerenciaUsuario sugerencia) {
        Map<String, Object> map = new HashMap<>();
        map.put("username", sugerencia.getUsername());
        map.put("nombre", sugerencia.getNombre());
        map.put("seguidores", sugerencia.getSeguidores());
        map.put("siguiendo", sugerencia.getSiguiendo());
        map.put("conexionesComunes", sugerencia.getConexionesComunes());
        map.put("amigosEnComun", sugerencia.getAmigosEnComun());
        map.put("gradoSeparacion", sugerencia.getGradoSeparacion());
        map.put("score", Math.round(sugerencia.getScore() * 100.0) / 100.0);
        return map;
    }

    /**
     * Obtener información de conexiones de un usuario
     */
    public Map<String, Object> obtenerInformacionConexiones(String username) {
        if (grafoSocial.estaVacio()) {
            reconstruirGrafo();
        }

        return grafoSocial.obtenerInformacionConexiones(username);
    }

    /**
     * Encontrar camino entre dos usuarios
     */
    public Map<String, Object> encontrarCamino(String origen, String destino) {
        if (grafoSocial.estaVacio()) {
            reconstruirGrafo();
        }

        Map<String, Object> resultado = new HashMap<>();
        List<String> camino = grafoSocial.encontrarCamino(origen, destino);

        if (camino != null && !camino.isEmpty()) {
            resultado.put("existe", true);
            resultado.put("origen", origen);
            resultado.put("destino", destino);
            resultado.put("distancia", camino.size() - 1);
            resultado.put("camino", camino);
        } else {
            resultado.put("existe", false);
            resultado.put("mensaje", "No existe conexión entre estos usuarios");
        }

        return resultado;
    }

    /**
     * Obtener estadísticas del grafo
     */
    public Map<String, Object> obtenerEstadisticas() {
        if (grafoSocial.estaVacio()) {
            reconstruirGrafo();
        }

        return grafoSocial.obtenerEstadisticas();
    }

    /**
     * Actualizar grafo cuando un usuario sigue a otro
     */
    public void actualizarSeguimiento(String seguidor, String seguido) {
        if (!grafoSocial.estaVacio()) {
            grafoSocial.agregarConexion(seguidor, seguido);
            log.info("➕ Conexión agregada: {} ↔ {}", seguidor, seguido);
        }
    }

    /**
     * Actualizar grafo cuando un usuario deja de seguir a otro
     */
    public void actualizarDejarDeSeguir(String seguidor, String seguido) {
        if (!grafoSocial.estaVacio()) {
            grafoSocial.eliminarConexion(seguidor, seguido);
            log.info("➖ Conexión eliminada: {} ↔ {}", seguidor, seguido);
        }
    }

    /**
     * Clase interna para representar una sugerencia
     */
    private static class SugerenciaUsuario {
        private String username;
        private String nombre;
        private int seguidores;
        private int siguiendo;
        private int conexionesComunes;
        private List<String> amigosEnComun;
        private int gradoSeparacion;
        private double score;

        public SugerenciaUsuario(String username, String nombre, int seguidores,
                                 int siguiendo, int conexionesComunes,
                                 List<String> amigosEnComun, int gradoSeparacion,
                                 double score) {
            this.username = username;
            this.nombre = nombre;
            this.seguidores = seguidores;
            this.siguiendo = siguiendo;
            this.conexionesComunes = conexionesComunes;
            this.amigosEnComun = amigosEnComun;
            this.gradoSeparacion = gradoSeparacion;
            this.score = score;
        }

        public String getUsername() { return username; }
        public String getNombre() { return nombre; }
        public int getSeguidores() { return seguidores; }
        public int getSiguiendo() { return siguiendo; }
        public int getConexionesComunes() { return conexionesComunes; }
        public List<String> getAmigosEnComun() { return amigosEnComun; }
        public int getGradoSeparacion() { return gradoSeparacion; }
        public double getScore() { return score; }
    }

    /**
     * Obtener estructura completa del grafo para visualización
     * Incluye todos los nodos y aristas hasta cierta profundidad
     */
    public Map<String, Object> obtenerEstructuraGrafo(String username, int profundidad) {
        log.info("🔍 Obteniendo estructura del grafo para: {} (profundidad: {})", username, profundidad);

        if (grafoSocial.estaVacio()) {
            reconstruirGrafo();
        }

        Map<String, Object> estructura = new HashMap<>();
        List<Map<String, Object>> nodos = new ArrayList<>();
        List<Map<String, Object>> aristas = new ArrayList<>();
        Set<String> nodosVisitados = new HashSet<>();

        // BFS para obtener nodos hasta cierta profundidad
        Queue<String> cola = new LinkedList<>();
        Map<String, Integer> niveles = new HashMap<>();

        cola.offer(username);
        niveles.put(username, 0);
        nodosVisitados.add(username);

        while (!cola.isEmpty()) {
            String actual = cola.poll();
            int nivelActual = niveles.get(actual);

            // Agregar nodo
            Nodo nodo = grafoSocial.obtenerNodo(actual);
            if (nodo != null) {
                Map<String, Object> nodoData = new HashMap<>();
                nodoData.put("id", actual);
                nodoData.put("label", actual);
                nodoData.put("nivel", nivelActual);
                nodoData.put("grado", nodo.getGrado());
                nodos.add(nodoData);
            }

            // Si no hemos alcanzado la profundidad máxima, procesar vecinos
            if (nivelActual < profundidad) {
                Set<String> vecinos = grafoSocial.obtenerVecinos(actual);

                for (String vecino : vecinos) {
                    // Agregar arista (evitar duplicados en grafo no dirigido)
                    Map<String, Object> arista = new HashMap<>();
                    // Ordenar para evitar duplicados: A-B y B-A
                    String from = actual.compareTo(vecino) < 0 ? actual : vecino;
                    String to = actual.compareTo(vecino) < 0 ? vecino : actual;

                    arista.put("from", actual);  // Mantener dirección original para visualización
                    arista.put("to", vecino);
                    arista.put("id", from + "-" + to);  // ID único

                    // Solo agregar si no existe ya
                    boolean aristaExiste = aristas.stream()
                            .anyMatch(a -> a.get("id").equals(from + "-" + to));

                    if (!aristaExiste) {
                        aristas.add(arista);
                    }

                    // Agregar vecino a la cola si no ha sido visitado
                    if (!nodosVisitados.contains(vecino)) {
                        nodosVisitados.add(vecino);
                        niveles.put(vecino, nivelActual + 1);
                        cola.offer(vecino);
                    }
                }
            }
        }

        estructura.put("nodos", nodos);
        estructura.put("aristas", aristas);
        estructura.put("usuarioOrigen", username);
        estructura.put("profundidad", profundidad);
        estructura.put("totalNodos", nodos.size());
        estructura.put("totalAristas", aristas.size());

        log.info("✅ Estructura obtenida: {} nodos, {} aristas", nodos.size(), aristas.size());
        return estructura;
    }


}