package com.uniquindio.edu.co.SyncUp.dto;

import com.uniquindio.edu.co.SyncUp.document.Album;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AlbumListResponse {
    private boolean exito;
    private List<Album> albums;
}
