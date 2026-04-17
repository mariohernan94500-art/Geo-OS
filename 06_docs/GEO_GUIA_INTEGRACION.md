# 🔧 GUÍA DE INTEGRACIÓN — Archivos Nuevos

## 1. SalesAgent.ts
**Copiar a:** `Geotrouvetout/src/agent/agents/SalesAgent.ts`

**Luego en GeoCore.ts**, agregar:
```typescript
// Después de la línea: import { warroomAgent } from '../agents/WarRoomAgent.js';
import { salesAgent } from '../agents/SalesAgent.js';

// Cambiar la línea de agentes activos:
const agentesActivos = [ comercioAgent, warroomAgent, salesAgent ];
```

## 2. publicChat.ts
**Copiar a:** `Geotrouvetout/src/api/publicChat.ts`

**Luego en server.ts**, agregar al final (antes de arrancarServidorApi):
```typescript
// Después de la línea: import { peticionGeoCore } from '../agent/core/GeoCore.js';
import { montarChatPublico } from './publicChat.js';

// Justo antes del cierre de arrancarServidorApi, agregar:
montarChatPublico(app);
```

## 3. ChatWidget.tsx
**Copiar a:** `EcoOrigen_Web/src/components/ChatWidget.tsx`

**Luego en App.tsx**, agregar:
```typescript
// Al inicio, con los imports:
import { ChatWidget } from './components/ChatWidget';

// Dentro del return de App(), después de </Routes>:
function App() {
  return (
    <>
      <Routes>
        {/* ... rutas existentes ... */}
      </Routes>
      <ChatWidget />
    </>
  );
}
```

## 4. VitraTienda_FIXED.tsx
**Reemplazar:** `EcoOrigen_Web/src/pages/vitra/VitraTienda.tsx`

## 5. VitraMascotas.tsx
**Copiar a:** `EcoOrigen_Web/src/pages/vitra/VitraMascotas.tsx`

## 6. App_UPDATED.tsx
**Reemplazar:** `EcoOrigen_Web/src/App.tsx`
(Ya incluye import de ChatWidget y ruta /vitra/mascotas)

## 7. VitraHeader_UPDATED.tsx
**Reemplazar:** `EcoOrigen_Web/src/components/vitra/VitraHeader.tsx`

## 8. .env — Agregar estas variables:
```
# En Geotrouvetout/.env (si no existen):
SHOPIFY_ADMIN_API_TOKEN=tu_nuevo_token    # REVOCAR EL ANTERIOR
SHOPIFY_STORE_DOMAIN=ecoorigenchile.myshopify.com

# En EcoOrigen_Web/.env:
VITE_SHOPIFY_STORE=ecoorigenchile.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=tu_nuevo_storefront_token
VITE_GEOCORE_API_URL=https://agent.ecoorigenchile.com
```

## 9. Actualizar número WhatsApp REAL en:
- VitraHeader.tsx (línea 4)
- VitraContacto.tsx (línea 6)
- VitraMascotas.tsx (línea 7)
- VitraFooter.tsx (línea 33)
- SalesAgent.ts (línea CONTACTO del catálogo)

## Orden de deploy:
1. Aplicar todos los cambios localmente
2. `cd EcoOrigen_Web && npm run build`
3. Ejecutar `subir_al_vps.bat` (con IP real)
4. SSH al VPS: `bash /var/www/geoos/deploy_hostinger.sh`
5. Verificar: https://ecoorigenchile.com + https://agent.ecoorigenchile.com/api/public/health
