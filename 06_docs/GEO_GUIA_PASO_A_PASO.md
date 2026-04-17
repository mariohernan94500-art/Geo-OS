# 🔧 GUÍA DE IMPLEMENTACIÓN PASO A PASO
## Todo lo que construimos — en orden exacto

---

## ANTES DE EMPEZAR

Abre tu carpeta de proyecto. Deberías tener esta estructura:
```
Proyecto/
├── Geotrouvetout/        ← Backend (GeoCore, agentes, API, Telegram)
│   └── src/
│       ├── agent/
│       │   ├── agents/   ← AQUÍ van los agentes
│       │   ├── core/     ← AQUÍ va GeoCore
│       │   └── ...
│       ├── api/          ← AQUÍ va publicChat
│       └── ...
├── EcoOrigen_Web/        ← Frontend (sitio web React)
│   └── src/
│       ├── components/   ← AQUÍ va ChatWidget y VitraHeader
│       ├── pages/vitra/  ← AQUÍ van las páginas
│       └── App.tsx
└── ...
```

Y tu carpeta de archivos creados por Claude (la que guardaste).

---

## PARTE 1: BACKEND — Agentes (Geotrouvetout)

### Paso 1: Abrir la carpeta de agentes
```
Navega a: Geotrouvetout/src/agent/agents/
```
Ahí deberías ver:
- BaseAgent.ts
- CommerceAgent.ts
- WarRoomAgent.ts

### Paso 2: REEMPLAZAR BaseAgent.ts
- Abre `BaseAgent.ts` en tu editor
- Selecciona TODO el contenido (Ctrl+A)
- Borra todo
- Abre el archivo `BaseAgent_FIXED.ts` que te entregué
- Copia TODO su contenido
- Pega en BaseAgent.ts
- Guarda (Ctrl+S)

**Qué cambió:** Modelo de llama-3.1-8b → llama-3.3-70b. Mock data eliminado.

### Paso 3: REEMPLAZAR CommerceAgent.ts
- Mismo proceso: abre CommerceAgent.ts
- Reemplaza TODO con el contenido de `CommerceAgent_IMPROVED.ts`
- Guarda

### Paso 4: REEMPLAZAR WarRoomAgent.ts
- Mismo proceso con `WarRoomAgent_IMPROVED.ts`
- Guarda

### Paso 5: CREAR los 8 agentes nuevos
Crea estos archivos NUEVOS en `Geotrouvetout/src/agent/agents/`:

**5a. SalesAgent.ts**
- Crea archivo nuevo: `SalesAgent.ts`
- Copia el contenido de `SalesAgent.ts` que te entregué
- Guarda

**5b. SentinelAgent.ts**
- Crea archivo nuevo: `SentinelAgent.ts`
- Copia el contenido de `SentinelAgent.ts`
- Guarda

**5c. FirewallAgent.ts**
- Crea archivo nuevo: `FirewallAgent.ts`
- Copia el contenido de `FirewallAgent.ts`
- Guarda

**5d. OpportunityAgent.ts**
- Crea archivo nuevo: `OpportunityAgent.ts`
- Abre `AgentesEstrategicos_IMPL.ts`
- Copia SOLO la sección de OpportunityAgent (desde el comentario hasta `export const opportunityAgent`)
- Pega en el nuevo archivo
- Guarda

**5e. LegalAgent.ts**
- Crea archivo nuevo: `LegalAgent.ts`
- Del mismo `AgentesEstrategicos_IMPL.ts`, copia la sección de LegalAgent
- Guarda

**5f. AccountantAgent.ts**
- Crea archivo nuevo: `AccountantAgent.ts`
- Copia la sección de AccountantAgent del mismo archivo
- Guarda

**5g. MediaAgent.ts**
- Crea archivo nuevo: `MediaAgent.ts`
- Abre `AgentesVidaDiaria_IMPL.ts`
- Copia la sección de MediaAgent
- Guarda

**5h. ContextAgent.ts**
- Crea: `ContextAgent.ts`
- Copia sección ContextAgent de AgentesVidaDiaria_IMPL.ts
- Guarda

**5i. HealthAgent.ts**
- Crea: `HealthAgent.ts`
- Copia sección HealthAgent
- Guarda

**5j. ShopperAgent.ts**
- Crea: `ShopperAgent.ts`
- Copia sección ShopperAgent
- Guarda

