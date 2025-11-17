package com.uniquindio.edu.co.SyncUp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración para el manejo de CORS (Cross-Origin Resource Sharing).
 * Define las políticas de acceso para solicitudes entre diferentes orígenes.
 */
@Configuration
public class CorsConfig {

    /**
     * Configura el mapeo de CORS para los endpoints de la API.
     * Permite solicitudes desde el cliente frontend en localhost:5173.
     *
     * @return Configurador de CORS para la aplicación
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("GET", "POST", "PUT", "DELETE");
            }
        };
    }
}