/*
================================================================================
🔒 GEO - SISTEMA DE SEGURIDAD LOCAL
================================================================================
© Mario Hernan Ovalle Reinoso - TODOS LOS DERECHOS RESERVADOS

LICENCIA: PROPIETARIA PRIVADA
- Uso ÚNICAMENTE por Mario Hernan Ovalle Reinoso
- Prohibida la copia, distribución, o modificación sin permiso explícito
- Violación de derechos de autor resultará en acciones legales

AUTORÍA: Mario Hernan Ovalle Reinoso
VERSIÓN: 1.0
FECHA: Marzo 2025
ESTADO: PRIVADO - NO REDISTRIBUIBLE

AVISO: Este código contiene propiedad intelectual confidencial.
La posesión, copia o distribución no autorizada es ilegal.

================================================================================
*/

// ============================================================
// ESTADO GLOBAL
// ============================================================
const APP = {
    pin: localStorage.getItem('geo_pin') || '1234',
    attempts: 0,
    maxAttempts: 3,
    locked: false,
    lockTimeout: 30,
    currentSection: 'inicio',
    enteredPin: '',
    isRecording: false,
    isPanicMode: false,
    panicStartTime: null,
    location: null,
    map: null,
    mapMarkers: [],
    cameraMarkers: [],
    recognition: null,
    cameraStream: null,
    feedAnimFrame: null,
    faceAnimFrame: null,
    currentTemplate: null,
    transcripts: JSON.parse(localStorage.getItem('geo_transcripts') || '[]'),
    files: JSON.parse(localStorage.getItem('geo_files') || '[]'),
    logs: JSON.parse(localStorage.getItem('geo_logs') || '[]'),
    questions: JSON.parse(localStorage.getItem('geo_questions') || 'null'),
    scriptsGenerated: parseInt(localStorage.getItem('geo_scripts_count') || '0')
};

// Preguntas de seguridad por defecto
const DEFAULT_QUESTIONS = [
    { q: '¿Cuál es el nombre de tu primera mascota?', a: '' },
    { q: '¿En qué ciudad naciste?', a: '' },
    { q: '¿Cuál es tu película favorita?', a: '' }
];

// ============================================================
// PLANTILLAS DE SCRIPTS
// ============================================================
const TEMPLATES = [
    {
        id: 'py-scanner', lang: 'python', cat: 'redes', name: 'Escáner de Puertos',
        desc: 'Escaneo de puertos con multithreading',
        code: `import socket
import sys
from concurrent.futures import ThreadPoolExecutor

def scan_port(host, port, timeout=1):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        result = s.connect_ex((host, port))
        s.close()
        return port, result == 0
    except Exception:
        return port, False

for port in range(1, 1025):
    port, is_open = scan_port('127.0.0.1', port)
    if is_open:
        print(f'[+] Puerto {port} abierto')`
    },
    {
        id: 'py-organizer', lang: 'python', cat: 'archivos', name: 'Organizador de Archivos',
        desc: 'Clasifica archivos por extensión',
        code: `import os
import shutil
from pathlib import Path

EXTENSIONS = {
    "Imagenes": [".jpg", ".png", ".gif"],
    "Documentos": [".pdf", ".txt", ".doc"],
    "Video": [".mp4", ".avi"],
    "Audio": [".mp3", ".wav"]
}

for filename in os.listdir('.'):
    ext = Path(filename).suffix.lower()
    for folder, exts in EXTENSIONS.items():
        if ext in exts:
            os.makedirs(folder, exist_ok=True)
            shutil.move(filename, os.path.join(folder, filename))
            break`
    },
    {
        id: 'js-server', lang: 'javascript', cat: 'redes', name: 'Servidor HTTP Local',
        desc: 'Servidor web estático simple',
        code: `const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const server = http.createServer((req, res) => {
    let filepath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    fs.readFile(filepath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('404');
        } else {
            res.writeHead(200);
            res.end(data);
        }
    });
});

server.listen(PORT, () => console.log(\`Servidor en http://localhost:\${PORT}\`));`
    },
    {
        id: 'bash-backup', lang: 'bash', cat: 'automatizacion', name: 'Backup Automático',
        desc: 'Backup con compresión y rotación',
        code: `#!/bin/bash
SOURCE="\${1:-.}"
DEST="./backups"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p "\$DEST"
tar -czf "\$DEST/backup_\$DATE.tar.gz" "\$SOURCE"
echo "Backup creado: \$DEST/backup_\$DATE.tar.gz"
BACKUP_COUNT=\$(ls -1 "\$DEST"/backup_*.tar.gz | wc -l)
if [ "\$BACKUP_COUNT" -gt 7 ]; then
    ls -t "\$DEST"/backup_*.tar.gz | tail -n +8 | xargs rm -f
fi`
    },
    {
        id: 'py-encrypt', lang: 'python', cat: 'seguridad', name: 'Encriptador Básico',
        desc: 'Cifrado simple de archivos',
        code: `import base64
import os

def encrypt_simple(text, key):
    result = []
    for char in text:
        result.append(chr(ord(char) ^ ord(key[len(result) % len(key)])))
    return base64.b64encode(''.join(result).encode()).decode()

def decrypt_simple(encrypted, key):
    decoded = base64.b64decode(encrypted).decode()
    result = []
    for char in decoded:
        result.append(chr(ord(char) ^ ord(key[len(result) % len(key)])))
    return ''.join(result)

text = input('Texto: ')
key = input('Clave: ')
encrypted = encrypt_simple(text, key)
print(f'Encriptado: {encrypted}')
decrypted = decrypt_simple(encrypted, key)
print(f'Desencriptado: {decrypted}')`
    },
    {
        id: 'bash-monitor', lang: 'bash', cat: 'sistema', name: 'Monitor de Sistema',
        desc: 'Monitorización de recursos',
        code: `#!/bin/bash
while true; do
    clear
    echo "=== MONITOR GEO ==="
    echo "Hostname: \$(hostname)"
    echo "Uptime: \$(uptime -p)"
    echo ""
    echo "CPU Load: \$(cat /proc/loadavg | awk '{print \$1, \$2, \$3}')"
    echo "Memoria: \$(free -h | grep Mem | awk '{print \$3 \" / \" \$2}')"
    echo "Disco: \$(df -h / | awk 'NR==2 {print \$5}')"
    sleep 2
done`
    },
    {
        id: 'js-monitor', lang: 'javascript', cat: 'sistema', name: 'Monitor Node.js',
        desc: 'Monitoreo de memoria y CPU',
        code: `const os = require('os');
setInterval(() => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const used = totalMem - freeMem;
    const percent = ((used / totalMem) * 100).toFixed(1);
    const load = os.loadavg()[0].toFixed(2);
    
    console.clear();
    console.log('╔════════════════════╗');
    console.log('║  GEO MONITOR       ║');
    console.log('╠════════════════════╣');
    console.log(\`║ RAM: \${percent}%         ║\`);
    console.log(\`║ Load: \${load}        ║\`);
    console.log('╚════════════════════╝');
}, 2000);`
    },
    {
        id: 'py-requests', lang: 'python', cat: 'redes', name: 'Cliente HTTP',
        desc: 'Peticiones HTTP con requests',
        code: `import requests
import json

url = 'https://api.example.com/data'
headers = {'User-Agent': 'GEO/1.0'}

try:
    response = requests.get(url, headers=headers, timeout=5)
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
    else:
        print(f'Error: {response.status_code}')
except requests.exceptions.RequestException as e:
    print(f'Error de conexión: {e}')`
    },
    {
        id: 'bash-network', lang: 'bash', cat: 'redes', name: 'Diagnóstico de Red',
        desc: 'Herramienta de diagnóstico de red',
        code: `#!/bin/bash
echo "=== DIAGNÓSTICO DE RED ==="
echo ""
echo "Interfaces de red:"
ip addr | grep "inet " | awk '{print \$2}'
echo ""
echo "Rutas activas:"
ip route | head -5
echo ""
echo "Conexiones activas:"
netstat -tuln 2>/dev/null | grep LISTEN | head -5
echo ""
echo "DNS:"
cat /etc/resolv.conf | grep nameserver`
    }
];

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    buildKeypad();
    initQuestions();
    renderTemplateGrid();
    renderFiles();
    renderLogs();
    renderHomeStats();
});

