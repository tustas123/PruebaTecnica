package com.Alan.Cajero.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

@Entity
@Table(name = "DENOMINACIONES")
public class Denominacion {
	 @Id
	 @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "DENOMINACIONES_SEQ")
	 @SequenceGenerator(name = "DENOMINACIONES_SEQ", sequenceName = "DENOMINACIONES_SEQ", allocationSize = 1)
	 private Long id;
	    
	 @Column(name = "TIPO", length = 10, nullable = false)
	 private String tipo;
	    
	 @Column(name = "CANTIDAD", nullable = false)
	 private Integer cantidad;
	    
	 @Column(name = "DENOMINACION", nullable = false)
	 private Double denominacion;

	 
	 
	 public Denominacion() {}
	    
	 public Denominacion(String tipo, Integer cantidad, Double denominacion) {
		 this.tipo = tipo;
	     this.cantidad = cantidad;
	     this.denominacion = denominacion;
	     }
	    
	 
	 
	 public Long getId() { return id; }
	 public void setId(Long id) { this.id = id; }
	    
	 public String getTipo() { return tipo; }
	 public void setTipo(String tipo) { this.tipo = tipo; }
	    
	 public Integer getCantidad() { return cantidad; }
	 public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
	    
	 public Double getDenominacion() { return denominacion; }
	 public void setDenominacion(Double denominacion) { this.denominacion = denominacion; }

}