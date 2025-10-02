class CajeroApp {
    constructor() {
        this.apiUrl = '/proxy/api/cajero';
        this.init();
    }

    init() {
        console.log('Iniciando aplicación cajero');
        this.cargarTotalDisponible();
        this.setupEventListeners();
        setInterval(() => this.cargarTotalDisponible(), 30000);
    }

    setupEventListeners() {
        document.getElementById('btnRetirar').addEventListener('click', () => this.realizarRetiro());
        document.getElementById('btnCerrarResultado').addEventListener('click', () => this.limpiarResultado());
        document.getElementById('monto').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.realizarRetiro();
        });
    }

    async cargarTotalDisponible() {
    try {
        console.log('Cargando total disponible del cajero');
        
        const [estadoResponse, totalResponse] = await Promise.all([
            fetch(`${this.apiUrl}/estado`),
            fetch(`${this.apiUrl}/total`)
        ]);

        if (!estadoResponse.ok) throw new Error(`Error HTTP: ${estadoResponse.status}`);
        if (!totalResponse.ok) throw new Error(`Error HTTP: ${totalResponse.status}`);

        const estado = await estadoResponse.json();
        const total = await totalResponse.json();
        this.imprimirEstadoConsola(estado, total);
        this.actualizarTotalDisponible(total);
        
    } catch (error) {
        console.error('Error cargando total:', error);
        this.mostrarError('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
    }
}

imprimirEstadoConsola(estado, total) {
    console.log('Divisas Restantes');
    console.log('================================');
    console.log(`Total disponible: $${total.toFixed(2)}`);
    console.log('--------------------------------');
    
    estado.forEach(denom => {
        const subtotal = denom.denominacion * denom.cantidad;
        console.log(
            `${denom.tipo} de $${denom.denominacion}: ${denom.cantidad} unidades | Subtotal: $${subtotal.toFixed(2)}`
        );
    });
    
    console.log('================================');
}

    actualizarTotalDisponible(total) {
        // Solo actualizamos los elementos que aún existen
        document.getElementById('totalEfectivo').textContent = total.toFixed(2);
        document.getElementById('montoMaximo').textContent = `$${total.toFixed(2)}`;
    }

    async realizarRetiro() {
        const montoInput = document.getElementById('monto');
        const monto = parseFloat(montoInput.value);
        const btnRetirar = document.getElementById('btnRetirar');

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

        btnRetirar.disabled = true;
        btnRetirar.textContent = 'PROCESANDO';
        document.body.classList.add('loading');

        try {
            console.log(`Solicitando retiro: $${monto}`);
            
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
                setTimeout(() => this.cargarTotalDisponible(), 1000);
            }

        } catch (error) {
            console.error('Error en retiro:', error);
            this.mostrarError(error.message || 'Error al procesar la solicitud');
        } finally {
            btnRetirar.disabled = false;
            btnRetirar.textContent = 'RETIRAR EFECTIVO';
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
        titulo.textContent = resultado.exito ? '¡Retiro Exitoso!' : 'Error en el Retiro';
        mensaje.textContent = resultado.mensaje;

        if (resultado.exito && resultado.denominacionesEntregadas) {
            denominacionesLista.innerHTML = '';
            
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicación cajero inicializada');
    new CajeroApp();
});