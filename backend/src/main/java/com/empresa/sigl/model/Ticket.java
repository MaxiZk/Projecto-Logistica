package com.empresa.sigl.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity @Table(name="ticket")
public class Ticket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String codigo;      // TCK-0502
    private String cliente;
    private String asunto;
    private String estado;      // Abierto/Cerrado
}
