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

    @GetMapping("/{id}")
    public Factura obtener(@PathVariable Long id){
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada"));
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


    @PostMapping("/{id}/nota-debito")
    public ResponseEntity<Factura> crearNotaDebito(
            @PathVariable Long id,
            @RequestBody NotaDebitoDTO dto // ver DTO abajo
    ) {
        Factura origen = repository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura origen no encontrada"));

        Factura nd = new Factura();
        nd.setId(null);
        nd.setFacturaOrigenId(origen.getId());

        // Tipo y código AFIP típicos (ajustá a tu necesidad)
        nd.setTipo("ND A");                 // o "Nota de Débito A"
        nd.setCodigoComprobante("02");      // 02 suele ser ND A; para FCE usar 202
        nd.setPuntoVenta(dto.getPuntoVenta()!=null? dto.getPuntoVenta() : origen.getPuntoVenta());
        nd.setNumero(dto.getNumero());      // si lo maneja el sistema, puede quedar null

        nd.setFechaEmision(dto.getFechaEmision()!=null? dto.getFechaEmision() : LocalDate.now());

        // Copiamos datos del cliente
        nd.setCliente(origen.getCliente());
        nd.setCuit(origen.getCuit());
        nd.setDomicilio(origen.getDomicilio());
        nd.setCondicionIVACliente(origen.getCondicionIVACliente());
        nd.setCondicionVenta(origen.getCondicionVenta());

        // Concepto / detalle ND
        nd.setDetalle(dto.getDetalle());

        // Si manejás ítems:
        // podés construir nd.detalles con 1 renglón por el concepto de la ND
        // o, si no usás items, completar los totales directos:
        nd.setImporteNetoGravado(dto.getImporteNeto()!=null? dto.getImporteNeto() : 0);
        nd.setImporteIva(dto.getImporteIva()!=null? dto.getImporteIva() : 0);
        nd.setImporteOtrosTributos(dto.getImporteOtros()!=null? dto.getImporteOtros() : 0);
        nd.setImporteTotal(
                (nd.getImporteNetoGravado()==null?0:nd.getImporteNetoGravado()) +
                        (nd.getImporteIva()==null?0:nd.getImporteIva()) +
                        (nd.getImporteOtrosTributos()==null?0:nd.getImporteOtrosTributos())
        );

        // Datos FCE / bancarios opcionales
        nd.setCbuEmisor(origen.getCbuEmisor());
        nd.setAliasCbu(origen.getAliasCbu());
        nd.setOpcionCirculacion(origen.getOpcionCirculacion());

        nd.setEstado("EMITIDA");

        Factura saved = repository.save(nd);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }


    @PutMapping("/{id}/anular")
    public ResponseEntity<Factura> anular(@PathVariable Long id) {
        Factura fac = repository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada"));

        if ("ANULADA".equalsIgnoreCase(fac.getEstado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La factura ya está anulada");
        }
        // Marcamos anulación por NC (no generamos aquí el comprobante NC; esto solo marca el estado)
        fac.setEstado("ANULADA");
        fac.setAnulacionTipo("NC");
        fac.setFechaAnulacion(LocalDate.now());

        return ResponseEntity.ok(repository.save(fac));
    }

    private static BigDecimal n(BigDecimal v){
        return v==null ? BigDecimal.ZERO : v;
    }
}
