package com.empresa.sigl.service;

import com.empresa.sigl.dto.NotaDebitoDTO;
import com.empresa.sigl.model.Factura;
import com.empresa.sigl.repository.FacturaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class FacturaService {
    private final FacturaRepository repository;

    public FacturaService(FacturaRepository repository) { this.repository = repository; }

    public List<Factura> listar(String cliente) {
        if (cliente != null && !cliente.isBlank()) {
            return repository.findByClienteContainingIgnoreCaseOrderByIdDesc(cliente.trim());
        }
        return repository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    public Factura crearFactura(Factura f) {
        if (f == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Factura vacía");

        // Si tus getters ya devuelven BigDecimal, no uses valueOf:
        BigDecimal cantidad       = f.getCantidad()            != null ? f.getCantidad()            : BigDecimal.ZERO;
        BigDecimal precioUnitario = f.getPrecioUnitario()      != null ? f.getPrecioUnitario()      : BigDecimal.ZERO;
        BigDecimal bonifPct       = f.getBonificacionPct()     != null ? f.getBonificacionPct()     : BigDecimal.ZERO;
        BigDecimal ivaPct         = f.getAlicuotaIvaPct()      != null ? f.getAlicuotaIvaPct()      : new BigDecimal("21");
        BigDecimal otrosTributos  = f.getImporteOtrosTributos()!= null ? f.getImporteOtrosTributos(): BigDecimal.ZERO;

        BigDecimal cien  = new BigDecimal("100");

        BigDecimal bruto = cantidad.multiply(precioUnitario);
        BigDecimal bonif = bruto.multiply(bonifPct).divide(cien, 2, RoundingMode.HALF_UP);
        BigDecimal neto  = bruto.subtract(bonif);
        BigDecimal iva   = neto.multiply(ivaPct).divide(cien, 2, RoundingMode.HALF_UP);
        BigDecimal total = neto.add(iva).add(otrosTributos);

        f.setImporteNetoGravado(neto);
        f.setImporteIva(iva);
        f.setImporteTotal(total);

        if (f.getEstado()==null || f.getEstado().isBlank()) {
            f.setEstado("EMITIDA");
        }

        return repository.save(f);
    }

    @Transactional
    public Factura emitirNotaDebito(Long facturaId, NotaDebitoDTO dto) {
        Factura original = repository.findById(facturaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada"));

        BigDecimal neto    = dto.getImporteNeto()      != null ? dto.getImporteNeto()      : BigDecimal.ZERO;
        BigDecimal ivaPct  = dto.getAlicuotaIvaPct()   != null ? dto.getAlicuotaIvaPct()   : new BigDecimal("21");
        BigDecimal otros   = dto.getOtrosTributos()    != null ? dto.getOtrosTributos()    : BigDecimal.ZERO;

        BigDecimal iva   = neto.multiply(ivaPct).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal total = neto.add(iva).add(otros);

        Factura nd = new Factura();
        nd.setTipo("ND");
        nd.setCliente(original.getCliente());
        nd.setCuit(original.getCuit());
        nd.setDomicilio(original.getDomicilio());
        nd.setCondicionIVACliente(original.getCondicionIVACliente());
        nd.setCondicionVenta(original.getCondicionVenta());
        nd.setFechaEmision(dto.getFechaEmision()!=null ? dto.getFechaEmision() : LocalDate.now());

        String motivo = (dto.getMotivo()!=null && !dto.getMotivo().isBlank()) ? dto.getMotivo() : "Ajuste por débito";
        nd.setDetalle("ND por: " + motivo + " (Ref. Factura " + original.getId() + ")");

        nd.setImporteNetoGravado(neto);
        nd.setImporteIva(iva);
        nd.setImporteTotal(total);
        nd.setEstado("EMITIDA");

        return repository.save(nd);
    }
}
