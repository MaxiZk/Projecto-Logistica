package com.empresa.sigl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "carga")
public class Carga {

    @Id
    @Column(length = 40)     // ej: ORD-101
    private String id;

    @Column(nullable = false)
    private String cliente;

    @Column(nullable = false)
    private String origen;

    @Column(nullable = false)
    private String destino;

    private String terminal;
    private String contenedor;
    private String tipo;
    private String taraKg;
    private String precinto;
    private String pesoBrutoKg;

    private LocalDate fecha;

    @Column(length = 30, nullable = false)
    private String estado;   // En preparación / En tránsito / Entregado / Demorado

    // ---------- Embebidos con columnas prefijadas ----------
    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "nombre",   column = @Column(name = "chofer_nombre")),
            @AttributeOverride(name = "dni",      column = @Column(name = "chofer_dni")),
            @AttributeOverride(name = "cel",      column = @Column(name = "chofer_cel")),
            @AttributeOverride(name = "usuario",  column = @Column(name = "chofer_usuario")),
            @AttributeOverride(name = "password", column = @Column(name = "chofer_password"))
    })
    private Chofer chofer;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "marca",   column = @Column(name = "camion_marca")),
            @AttributeOverride(name = "modelo",  column = @Column(name = "camion_modelo")),
            @AttributeOverride(name = "anio",    column = @Column(name = "camion_anio")),
            @AttributeOverride(name = "patente", column = @Column(name = "camion_patente")),
            @AttributeOverride(name = "sat",     column = @Column(name = "camion_sat"))
    })
    private Camion camion;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "marca",   column = @Column(name = "semi_marca")),
            @AttributeOverride(name = "modelo",  column = @Column(name = "semi_modelo")),
            @AttributeOverride(name = "anio",    column = @Column(name = "semi_anio")),
            @AttributeOverride(name = "patente", column = @Column(name = "semi_patente"))
    })
    private Semi semi;
}
