package com.empresa.sigl.service;

import com.empresa.sigl.model.Factura;
import com.empresa.sigl.repository.FacturaRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FacturaService {

    private final FacturaRepository repo;

    public FacturaService(FacturaRepository repo) {
        this.repo = repo;
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    public Factura crear(@Valid Factura f) {
        // estado por defecto si viene vacío
        if (isBlank(f.getEstado())) {
            f.setEstado("EMITIDA");
        }
        return repo.save(f);
    }

    public List<Factura> listar(String cliente) {
        if (isBlank(cliente)) {
            return repo.findAll();
        }
        return repo.findByClienteContainingIgnoreCase(cliente);
    }

    public Optional<Factura> buscarPorId(Long id) {
        return repo.findById(id);
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }
}
