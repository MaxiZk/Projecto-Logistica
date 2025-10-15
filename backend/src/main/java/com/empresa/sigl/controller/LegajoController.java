package com.empresa.sigl.controller;

import com.empresa.sigl.model.Legajo;
import com.empresa.sigl.service.LegajoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/legajos")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://127.0.0.1:5173","http://localhost:5173",
        "http://127.0.0.1:5174","http://localhost:5174",
        "https://max.zuidnet.online"
})
public class LegajoController {
    private final LegajoService service;

    @GetMapping public List<Legajo> listar(){ return service.listar(); }
    @PostMapping public Legajo crear(@RequestBody Legajo l){ return service.crear(l); }
    @PutMapping("/{id}") public Legajo actualizar(@PathVariable Long id, @RequestBody Legajo l){ return service.actualizar(id, l); }
    @DeleteMapping("/{id}") public void eliminar(@PathVariable Long id){ service.eliminar(id); }
}
