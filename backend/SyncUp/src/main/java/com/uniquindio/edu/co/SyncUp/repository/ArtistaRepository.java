package com.uniquindio.edu.co.SyncUp.repository;

import com.uniquindio.edu.co.SyncUp.document.Artista;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ArtistaRepository extends MongoRepository<Artista, String> {
}
