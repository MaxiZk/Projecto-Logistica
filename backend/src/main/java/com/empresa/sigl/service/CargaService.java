package com.empresa.sigl.service;

import com.empresa.sigl.model.Carga;
import com.empresa.sigl.repository.CargaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CargaService {

    private final CargaRepository repo;

    public CargaService(CargaRepository repo) {
        this.repo = repo;
    }

    public List<Carga> listar() {
        return repo.findAll();
    }

    public Optional<Carga> obtener(String id) {        // <- String
        return repo.findById(id);
    }

    public Carga crear(Carga c) {
        return repo.save(c);
    }

    public Optional<Carga> actualizar(String id, Carga datos) {  // <- String
        return repo.findById(id).map(ex -> {
            ex.setCliente(datos.getCliente());
            ex.setOrigen(datos.getOrigen());
            ex.setDestino(datos.getDestino());
            ex.setEstado(datos.getEstado());
            ex.setTerminal(datos.getTerminal());
            ex.setContenedor(datos.getContenedor());
            ex.setTaraKg(datos.getTaraKg());
            ex.setPrecinto(datos.getPrecinto());
            ex.setPesoBrutoKg(datos.getPesoBrutoKg());
            ex.setFecha(datos.getFecha());
            return repo.save(ex);
        });
    }

    public boolean eliminar(String id) {               // <- String
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
