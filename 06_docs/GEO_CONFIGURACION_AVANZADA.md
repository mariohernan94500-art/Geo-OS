# ⚙️ CONFIGURACIÓN AVANZADA - GEO

## 🎨 Personalización Visual

### Cambiar Esquema de Colores

En `index.html`, busca la sección `<script>` (línea ~11):

```javascript
tailwind.config={theme:{extend:{colors:{geo:{
    bg:'#060a13',           // Fondo principal (oscuro)
    surface:'#0d1321',      // Superficies secundarias
    card:'#111827',         // Cards y containers
    cardhover:'#1a2332',    // Hover en cards
    border:'#1e293b',       // Bordes
    text:'#e8edf5',         // Texto principal
    muted:'#6b7a90',        // Texto tenue
    accent:'#00ff88',       // Verde neon (principal)
    cyan:'#00d4ff',         // Cian (secundario)
    danger:'#ff3366',       // Rojo (alertas)
    warn:'#ffaa00'          // Amarillo (advertencias)
}}}}}
```

### Temas Predefinidos

#### Tema Oscuro Puro
```javascript
bg:'#000000',
surface:'#0a0a0a',
card:'#1a1a1a',
border:'#2a2a2a',
accent:'#00ff00',     // Verde crudo
text:'#ffffff'
```

#### Tema Azul Profesional
```javascript
bg:'#0f1419',
accent:'#00a8ff',     // Azul brillante
cyan:'#00d4ff',
card:'#1a2a3a',
text:'#e0e6ff'
```

#### Tema Rojo Clásico (Hacker)
```javascript
accent:'#ff0000',
card:'#1a0000',
text:'#ff0000',       // Texto rojo real
muted:'#660000'
```

---

## 🔐 Seguridad Avanzada

### Cambiar PIN en Tiempo de Ejecución

Opción 1: Directamente en localStorage
```javascript
// En DevTools Console:
localStorage.setItem('geo_pin', '999999');
location.reload();
```

Opción 2: Crear un formulario en la app
En `index.html`, agregar modal:

```html
<!-- En dashboard, agregar sección Settings -->
<section class="content-section" id="sec-settings">
    <h1>Ajustes</h1>
    <label>Cambiar PIN (actual: 1234)</label>
    <input type="password" id="oldPin" placeholder="PIN actual">
    <input type="password" id="newPin" placeholder="Nuevo PIN">
    <input type="password" id="confirmPin" placeholder="Confirmar PIN">
    <button onclick="changePIN()">Cambiar PIN</button>
</section>
```

Luego en `geo.js`:
```javascript
function changePIN() {
    const old = document.getElementById('oldPin').value;
    const newVal = document.getElementById('newPin').value;
    const confirm = document.getElementById('confirmPin').value;
    
    if (old !== APP.pin) {
        showToast('PIN actual incorrecto', 'error');
        return;
    }
    if (newVal !== confirm) {
        showToast('Los PINs no coinciden', 'error');
        return;
    }
    if (newVal.length < 4) {
        showToast('PIN debe tener al menos 4 dígitos', 'warning');
        return;
    }
    
    APP.pin = newVal;
    localStorage.setItem('geo_pin', newVal);
    showToast('PIN cambiado correctamente', 'success');
    logActivity('sistema', 'PIN modificado', 'Cambio de contraseña');
}
```

### Hash de PIN (Futuro)

Para v2.0, agregar:
```javascript
// Hasher simple (en geo.js):
function hashPIN(pin) {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
        hash = ((hash << 5) - hash) + pin.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

// Usar en verificación:
function verifyPin() {
    if (hashPIN(APP.enteredPin) === hashPIN(APP.pin)) {
        // ... continuar
    }
}
```

---

## 🧬 Agregar Nuevas Plantillas de Scripts

En `geo.js`, sección `TEMPLATES`:

```javascript
{
    id: 'mi-script-unico',
    lang: 'python',                    // 'python', 'javascript', 'bash'
    cat: 'automatizacion',             // categoría
    name: 'Nombre Visible',
    desc: 'Descripción breve',
    code: `#!/usr/bin/env python3
# Tu código aquí
print('Hello, GEO!')
`
}
```

**Categorías válidas:**
- `seguridad`
- `automatizacion`
- `redes`
- `archivos`
- `sistema`
- `datos`
- `utilidades`

**Ejemplo completo:**
```javascript
{
    id: 'py-json-viewer',
    lang: 'python',
    cat: 'utilidades',
    name: 'Visor JSON',
    desc: 'Formatea y valida archivos JSON',
    code: `import json
import sys

filename = sys.argv[1] if len(sys.argv) > 1 else 'data.json'

try:
    with open(filename, 'r') as f:
        data = json.load(f)
    
    formatted = json.dumps(data, indent=2, ensure_ascii=False)
    print(formatted)
    
    print(f"\\n✓ JSON válido")
    print(f"Total de claves: {len(data) if isinstance(data, dict) else 'N/A'}")
    
except json.JSONDecodeError as e:
    print(f"✗ Error JSON: {e}")
except FileNotFoundError:
    print(f"✗ Archivo no encontrado: {filename}")
`
}
```

---

## 🛠️ Herramientas de Administración

### Script de Backup