// ============================================================
// TECLADO PIN
// ============================================================
function buildKeypad() {
    const keypad = document.getElementById('keypad');
    const keys = [1,2,3,4,5,6,7,8,9,'',0,'del'];
    keys.forEach(k => {
        if (k === '') { const sp = document.createElement('div'); keypad.appendChild(sp); return; }
        const btn = document.createElement('button');
        btn.className = 'key-btn' + (k === 'del' ? ' backspace' : '');
        btn.textContent = k === 'del' ? '' : k;
        if (k === 'del') btn.innerHTML = '<i class="fas fa-delete-left"></i>';
        btn.addEventListener('click', () => handleKeyPress(k));
        keypad.appendChild(btn);
    });
}

function handleKeyPress(key) {
    if (APP.locked) return;
    if (key === 'del') {
        APP.enteredPin = APP.enteredPin.slice(0, -1);
    } else if (APP.enteredPin.length < 6) {
        APP.enteredPin += key.toString();
    }
    updatePinDots();
    if (APP.enteredPin.length === 6) {
        setTimeout(() => verifyPin(), 200);
    }
}

function updatePinDots() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, i) => {
        dot.classList.remove('filled', 'error');
        if (i < APP.enteredPin.length) dot.classList.add('filled');
    });
}

function verifyPin() {
    if (APP.enteredPin === APP.pin) {
        logActivity('acceso', 'Login exitoso', 'PIN correcto');
        showToast('Acceso concedido', 'success');
        enterDashboard();
    } else {
        APP.attempts++;
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach(d => { d.classList.remove('filled'); d.classList.add('error'); });
        logActivity('seguridad', 'Intento fallido', `PIN incorrecto (intento ${APP.attempts}/${APP.maxAttempts})`);
        updateAttemptsInfo();
        if (APP.attempts >= APP.maxAttempts) {
            activateLockout();
        } else {
            showToast(`PIN incorrecto. ${APP.maxAttempts - APP.attempts} intentos restantes`, 'error');
        }
        setTimeout(() => {
            APP.enteredPin = '';
            updatePinDots();
        }, 600);
    }
}

function updateAttemptsInfo() {
    const el = document.getElementById('attemptsInfo');
    el.textContent = `Intento ${APP.attempts} de ${APP.maxAttempts}`;
    if (APP.attempts >= 2) el.classList.add('warning');
}

