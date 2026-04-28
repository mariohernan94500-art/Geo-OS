# 🧠 GEO — PROMPT MAESTRO PARA Z.AI
## Documento completo para construir Geo v3/v4 desde cero

---

## 🎯 LA IDEA EN UNA ORACIÓN

> Geo es una **plataforma autónoma que genera, despliega, monitorea y vende aplicaciones web completas** (frontend + backend), controlada por voz, con suscripciones Stripe, marketplace multi-tenant y licencias NFT en Polygon.

---

## 🧩 CONTEXTO PARA Z.AI (léelo primero)

Este proyecto ya existe en diseño conceptual avanzado. Lo que necesito es que lo construyas como una **aplicación web Node.js con Express**, modular, ejecutable en un VPS Linux con PM2. No es un toy project: es una plataforma real.

El sistema tiene 4 versiones evolutivas:
- **v1**: Generador de apps fullstack con autonomía controlada (base)
- **v2**: Multi-tenant, auth JWT, SQLite, deploy a Vercel/Railway
- **v3**: Monitoreo en tiempo real (Socket.io), escalado automático (PM2), Stripe, asistente de voz (ElevenLabs + Web Speech API)
- **v4**: Marketplace interno + licencias NFT (ERC-721 en Polygon via Hardhat)

**Empieza por v1 + v3 integrados. v4 es opcional/posterior.**

---

## 🏗️ ARQUITECTURA GENERAL

```
geo-system/
├── server.js                    ← Núcleo Express + Socket.io
├── .env                         ← API keys (nunca a Git)
├── package.json
├── public/
│   └── dashboard.html           ← UI completa (voz + monitoreo)
├── apps/                        ← Apps generadas dinámicamente
│   └── [nombre-app]/
│       ├── frontend/            ← HTML, CSS, JS
│       └── backend/             ← Express server, routes, db.json
├── data/
│   ├── geo.db                   ← SQLite principal
│   └── memory.json              ← Memoria/plantillas de Geo
├── logs/
│   └── apps/                    ← Logs por app
└── modules/
    ├── ai/                      ← OpenRouter + Groq + DeepSeek
    ├── database/                ← SQLite con schemas multi-tenant
    ├── auth/                    ← JWT
    ├── generator/               ← El corazón: genera código fullstack
    ├── monitoring/              ← Socket.io métricas en tiempo real
    ├── scaling/                 ← PM2 autoscaler
    ├── payments/                ← Stripe suscripciones
    ├── voice/                   ← ElevenLabs TTS + Web Speech API
    ├── deployment/              ← Vercel / Railway deploy
    └── marketplace/             ← (v4) compra/venta de apps
```

---

## ⚙️ STACK TECNOLÓGICO

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 20+ (ESModules, `"type": "module"`) |
| Framework | Express 4 |
| Base de datos | SQLite (via `sqlite` + `sqlite3`) |
| Auth | JWT (`jsonwebtoken` + `bcrypt`) |
| Tiempo real | Socket.io 4 |
| Proceso manager | PM2 |
| IA cerebro | DeepSeek (via OpenRouter) |
| IA prompts | OpenRouter → Mixtral-8x7b |
| IA código | Groq → llama3-70b-8192 |
| Voz síntesis | ElevenLabs API |
| Voz reconocimiento | Web Speech API (navegador) |
| Pagos | Stripe (checkout + webhooks + portal) |
| Blockchain (v4) | Hardhat + OpenZeppelin ERC-721 en Polygon |
| IPFS (v4) | Pinata |
| Deploy apps | Vercel API + Railway API |

---

## 🔑 VARIABLES DE ENTORNO (.env)

