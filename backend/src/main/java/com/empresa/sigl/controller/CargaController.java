package com.empresa.sigl.controller;

import com.empresa.sigl.model.Carga;
import com.empresa.sigl.repository.CargaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/cargas")
@CrossOrigin(origins = {"http://localhost:5173","http://127.0.0.1:5173",
        "https://projecto-logistica-git-main-maxizks-projects.vercel.app",
        "https://projecto-logistica.vercel.app"})
public class CargaController {

    private final CargaRepository repo;

    public CargaController(CargaRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Carga> listar(@RequestParam(required = false) String cliente){
        if (cliente != null && !cliente.isBlank()) {
            return repo.findByClienteContainingIgnoreCaseOrderByIdAsc(cliente.trim());
        }
        return repo.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    @GetMapping("/{id}")
    public Carga obtener(@PathVariable String id){
        return repo.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carga no encontrada")
        );
    }

    @PostMapping
    public ResponseEntity<Carga> crear(@RequestBody Carga c){
        // Si usás String id: lo define el front (obligatorio y único)
        if (c.getId()==null || c.getId().isBlank()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El ID de la orden es obligatorio.");
        }
        if (repo.existsById(c.getId())){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una orden con ese ID.");
        }
        // Estado por defecto
        if (c.getEstado()==null || c.getEstado().isBlank()) c.setEstado("En preparación");
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(c));
    }

    @PutMapping("/{id}")
    public Carga actualizar(@PathVariable String id, @RequestBody Carga in){
        Carga db = repo.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carga no encontrada")
        );
        // Campos principales
        db.setCliente(in.getCliente());
        db.setOrigen(in.getOrigen());
        db.setDestino(in.getDestino());
        db.setEstado(in.getEstado());
        db.setFecha(in.getFecha());

        // Extendidos
        db.setTerminalPortuaria(in.getTerminalPortuaria());
        db.setContenedor(in.getContenedor());
        db.setTipo(in.getTipo());
        db.setTara(in.getTara());
        db.setPrecinto(in.getPrecinto());
        db.setPesoBruto(in.getPesoBruto());

        db.setChofer(in.getChofer());
        db.setDniChofer(in.getDniChofer());
        db.setCelularChofer(in.getCelularChofer());
        db.setPatenteTractor(in.getPatenteTractor());
        db.setPatenteSemi(in.getPatenteSemi());

        return repo.save(db);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id){
        if (!repo.existsById(id)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Carga no encontrada");
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
