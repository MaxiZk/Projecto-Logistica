package com.empresa.sigl.repository;

import com.empresa.sigl.model.Factura;  // <--- model
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FacturaRepository extends JpaRepository<Factura, Long> {
    List<Factura> findByClienteContainingIgnoreCase(String cliente);
}