```env
# IA
OPENROUTER_API_KEY=sk-or-v1-...
GROQ_API_KEY=gsk_...
DEEPSEEK_API_KEY=sk-...         # Opcional, OpenRouter lo puede cubrir

# Auth
JWT_SECRET=geo_super_secret_change_me_in_prod

# Deploy de apps generadas
VERCEL_TOKEN=...
RAILWAY_TOKEN=...

# Pagos
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PRO=price_...

# Voz
ELEVENLABS_API_KEY=...

# Blockchain (v4)
PRIVATE_KEY=0x...
POLYGON_RPC=https://polygon-rpc.com
NFT_CONTRACT_ADDRESS=0x...
PINATA_JWT=...

# Server
PORT=3000
BASE_URL=http://localhost:3000
```

---

## 📦 DEPENDENCIAS (package.json)

```json
{
  "name": "geo-ai-system",
  "version": "3.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "deploy-contract": "npx hardhat run scripts/deploy.js --network mumbai"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "sqlite3": "^5.1.6",
    "sqlite": "^5.1.1",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "uuid": "^9.0.1",
    "socket.io": "^4.6.2",
    "pm2": "^5.3.0",
    "stripe": "^14.12.0",
    "elevenlabs-node": "^1.0.0",
    "multer": "^1.4.5-lts.1",
    "ethers": "^6.9.0",
    "form-data": "^4.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "hardhat": "^2.19.4",
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@openzeppelin/contracts": "^5.0.1"
  }
}
```

---

## 🧠 PROMPT MAESTRO PARA Z.AI

Copia y pega esto en Z.ai como tu prompt principal:

---