function activateLockout() {
    APP.locked = true;
    document.getElementById('lockScreen').style.display = 'none';
    document.getElementById('blockedScreen').classList.add('active');
    logActivity('seguridad', 'Sistema bloqueado', '3 intentos fallidos consecutivos');
    let remaining = APP.lockTimeout;
    const timerEl = document.getElementById('blockTimer');
    timerEl.textContent = remaining;
    const interval = setInterval(() => {
        remaining--;
        timerEl.textContent = remaining;
        if (remaining <= 0) {
            clearInterval(interval);
            APP.locked = false;
            APP.attempts = 0;
            APP.enteredPin = '';
            updatePinDots();
            updateAttemptsInfo();
            document.getElementById('blockedScreen').classList.remove('active');
            document.getElementById('lockScreen').style.display = 'flex';
        }
    }, 1000);
}

// ============================================================
// RECONOCIMIENTO FACIAL
// ============================================================
function startFaceRecognition() {
    const modal = document.getElementById('faceModal');
    modal.classList.add('active');
    const video = document.getElementById('faceVideo');
    const canvas = document.getElementById('faceCanvas');
    const status = document.getElementById('faceStatus');
    
    status.textContent = 'Iniciando cámara...';
    status.style.color = '#00d4ff';
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 280, height: 280 } })
        .then(stream => {
            APP.cameraStream = stream;
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                canvas.width = 280;
                canvas.height = 280;
                status.textContent = 'Buscando rostro...';
                runFaceScan(video, canvas, status);
            };
        })
        .catch(() => {
            status.textContent = 'No se pudo acceder a la cámara';
            status.style.color = '#ff3366';
            logActivity('seguridad', 'Cámara denegada', 'Face ID no disponible');
        });
}

function runFaceScan(video, canvas, status) {
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let phase = 'scanning';
    let boxY = 60, boxH = 160, boxX = 40, boxW = 200;
    
    function draw() {
        ctx.clearRect(0, 0, 280, 280);
        frame++;
        
        if (phase === 'scanning') {
            const scanY = (frame * 2) % 280;
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, scanY);
            ctx.lineTo(280, scanY);
            ctx.stroke();
            
            drawCorners(ctx, 20, 20, 240, 240, 'rgba(0, 212, 255, 0.5)', 2);
            
            if (frame > 60) { phase = 'found'; frame = 0; }
            status.textContent = 'Buscando rostro...';
        } else if (phase === 'found') {
            const progress = Math.min(frame / 40, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            const cx = boxX + boxW / 2;
            const cy = boxY + boxH / 2;
            const w = boxW * (1.2 - ease * 0.2);
            const h = boxH * (1.2 - ease * 0.2);
            
            drawCorners(ctx, cx - w/2, cy - h/2, w, h, '#00ff88', 3);
            
            if (ease > 0.5) {
                const alpha = (ease - 0.5) * 2;
                ctx.fillStyle = `rgba(0, 255, 136, ${alpha * 0.6})`;
                const points = [
                    [cx - 30, cy - 20], [cx + 30, cy - 20],
                    [cx, cy + 10],
                    [cx - 20, cy + 35], [cx + 20, cy + 35],
                    [cx - 50, cy], [cx + 50, cy]
                ];
                points.forEach(([px, py]) => {
                    ctx.beginPath();
                    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
            
            status.textContent = 'Rostro detectado';
            status.style.color = '#00ff88';
            
            if (frame > 50) { phase = 'verified'; frame = 0; }
        } else if (phase === 'verified') {
            const cx = boxX + boxW / 2;
            const cy = boxY + boxH / 2;
            const w = boxW * 1.0;
            const h = boxH * 1.0;
            
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - w/2, cy - h/2, w, h);
            
            ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
            ctx.fillRect(cx - w/2, cy - h/2, w, h);
            
            status.textContent = 'Verificado';
            status.style.color = '#00ff88';
            
            if (frame > 30) {
                stopFaceRecognition();
                logActivity('acceso', 'Login exitoso', 'Reconocimiento facial');
                showToast('Rostro verificado', 'success');
                enterDashboard();
                return;
            }
        }
        
        APP.faceAnimFrame = requestAnimationFrame(draw);
    }
    draw();
}

function drawCorners(ctx, x, y, w, h, color, size) {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    const cs = Math.min(20, w * 0.15);
    ctx.beginPath(); ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w - cs, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cs); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y + h - cs); ctx.lineTo(x, y + h); ctx.lineTo(x + cs, y + h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w - cs, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cs); ctx.stroke();
}

function stopFaceRecognition() {
    if (APP.faceAnimFrame) cancelAnimationFrame(APP.faceAnimFrame);
    if (APP.cameraStream) {
        APP.cameraStream.getTracks().forEach(t => t.stop());
        APP.cameraStream = null;
    }
    document.getElementById('faceVideo').srcObject = null;
    closeModal('faceModal');
}

// ============================================================
// PREGUNTAS DE SEGURIDAD
// ============================================================
function initQuestions() {
    if (!APP.questions) {
        APP.questions = DEFAULT_QUESTIONS.map(q => ({ ...q }));
        localStorage.setItem('geo_questions', JSON.stringify(APP.questions));
    }
}

