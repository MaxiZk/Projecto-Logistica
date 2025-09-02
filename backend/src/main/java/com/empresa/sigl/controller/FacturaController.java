package com.empresa.sigl.controller;

import com.empresa.sigl.model.Factura;
import com.empresa.sigl.service.FacturaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    private final FacturaService service;

    public FacturaController(FacturaService service) {
        this.service = service;
    }

    // Crear
    @PostMapping
    public ResponseEntity<Factura> crear(@Valid @RequestBody Factura factura) {
        Factura guardada = service.crear(factura);
        return ResponseEntity.created(URI.create("/api/facturas/" + guardada.getId()))
                             .body(guardada);
    }

    // Listar (opcional ?cliente=ACME)
    @GetMapping
    public List<Factura> listar(@RequestParam(required = false) String cliente) {
        return service.listar(cliente);
    }

    // Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<Factura> obtener(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // (Opcional) Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
