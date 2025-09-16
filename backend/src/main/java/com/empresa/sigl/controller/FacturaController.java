package com.empresa.sigl.controller;

import com.empresa.sigl.model.Factura;
import com.empresa.sigl.repository.FacturaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/facturas")
@CrossOrigin(origins = {"http://localhost:5173","http://127.0.0.1:5173"})
public class FacturaController {

    private final FacturaRepository repository;
    public FacturaController(FacturaRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Factura> listar(@RequestParam(required = false) String cliente) {
        if (cliente != null && !cliente.isBlank()) {
            return repository.findByClienteContainingIgnoreCaseOrderByIdDesc(cliente.trim());
        }
        return repository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @PostMapping
    public ResponseEntity<Factura> crear(@RequestBody Factura f) {
        f.setId(null);
        if (f.getEstado() == null || f.getEstado().isBlank()) f.setEstado("EMITIDA");

        // Defaults razonables
        if (f.getBonificacionPct() == null) f.setBonificacionPct(BigDecimal.ZERO);
        if (f.getAlicuotaIvaPct() == null) f.setAlicuotaIvaPct(new BigDecimal("21"));
        if (f.getImporteOtrosTributos() == null) f.setImporteOtrosTributos(BigDecimal.ZERO);

        // Cálculos
        BigDecimal cant = n(f.getCantidad());
        BigDecimal pUnit = n(f.getPrecioUnitario());
        BigDecimal boni = n(f.getBonificacionPct()); // % ej 0 ó 10
        BigDecimal alic = n(f.getAlicuotaIvaPct());  // 21 / 10.5 / 27

        BigDecimal bruto = cant.multiply(pUnit);
        BigDecimal desc = bruto.multiply(boni).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal neto = bruto.subtract(desc);
        BigDecimal iva = neto.multiply(alic).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal total = neto.add(iva).add(n(f.getImporteOtrosTributos()));

        f.setImporteNetoGravado(neto);
        f.setImporteIva(iva);
        f.setImporteTotal(total);

        Factura saved = repository.save(f);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/anular")
    public ResponseEntity<Factura> anular(@PathVariable Long id, @RequestParam String tipo) {
        Factura fac = repository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada"));

        String t = tipo == null ? "" : tipo.trim().toUpperCase();
        if (!t.equals("NC") && !t.equals("ND")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tipo debe ser NC o ND");
        }
        fac.setEstado("ANULADA");
        fac.setAnulacionTipo(t);
        fac.setFechaAnulacion(LocalDate.now());
        return ResponseEntity.ok(repository.save(fac));
    }

    private static BigDecimal n(BigDecimal v){
        return v==null ? BigDecimal.ZERO : v;
    }
}
