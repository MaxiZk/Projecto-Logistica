// src/main/java/com/empresa/sigl/controller/FacturaController.java
package com.empresa.sigl.controller;

import com.empresa.sigl.model.Factura;
import com.empresa.sigl.service.FacturaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:63342",     // JetBrains IDE built-in server
        "http://127.0.0.1:63342",
        "http://localhost:5500"       // Live Server (VSCode) si lo usás
})
public class FacturaController {

    private final FacturaService service;

    @PostMapping
    public ResponseEntity<Factura> crear(@Valid @RequestBody Factura f) {
        Factura creada = service.crear(f);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @GetMapping
    public List<Factura> listar(@RequestParam(required = false) String cliente) {
        return service.listar(cliente);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Factura> buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
