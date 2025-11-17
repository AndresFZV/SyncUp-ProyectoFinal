package com.uniquindio.edu.co.SyncUp.repository;

import com.uniquindio.edu.co.SyncUp.document.Cancion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

/**
 * Repositorio para gestionar las operaciones de base de datos de canciones.
 * Proporciona métodos para acceso y consulta de entidades Cancion.
 *
 * @author SyncUp Team
 * @version 1.0
 */
public interface CancionRepository extends MongoRepository<Cancion, String> {

    /**
     * Busca canciones por ID de álbum utilizando referencias DBRef.
     *
     * @param albumId Identificador del álbum
     * @return Lista de canciones pertenecientes al álbum especificado
     */
    @Query("{ 'album.$id': { $oid: ?0 } }")
    List<Cancion> findByAlbumId(String albumId);

    /**
     * Busca canciones por ID de artista utilizando referencias DBRef.
     *
     * @param artistaId Identificador del artista
     * @return Lista de canciones del artista especificado
     */
    @Query("{ 'artista.$id': { $oid: ?0 } }")
    List<Cancion> findByArtistaId(String artistaId);

    /**
     * Busca canciones por género musical.
     *
     * @param genero Género musical a buscar
     * @return Lista de canciones del género especificado
     */
    List<Cancion> findByGenero(String genero);
}