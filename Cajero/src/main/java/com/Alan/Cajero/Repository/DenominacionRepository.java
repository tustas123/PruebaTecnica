package com.Alan.Cajero.Repository;


import com.Alan.Cajero.Entities.Denominacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DenominacionRepository extends JpaRepository<Denominacion, Long> {
    
    List<Denominacion> findAllByOrderByDenominacionDesc();
    
    @Query("SELECT SUM(d.denominacion * d.cantidad) FROM Denominacion d")
    Double getTotalEfectivo();
}