### Verificación Paso 5:
Tu carpeta `agents/` ahora debe tener estos 11 archivos:
```
Geotrouvetout/src/agent/agents/
├── BaseAgent.ts          ← REEMPLAZADO
├── CommerceAgent.ts      ← REEMPLAZADO
├── WarRoomAgent.ts       ← REEMPLAZADO
├── SalesAgent.ts         ← NUEVO
├── SentinelAgent.ts      ← NUEVO
├── FirewallAgent.ts      ← NUEVO
├── OpportunityAgent.ts   ← NUEVO
├── LegalAgent.ts         ← NUEVO
├── AccountantAgent.ts    ← NUEVO
├── MediaAgent.ts         ← NUEVO
├── ContextAgent.ts       ← NUEVO
├── HealthAgent.ts        ← NUEVO
└── ShopperAgent.ts       ← NUEVO
```

---

## PARTE 2: BACKEND — GeoCore (el cerebro)

### Paso 6: REEMPLAZAR GeoCore.ts
```
Navega a: Geotrouvetout/src/agent/core/GeoCore.ts
```
- Abre GeoCore.ts
- Reemplaza TODO con el contenido de `GeoCore_IMPROVED.ts`
- Guarda

**IMPORTANTE:** GeoCore_IMPROVED.ts solo importa 3 agentes (Commerce, WarRoom, Sales).
Necesitas agregar los demás. Abre GeoCore.ts y busca esta sección al inicio:

```typescript
import { comercioAgent } from '../agents/CommerceAgent.js';
import { warroomAgent } from '../agents/WarRoomAgent.js';
import { salesAgent } from '../agents/SalesAgent.js';
```

Cambia esas líneas por TODAS estas:
```typescript
import { comercioAgent } from '../agents/CommerceAgent.js';
import { warroomAgent } from '../agents/WarRoomAgent.js';
import { salesAgent } from '../agents/SalesAgent.js';
import { sentinelAgent } from '../agents/SentinelAgent.js';
import { firewallAgent } from '../agents/FirewallAgent.js';
import { opportunityAgent } from '../agents/OpportunityAgent.js';
import { legalAgent } from '../agents/LegalAgent.js';
import { accountantAgent } from '../agents/AccountantAgent.js';
import { mediaAgent } from '../agents/MediaAgent.js';
import { contextAgent } from '../agents/ContextAgent.js';
import { healthAgent } from '../agents/HealthAgent.js';
import { shopperAgent } from '../agents/ShopperAgent.js';
```

Y busca la línea:
```typescript
const agentesActivos = [ comercioAgent, warroomAgent, salesAgent ];
```

Reemplázala por:
```typescript
const agentesActivos = [
    comercioAgent,
    warroomAgent,
    salesAgent,
    sentinelAgent,
    firewallAgent,
    opportunityAgent,
    legalAgent,
    accountantAgent,
    mediaAgent,
    contextAgent,
    healthAgent,
    shopperAgent,
];
```

Guarda.

---

## PARTE 3: BACKEND — Endpoint público + Firewall

### Paso 7: CREAR publicChat.ts
```
Navega a: Geotrouvetout/src/api/
```
- Crea archivo nuevo: `publicChat.ts`
- Copia el contenido de `publicChat.ts` que te entregué
- Guarda

### Paso 8: MODIFICAR server.ts
```
Abre: Geotrouvetout/src/api/server.ts
```

**8a.** Busca esta línea cerca del inicio (después de los imports):
```typescript
import { peticionGeoCore } from '../agent/core/GeoCore.js';
```
Agrega DEBAJO:
```typescript
import { montarChatPublico } from './publicChat.js';
import { firewallMiddleware } from '../agent/agents/FirewallAgent.js';
```

**8b.** Busca esta línea:
```typescript
app.use(express.json());
```
Agrega DEBAJO:
```typescript
// Firewall — protección contra ataques externos
app.use(firewallMiddleware);
```

**8c.** Busca la función `arrancarServidorApi` al final del archivo. Dentro de ella, busca:
```typescript
app.listen(Number(PORT), '0.0.0.0', () => {
```
Agrega ANTES de esa línea:
```typescript
    // Chat público para el widget web (sin JWT)
    montarChatPublico(app);
```

Guarda.

---

## PARTE 4: BACKEND — Modos de Telegram (nuevos)

### Paso 9: MODIFICAR telegram.ts
```
Abre: Geotrouvetout/src/bot/telegram.ts
```

**9a.** Busca los comandos de modo existentes (están juntos):
```typescript
botServidor.command('modo_geo', ...
botServidor.command('modo_comercio', ...
botServidor.command('modo_warroom', ...
botServidor.command('modo_productividad', ...
```

