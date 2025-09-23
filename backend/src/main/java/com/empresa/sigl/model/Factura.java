package com.empresa.sigl.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "facturas")
public class Factura {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Encabezado
    private String tipo;              // "A", "FCE A", etc.
    private String codigoComprobante; // "01", "201", etc.
    private Integer puntoVenta;       // 2 => 00002
    private Integer numero;           // 1958, 96, etc.

    private LocalDate fechaEmision;
    private LocalDate fechaVencimientoPago; // vto de pago
    private LocalDate periodoDesde;
    private LocalDate periodoHasta;

    // Receptor
    private String cliente;
    private String cuit;
    private String domicilio;
    private String condicionIVACliente; // "IVA Responsable Inscripto"
    private String condicionVenta;      // "Cuenta Corriente"
    private String ingresosBrutos;      // opcional
    private LocalDate inicioActividades;// opcional

    // Ítem simple (uno) – si luego necesitás múltiples ítems, se pasa a tabla hija
    @Column(length = 1000)
    private String detalle;             // descripción + refs (bkg, bl, contenedores)
    private BigDecimal cantidad;        // 12.00
    private String unidadMedida;        // "unidades"
    private BigDecimal precioUnitario;  // 1431000.00
    private BigDecimal bonificacionPct; // 0.00
    private BigDecimal alicuotaIvaPct;  // 21.00, 10.5, 27

    // Totales
    private BigDecimal importeNetoGravado; // subtotal sin IVA
    private BigDecimal importeIva;         // IVA calculado
    private BigDecimal importeOtrosTributos;// 0
    private BigDecimal importeTotal;       // total con IVA

    // Datos fiscales
    private String cae;
    private LocalDate caeVencimiento;

    // FCE
    private String opcionCirculacion; // "Sistema de Circulación Abierta"
    private String cbuEmisor;
    private String aliasCbu;

    // Estado / Anulación
    private String estado; // EMITIDA / ANULADA
    private String anulacionTipo; // "NC" o "ND"
    private LocalDate fechaAnulacion;

    /* ===== Getters/Setters ===== */
    // -- generados a mano por brevedad:
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getCodigoComprobante() { return codigoComprobante; }
    public void setCodigoComprobante(String codigoComprobante) { this.codigoComprobante = codigoComprobante; }

    public Integer getPuntoVenta() { return puntoVenta; }
    public void setPuntoVenta(Integer puntoVenta) { this.puntoVenta = puntoVenta; }

    public Integer getNumero() { return numero; }
    public void setNumero(Integer numero) { this.numero = numero; }

    public LocalDate getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDate fechaEmision) { this.fechaEmision = fechaEmision; }

    public LocalDate getFechaVencimientoPago() { return fechaVencimientoPago; }
    public void setFechaVencimientoPago(LocalDate fechaVencimientoPago) { this.fechaVencimientoPago = fechaVencimientoPago; }

    public LocalDate getPeriodoDesde() { return periodoDesde; }
    public void setPeriodoDesde(LocalDate periodoDesde) { this.periodoDesde = periodoDesde; }

    public LocalDate getPeriodoHasta() { return periodoHasta; }
    public void setPeriodoHasta(LocalDate periodoHasta) { this.periodoHasta = periodoHasta; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public String getCuit() { return cuit; }
    public void setCuit(String cuit) { this.cuit = cuit; }

    public String getDomicilio() { return domicilio; }
    public void setDomicilio(String domicilio) { this.domicilio = domicilio; }

    public String getCondicionIVACliente() { return condicionIVACliente; }
    public void setCondicionIVACliente(String condicionIVACliente) { this.condicionIVACliente = condicionIVACliente; }

    public String getCondicionVenta() { return condicionVenta; }
    public void setCondicionVenta(String condicionVenta) { this.condicionVenta = condicionVenta; }

    public String getIngresosBrutos() { return ingresosBrutos; }
    public void setIngresosBrutos(String ingresosBrutos) { this.ingresosBrutos = ingresosBrutos; }

    public LocalDate getInicioActividades() { return inicioActividades; }
    public void setInicioActividades(LocalDate inicioActividades) { this.inicioActividades = inicioActividades; }

    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }

    public BigDecimal getCantidad() { return cantidad; }
    public void setCantidad(BigDecimal cantidad) { this.cantidad = cantidad; }

    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }

    public BigDecimal getBonificacionPct() { return bonificacionPct; }
    public void setBonificacionPct(BigDecimal bonificacionPct) { this.bonificacionPct = bonificacionPct; }

    public BigDecimal getAlicuotaIvaPct() { return alicuotaIvaPct; }
    public void setAlicuotaIvaPct(BigDecimal alicuotaIvaPct) { this.alicuotaIvaPct = alicuotaIvaPct; }

    public BigDecimal getImporteNetoGravado() { return importeNetoGravado; }
    public void setImporteNetoGravado(BigDecimal importeNetoGravado) { this.importeNetoGravado = importeNetoGravado; }

    public BigDecimal getImporteIva() { return importeIva; }
    public void setImporteIva(BigDecimal importeIva) { this.importeIva = importeIva; }

    public BigDecimal getImporteOtrosTributos() { return importeOtrosTributos; }
    public void setImporteOtrosTributos(BigDecimal importeOtrosTributos) { this.importeOtrosTributos = importeOtrosTributos; }

    public BigDecimal getImporteTotal() { return importeTotal; }
    public void setImporteTotal(BigDecimal importeTotal) { this.importeTotal = importeTotal; }

    public String getCae() { return cae; }
    public void setCae(String cae) { this.cae = cae; }

    public LocalDate getCaeVencimiento() { return caeVencimiento; }
    public void setCaeVencimiento(LocalDate caeVencimiento) { this.caeVencimiento = caeVencimiento; }

    public String getOpcionCirculacion() { return opcionCirculacion; }
    public void setOpcionCirculacion(String opcionCirculacion) { this.opcionCirculacion = opcionCirculacion; }

    public String getCbuEmisor() { return cbuEmisor; }
    public void setCbuEmisor(String cbuEmisor) { this.cbuEmisor = cbuEmisor; }

    public String getAliasCbu() { return aliasCbu; }
    public void setAliasCbu(String aliasCbu) { this.aliasCbu = aliasCbu; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getAnulacionTipo() { return anulacionTipo; }
    public void setAnulacionTipo(String anulacionTipo) { this.anulacionTipo = anulacionTipo; }

    public LocalDate getFechaAnulacion() { return fechaAnulacion; }
    public void setFechaAnulacion(LocalDate fechaAnulacion) { this.fechaAnulacion = fechaAnulacion; }

    @Column(name = "factura_origen_id")
    private Long facturaOrigenId;    // null para facturas normales; seteado en ND/NC que referencian otra
}
