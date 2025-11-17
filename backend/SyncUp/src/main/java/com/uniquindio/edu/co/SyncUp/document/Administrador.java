package com.uniquindio.edu.co.SyncUp.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

/**
 * Representa un administrador del sistema SyncUp.
 * Extiende la clase Usuario y agrega funcionalidades específicas de administración.
 *
 * @author SyncUp Team
 * @version 1.0
 */
@Document(collection = "administradores")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Administrador extends Usuario {

    /**
     * Rol del administrador en el sistema.
     * Valor fijo "ADMIN" que identifica a los usuarios administradores.
     */
    private String rol = "ADMIN";

    /**
     * Calcula el código hash del administrador basado en su username.
     *
     * @return Código hash del administrador
     */
    @Override
    public int hashCode() {
        return Objects.hash(getUsername());
    }

    /**
     * Compara este administrador con otro objeto para determinar igualdad.
     * Dos administradores se consideran iguales si tienen el mismo username.
     *
     * @param obj Objeto a comparar con este administrador
     * @return true si los objetos son iguales, false en caso contrario
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Administrador admin = (Administrador) obj;
        return Objects.equals(getUsername(), admin.getUsername());
    }
}