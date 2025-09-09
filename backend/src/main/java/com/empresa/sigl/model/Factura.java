package com.empresa.sigl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "factura", uniqueConstraints = {
        @UniqueConstraint(name = "uk_factura_numero", columnNames = "numero")
})
public class Factura {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 120, nullable = false)
    private String cliente;

    private String cuit;

    @Column(length = 255)
    private String detalle;

    @Column(length = 20, nullable = false)
    private String estado; // EMITIDA / PENDIENTE / PAGADA / ANULADA

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(length = 20)
    private String numero; // único (opcional)

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total;
}
