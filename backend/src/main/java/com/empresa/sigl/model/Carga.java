package com.empresa.sigl.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "cargas")
public class Carga {

    /**
     * Si tu ID era numérico (Long con @GeneratedValue), cambiá este String por Long
     * y ajustá el Repository y Controller: JpaRepository<Carga, Long>, etc.
     */
    @Id
    @Column(length = 64) // id tipo “ORD-123” o similar
    private String id;

    @Column(nullable = false, length = 150)
    private String cliente;

    @Column(nullable = false, length = 120)
    private String origen;

    @Column(nullable = false, length = 120)
    private String destino;

    @Column(length = 60)
    private String estado; // En preparación / En tránsito / Entregado / Demorado

    private LocalDate fecha;

    // --- Campos nuevos / extendidos ---
    @Column(length = 120)
    private String terminalPortuaria;

    @Column(length = 20)
    private String contenedor;

    @Column(length = 20)
    private String tipo; // 20DV, 40HC, etc.

    @Column(precision = 12, scale = 2)
    private BigDecimal tara; // Kg

    @Column(length = 40)
    private String precinto;

    @Column(precision = 12, scale = 2)
    private BigDecimal pesoBruto; // Kg

    @Column(length = 120)
    private String chofer;

    @Column(length = 20)
    private String dniChofer;

    @Column(length = 30)
    private String celularChofer;

    @Column(length = 15)
    private String patenteTractor;

    @Column(length = 15)
    private String patenteSemi;

    // --- Getters / Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public String getOrigen() { return origen; }
    public void setOrigen(String origen) { this.origen = origen; }

    public String getDestino() { return destino; }
    public void setDestino(String destino) { this.destino = destino; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getTerminalPortuaria() { return terminalPortuaria; }
    public void setTerminalPortuaria(String terminalPortuaria) { this.terminalPortuaria = terminalPortuaria; }

    public String getContenedor() { return contenedor; }
    public void setContenedor(String contenedor) { this.contenedor = contenedor; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public BigDecimal getTara() { return tara; }
    public void setTara(BigDecimal tara) { this.tara = tara; }

    public String getPrecinto() { return precinto; }
    public void setPrecinto(String precinto) { this.precinto = precinto; }

    public BigDecimal getPesoBruto() { return pesoBruto; }
    public void setPesoBruto(BigDecimal pesoBruto) { this.pesoBruto = pesoBruto; }

    public String getChofer() { return chofer; }
    public void setChofer(String chofer) { this.chofer = chofer; }

    public String getDniChofer() { return dniChofer; }
    public void setDniChofer(String dniChofer) { this.dniChofer = dniChofer; }

    public String getCelularChofer() { return celularChofer; }
    public void setCelularChofer(String celularChofer) { this.celularChofer = celularChofer; }

    public String getPatenteTractor() { return patenteTractor; }
    public void setPatenteTractor(String patenteTractor) { this.patenteTractor = patenteTractor; }

    public String getPatenteSemi() { return patenteSemi; }
    public void setPatenteSemi(String patenteSemi) { this.patenteSemi = patenteSemi; }
}
