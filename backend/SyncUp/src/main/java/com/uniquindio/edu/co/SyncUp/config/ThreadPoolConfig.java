package com.uniquindio.edu.co.SyncUp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * RF-030: Configuración de pool de hilos para búsquedas concurrentes
 */
@Configuration
public class ThreadPoolConfig {

    @Bean(name = "searchTaskExecutor")
    public Executor searchTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // Núcleo de hilos: 4
        executor.setCorePoolSize(4);

        // Máximo de hilos: 8
        executor.setMaxPoolSize(8);

        // Capacidad de la cola: 100
        executor.setQueueCapacity(100);

        // Prefijo para nombres de hilos
        executor.setThreadNamePrefix("search-");

        // Política de rechazo: CallerRunsPolicy
        // Si la cola está llena, ejecuta en el hilo que llamó
        executor.setRejectedExecutionHandler(
                new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy()
        );

        executor.initialize();

        System.out.println("✅ ThreadPool para búsquedas configurado");
        System.out.println("   Core: 4, Max: 8, Queue: 100");

        return executor;
    }
}