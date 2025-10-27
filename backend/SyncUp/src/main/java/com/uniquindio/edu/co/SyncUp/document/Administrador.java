package com.uniquindio.edu.co.SyncUp.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@Document(collection = "administradores")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Administrador extends Usuario {


    private String rol = "ADMIN";

    @Override
    public int hashCode() {
        return Objects.hash(getUsername());
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Administrador admin = (Administrador) obj;
        return Objects.equals(getUsername(), admin.getUsername());
    }
}
