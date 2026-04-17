// ============================================================
// GEO — Watcher Inteligente de Descargas
// Versión 1.0 — Mario Guillaume
// ============================================================
// Ejecutar: node watcher.js
// Detener:  Ctrl+C
// ============================================================

const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURACIÓN — EDITAR AQUÍ
// ============================================================
const DOWNLOADS = path.join(process.env.USERPROFILE, 'Downloads');
const GEO = path.join(process.env.USERPROFILE, 'OneDrive', 'Desktop', 'Geo');

const DESTINOS = {
  // Código y desarrollo
  '.js':    path.join(GEO, '01_core'),
  '.ts':    path.join(GEO, '02_agents'),
  '.tsx':   path.join(GEO, '02_agents'),
  '.jsx':   path.join(GEO, '02_agents'),
  '.py':    path.join(GEO, '01_core'),
  '.html':  path.join(GEO, '05_frontend', 'pages'),
  '.css':   path.join(GEO, '05_frontend', 'assets'),

  // Documentos
  '.pdf':   path.join(GEO, '06_docs'),
  '.docx':  path.join(GEO, '06_docs'),
  '.doc':   path.join(GEO, '06_docs'),
  '.md':    path.join(GEO, '06_docs'),
  '.txt':   path.join(GEO, '06_docs'),
  '.xlsx':  path.join(GEO, '06_docs'),

  // Imágenes
  '.png':   path.join(GEO, '05_frontend', 'assets'),
  '.jpg':   path.join(GEO, '05_frontend', 'assets'),
  '.jpeg':  path.join(GEO, '05_frontend', 'assets'),
  '.PNG':   path.join(GEO, '05_frontend', 'assets'),
  '.gif':   path.join(GEO, '05_frontend', 'assets'),
  '.webp':  path.join(GEO, '05_frontend', 'assets'),
  '.avif':  path.join(GEO, '05_frontend', 'assets'),
  '.svg':   path.join(GEO, '05_frontend', 'assets'),
  '.jfif':  path.join(GEO, '05_frontend', 'assets'),

  // Datos y config
  '.json':  path.join(GEO, '04_data', 'db'),
  '.env':   path.join(GEO, '04_data', 'prompts'),
  '.db':    path.join(GEO, '04_data', 'db'),
  '.sql':   path.join(GEO, '04_data', 'db'),

  // Scripts
  '.bat':   path.join(GEO, '07_scripts'),
  '.ps1':   path.join(GEO, '07_scripts'),
  '.sh':    path.join(GEO, '07_scripts'),

  // Comprimidos — revisar antes de mover
  '.zip':   path.join(GEO, '06_docs', 'backups'),
  '.rar':   path.join(GEO, '06_docs', 'backups'),
  '.tar':   path.join(GEO, '06_docs', 'backups'),
};

// ============================================================
// DOCUMENTOS GEO — NOMBRES FIJOS Y DESTINOS AUTOMÁTICOS
// REGLA DE ORO: Todo documento GEO empieza con GEO_
// Si el archivo tiene este nombre exacto → va directo a su lugar
// Si ya existe → se reemplaza (actualización automática)
// ============================================================
const DESTINOS_POR_NOMBRE = {

  // --- 00_nucleus — Identidad y memoria de Mario ---
  'GEO_DIARIO_SESIONES.md':     path.join(GEO, '00_nucleus'),
  'GEO_NUCLEO_MARIO.docx':      path.join(GEO, '00_nucleus'),
  'GEO_IDEAS_NEGOCIO.md':       path.join(GEO, '00_nucleus'),
  'GEO_OBJETIVOS_VIDA.md':      path.join(GEO, '00_nucleus'),
  'NUCLEO_DE_MARIO_v1.docx':    path.join(GEO, '00_nucleus'),
  'NUCLEO_DE_MARIO_v2.docx':    path.join(GEO, '00_nucleus'),
  'NUCLEO_DE_MARIO_v3.docx':    path.join(GEO, '00_nucleus'),

  // --- 04_data — Datos financieros y operacionales ---
  'GEO_GASTOS_PERSONALES.xlsx': path.join(GEO, '04_data'),
  'GEO_SUSCRIPCIONES.xlsx':     path.join(GEO, '04_data'),
  'GEO_CLIENTES.xlsx':          path.join(GEO, '04_data'),
  'GEO_INGRESOS_EGRESOS.xlsx':  path.join(GEO, '04_data'),
  'GEO_PIPELINE_VENTAS.xlsx':   path.join(GEO, '04_data'),
  'GEO_CONTACTOS_CLAVE.md':     path.join(GEO, '04_data'),
  'GEO_API_KEYS_ESTADO.md':     path.join(GEO, '04_data', 'prompts'),
  'GEO_PROMPTS.env':            path.join(GEO, '04_data', 'prompts'),

  // --- 06_docs — Documentación técnica y proyectos ---
  'GEO_PROYECTOS_ESTADO.md':    path.join(GEO, '06_docs'),
  'GEO_HERRAMIENTAS_KIT.md':    path.join(GEO, '06_docs'),
  'GEO_AUDITORIA_VPS.md':       path.join(GEO, '06_docs'),
  'GEO_DOMINIOS_HOSTING.md':    path.join(GEO, '06_docs'),
  'GEO_CHANGELOG.md':           path.join(GEO, '06_docs'),
  'GEO_BUGS_PENDIENTES.md':     path.join(GEO, '06_docs'),
  'GEO_APRENDIZAJE.md':         path.join(GEO, '06_docs'),

  // --- 02_agents — Scripts del sistema ---
  'watcher.js':                 path.join(GEO, '02_agents', 'automation-agent'),
};

