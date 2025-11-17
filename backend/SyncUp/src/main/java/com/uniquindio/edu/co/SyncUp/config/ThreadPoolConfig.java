package com.uniquindio.edu.co.SyncUp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuración del pool de hilos para búsquedas concurrentes.
 * Define el executor que gestiona los hilos para operaciones de búsqueda.
 */
@Configuration
public class ThreadPoolConfig {
    /**
     * Configura y crea el executor para tareas de búsqueda concurrentes.
     * Establece el tamaño del pool, capacidad de cola y políticas de ejecución.
     *
     * @return Executor configurado para tareas de búsqueda
     */
    @Bean(name = "searchTaskExecutor")
    public Executor searchTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("search-");
        executor.setRejectedExecutionHandler(
                new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy()
        );
        executor.initialize();
        return executor;
    }
}