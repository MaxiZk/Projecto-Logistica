package com.empresa.sigl.repository;

import com.empresa.sigl.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {}

