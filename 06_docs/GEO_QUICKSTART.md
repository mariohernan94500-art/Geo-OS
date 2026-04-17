# 🚀 INICIO RÁPIDO - GEO v1.0

## 1️⃣ ABRIR LA APLICACIÓN

### Opción más simple:
```
1. Navega a la carpeta del proyecto
2. Haz doble clic en: index.html
```

### Con navegador específico:
```
Chrome:  Arrastra index.html aquí
Firefox: Arrastra index.html aquí
Safari:  Arrastra index.html aquí
```

### Via servidor local:
```bash
# Si tienes Python 3:
python -m http.server 8000
# Luego abre: http://localhost:8000

# Si tienes Node.js:
npx http-server
# Luego abre: http://localhost:8080
```

---

## 2️⃣ PRIMER ACCESO

### PIN por defecto:
```
1234
```

### Si quieres cambiar el PIN:
1. Abre DevTools (F12)
2. Consola JavaScript
3. Ejecuta:
```javascript
localStorage.setItem('geo_pin', '5678');
location.reload();
```

### Configurar Preguntas de Seguridad:
1. En la pantalla de bloqueo, clic en "Preguntas"
2. Responde las 3 preguntas
3. Guarda

---

## 3️⃣ PRIMEROS PASOS

### Panel de Control
```
✓ Estado del sistema
✓ Estadísticas generales  
✓ Actividad reciente
```

### Motor de Código
```
1. Filtra por lenguaje (Python/JavaScript/Bash)
2. Filtra por categoría (Seguridad/Automatización/etc)
3. Clic en plantilla
4. Usa: Copiar / Descargar / Editar
```

### Grabar Audio
```
1. Sección "Audio y Transcripción"
2. Clic en botón micrófono
3. Habla en español
4. Ver transcripción en vivo
5. Clic de nuevo para detener
```

### Ver Mapa
```
1. Sección "Mapa y Cámaras"
2. Permite ubicación cuando se pida
3. Verás tu ubicación + cámaras cercanas simuladas
4. Clic en cámara → "Ver transmisión"
```

### Guardar Archivos
```
1. Sección "Archivos"
2. Botón "+ Nuevo Archivo"
3. Nombre, categoría, contenido
4. Guardar
5. Buscar o filtrar después
```

### Activar Emergencia
```
1. Sección "Protocolo de Seguridad"
2. Clic en botón rojo grande (🛡️)
3. Se activan 6 acciones:
   - Rastreo (ubicación)
   - Audio (grabar)
   - Selfie (foto)
   - Cifrar (proteger)
   - Borrar (wipe data)
   - Alerta (notificación)
```

### Ver Historial
```
1. Sección "Registro"
2. Filtrar por tipo de evento
3. Ver todos los eventos cronológicamente
```

---

## 4️⃣ ARCHIVOS DEL PROYECTO

```
Geo Core/
├── index.html          ← Abre este archivo
├── geo.js              ← Lógica y funcionalidad
├── geo-sw.js           ← Service Worker (offline)
├── README.md           ← Documentación completa
└── QUICKSTART.md       ← Este archivo
```

### Total: ~3500 líneas de código

---

## 5️⃣ DATOS ALMACENADOS

Todo se guarda automáticamente en el navegador:

```javascript
localStorage.getItem('geo_pin')           // Tu PIN
localStorage.getItem('geo_questions')     // Preguntas de seguridad
localStorage.getItem('geo_transcripts')   // Transcripciones
localStorage.getItem('geo_files')         // Archivos personalizados
localStorage.getItem('geo_logs')          // Historial de eventos
localStorage.getItem('geo_scripts_count') // Contador de scripts
```

### Para BORRAR TODO:
```javascript
localStorage.clear();
location.reload();
```

---

## 6️⃣ CARACTERÍSTICAS OCULTAS

### Estadísticas en Consola
Abre DevTools (F12) → Consola:
```javascript
// Ver estado completo del sistema
console.log(APP);

// Ver todos los scripts disponibles
console.log(TEMPLATES);

// Ver configuración de preguntas
console.log(APP.questions);
```

### Modo Debug
```javascript
// En consola:
localStorage.setItem('geo_debug', 'true');
// Habilita logging adicional
```

---

## 7️⃣ REQUISITOS

| Requisito | Versión |
|-----------|---------|
| Navegador | Chrome 60+, Firefox 55+, Safari 12+, Edge 79+ |
| Internet | Solo para CDNs iniciales (Tailwind, Font Awesome, Leaflet) |
| Almacenamiento | 5-10 MB disponibles en localStorage |
| Permisos | Opcional: Micrófono, Cámara, Ubicación |

---

## 8️⃣ SOLUCIONES RÁPIDAS

**"La aplicación está en blanco"**
- Abre DevTools (F12)
- Consola → Verifica errores
- Intenta Ctrl+Shift+R (hard refresh)

**"El PIN es incorrecto"**
- PIN por defecto: `1234`
- Si lo cambiaste, recupéralo:
```javascript
// En consola - Ver el PIN actual:
console.log(localStorage.getItem('geo_pin'));
```

**"Quiero empezar de cero"**
```javascript
// En consola - Resetear todo:
localStorage.clear();
location.reload();
// Se abre el lock screen nuevamente
```

**"¿Dónde están mis datos?"**
- F12 → Application → LocalStorage
- Busca entrada del sitio actual
- Verás todas las claves y valores

---

## 9️⃣ TIPS & TRICKS

### Grabar primero, preguntar después
Cuando está en Panic Mode, todas las acciones se registran automáticamente.

### Usar plantillas como referencias
Los scripts incluidos son seguros y educativos. Modifica según necesites.

### Transcripciones en múltiples idiomas
En `geo.js` línea ~600, cambia `lang: 'es-ES'` a otro código:
```javascript
'en-US' → Inglés US
'fr-FR' → Francés
'de-DE' → Alemán
'it-IT' → Italiano
'ja-JP' → Japonés
```

### Exportar datos
Copia el contenido de localStorage:
```javascript
JSON.stringify(localStorage, null, 2)
```

---

## 🔟 SIGUIENTES PASOS

1. **Explora todos los módulos** (Código, Audio, Mapa, Archivos)
2. **Personaliza el PIN** a algo que recuerdes
3. **Configura preguntas** (usa hechos reales)
4. **Guarda scripts útiles** en "Archivos"
5. **Revisa el Registro** para ver actividad

---

## ❓ PREGUNTAS FRECUENTES

**¿Es seguro guardar datos sensibles?**
- Sí en navegación privada (se borra al cerrar)
- En navegación normal, cualquiera con acceso puede verlo
- Recomendación: Usa junto con PIN fuerte

**¿Funciona sin internet?**
- Front-end: Sí completamente
- Algunos CDNs (Leaflet/Icons): Requieren internet inicial
- Una vez cargado: Funciona offline con Service Worker

**¿Hay backdoors o spyware?**
- No, código 100% abierto
- Todo procesado localmente
- Revisa `geo.js` si lo deseas

**¿Puedo instalarlo en móvil?**
- Sí: Abre en navegador del móvil
- Guarda en pantalla de inicio (agregar a pantalla de inicio)
- Funciona como web app

---

## 📞 SOPORTE

Para problemas:
1. Consulta el archivo README.md completo
2. Abre DevTools (F12) y revisa la consola
3.ér el Registro de eventos (última sección)
4. Resetea si es necesario (localStorage.clear())

---

**GEO v1.0** | March 2025
🛡️ *Seguridad y Organización Local*
