package com.empresa.sigl.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class NotaDebitoDTO {
    private BigDecimal importeNeto;        // lo que querés debitar sin IVA
    private BigDecimal alicuotaIvaPct;     // ej: 21
    private BigDecimal otrosTributos;      // opcional
    private String motivo;                 // descripción breve
    private LocalDate fechaEmision;        // opcional (si null, la pone el service)

    public BigDecimal getImporteNeto() { return importeNeto; }
    public void setImporteNeto(BigDecimal importeNeto) { this.importeNeto = importeNeto; }

    public BigDecimal getAlicuotaIvaPct() { return alicuotaIvaPct; }
    public void setAlicuotaIvaPct(BigDecimal alicuotaIvaPct) { this.alicuotaIvaPct = alicuotaIvaPct; }

    public BigDecimal getOtrosTributos() { return otrosTributos; }
    public void setOtrosTributos(BigDecimal otrosTributos) { this.otrosTributos = otrosTributos; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public LocalDate getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDate fechaEmision) { this.fechaEmision = fechaEmision; }
}
