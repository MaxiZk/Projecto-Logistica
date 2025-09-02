// src/main/java/com/empresa/sigl/model/Factura.java
package com.empresa.sigl.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "factura")
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 20, unique = true)
    private String numero;               // opcional (podés dejar null)

    @NotBlank
    @Column(nullable = false, length = 120)
    private String cliente;

    private String cuit;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")  // <-- el front debe enviar este formato
    @Column(nullable = false)
    private LocalDate fecha;

    @NotNull
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total;

    @Column(nullable = false, length = 20)
    private String estado;               // si viene vacío, Service pone "EMITIDA"

    // (opcional) un detalle rápido si querés guardar lo que escribe el usuario
    @Column(length = 255)
    private String detalle;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }
    public String getCuit() { return cuit; }
    public void setCuit(String cuit) { this.cuit = cuit; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }
}
