package com.empresa.sigl.service;

import com.empresa.sigl.model.Factura;           // <--- model
import com.empresa.sigl.repository.FacturaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository repo;

    public List<Factura> listarTodas() {
        return repo.findAll();
    }

    public List<Factura> buscarPorCliente(String cliente) {
        return repo.findByClienteContainingIgnoreCase(cliente);
    }

    public Factura crear(Factura f) {
        if (f.getEstado() == null || f.getEstado().isBlank()) f.setEstado("EMITIDA");
        return repo.save(f);
    }
}
