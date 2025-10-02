package com.Alan.Cajero.Dto;

import java.util.Map;

public class RetiroResponse {
	
    private boolean exito;
    private String mensaje;
    private Map<Double, Integer> denominacionesEntregadas;
    private Double montoRetirado;
    
    
    public RetiroResponse() {}
    
    public RetiroResponse(boolean exito, String mensaje) {
        this.exito = exito;
        this.mensaje = mensaje;
    }
    

    public boolean isExito() { return exito; }
    public void setExito(boolean exito) { this.exito = exito; }
    
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    
    public Map<Double, Integer> getDenominacionesEntregadas() { return denominacionesEntregadas; }
    public void setDenominacionesEntregadas(Map<Double, Integer> denominacionesEntregadas) { 
        this.denominacionesEntregadas = denominacionesEntregadas; 
    }
    
    public Double getMontoRetirado() { return montoRetirado; }
    public void setMontoRetirado(Double montoRetirado) { this.montoRetirado = montoRetirado; }
}