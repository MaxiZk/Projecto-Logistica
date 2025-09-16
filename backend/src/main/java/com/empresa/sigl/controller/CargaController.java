package com.empresa.sigl.controller;

import java.util.List;                         // <-- FALTA ESTE
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.empresa.sigl.model.Carga;
import com.empresa.sigl.service.CargaService;

@RestController
@RequestMapping("/api/cargas")
@CrossOrigin
public class CargaController {

    private final CargaService service;

    public CargaController(CargaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Carga> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Carga> obtener(@PathVariable String id) {
        return service.obtener(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Carga> crear(@RequestBody Carga c) {
        return ResponseEntity.ok(service.crear(c));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Carga> actualizar(@PathVariable String id, @RequestBody Carga c) {
        return service.actualizar(id, c)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        return service.eliminar(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
