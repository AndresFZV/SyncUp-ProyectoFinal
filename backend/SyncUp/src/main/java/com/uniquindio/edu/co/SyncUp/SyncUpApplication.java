package com.uniquindio.edu.co.SyncUp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Clase principal de la aplicación SyncUp - Sistema de Streaming Musical.
 * Inicia la aplicación Spring Boot y configura la funcionalidad asíncrona.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@SpringBootApplication
@EnableAsync
public class SyncUpApplication {

	/**
	 * Método principal que inicia la aplicación Spring Boot.
	 *
	 * @param args Argumentos de línea de comandos
	 */
	public static void main(String[] args) {
		SpringApplication.run(SyncUpApplication.class, args);
	}

}