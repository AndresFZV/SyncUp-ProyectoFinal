package com.uniquindio.edu.co.SyncUp.repository;

import com.uniquindio.edu.co.SyncUp.document.Album;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Repositorio para gestionar las operaciones de base de datos de álbumes.
 * Proporciona métodos para acceso y consulta de entidades Album.
 *
 * @author SyncUp Team
 * @version 1.0
 */
public interface AlbumRepository extends MongoRepository<Album, String> {
}