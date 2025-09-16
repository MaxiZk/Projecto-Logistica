package com.empresa.sigl.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity @Table(name="legajo")
public class Legajo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String codigo;     // LEG-0240
    private String cliente;
    private String tipo;       // Importación/Exportación
    private String estado;     // Documentación OK / Esperando verificación
}
