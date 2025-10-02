const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;
const BACKEND_URL = 'http://localhost:8080';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.use('/proxy/api', async (req, res) => {
    try {
        const backendPath = req.originalUrl.replace('/proxy/api/cajero', '/api/cajero');
        const url = `${BACKEND_URL}${backendPath}`;
        
        console.log('Conectando con backend:', url);
        
        const fetchOptions = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Error de conexión:', error.message);
        res.status(500).json({ 
            exito: false,
            mensaje: 'No se puede conectar con el servidor backend',
            error: error.message
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('SERVICIO CAJERO AUTOMÁTICO');
    console.log('==============================');
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`Backend: ${BACKEND_URL}`);
    console.log('Servidor listo!');
    
    // Verificación automática
    console.log('\nVerificando conexión con backend...');
    fetch(`${BACKEND_URL}/api/cajero/estado`)
        .then(response => {
            if (response.ok) {
                console.log('Backend conectado correctamente');
            } else {
                console.log('Backend no responde correctamente');
            }
        })
        .catch(error => {
            console.log('No se puede conectar al backend:', error.message);
        });
});