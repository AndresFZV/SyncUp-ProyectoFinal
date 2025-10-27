package com.uniquindio.edu.co.SyncUp.repository;

import com.uniquindio.edu.co.SyncUp.document.Cancion;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CancionRepository extends MongoRepository<Cancion, String> {
    // 🔍 Buscar canciones por el ID del artista
 //   List<Cancion> findByArtista_Id(String artistaId);

    // 🔍 Buscar canciones por el ID del álbum
   // List<Cancion> findByAlbum_Id(String albumId);

    // 🔍 Buscar canciones por género (opcional, útil para el frontend)
    //List<Cancion> findByGeneroIgnoreCase(String genero);

}
