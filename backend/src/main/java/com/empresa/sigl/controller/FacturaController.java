package com.empresa.sigl.controller;

import com.empresa.sigl.model.Factura;
import com.empresa.sigl.repository.FacturaRepository;
import com.empresa.sigl.service.FacturaService;
import com.empresa.sigl.dto.NotaDebitoDTO;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/facturas")
@CrossOrigin(origins = {"http://localhost:5173,http://127.0.0.1:5173,https://max.zuidnet.online"})
public class FacturaController {

    private final FacturaRepository repository;
    private final FacturaService facturaService;

    public FacturaController(FacturaRepository repository, FacturaService facturaService) {
        this.repository = repository;
        this.facturaService = facturaService;
    }

    // LISTAR (uno solo)
    @GetMapping
    public List<Factura> listar(@RequestParam(required = false) String cliente) {
        if (cliente != null && !cliente.isBlank()) {
            return repository.findByClienteContainingIgnoreCaseOrderByIdDesc(cliente.trim());
        }
        return repository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    // ➜ OBTENER POR ID (lo que falta)
    @GetMapping("/{id}")
    public Factura obtener(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada"));
    }

    // CREAR (uno solo)
    @PostMapping
    public ResponseEntity<Factura> crear(@RequestBody Factura f) {
        // si querés delegar en el service:
        Factura calculada = facturaService.crearFactura(f);
        Factura saved = repository.save(calculada);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ANULAR (marca estado ANULADA por NC)
    @PutMapping("/{id}/anular")
    public ResponseEntity<Factura> anular(@PathVariable Long id) {
        Factura fac = repository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada"));
        if ("ANULADA".equalsIgnoreCase(fac.getEstado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La factura ya está anulada");
        }
        fac.setEstado("ANULADA");
        fac.setAnulacionTipo("NC");
        fac.setFechaAnulacion(LocalDate.now());
        return ResponseEntity.ok(repository.save(fac));
    }

    // NOTA DE DÉBITO
    @PostMapping("/{id}/nota-debito")
    public ResponseEntity<Factura> emitirNotaDebito(@PathVariable Long id, @RequestBody NotaDebitoDTO dto) {
        Factura nd = facturaService.emitirNotaDebito(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nd);
    }
}