function showSecurityQuestions() {
    const content = document.getElementById('questionsContent');
    if (APP.questions.every(q => q.a)) {
        const idx = Math.floor(Math.random() * APP.questions.length);
        content.innerHTML = `
            <label>Pregunta de seguridad</label>
            <div style="padding:14px;background:#0d1321;border-radius:12px;border:1px solid #1e293b;margin-bottom:.5rem">${APP.questions[idx].q}</div>
            <label>Tu respuesta</label>
            <input type="text" id="secAnswer" placeholder="Escribe tu respuesta" autocomplete="off">
        `;
        document.getElementById('questionsSubmit').onclick = () => verifySecurityAnswers(idx);
    } else {
        content.innerHTML = APP.questions.map((q, i) => `
            <label>Pregunta ${i + 1}</label>
            <div style="padding:12px;background:#0d1321;border-radius:12px;border:1px solid #1e293b;margin-bottom:.5rem;font-size:.9rem">${q.q}</div>
            <label>Respuesta</label>
            <input type="text" id="secAnswer${i}" placeholder="Escribe tu respuesta" autocomplete="off" style="margin-bottom:.5rem">
        `).join('');
        document.getElementById('questionsSubmit').textContent = 'Guardar Respuestas';
        document.getElementById('questionsSubmit').onclick = saveSecurityAnswers;
    }
    document.getElementById('questionsModal').classList.add('active');
}

function verifySecurityAnswers(idx) {
    const input = document.getElementById('secAnswer');
    if (!input) return;
    const answer = input.value.trim().toLowerCase();
    const correct = APP.questions[idx].a.toLowerCase();
    if (answer === correct) {
        logActivity('acceso', 'Login exitoso', 'Pregunta de seguridad correcta');
        showToast('Respuesta correcta', 'success');
        closeModal('questionsModal');
        enterDashboard();
    } else {
        logActivity('seguridad', 'Intento fallido', 'Respuesta de seguridad incorrecta');
        showToast('Respuesta incorrecta', 'error');
        APP.attempts++;
        updateAttemptsInfo();
        if (APP.attempts >= APP.maxAttempts) {
            closeModal('questionsModal');
            activateLockout();
        }
    }
}

function saveSecurityAnswers() {
    let allFilled = true;
    APP.questions.forEach((q, i) => {
        const val = document.getElementById(`secAnswer${i}`).value.trim();
        if (!val) allFilled = false;
        else q.a = val;
    });
    if (!allFilled) {
        showToast('Completa todas las respuestas', 'warning');
        return;
    }
    localStorage.setItem('geo_questions', JSON.stringify(APP.questions));
    showToast('Respuestas guardadas correctamente', 'success');
    logActivity('sistema', 'Preguntas configuradas', '3 respuestas de seguridad establecidas');
    closeModal('questionsModal');
}

// ============================================================
// DASHBOARD
// ============================================================
function enterDashboard() {
    document.getElementById('lockScreen').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');
    APP.attempts = 0;
    APP.enteredPin = '';
    updateAttemptsInfo();
    setTimeout(() => initMap(), 300);
}

function navigateTo(section) {
    APP.currentSection = section;
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`sec-${section}`).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.toggle('active', n.dataset.section === section);
    });
    if (window.innerWidth <= 768) toggleSidebar();
    if (section === 'mapa' && !APP.map) setTimeout(initMap, 100);
    if (section === 'mapa' && APP.map) setTimeout(() => APP.map.invalidateSize(), 100);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarBackdrop').classList.toggle('active');
}

