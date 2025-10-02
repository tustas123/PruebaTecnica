package com.Alan.Cajero.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import com.Alan.Cajero.Dto.RetiroRequest;
import com.Alan.Cajero.Dto.RetiroResponse;
import com.Alan.Cajero.Entities.Denominacion;
import com.Alan.Cajero.Service.CajeroService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/cajero")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.1.72:3000"})
public class CajeroController {
    
    @Autowired
    private CajeroService cajeroService;
    
    @PostMapping("/retirar")
    public RetiroResponse retirar(@RequestBody RetiroRequest request) {
        return cajeroService.procesarRetiro(request.getMonto());
    }
    
    @GetMapping("/estado")
    public List<Denominacion> obtenerEstado() {
        return cajeroService.obtenerEstadoCajero();
    }
    
    @GetMapping("/total")
    public Double obtenerTotal() {
        return cajeroService.obtenerTotalEfectivo();
    }
}
