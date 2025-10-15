package com.empresa.sigl.controller;

import com.empresa.sigl.model.Ticket;
import com.empresa.sigl.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://127.0.0.1:5173","http://localhost:5173",
        "http://127.0.0.1:5174","http://localhost:5174",
        "https://max.zuidnet.online/index.html#home"
})
public class TicketController {
    private final TicketService service;

    @GetMapping public List<Ticket> listar(){ return service.listar(); }
    @PostMapping public Ticket crear(@RequestBody Ticket t){ return service.crear(t); }
    @PutMapping("/{id}") public Ticket actualizar(@PathVariable Long id, @RequestBody Ticket t){ return service.actualizar(id, t); }
    @DeleteMapping("/{id}") public void eliminar(@PathVariable Long id){ service.eliminar(id); }
}
