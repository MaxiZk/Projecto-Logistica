package com.empresa.sigl.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Data @Embeddable
public class Chofer {
    private String nombre;
    private String dni;
    private String cel;
    private String usuario;
    private String password;
}
