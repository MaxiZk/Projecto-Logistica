package com.empresa.sigl.service;

import com.empresa.sigl.model.Factura;
import com.empresa.sigl.repository.FacturaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class FacturaService {
    private final FacturaRepository repository;

    public FacturaService(FacturaRepository repository) {
        this.repository = repository;
    }

    public List<Factura> listar(String cliente) {
        if (cliente != null && !cliente.isBlank()) {
            return repository.findByClienteContainingIgnoreCaseOrderByIdDesc(cliente.trim());
        }
        return repository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    public Factura crear(Factura f) {
        f.setId(null);
        if (f.getEstado() == null || f.getEstado().isBlank()) f.setEstado("EMITIDA");
        return repository.save(f);
    }

    public Factura anular(Long id, String tipo) {
        Factura fac = repository.findById(id).orElseThrow();
        String t = tipo == null ? "" : tipo.trim().toUpperCase();
        if (!t.equals("NC") && !t.equals("ND")) throw new IllegalArgumentException("tipo debe ser NC o ND");
        fac.setEstado("ANULADA");
        fac.setAnulacionTipo(t);
        fac.setFechaAnulacion(LocalDate.now());
        return repository.save(fac);
    }
}
