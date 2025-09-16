package com.empresa.sigl.service;

import com.empresa.sigl.model.Legajo;
import com.empresa.sigl.repository.LegajoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LegajoService {
    private final LegajoRepository repo;
    public List<Legajo> listar(){ return repo.findAll(); }
    public Legajo crear(Legajo l){ return repo.save(l); }
    public Legajo actualizar(Long id, Legajo l){ l.setId(id); return repo.save(l); }
    public void eliminar(Long id){ repo.deleteById(id); }
}