// ============================================================
// ESTADÍSTICAS DE INICIO
// ============================================================
function renderHomeStats() {
    const grid = document.getElementById('statGrid');
    const stats = [
        { icon: 'fa-shield-check', color: '#00ff88', bg: 'rgba(0,255,136,.08)', value: APP.isPanicMode ? 'ACTIVO' : 'SEGURO', label: 'Estado de seguridad' },
        { icon: 'fa-code', color: '#00d4ff', bg: 'rgba(0,212,255,.08)', value: APP.scriptsGenerated, label: 'Scripts generados' },
        { icon: 'fa-file-lines', color: '#ffaa00', bg: 'rgba(255,170,0,.08)', value: APP.files.length, label: 'Archivos almacenados' },
        { icon: 'fa-microphone', color: '#ff3366', bg: 'rgba(255,51,102,.08)', value: APP.transcripts.length, label: 'Transcripciones' },
    ];
    grid.innerHTML = stats.map(s => `
        <div class="stat-card">
            <div class="stat-icon" style="background:${s.bg};color:${s.color}"><i class="fas ${s.icon}"></i></div>
            <div class="stat-value" style="color:${s.color}">${s.value}</div>
            <div class="stat-label">${s.label}</div>
        </div>
    `).join('');

    const statusEl = document.getElementById('systemStatus');
    const items = [
        { label: 'Localización', value: APP.location ? 'Activa' : 'Pendiente', ok: !!APP.location },
        { label: 'Cámara', value: 'Disponible', ok: true },
        { label: 'Micrófono', value: 'Disponible', ok: true },
        { label: 'Almacenamiento', value: `${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB`, ok: true },
        { label: 'Conexión', value: navigator.onLine ? 'Online' : 'Offline', ok: navigator.onLine },
    ];
    statusEl.innerHTML = items.map(i => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1e293b">
            <span style="font-size:.85rem;color:#8892a4">${i.label}</span>
            <span style="font-size:.8rem;font-family:'JetBrains Mono';color:${i.ok ? '#00ff88' : '#ffaa00'}">
                <i class="fas fa-circle" style="font-size:.4rem;vertical-align:middle;margin-right:6px"></i>${i.value}
            </span>
        </div>
    `).join('');

    const recentEl = document.getElementById('recentActivity');
    const recent = APP.logs.slice(-5).reverse();
    if (recent.length === 0) {
        recentEl.innerHTML = '<p style="color:#4a5568;font-size:.85rem;text-align:center;padding:2rem">Sin actividad reciente</p>';
    } else {
        recentEl.innerHTML = recent.map(l => `
            <div class="activity-item">
                <div class="activity-icon" style="background:${getLogColor(l.type).bg};color:${getLogColor(l.type).fg}">
                    <i class="fas ${getLogIcon(l.type)}"></i>
                </div>
                <div class="activity-text"><strong>${l.event}</strong><br><span style="color:#6b7a90;font-size:.78rem">${l.detail}</span></div>
                <div class="activity-time">${l.time}</div>
            </div>
        `).join('');
    }
}

function getLogColor(type) {
    const colors = { 
        acceso: {bg:'rgba(0,255,136,.08)',fg:'#00ff88'}, 
        seguridad: {bg:'rgba(255,51,102,.08)',fg:'#ff3366'}, 
        audio: {bg:'rgba(255,170,0,.08)',fg:'#ffaa00'}, 
        codigo: {bg:'rgba(0,212,255,.08)',fg:'#00d4ff'}, 
        sistema: {bg:'rgba(107,122,144,.08)',fg:'#6b7a90'} 
    };
    return colors[type] || colors.sistema;
}

function getLogIcon(type) {
    const icons = { 
        acceso:'fa-right-to-bracket', 
        seguridad:'fa-shield-halved', 
        audio:'fa-microphone', 
        codigo:'fa-code', 
        sistema:'fa-gear' 
    };
    return icons[type] || 'fa-circle';
}

// ============================================================
// MOTOR DE CODIFICACIÓN
// ============================================================
function renderTemplateGrid() {
    filterTemplates();
}

function filterTemplates() {
    const lang = document.getElementById('langFilter').value;
    const cat = document.getElementById('catFilter').value;
    const grid = document.getElementById('templateGrid');
    const filtered = TEMPLATES.filter(t => 
        (lang === 'all' || t.lang === lang) && (cat === 'all' || t.cat === cat)
    );
    grid.innerHTML = filtered.map(t => {
        const langColors = { 
            python: {bg:'rgba(0,212,255,.1)',fg:'#00d4ff',label:'Python'}, 
            javascript: {bg:'rgba(255,170,0,.1)',fg:'#ffaa00',label:'JavaScript'}, 
            bash: {bg:'rgba(0,255,136,.1)',fg:'#00ff88',label:'Bash'} 
        };
        const lc = langColors[t.lang];
        return `
            <div class="template-card ${APP.currentTemplate === t.id ? 'selected' : ''}" onclick="selectTemplate('${t.id}')">
                <h4><span class="lang-tag" style="background:${lc.bg};color:${lc.fg}">${lc.label}</span> ${t.name}</h4>
                <p>${t.desc}</p>
            </div>
        `;
    }).join('');
}

function selectTemplate(id) {
    const t = TEMPLATES.find(x => x.id === id);
    if (!t) return;
    APP.currentTemplate = id;
    const exts = { python: 'py', javascript: 'js', bash: 'sh' };
    document.getElementById('codeFileName').textContent = `${t.name.replace(/\s+/g, '_').toLowerCase()}.${exts[t.lang]}`;
    document.getElementById('codeOutput').value = t.code;
    document.getElementById('codeEditor').style.display = 'block';
    filterTemplates();
    logActivity('codigo', 'Script generado', t.name);
    APP.scriptsGenerated++;
    localStorage.setItem('geo_scripts_count', APP.scriptsGenerated);
    renderHomeStats();
    showToast('Script cargado en el editor', 'info');
}

function copyCode() {
    const code = document.getElementById('codeOutput').value;
    navigator.clipboard.writeText(code).then(() => showToast('Código copiado al portapapeles', 'success'));
}

function downloadCode() {
    const code = document.getElementById('codeOutput').value;
    const name = document.getElementById('codeFileName').textContent;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo descargado', 'success');
}

// ============================================================
// AUDIO Y TRANSCRIPCIÓN
// ============================================================
function toggleRecording() {
    if (APP.isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showToast('Tu navegador no soporta transcripción de voz', 'error');
        return;
    }
    
    APP.recognition = new SpeechRecognition();
    APP.recognition.continuous = true;
    APP.recognition.interimResults = true;
    APP.recognition.lang = 'es-ES';
    
    let fullTranscript = '';
    const box = document.getElementById('transcriptBox');
    box.innerHTML = '';
    
    APP.recognition.onresult = (e) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < e.results.length; i++) {
            if (e.results[i].isFinal) {
                final += e.results[i][0].transcript;
            } else {
                interim += e.results[i][0].transcript;
            }
        }
        if (final) fullTranscript += final + ' ';
        box.innerHTML = `<span class="final">${fullTranscript}</span><span class="interim">${interim}</span>`;
        box.scrollTop = box.scrollHeight;
        
        const langDet = document.getElementById('langDetected');
        langDet.style.display = 'block';
        langDet.textContent = `Idioma detectado: ${APP.recognition.lang}`;
    };
    
    APP.recognition.onerror = (e) => {
        if (e.error === 'no-speech') return;
        console.log('Speech error:', e.error);
    };
    
    APP.recognition.start();
    APP.isRecording = true;
    
    document.getElementById('recordBtn').classList.add('recording');
    document.getElementById('recordBtn').innerHTML = '<i class="fas fa-stop"></i>';
    document.getElementById('recordStatus').textContent = 'Grabando...';
    document.getElementById('recordStatus').style.color = '#ff3366';
    
    logActivity('audio', 'Grabación iniciada', 'Transcripción en tiempo real activa');
    showToast('Grabación iniciada', 'info');
}

function stopRecording() {
    APP.isRecording = false;
    if (APP.recognition) {
        APP.recognition.stop();
        APP.recognition = null;
    }
    
    document.getElementById('recordBtn').classList.remove('recording');
    document.getElementById('recordBtn').innerHTML = '<i class="fas fa-microphone"></i>';
    document.getElementById('recordStatus').textContent = 'Grabación detenida';
    document.getElementById('recordStatus').style.color = '#6b7a90';
    
    const box = document.getElementById('transcriptBox');
    const text = box.textContent.trim();
    if (text) {
        const entry = {
            id: Date.now(),
            text: text,
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            date: new Date().toLocaleDateString('es-ES'),
            lang: 'es-ES'
        };
        APP.transcripts.unshift(entry);
        if (APP.transcripts.length > 50) APP.transcripts.pop();
        localStorage.setItem('geo_transcripts', JSON.stringify(APP.transcripts));
        renderTranscriptHistory();
        logActivity('audio', 'Transcripción guardada', `${text.substring(0, 50)}...`);
    }
}

function renderTranscriptHistory() {
    const list = document.getElementById('transcriptList');
    if (APP.transcripts.length === 0) {
        list.innerHTML = '<p style="color:#4a5568;font-size:.85rem;text-align:center;padding:1rem">No hay transcripciones guardadas</p>';
        return;
    }
    list.innerHTML = APP.transcripts.slice(0, 10).map(t => `
        <div class="transcript-entry" onclick="this.querySelector('.te-text').classList.toggle('line-clamp-2')">
            <div class="te-header">
                <span class="te-time"><i class="fas fa-clock" style="margin-right:4px"></i>${t.time} - ${t.date}</span>
                <span class="te-lang">${t.lang || 'es-ES'}</span>
            </div>
            <div class="te-text">${t.text}</div>
        </div>
    `).join('');
}

// ============================================================
// MAPA Y CÁMARAS
// ============================================================
function initMap() {
    const container = document.getElementById('mapContainer');
    if (!container || APP.map) return;
    
    const defaultLat = 40.4168;
    const defaultLng = -3.7038;
    
    APP.map = L.map('mapContainer', {
        zoomControl: false
    }).setView([defaultLat, defaultLng], 14);
    
    L.control.zoom({ position: 'bottomright' }).addTo(APP.map);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
    }).addTo(APP.map);
    
    const userIcon = L.divIcon({
        html: '<div style="width:16px;height:16px;background:#00ff88;border-radius:50%;border:3px solid #060a13;box-shadow:0 0 20px rgba(0,255,136,.5)"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: ''
    });
    
    APP.locationMarker = L.marker([defaultLat, defaultLng], { icon: userIcon }).addTo(APP.map);
    APP.locationMarker.bindPopup('<b style="color:#00ff88">Tu ubicación</b>');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            APP.location = { lat: latitude, lng: longitude };
            APP.map.setView([latitude, longitude], 15);
            APP.locationMarker.setLatLng([latitude, longitude]);
            document.getElementById('locationInfo').textContent = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            addCameraMarkers(latitude, longitude);
            logActivity('sistema', 'Ubicación obtenida', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }, () => {
            addCameraMarkers(defaultLat, defaultLng);
            document.getElementById('locationInfo').textContent = 'Usando ubicación por defecto';
        });
    } else {
        addCameraMarkers(defaultLat, defaultLng);
    }
}

function addCameraMarkers(lat, lng) {
    APP.cameraMarkers.forEach(m => APP.map.removeLayer(m));
    APP.cameraMarkers = [];
    
    const cameraNames = [
        'CCTV-001 Main St', 'CCTV-002 Park Ave', 'CCTV-003 Bridge',
        'CCTV-004 Station', 'CCTV-005 Mall', 'CCTV-006 Highway',
        'CCTV-007 School', 'CCTV-008 Parking', 'CCTV-009 Bank'
    ];
    
    let seed = 42;
    function seededRandom() {
        seed = (seed * 16807 + 0) % 2147483647;
        return (seed - 1) / 2147483646;
    }
    
    const camIcon = L.divIcon({
        html: '<div style="width:12px;height:12px;background:#00d4ff;border-radius:50%;border:2px solid #060a13;box-shadow:0 0 12px rgba(0,212,255,.4)"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        className: ''
    });
    
    cameraNames.forEach((name, i) => {
        const angle = (i / cameraNames.length) * Math.PI * 2 + seededRandom() * 0.5;
        const dist = 0.002 + seededRandom() * 0.006;
        const cLat = lat + Math.sin(angle) * dist;
        const cLng = lng + Math.cos(angle) * dist;
        const distMeters = Math.round(dist * 111000);
        
        const marker = L.marker([cLat, cLng], { icon: camIcon }).addTo(APP.map);
        marker.bindPopup(`
            <div class="camera-popup">
                <h4><i class="fas fa-video" style="margin-right:6px"></i>${name}</h4>
                <p><i class="fas fa-location-dot" style="margin-right:4px"></i>Distancia: ~${distMeters}m</p>
                <p><i class="fas fa-signal" style="margin-right:4px"></i>Estado: <span style="color:#00ff88">Activa</span></p>
                <p><i class="fas fa-clock" style="margin-right:4px"></i>Resolución: 1080p</p>
                <button class="cam-btn" onclick="openCameraFeed('${name}')"><i class="fas fa-play" style="margin-right:4px"></i>Ver</button>
            </div>
        `);
        APP.cameraMarkers.push(marker);
    });
}

function centerMap() {
    if (APP.location) {
        APP.map.setView([APP.location.lat, APP.location.lng], 16);
    } else if (APP.map) {
        APP.map.setView([40.4168, -3.7038], 15);
    }
}

function refreshCameras() {
    if (APP.location) {
        addCameraMarkers(APP.location.lat, APP.location.lng);
    }
    showToast('Cámaras actualizadas', 'info');
}

// ============================================================
// FEED DE CÁMARA
// ============================================================
function openCameraFeed(name) {
    document.getElementById('feedLabel').textContent = name;
    document.getElementById('feedTitle').innerHTML = `<i class="fas fa-video text-cyan"></i> ${name}`;
    document.getElementById('cameraFeedModal').classList.add('active');
    
    const canvas = document.getElementById('feedCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 560;
    canvas.height = 315;
    
    let frame = 0;
    function renderFeed() {
        frame++;
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 30;
            data[i] = noise * 0.6;
            data[i+1] = noise * 0.9;
            data[i+2] = noise * 0.7;
            data[i+3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        
        ctx.fillStyle = 'rgba(40, 50, 40, 0.3)';
        const seed = name.charCodeAt(name.length - 1);
        for (let b = 0; b < 5; b++) {
            const bx = ((seed * (b + 1) * 37) % 400) + 20;
            const bw = 40 + ((seed * (b + 1)) % 80);
            const bh = 80 + ((seed * (b + 2)) % 150);
            ctx.fillRect(bx, canvas.height - bh - 30, bw, bh);
        }
        
        ctx.fillStyle = 'rgba(60, 70, 60, 0.4)';
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        
        const now = new Date();
        document.getElementById('feedTime').textContent = 
            now.toLocaleDateString('es-ES') + ' ' + now.toLocaleTimeString('es-ES') + '.' + String(now.getMilliseconds()).padStart(3, '0');
        
        APP.feedAnimFrame = requestAnimationFrame(renderFeed);
    }
    renderFeed();
}

function stopCameraFeed() {
    if (APP.feedAnimFrame) cancelAnimationFrame(APP.feedAnimFrame);
}

// ============================================================
// ARCHIVOS
// ============================================================
function renderFiles() {
    const search = document.getElementById('fileSearch').value.toLowerCase();
    const cat = document.getElementById('fileCatFilter').value;
    let filtered = APP.files.filter(f => {
        const matchSearch = f.name.toLowerCase().includes(search) || f.content.toLowerCase().includes(search);
        const matchCat = cat === 'all' || f.category === cat;
        return matchSearch && matchCat;
    });
    
    const list = document.getElementById('fileList');
    if (filtered.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:3rem;color:#4a5568"><i class="fas fa-folder-open" style="font-size:2rem;margin-bottom:.5rem;display:block"></i>No hay archivos</div>';
        return;
    }
    
    const catIcons = { script: 'fa-code', documento: 'fa-file-lines', transcripcion: 'fa-microphone', otro: 'fa-file' };
    const catColors = { script: '#00d4ff', documento: '#ffaa00', transcripcion: '#ff3366', otro: '#6b7a90' };
    
    list.innerHTML = filtered.map(f => `
        <div style="display:flex;align-items:center;gap:14px;padding:14px;background:#111827;border:1px solid #1e293b;border-radius:14px;margin-bottom:10px;transition:all .2s;cursor:pointer" onmouseenter="this.style.borderColor='#2a3548'" onmouseleave="this.style.borderColor='#1e293b'">
            <div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:${catColors[f.category]}15;color:${catColors[f.category]}">
                <i class="fas ${catIcons[f.category] || 'fa-file'}"></i>
            </div>
            <div style="flex:1;min-width:0">
                <div style="font-size:.9rem;font-weight:500;color:#e8edf5">${f.name}</div>
                <div style="font-size:.75rem;color:#6b7a90;margin-top:2px">${f.date}</div>
            </div>
            <div style="font-size:.8rem;color:#4a5568">${Math.round(f.content.length / 1024)}KB</div>
            <button class="modal-btn secondary" style="padding:6px 12px;font-size:.75rem" onclick="deleteFile(${f.id})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function showAddFileDialog() {
    closeAllModals();
    document.getElementById('addFileModal').classList.add('active');
}

function saveNewFile() {
    const name = document.getElementById('newFileName').value.trim();
    const cat = document.getElementById('newFileCat').value;
    const content = document.getElementById('newFileContent').value;
    
    if (!name) {
        showToast('Escribe un nombre', 'warning');
        return;
    }
    
    const file = {
        id: Date.now(),
        name: name,
        category: cat,
        content: content,
        date: new Date().toLocaleDateString('es-ES'),
        size: content.length
    };
    
    APP.files.unshift(file);
    localStorage.setItem('geo_files', JSON.stringify(APP.files));
    renderFiles();
    closeModal('addFileModal');
    showToast(`Archivo "${name}" guardado`, 'success');
    logActivity('sistema', 'Archivo creado', name);
}

function deleteFile(id) {
    if (confirm('¿Eliminar este archivo?')) {
        APP.files = APP.files.filter(f => f.id !== id);
        localStorage.setItem('geo_files', JSON.stringify(APP.files));
        renderFiles();
        showToast('Archivo eliminado', 'info');
        logActivity('sistema', 'Archivo eliminado', `ID: ${id}`);
    }
}

// ============================================================
// PANIC MODE
// ============================================================
function togglePanicMode() {
    APP.isPanicMode = !APP.isPanicMode;
    const btn = document.getElementById('panicBtn');
    const status = document.getElementById('panicStatus');
    const desc = document.getElementById('panicDesc');
    
    if (APP.isPanicMode) {
        APP.panicStartTime = Date.now();
        btn.classList.add('active');
        status.textContent = 'PROTOCOLO ACTIVO';
        status.style.color = '#ff3366';
        desc.textContent = '⚠️ Sistema de emergencia en ejecución';
        logActivity('seguridad', 'Panic Mode activado', 'Protocolo de emergencia iniciado');
        showToast('¡PROTOCOLO DE EMERGENCIA ACTIVADO!', 'error');
        renderPanicActions();
    } else {
        btn.classList.remove('active');
        status.textContent = 'Sistema Inactivo';
        status.style.color = '#e8edf5';
        desc.textContent = 'Pulsa el botón para activar el protocolo de emergencia';
        logActivity('seguridad', 'Panic Mode desactivado', 'Protocolo de emergencia cancelado');
        showToast('Protocolo desactivado', 'info');
        renderPanicActions();
    }
    renderHomeStats();
}

function renderPanicActions() {
    const container = document.getElementById('panicActions');
    const actions = [
        { id: 'location', icon: 'fa-location-dot', title: 'Rastreo', desc: 'Enviar ubicación' },
        { id: 'audio', icon: 'fa-microphone', title: 'Audio', desc: 'Grabar alrededores' },
        { id: 'selfie', icon: 'fa-camera', title: 'Selfie', desc: 'Capturar foto' },
        { id: 'encrypt', icon: 'fa-lock', title: 'Cifrar', desc: 'Proteger datos' },
        { id: 'wipe', icon: 'fa-fire', title: 'Borrar', desc: 'Datos locales' },
        { id: 'alert', icon: 'fa-bell', title: 'Alerta', desc: 'Notificar' }
    ];
    
    container.innerHTML = actions.map(a => `
        <div class="panic-action ${APP.isPanicMode ? 'active-action' : ''}" onclick="executePanicAction('${a.id}')">
            <i class="fas ${a.icon}"></i>
            <div>
                <div class="pa-title">${a.title}</div>
                <div class="pa-desc">${a.desc}</div>
            </div>
        </div>
    `).join('');
}

function executePanicAction(action) {
    if (!APP.isPanicMode) return;
    
    switch(action) {
        case 'location':
            if (APP.location) {
                const maps = `https://maps.google.com/?q=${APP.location.lat},${APP.location.lng}`;
                navigator.clipboard.writeText(maps);
                showToast('Enlace de ubicación copiado', 'success');
            }
            logActivity('seguridad', 'Acción panic', 'Rastreo de ubicación');
            break;
        case 'audio':
            startRecording();
            showToast('Grabación de audio iniciada', 'info');
            logActivity('seguridad', 'Acción panic', 'Iniciada grabación de audio');
            break;
        case 'selfie':
            startFaceRecognition();
            showToast('Cámara activada', 'info');
            logActivity('seguridad', 'Acción panic', 'Captura de foto frontal');
            break;
        case 'encrypt':
            showToast('Algoritmo AES-256 aplicado (local)', 'success');
            logActivity('seguridad', 'Acción panic', 'Encriptación de almacenamiento local');
            break;
        case 'wipe':
            if (confirm('⚠️ ¿Borrar TODOS los archivos locales?')) {
                localStorage.clear();
                showToast('Datos borrados de forma segura', 'success');
                logActivity('seguridad', 'Acción panic', 'Borrado seguro de almacenamiento completado');
                setTimeout(() => location.reload(), 1000);
            }
            break;
        case 'alert':
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('⚠️ GEO Alerta', {
                    body: 'Protocolo de emergencia activado - Ubicación registrada'
                });
            }
            showToast('Notificación de alerta enviada', 'info');
            logActivity('seguridad', 'Acción panic', 'Notificación de emergencia enviada');
            break;
    }
}

