package com.uniquindio.edu.co.SyncUp.repository;

import com.uniquindio.edu.co.SyncUp.document.Artista;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Repositorio para gestionar las operaciones de base de datos de artistas.
 * Proporciona métodos para acceso y consulta de entidades Artista.
 *
 * @author SyncUp Team
 * @version 1.0
 */
public interface ArtistaRepository extends MongoRepository<Artista, String> {
}