```bash
#!/bin/bash
# backup-geo.sh - Exporta datos de GEO

BACKUP_DIR="./geo-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

echo "Exportar localStorage desde DevTools:"
echo "===================================="
echo ""
echo "1. Abre DevTools (F12)"
echo "2. Consola"
echo "3. Ejecuta:"
echo ""
echo 'JSON.stringify(localStorage, null, 2)' 
echo ""
echo "4. Copia el resultado"
echo "5. Guarda en: $BACKUP_DIR/backup_$TIMESTAMP.json"
```

### Script de Restauración

```javascript
// En consola para restaurar:
function restoreBackup(jsonString) {
    try {
        const backup = JSON.parse(jsonString);
        for (const [key, value] of Object.entries(backup)) {
            localStorage.setItem(key, value);
        }
        console.log('✓ Backup restaurado');
        location.reload();
    } catch (e) {
        console.error('✗ Error en JSON:', e);
    }
}

// Usar: restoreBackup(jsonString)
```

---

## 📊 Estadísticas Avanzadas

Ver datos en tiempo real:
```javascript
// Tamaño total de localStorage
function getStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return (total / 1024).toFixed(2) + ' KB';
}

getStorageSize();  // "342.50 KB"

// Breakdown por tipo
function getStorageBreakdown() {
    return {
        logs: (JSON.stringify(APP.logs).length / 1024).toFixed(2) + ' KB',
        files: (JSON.stringify(APP.files).length / 1024).toFixed(2) + ' KB',
        transcripts: (JSON.stringify(APP.transcripts).length / 1024).toFixed(2) + ' KB',
        total: getStorageSize()
    };
}

getStorageBreakdown();
```

---

## 🌐 Integración con APIs Externas

### Ejemplo: Enviar ubicación a servidor

```javascript
// Modificar executePanicAction en geo.js:

case 'location':
    if (APP.location) {
        const data = {
            latitude: APP.location.lat,
            longitude: APP.location.lng,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        // Enviar a servidor (si tienes):
        fetch('/api/emergency-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(err => console.log('API no disponible (offline)'));
        
        const maps = `https://maps.google.com/?q=${APP.location.lat},${APP.location.lng}`;
        navigator.clipboard.writeText(maps);
    }
    break;
```

### Ejemplo: Webhooks a Discord

```javascript
async function sendToDiscord(message) {
    const webhook = 'https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN';
    
    try {
        await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: message,
                username: 'GEO System',
                avatar_url: 'https://...'
            })
        });
        console.log('Mensaje enviado a Discord');
    } catch (e) {
        console.log('No se pudo enviar (offline)');
    }
}

// En Panic Mode:
sendToDiscord(`🚨 GEO Emergency: ${APP.location.lat}, ${APP.location.lng}`);
```

---

## 🔧 Modo Desarrollo

### Logging Detallado

```javascript
// Al inicio de geo.js:
const DEBUG = true;

function devLog(category, message, data = null) {
    if (!DEBUG) return;
    const style = 'background:#00ff88;color:#060a13;padding:2px 8px;border-radius:3px;font-weight:bold';
    console.log(`%c[${category}]%c ${message}`, style, 'color:#e8edf5');
    if (data) console.log(data);
}

// Usar:
devLog('AUDIO', 'Transcripción completada', fullTranscript);
devLog('SECURITY', 'Intentos fallidos', APP.attempts);
```

### Modo Sandbox (sin datos reales)

```javascript
// En localStorage:
localStorage.setItem('geo_sandbox', 'true');

// Luego en geo.js:
if (localStorage.getItem('geo_sandbox')) {
    APP.location = { lat: 0, lng: 0 };  // Ubicación fake
    APP.cameraStream = null;             // Sin cámara
    APP.recognition = null;              // Sin micrófono
}
```

---

## 📱 Optimización Móvil

### Agregar PWA Manifest

Crear `manifest.json`:
```json
{
    "name": "GEO - Sistema de Seguridad",
    "short_name": "GEO",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#060a13",
    "theme_color": "#00ff88",
    "orientation": "portrait-primary",
    "scope": "/",
    "icons": [
        {
            "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><text y='150' font-size='180'>🛡️</text></svg>",
            "sizes": "192x192",
            "type": "image/svg+xml",
            "purpose": "any"
        }
    ]
}
```

En `index.html` `<head>`:
```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#00ff88">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="GEO">
```

---

## 🚀 Deployment

### Opción 1: GitHub Pages

```bash
# 1. Crea repositorio: geo-security
# 2. Sube archivos
# 3. Settings → Pages → ✓ Enable
# 4. Accede: https://tu-usuario.github.io/geo-security
```

### Opción 2: Netlify

```bash
# 1. yarn install (si usas)
# 2. Arrastra carpeta a Netlify.com
# 3. Se publica automáticamente
```

### Opción 3: Servidor Propio

```bash
# Ubuntu/Debian con Nginx
sudo apt install nginx
sudo cp -r * /var/www/geo
sudo systemctl start nginx
# Accede: http://tu-servidor/geo
```

---

## 📋 Checklist de Customización

- [ ] Cambiar PIN a algo personal
- [ ] Actualizar paleta de colores
- [ ] Agregar preguntas de seguridad reales
- [ ] Añadir scripts propios
- [ ] Traducir a tu idioma
- [ ] Configurar integración con servicios
- [ ] Hacer backup de la configuración
- [ ] Testear en móvil
- [ ] Optimizar para tu caso de uso
- [ ] Documentar cambios

---

**GEO Advanced Config v1.0** | 2025
