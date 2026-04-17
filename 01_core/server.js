const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Almacén temporal de estado del dispositivo
let deviceStatus = {
    online: false,
    location: null,
    isRecording: false,
    lastAlert: null
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rutas Estáticas
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/reset.html', (req, res) => res.sendFile(path.join(__dirname, 'reset.html')));
app.get('/unlock.html', (req, res) => res.sendFile(path.join(__dirname, 'unlock.html')));
app.get('/perfil.html', (req, res) => res.sendFile(path.join(__dirname, 'perfil.html')));
app.get('/setup.html', (req, res) => res.sendFile(path.join(__dirname, 'setup.html')));

// API Endpoints
app.post('/api/reset', (req, res) => {
    res.json({ status: 'ok', redirect: '/?t=' + Date.now() });
});

app.post('/api/backup', (req, res) => {
    res.json({ status: 'ok', message: 'Backup guardado en servidor' });
});

// === LOGICA SOCKET.IO (TIEMPO REAL) ===
io.on('connection', (socket) => {
    console.log('🔗 Cliente conectado:', socket.id);

    // Identificar tipo de cliente (Móvil o Dashboard)
    socket.on('identify', (type) => {
        if(type === 'mobile') {
            deviceStatus.online = true;
            io.emit('device_status', deviceStatus);
        }
    });

    // Recibir GPS del móvil
    socket.on('gps_update', (data) => {
        deviceStatus.location = data;
        io.emit('new_location', data);
    });

    // Recibir Alerta de Intruso
    socket.on('intruder_alert', (data) => {
        deviceStatus.isRecording = true;
        deviceStatus.lastAlert = new Date().toISOString();
        io.emit('security_alert', { 
            msg: '¡ALERTA DE SEGURIDAD ACTIVADA!',
            time: deviceStatus.lastAlert,
            ...data
        });
    });

    // Transmisión de Video (Frames)
    socket.on('video_frame', (buffer) => {
        io.emit('video_stream', buffer);
    });

    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado');
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     🚀 GEO VPS SERVER INICIADO         ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  URL: http://localhost:${PORT}          ║`);
    console.log('║  Modo: Seguridad en Tiempo Real (Active)║');
    console.log('╚════════════════════════════════════════╝\n');
});
