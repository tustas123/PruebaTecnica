package com.Alan.Cajero.Service;


import com.Alan.Cajero.Entities.Denominacion;
import com.Alan.Cajero.Repository.DenominacionRepository;
import jakarta.transaction.Transactional;
import com.Alan.Cajero.Dto.RetiroResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class CajeroService {
    
    @Autowired
    private DenominacionRepository denominacionRepository;
    
    @Transactional
    public RetiroResponse procesarRetiro(Double monto) {
        try {
        	
        	//monto minimo de retiro
            if (monto <= 0) {
                return new RetiroResponse(false, "El monto debe ser mayor a cero");
            }
            
            //monto maximo de retiro
            Double totalEfectivo = denominacionRepository.getTotalEfectivo();
            if (monto > totalEfectivo) {
                return new RetiroResponse(false, "Fondos insuficientes en el cajero");
            }
          
            
            //ordenar los billetes menor a mayor
            List<Denominacion> denominaciones = denominacionRepository.findAllByOrderByDenominacionDesc();
            Map<Double, Integer> denominacionesEntregadas = new LinkedHashMap<>();
            Double montoRestante = monto;
            
            // billetes de cada tipo a entregar
            for (Denominacion denom : denominaciones) {
                if (montoRestante <= 0) break;
                
                if (denom.getCantidad() > 0 && denom.getDenominacion() <= montoRestante) {
                	
                	//cuántos billetes de esta denominación se necesitan
                    int cantidadNecesaria = (int) (montoRestante / denom.getDenominacion());
                    
                    //toma el mínimo entre lo necesario y lo disponible
                    int cantidadEntregar = Math.min(cantidadNecesaria, denom.getCantidad());
                    
                    if (cantidadEntregar > 0) {
                        denominacionesEntregadas.put(denom.getDenominacion(), cantidadEntregar);
                        montoRestante -= cantidadEntregar * denom.getDenominacion();
                        montoRestante = Math.round(montoRestante * 100.0) / 100.0;
                    }
                }
            }
            
            // Validar si hay billetes suficientes para completar la cantidad del retiro
            if (montoRestante > 0) {
                return new RetiroResponse(false, "No se puede entregar el monto exacto con las denominaciones disponibles");
            }
            
            // Actualizar el inventario
            for (Map.Entry<Double, Integer> entry : denominacionesEntregadas.entrySet()) {
                Double denominacion = entry.getKey();
                Integer cantidadUsada = entry.getValue();
                
                Denominacion denom = denominaciones.stream()
                    .filter(d -> d.getDenominacion().equals(denominacion))
                    .findFirst()
                    .orElse(null);
                
                if (denom != null) {
                    denom.setCantidad(denom.getCantidad() - cantidadUsada);
                    denominacionRepository.save(denom);
                }
            }
            
            // Log del retiro
            System.out.println("=== RETIRO EXITOSO ===");
            System.out.println("Monto: $" + monto);
            System.out.println("Denominaciones entregadas:");
            denominacionesEntregadas.forEach((denom, cant) -> 
                System.out.println(" - " + cant + " x $" + denom));
            System.out.println("=====================");
            
            RetiroResponse response = new RetiroResponse(true, "Retiro exitoso");
            response.setDenominacionesEntregadas(denominacionesEntregadas);
            response.setMontoRetirado(monto);
            
            return response;
            
        } catch (Exception e) {
            return new RetiroResponse(false, "Error al procesar el retiro: " + e.getMessage());
        }

    }
    
    public List<Denominacion> obtenerEstadoCajero() {
        return denominacionRepository.findAllByOrderByDenominacionDesc();
    }
    
    public Double obtenerTotalEfectivo() {
        return denominacionRepository.getTotalEfectivo();
    }
}