```
Eres un desarrollador backend senior experto en Node.js. 
Vas a construir "Geo AI System v3.0" — una plataforma autónoma que 
genera aplicaciones web completas usando inteligencia artificial.

## LO QUE HACE GEO

1. El usuario escribe una idea en el dashboard (ej: "app tipo Trello con login")
2. Geo llama a OpenRouter (Mixtral) para diseñar la arquitectura
3. Luego llama a Groq (llama3-70b) para generar el código completo (frontend HTML/CSS/JS + backend Express)
4. Geo instala los archivos en /apps/[nombre-app]/
5. Lanza el backend automáticamente con PM2
6. El usuario puede ver la app funcionando en vivo desde el dashboard
7. El dashboard muestra monitoreo en tiempo real (CPU, memoria, requests) vía Socket.io
8. El usuario puede controlar Geo con VOZ: dice "crea una app de notas" y Geo lo hace
9. La respuesta de voz viene de ElevenLabs (TTS)
10. El sistema puede escalar apps automáticamente según carga de CPU

## ESTRUCTURA DE MÓDULOS A CREAR

### modules/ai/index.js
Exporta tres funciones async:
- runOpenRouter(prompt) → llama a https://openrouter.ai/api/v1/chat/completions con model "mistralai/mixtral-8x7b"
- runGroq(prompt) → llama a https://api.groq.com/openai/v1/chat/completions con model "llama3-70b-8192"  
- runDeepSeek(prompt) → puede usar OpenRouter con model "deepseek/deepseek-chat"
Todas retornan string con la respuesta.

### modules/database/sqlite.js
- initializeDatabase() → crea tablas: users, apps, tenants, marketplace_listings, marketplace_purchases
- getDatabase() → retorna instancia SQLite abierta

Schema mínimo de tablas:
```sql
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT,
  subdomain TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT DEFAULT 'user',
  tenant_id TEXT,
  stripe_customer_id TEXT,
  eth_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS apps (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'running',
  port INTEGER,
  tenant_id TEXT,
  metrics TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### modules/auth/index.js
- Middleware JWT: verifica Bearer token en headers
- POST /api/auth/register → crea user con bcrypt hash
- POST /api/auth/login → verifica password, retorna JWT
- Exporta authMiddleware y authRouter

### modules/generator/index.js
FUNCIÓN PRINCIPAL: createAppFromIdea(idea, port)
1. Llama a runOpenRouter con este prompt exacto:
   "Eres un arquitecto de software. Diseña una app fullstack basada en: [idea].
   Retorna SOLO JSON válido con estructura:
   { name: 'kebab-case', frontend: { 'index.html': '...', 'style.css': '...', 'script.js': '...' }, backend: { 'server.js': '...', 'routes.js': '...', 'db.json': '{}' } }
   El backend usa Express en puerto [port]. El frontend hace fetch a http://localhost:[port]"
2. Parsea el JSON de la respuesta (busca el bloque {} con regex)
3. Crea carpetas: /apps/[name]/frontend/ y /apps/[name]/backend/
4. Escribe todos los archivos
5. Lanza PM2: pm2.start({ script: 'server.js', cwd: backendPath, name: appName })
6. Guarda en SQLite: INSERT INTO apps...
7. Guarda en memory.json como plantilla

### modules/monitoring/index.js
- collectAppMetrics(appName) → retorna { cpu, memory, requestsPerMinute, status, logs[] }
- setupWebSocket(io) → maneja eventos 'subscribe-app' y 'unsubscribe-app'
- broadcastMetrics() → emite 'app-metrics' a todos los clientes suscritos cada 5s

### modules/scaling/index.js
- autoScaleCheck() → revisa CPU de cada app; si >80% escala instancias PM2, si <20% las reduce
- Umbrales: SCALE_UP=80%, SCALE_DOWN=20%, MAX=5 instancias, MIN=1

### modules/payments/index.js
- Stripe checkout session para suscripciones
- Webhook para activar plan tras pago
- Portal de billing
- POST /api/payments/subscribe
- POST /api/payments/portal  
- POST /api/payments/webhook

### modules/voice/index.js
- POST /api/voice/tts: recibe { text }, llama ElevenLabs, retorna audio base64
- POST /api/voice/command: recibe { transcript }, llama runDeepSeek para interpretar, retorna { text, audio }

### server.js principal
```javascript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
// ... imports de módulos

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// Middlewares, rutas, WebSocket
// setupWebSocket(io)
// startGeo() → inicia DB, PM2, Socket, Express
```

## DASHBOARD (public/dashboard.html)

UI moderna dark theme con:
- Input de texto + botón "✨ Crear App" 
- Grid de apps instaladas con botones: Abrir | Monitorear | Deploy | Eliminar
- Panel lateral de monitoreo (CPU gauge, memoria, requests, logs en vivo)
- Botón flotante de micrófono (🎤) para asistente de voz
- Socket.io cliente para recibir métricas en tiempo real
- Login modal si no hay JWT en localStorage

Usa esta paleta: fondo #0f172a, cards #1e293b, acento #3b82f6, verde #10b981, rojo #ef4444
Fuentes: 'JetBrains Mono' para código, 'Inter' para UI

## FLUJO DE AUTONOMÍA CONTROLADA (opcional, activar manualmente)

```javascript
async function controlledAutonomy(maxCycles = 3) {
  for (let i = 0; i < maxCycles; i++) {
    const decision = await runDeepSeek(`
      Eres el cerebro de Geo. Basándote en las apps existentes, decide:
      - "CREATE: [idea]" para crear algo nuevo útil
      - "STOP" si no hay nada valioso que hacer
    `);
    if (decision.includes('STOP')) break;
    if (decision.startsWith('CREATE:')) {
      const idea = decision.replace('CREATE:', '').trim();
      await createAppFromIdea(idea, getNextPort());
    }
    await sleep(10000); // esperar 10s entre ciclos
  }
}
```

## CONTRATO NFT (v4, opcional)

Solidity ERC-721 en contracts/GeoLicenseNFT.sol:
- mintLicense(address to, string appId, string metadataURI, bool transferable)
- Licencias transferibles opcionales
- Metadata subida a IPFS via Pinata antes de mintear
- Deploy con Hardhat en Polygon Mumbai (testnet) o Mainnet

## REGLAS IMPORTANTES

1. Usa ESModules (`import/export`), NO CommonJS
2. Todas las funciones async/await con try/catch
3. Los errores siempre loguean con console.error y retornan JSON { error: '...' }
4. PM2 se usa para lanzar los backends de las apps generadas (no el server principal)
5. El server principal puede correr con `node server.js` o PM2
6. SQLite se abre una sola vez y se reutiliza con un singleton
7. JWT expira en '7d'
8. Nunca hardcodear API keys — siempre de process.env

## ORDEN DE CONSTRUCCIÓN RECOMENDADO

1. package.json + .env.example
2. modules/database/sqlite.js (schemas)
3. modules/ai/index.js (los 3 modelos)
4. modules/auth/index.js
5. modules/generator/index.js ← CORAZÓN del sistema
6. modules/monitoring/index.js
7. modules/scaling/index.js  
8. modules/payments/index.js
9. modules/voice/index.js
10. server.js (integra todo)
11. public/dashboard.html (UI completa)
12. scripts/setup-tenants.js (seed inicial)
13. contracts/GeoLicenseNFT.sol (opcional)

## ENTREGABLE ESPERADO

Código fuente completo y funcional de todos los archivos anteriores.
Debe poder ejecutarse con:
  npm install
  node scripts/setup-tenants.js
  npm start
Y abrir http://localhost:3000 para ver el dashboard.
```

---

## 🚀 INSTRUCCIONES ADICIONALES PARA Z.AI

Después del prompt anterior, si Z.ai te pide aclaraciones, responde:

**Sobre el generador de código:**
> "El generador llama a OpenRouter para planificar y a Groq para generar el código. El JSON resultante se parsea con regex `/{[\s\S]*}/` y se escriben los archivos con `fs.writeFile`. Si el JSON falla, se reintenta con un prompt más simple."

**Sobre PM2:**
> "PM2 se importa como módulo npm (`import pm2 from 'pm2'`). Usar `pm2.connect()` antes de cada operación. Los backends de las apps generadas se lanzan con `pm2.start({ script, name, cwd, instances: 1, exec_mode: 'fork' })`."

**Sobre el dashboard:**
> "El dashboard debe ser una sola página HTML con Socket.io client importado desde `/socket.io/socket.io.js` (lo sirve socket.io automáticamente). El JWT se guarda en localStorage como `geo_token`."

**Sobre ElevenLabs:**
> "Usar voice ID `21m00Tcm4TlvDq8ikWAM` (Rachel) por defecto. La respuesta es un arraybuffer que se convierte a base64 para enviar al frontend. El frontend crea un `Audio` object con `data:audio/mp3;base64,...`."

---

## 🔥 RESUMEN DE LO QUE HACE GEO (para explicar a cualquiera)

| Qué hace | Cómo lo hace |
|----------|-------------|
| Genera apps completas desde una idea | OpenRouter planifica → Groq codifica |
| Las lanza automáticamente | PM2 process manager |
| Aprende de lo que ya creó | memory.json con plantillas reutilizables |
| Monitorea en tiempo real | Socket.io + métricas de CPU/RAM/requests |
| Se escala solo según carga | PM2 cluster + autoScaler loop |
| Acepta comandos de voz | Web Speech API + ElevenLabs TTS |
| Cobra por acceso | Stripe checkout + subscriptions |
| Vende apps entre usuarios | Marketplace interno (v4) |
| Protege licencias | NFT ERC-721 en Polygon (v4) |
| Actúa de forma autónoma | Loop controlado: decide → crea → evalúa |

---

## ⚠️ ERRORES CONOCIDOS Y SOLUCIONES

| Problema | Solución |
|----------|----------|
| Groq devuelve texto fuera del JSON | Parsear con regex `/{[\s\S]*}/` |
| PM2 no encuentra el script | Usar paths absolutos con `path.resolve()` |
| Socket.io CORS error | `cors: { origin: '*' }` en Server config |
| SQLite WAL mode | Activar con `PRAGMA journal_mode=WAL` |
| ElevenLabs arraybuffer | `Buffer.from(response.data).toString('base64')` |
| JWT expired en frontend | Interceptar 401 y redirigir a login |

---

*Documento generado para Guillaume — Geo AI System v3/v4*  
*Stack: Node.js · Express · SQLite · Socket.io · PM2 · OpenRouter · Groq · ElevenLabs · Stripe · Polygon*
