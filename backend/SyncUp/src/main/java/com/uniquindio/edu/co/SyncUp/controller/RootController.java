package com.uniquindio.edu.co.SyncUp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador REST para verificación del estado del servicio.
 * Proporciona endpoints básicos para monitoreo de salud de la aplicación.
 */
@RestController
@RequestMapping("/api/health")
public class RootController {

    /**
     * Verifica el estado de salud del servicio.
     *
     * @return Mensaje indicando que el servicio está funcionando correctamente
     */
    @GetMapping
    public String healthCheck() {
        return "Funciona esta vaina";
    }
}