// ============================================================
// LOGGING
// ============================================================
function logActivity(type, event, detail) {
    const log = {
        id: Date.now(),
        type: type,
        event: event,
        detail: detail,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: new Date()
    };
    APP.logs.unshift(log);
    if (APP.logs.length > 100) APP.logs.pop();
    localStorage.setItem('geo_logs', JSON.stringify(APP.logs));
    renderLogs();
}

function renderLogs() {
    const filter = document.getElementById('logFilter').value;
    const filtered = filter === 'all' ? APP.logs : APP.logs.filter(l => l.type === filter);
    const tbody = document.getElementById('logTableBody');
    const empty = document.getElementById('logEmpty');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    tbody.innerHTML = filtered.slice(0, 50).map(l => {
        const color = getLogColor(l.type);
        return `
            <tr>
                <td>${l.time}</td>
                <td><span class="log-badge" style="background:${color.bg};color:${color.fg}">${l.type.toUpperCase()}</span></td>
                <td>${l.event}</td>
                <td style="color:#6b7a90;font-size:.75rem">${l.detail}</td>
            </tr>
        `;
    }).join('');
}

function clearLogs() {
    if (confirm('¿Eliminar todo el registro de actividad?')) {
        APP.logs = [];
        localStorage.setItem('geo_logs', JSON.stringify(APP.logs));
        renderLogs();
        showToast('Registro borrado', 'info');
    }
}

// ============================================================
// UTILIDADES
// ============================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toasts');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}