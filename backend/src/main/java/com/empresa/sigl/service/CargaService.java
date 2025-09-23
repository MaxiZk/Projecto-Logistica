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

    public Optional<Carga> obtener(String id) {
        return repo.findById(id);
    }

    public Carga crear(Carga c) {
        // si querés forzar estado por defecto o normalizar algo, hacelo acá
        return repo.save(c);
    }

    public Optional<Carga> actualizar(String id, Carga datos) {
        return repo.findById(id).map(ex -> {
            ex.setCliente(datos.getCliente());
            ex.setOrigen(datos.getOrigen());
            ex.setDestino(datos.getDestino());
            ex.setEstado(datos.getEstado());

            // NOMBRES NUEVOS (coinciden con tu entidad Carga)
            ex.setTerminalPortuaria(datos.getTerminalPortuaria());
            ex.setContenedor(datos.getContenedor());
            ex.setTara(datos.getTara());
            ex.setPrecinto(datos.getPrecinto());
            ex.setPesoBruto(datos.getPesoBruto());

            ex.setFecha(datos.getFecha());
            ex.setTipo(datos.getTipo());
            ex.setChofer(datos.getChofer());
            ex.setDniChofer(datos.getDniChofer());
            ex.setCelularChofer(datos.getCelularChofer());
            ex.setPatenteTractor(datos.getPatenteTractor());
            ex.setPatenteSemi(datos.getPatenteSemi());

            return repo.save(ex);
        });
    }

    public boolean eliminar(String id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
