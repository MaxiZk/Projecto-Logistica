// src/main/java/com/empresa/sigl/controller/FacturaController.java
package com.empresa.sigl.controller;

import com.empresa.sigl.model.Factura;          // <--- model
import com.empresa.sigl.service.FacturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas")
@CrossOrigin(origins = {
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "https://projecto-logistica-l4au.vercel.app"
})
@RequiredArgsConstructor
public class FacturaController {

    private final FacturaService service;

    @GetMapping
    public List<Factura> listar(@RequestParam(required = false) String cliente) {
        return (cliente == null || cliente.isBlank())
                ? service.listarTodas()
                : service.buscarPorCliente(cliente);
    }

    @PostMapping
    public Factura crear(@RequestBody Factura factura) {
        return service.crear(factura);
    }
}
