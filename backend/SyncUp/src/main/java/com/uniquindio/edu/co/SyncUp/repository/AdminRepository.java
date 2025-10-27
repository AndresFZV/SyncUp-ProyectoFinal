package com.uniquindio.edu.co.SyncUp.repository;

import com.uniquindio.edu.co.SyncUp.document.Administrador;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AdminRepository extends MongoRepository<Administrador, String> {

    Optional<Administrador> findByUsernameAndPassword(String username, String password);
}
