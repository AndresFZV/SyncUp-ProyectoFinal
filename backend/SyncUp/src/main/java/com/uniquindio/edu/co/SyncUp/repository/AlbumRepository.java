package com.uniquindio.edu.co.SyncUp.repository;

import com.uniquindio.edu.co.SyncUp.document.Album;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AlbumRepository extends MongoRepository<Album, String> {
}
