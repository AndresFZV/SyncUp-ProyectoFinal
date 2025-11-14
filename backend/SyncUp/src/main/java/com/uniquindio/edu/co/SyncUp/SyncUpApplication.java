package com.uniquindio.edu.co.SyncUp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SyncUpApplication {

	public static void main(String[] args) {
		SpringApplication.run(SyncUpApplication.class, args);
	}

}
