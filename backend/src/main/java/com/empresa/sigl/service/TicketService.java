package com.empresa.sigl.service;

import com.empresa.sigl.model.Ticket;
import com.empresa.sigl.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository repo;
    public List<Ticket> listar(){ return repo.findAll(); }
    public Ticket crear(Ticket t){ return repo.save(t); }
    public Ticket actualizar(Long id, Ticket t){ t.setId(id); return repo.save(t); }
    public void eliminar(Long id){ repo.deleteById(id); }
}
