package com.empresa.sigl.repository;

import com.empresa.sigl.model.Carga;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CargaRepository extends JpaRepository<Carga, String> { }

