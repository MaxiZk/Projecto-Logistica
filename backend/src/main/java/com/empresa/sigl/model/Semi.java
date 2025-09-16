package com.empresa.sigl.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Data @Embeddable
public class Semi {
    private String marca;
    private String modelo;
    private String anio;
    private String patente;
}
