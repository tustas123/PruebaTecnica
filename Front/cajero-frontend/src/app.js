class CajeroApp {
    constructor() {
        this.apiUrl = '/proxy/api/cajero'; // URL relativa al proxy
        this.init();
    }

    init() {
        console.log('🔄 Iniciando aplicación cajero...');
        this.cargarEstadoCajero();
        this.setupEventListeners();
        
        // Actualizar cada 30 segundos
        setInterval(() => this.cargarEstadoCajero(), 30000);
    }

    setupEventListeners() {
        document.getElementById('btnRetirar').addEventListener('click', () => this.realizarRetiro());
        document.getElementById('btnCerrarResultado').addEventListener('click', () => this.limpiarResultado());
        
        document.getElementById('monto').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.realizarRetiro();
        });
    }

    async cargarEstadoCajero() {
        try {
            console.log('📊 Cargando estado del cajero...');
            
            const [estadoResponse, totalResponse] = await Promise.all([
                fetch(`${this.apiUrl}/estado`),
                fetch(`${this.apiUrl}/total`)
            ]);

            if (!estadoResponse.ok) throw new Error(`Error HTTP: ${estadoResponse.status}`);
            if (!totalResponse.ok) throw new Error(`Error HTTP: ${totalResponse.status}`);

            const estado = await estadoResponse.json();
            const total = await totalResponse.json();

            console.log('✅ Datos cargados:', estado.length, 'denominaciones');
            this.actualizarInterfaz(estado, total);
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            this.mostrarError('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
        }
    }

    actualizarInterfaz(estado, total) {
        // Actualizar totales
        document.getElementById('totalEfectivo').textContent = total.toFixed(2);
        document.getElementById('totalDisplay').textContent = total.toFixed(2);
        document.getElementById('totalFooter').textContent = total.toFixed(2);
        document.getElementById('montoMaximo').textContent = `$${total.toFixed(2)}`;

        // Actualizar tabla
        const tablaBody = document.getElementById('tablaEstado');
        tablaBody.innerHTML = '';

        estado.forEach(denom => {
            const subtotal = denom.denominacion * denom.cantidad;
            const fila = document.createElement('tr');
            
            if (denom.cantidad < 10) fila.className = 'table-warning';

            fila.innerHTML = `
                <td>
                    <span class="badge ${denom.tipo === 'Billete' ? 'bg-primary' : 'bg-secondary'}">
                        ${denom.tipo}
                    </span>
                </td>
                <td class="fw-bold">$${denom.denominacion}</td>
                <td>
                    <span class="badge ${
                        denom.cantidad >= 10 ? 'bg-success' : 
                        denom.cantidad > 0 ? 'bg-warning' : 'bg-danger'
                    }">
                        ${denom.cantidad}
                    </span>
                </td>
                <td class="fw-bold text-success">$${subtotal.toFixed(2)}</td>
            `;
            tablaBody.appendChild(fila);
        });
    }

    async realizarRetiro() {
        const montoInput = document.getElementById('monto');
        const monto = parseFloat(montoInput.value);
        const btnRetirar = document.getElementById('btnRetirar');

        // Validaciones
        if (!monto || monto <= 0) {
            this.mostrarError('El monto debe ser mayor a cero');
            return;
        }

        if (monto < 0.5) {
            this.mostrarError('El monto mínimo es $0.50');
            return;
        }

        const totalEfectivo = parseFloat(document.getElementById('totalEfectivo').textContent);
        if (monto > totalEfectivo) {
            this.mostrarError('Fondos insuficientes en el cajero');
            return;
        }

        // Loading state
        btnRetirar.disabled = true;
        btnRetirar.textContent = '🔄 PROCESANDO...';
        document.body.classList.add('loading');

        try {
            console.log(`💸 Solicitando retiro: $${monto}`);
            
            const response = await fetch(`${this.apiUrl}/retirar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ monto: monto })
            });

            const resultado = await response.json();
            
            if (!response.ok) {
                throw new Error(resultado.mensaje || `Error: ${response.status}`);
            }

            this.mostrarResultado(resultado);

            if (resultado.exito) {
                montoInput.value = '';
                // Recargar estado después de un retiro exitoso
                setTimeout(() => this.cargarEstadoCajero(), 1000);
            }

        } catch (error) {
            console.error('❌ Error en retiro:', error);
            this.mostrarError(error.message || 'Error al procesar la solicitud');
        } finally {
            btnRetirar.disabled = false;
            btnRetirar.textContent = '💸 RETIRAR EFECTIVO';
            document.body.classList.remove('loading');
        }
    }

    mostrarResultado(resultado) {
        const resultadoDiv = document.getElementById('resultado');
        const titulo = document.getElementById('resultadoTitulo');
        const mensaje = document.getElementById('resultadoMensaje');
        const denominacionesContainer = document.getElementById('denominacionesContainer');
        const denominacionesLista = document.getElementById('denominacionesLista');
        const montoRetirado = document.getElementById('montoRetirado');

        resultadoDiv.className = `alert ${resultado.exito ? 'alert-success' : 'alert-danger'} fade-in`;
        titulo.textContent = resultado.exito ? '✅ ¡Retiro Exitoso!' : '❌ Error en el Retiro';
        mensaje.textContent = resultado.mensaje;

        if (resultado.exito && resultado.denominacionesEntregadas) {
            denominacionesLista.innerHTML = '';
            
            // Ordenar denominaciones de mayor a menor
            const denominaciones = Object.entries(resultado.denominacionesEntregadas)
                .map(([denom, cant]) => ({ denominacion: parseFloat(denom), cantidad: cant }))
                .sort((a, b) => b.denominacion - a.denominacion);
            
            denominaciones.forEach(denom => {
                const col = document.createElement('div');
                col.className = 'col-6 col-sm-4 mb-2';
                col.innerHTML = `
                    <div class="denominacion-card">
                        <div class="fw-bold text-primary fs-5">${denom.cantidad}x</div>
                        <div class="text-success fw-bold">$${denom.denominacion}</div>
                    </div>
                `;
                denominacionesLista.appendChild(col);
            });

            denominacionesContainer.classList.remove('d-none');
            montoRetirado.textContent = resultado.montoRetirado.toFixed(2);
        } else {
            denominacionesContainer.classList.add('d-none');
        }

        resultadoDiv.classList.remove('d-none');
    }

    mostrarError(mensaje) {
        this.mostrarResultado({
            exito: false,
            mensaje: mensaje,
            denominacionesEntregadas: null,
            montoRetirado: 0
        });
    }

    limpiarResultado() {
        document.getElementById('resultado').classList.add('d-none');
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Aplicación cajero inicializada');
    new CajeroApp();
});