Agrega DEBAJO de esos 4 comandos:
```typescript
botServidor.command('modo_seguridad', async (ctx) => { userModes.set(ctx.from!.id.toString(), 'geo'); await ctx.reply('✅ Modo *SEGURIDAD* activado. Usa: "escaneo sentinel" o "reporte firewall"', { parse_mode: 'Markdown' }); });
botServidor.command('modo_salud', async (ctx) => { userModes.set(ctx.from!.id.toString(), 'productividad'); await ctx.reply('✅ Modo *SALUD* activado. Cuéntame sobre ejercicio, comida o sueño.', { parse_mode: 'Markdown' }); });
botServidor.command('modo_compras', async (ctx) => { userModes.set(ctx.from!.id.toString(), 'geo'); await ctx.reply('✅ Modo *COMPRAS* activado. Dime qué necesitas comprar.', { parse_mode: 'Markdown' }); });
botServidor.command('modo_media', async (ctx) => { userModes.set(ctx.from!.id.toString(), 'comercio'); await ctx.reply('✅ Modo *MEDIA* activado. ¿Post IG, copy, SEO?', { parse_mode: 'Markdown' }); });
```

**9b.** Busca el comando /start y actualiza el texto de ayuda. Busca la línea que dice:
```typescript
`/modo_productividad — Tareas / Voren\n` +
```
Agrega después:
```typescript
`/modo_seguridad — Escaneo y protección\n` +
`/modo_salud — Ejercicio y bienestar\n` +
`/modo_compras — Precios y listas\n` +
`/modo_media — Contenido y redes\n` +
```

Guarda.

---

## PARTE 5: FRONTEND — Sitio web (EcoOrigen_Web)

### Paso 10: FIX CRÍTICO — VitraTienda.tsx (token expuesto)
```
Navega a: EcoOrigen_Web/src/pages/vitra/VitraTienda.tsx
```
- Abre el archivo
- Reemplaza TODO con el contenido de `VitraTienda_FIXED.tsx`
- Guarda

**ESTO ES URGENTE — el token de Shopify está expuesto en el código actual.**

### Paso 11: CREAR VitraMascotas.tsx (página nueva)
```
Navega a: EcoOrigen_Web/src/pages/vitra/
```
- Crea archivo nuevo: `VitraMascotas.tsx`
- Copia el contenido de `VitraMascotas.tsx` que te entregué
- Guarda

### Paso 12: REEMPLAZAR App.tsx
```
Navega a: EcoOrigen_Web/src/App.tsx
```
- Reemplaza TODO con el contenido de `App_UPDATED.tsx`
- Guarda

### Paso 13: REEMPLAZAR VitraHeader.tsx
```
Navega a: EcoOrigen_Web/src/components/vitra/VitraHeader.tsx
```
- Reemplaza TODO con `VitraHeader_UPDATED.tsx`
- Guarda

### Paso 14: CREAR ChatWidget.tsx
```
Navega a: EcoOrigen_Web/src/components/
```
- Crea archivo nuevo: `ChatWidget.tsx`
- Copia el contenido de `ChatWidget.tsx`
- Guarda

### Paso 15: AGREGAR ChatWidget a App.tsx
Abre `EcoOrigen_Web/src/App.tsx` (el que acabas de reemplazar).

Busca al inicio los imports y agrega:
```typescript
import { ChatWidget } from './components/ChatWidget';
```

Busca la función App() al final y cámbiala a:
```typescript
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<EcoOrigenHome />} />
        <Route path="/vitra" element={<VitraLanding />} />
        <Route path="/vitra/tienda" element={<VitraTienda />} />
        <Route path="/vitra/mascotas" element={<VitraMascotas />} />
        <Route path="/vitra/como-se-hace" element={<VitraComoSeHace />} />
        <Route path="/vitra/sobre" element={<VitraSobre />} />
        <Route path="/vitra/contacto" element={<VitraContacto />} />
      </Routes>
      <ChatWidget />
    </>
  );
}
```
Guarda.

---

## PARTE 6: CONFIGURACIÓN

### Paso 16: Actualizar número de WhatsApp
Abre estos archivos y busca `56900000000` o `56912345678`. Cámbialo por tu número REAL:

- EcoOrigen_Web/src/components/vitra/VitraHeader.tsx (línea ~4)
- EcoOrigen_Web/src/pages/vitra/VitraContacto.tsx (línea ~6)
- EcoOrigen_Web/src/pages/vitra/VitraMascotas.tsx (línea ~7)
- EcoOrigen_Web/src/components/vitra/VitraFooter.tsx (línea ~33)

### Paso 17: Crear/verificar .env de EcoOrigen_Web
```
Navega a: EcoOrigen_Web/
```
Si no existe `.env`, créalo. Contenido:
```
VITE_SHOPIFY_STORE=ecoorigenchile.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=TU_NUEVO_TOKEN_AQUI
VITE_GEOCORE_API_URL=https://agent.ecoorigenchile.com
```