// Archivos que requieren confirmación antes de moverse
const REQUIEREN_CONFIRMACION = ['.exe', '.msi', '.dmg', '.winmd'];

// Archivos que se eliminan automáticamente (basura conocida)
const ELIMINAR_AUTO = ['.tmp', '.crdownload', '.part', '.downloading'];

// Nombres que indican keys sensibles — mover a prompts
const PALABRAS_SENSIBLES = ['secret', 'key', 'token', 'credential', 'firebase', 'api'];
// ============================================================

let procesando = new Set();

function log(emoji, msg) {
  const hora = new Date().toLocaleTimeString('es-CL');
  console.log(`[${hora}] ${emoji}  ${msg}`);
}

function esSensible(nombre) {
  const lower = nombre.toLowerCase();
  return PALABRAS_SENSIBLES.some(p => lower.includes(p));
}

function obtenerDestino(archivo) {
  const ext = path.extname(archivo).toLowerCase();
  const nombre = path.basename(archivo);

  // Destino fijo por nombre exacto (máxima prioridad)
  if (DESTINOS_POR_NOMBRE[nombre]) {
    return { destino: DESTINOS_POR_NOMBRE[nombre], tipo: 'conocido' };
  }

  // Keys sensibles van a prompts sin importar la extensión
  if (esSensible(nombre)) {
    return { destino: path.join(GEO, '04_data', 'prompts'), tipo: 'sensible' };
  }

  // Instaladores — requieren confirmación
  if (REQUIEREN_CONFIRMACION.includes(ext)) {
    return { destino: null, tipo: 'instalador' };
  }

  // Eliminar automáticamente
  if (ELIMINAR_AUTO.includes(ext)) {
    return { destino: null, tipo: 'basura' };
  }

  // Buscar destino por extensión
  const destino = DESTINOS[ext] || DESTINOS[path.extname(archivo)];
  if (destino) {
    return { destino, tipo: 'conocido' };
  }

  return { destino: null, tipo: 'desconocido' };
}

function moverArchivo(origen, destino, nombre) {
  try {
    if (!fs.existsSync(destino)) {
      fs.mkdirSync(destino, { recursive: true });
    }
    const dest = path.join(destino, nombre);
    // Si ya existe, agregar timestamp
    if (fs.existsSync(dest)) {
      const ts = Date.now();
      const ext = path.extname(nombre);
      const base = path.basename(nombre, ext);
      fs.renameSync(origen, path.join(destino, `${base}_${ts}${ext}`));
    } else {
      fs.renameSync(origen, dest);
    }
    return true;
  } catch (e) {
    return false;
  }
}

function procesarArchivo(archivo) {
  // Ignorar archivos temporales y carpetas
  if (archivo.startsWith('.') || procesando.has(archivo)) return;

  const rutaCompleta = path.join(DOWNLOADS, archivo);

  try {
    const stat = fs.statSync(rutaCompleta);
    if (stat.isDirectory()) return;
  } catch { return; }

  // Esperar 2 segundos para que termine de descargarse
  setTimeout(() => {
    if (!fs.existsSync(rutaCompleta)) return;
    if (procesando.has(archivo)) return;
    procesando.add(archivo);

    const { destino, tipo } = obtenerDestino(archivo);

    if (tipo === 'basura') {
      try {
        fs.unlinkSync(rutaCompleta);
        log('🗑️', `Eliminado automáticamente: ${archivo}`);
      } catch {}

    } else if (tipo === 'sensible') {
      const ok = moverArchivo(rutaCompleta, destino, archivo);
      if (ok) log('🔐', `Key sensible guardada en 04_data/prompts: ${archivo}`);

    } else if (tipo === 'instalador') {
      log('⚙️ ', `Instalador detectado: ${archivo}`);
      log('   ', `   → ¿Ya lo instalaste? Puedes borrarlo manualmente o dejarlo.`);
      log('   ', `   → Ubicación: ${rutaCompleta}`);

    } else if (tipo === 'conocido') {
      const ok = moverArchivo(rutaCompleta, destino, archivo);
      const carpeta = destino.replace(GEO, 'Geo').replace(/\\/g, '/');
      if (ok) log('✅', `${archivo} → ${carpeta}`);

    } else {
      log('❓', `Archivo desconocido: ${archivo}`);
      log('   ', `   → Revísalo manualmente: ${rutaCompleta}`);
    }

    procesando.delete(archivo);
  }, 2000);
}

// Iniciar watcher
log('🚀', 'GEO Watcher iniciado');
log('👁️ ', `Vigilando: ${DOWNLOADS}`);
log('📁', `Destino base: ${GEO}`);
console.log('─'.repeat(60));

const watcher = fs.watch(DOWNLOADS, (evento, archivo) => {
  if (evento === 'rename' && archivo) {
    procesarArchivo(archivo);
  }
});

watcher.on('error', (err) => {
  log('❌', `Error en watcher: ${err.message}`);
});

process.on('SIGINT', () => {
  console.log('\n' + '─'.repeat(60));
  log('👋', 'GEO Watcher detenido');
  watcher.close();
  process.exit(0);
});
