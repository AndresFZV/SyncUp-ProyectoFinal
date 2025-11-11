package com.uniquindio.edu.co.SyncUp.repository;

import com.uniquindio.edu.co.SyncUp.document.Cancion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface CancionRepository extends MongoRepository<Cancion, String> {

    /**
     * Busca canciones por ID de álbum
     * Como Album es @DBRef, usa la sintaxis especial 'album.$id'
     * Pero como Album.id se llama "id", usamos esa propiedad
     */
    @Query("{ 'album.$id': { $oid: ?0 } }")
    List<Cancion> findByAlbumId(String albumId);

    /**
     * Busca canciones por ID de artista
     * Como Artista es @DBRef y tiene "artistId", usamos esa propiedad
     */
    @Query("{ 'artista.$id': { $oid: ?0 } }")
    List<Cancion> findByArtistaId(String artistaId);
}