### Paso 18: Verificar .env de Geotrouvetout
```
Navega a: Geotrouvetout/
```
Verifica que tu `.env` tenga:
```
# Los que ya tienes...
TELEGRAM_BOT_TOKEN=tu_token
GROQ_API_KEY=tu_key
# etc...

# AGREGAR si no están:
SHOPIFY_STORE_DOMAIN=ecoorigenchile.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=tu_nuevo_admin_token
USD_TO_CLP=950
```

---

## PARTE 7: PROBAR LOCALMENTE

### Paso 19: Probar el backend
```bash
cd Geotrouvetout
npm run dev
```
Deberías ver:
```
🦾 Geo OS v1 — Iniciando ecosistema...
✅ SQLite operativo
🌐 [API] Escuchando en http://0.0.0.0:3000
💬 [PublicChat] Endpoint público montado en /api/public/chat
```

Si hay errores de import → revisa que los nombres de archivo coincidan exactamente.

### Paso 20: Probar el endpoint público
En tu navegador o con curl:
```
http://localhost:3000/api/public/health
```
Debería responder: `{"status":"ok","agent":"SalesAgent","sessions":0}`

### Paso 21: Probar el frontend
```bash
cd EcoOrigen_Web
npm run dev
```
Abre en el navegador. Verifica:
- La burbuja 💬 aparece abajo a la derecha
- El menú tiene "🐾 Mascotas" en dorado
- /vitra/mascotas muestra la página nueva

---

## PARTE 8: SHOPIFY — TOKEN (URGENTE)

### Paso 22: Rotar el token expuesto
1. Entra a tu admin de Shopify
2. Ve a Configuración → Aplicaciones y canales de venta
3. Busca el canal/app que usa el token `SHOPIFY_TOKEN_REMOVED`
4. REVOCA ese token
5. Genera uno NUEVO (Storefront Access Token)
6. Copia el nuevo token
7. Pégalo en `EcoOrigen_Web/.env` → VITE_SHOPIFY_STOREFRONT_TOKEN
8. Si tienes Admin API token, pégalo en `Geotrouvetout/.env` → SHOPIFY_ADMIN_API_TOKEN

---

## CHECKLIST FINAL

Marca cada paso completado:

```
BACKEND (Geotrouvetout):
□ Paso 2: BaseAgent.ts reemplazado
□ Paso 3: CommerceAgent.ts reemplazado
□ Paso 4: WarRoomAgent.ts reemplazado
□ Paso 5: 10 agentes nuevos creados
□ Paso 6: GeoCore.ts reemplazado + imports actualizados
□ Paso 7: publicChat.ts creado
□ Paso 8: server.ts modificado (3 cambios)
□ Paso 9: telegram.ts modificado (nuevos modos)

FRONTEND (EcoOrigen_Web):
□ Paso 10: VitraTienda.tsx FIX (token removido)
□ Paso 11: VitraMascotas.tsx creado
□ Paso 12: App.tsx reemplazado
□ Paso 13: VitraHeader.tsx reemplazado
□ Paso 14: ChatWidget.tsx creado
□ Paso 15: ChatWidget agregado a App.tsx

CONFIG:
□ Paso 16: WhatsApp real en 4 archivos
□ Paso 17: .env EcoOrigen_Web
□ Paso 18: .env Geotrouvetout

TEST:
□ Paso 19: Backend arranca sin errores
□ Paso 20: /api/public/health responde OK
□ Paso 21: Frontend muestra burbuja + mascotas

SEGURIDAD:
□ Paso 22: Token Shopify rotado en panel Shopify
```

---

## SI ALGO FALLA

**Error: "Cannot find module '../agents/SalesAgent.js'"**
→ El archivo no existe o el nombre no coincide. Verifica que el archivo se llame exactamente `SalesAgent.ts` (mayúsculas importan).

**Error: "SHOPIFY_TOKEN is empty"**
→ Normal si no has configurado el .env aún. El sitio funciona sin Shopify, solo no muestra productos.

**Error de TypeScript al compilar**
→ Ejecuta `npm run dev` (tsx) en vez de `npm run build` (tsc) para probar. Los errores de tipo se pueden arreglar después.

**El ChatWidget no se conecta**
→ Verifica que VITE_GEOCORE_API_URL en .env apunte a tu API (localhost:3000 en local, agent.ecoorigenchile.com en producción).

---

*Guía completa — 8 Abril 2026*
*22 pasos, 12 agentes, 1 tienda lista para el 20 de Abril*
