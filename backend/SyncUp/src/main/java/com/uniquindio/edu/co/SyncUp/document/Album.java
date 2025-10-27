package com.uniquindio.edu.co.SyncUp.document;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "albums")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
public class Album {
    @Id
    @JsonProperty("_id")
    private String id;
    private String nombre;
    private String descripcion;
    private String bgColor;
    private String imagenUrl;
    private String artistId;
    private List<String> songIds;
}
