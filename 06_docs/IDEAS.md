# 💡 IDEAS — Geo: Creador de Aplicaciones Personalizadas

> **Documento vivo.** Aquí se registran ideas, decisiones estratégicas y conceptos que luego se formalizan en documentos de diseño, planes de ejecución o código.
> Última actualización: 2026-04-23

---

## 🎯 Visión Principal

**Geo se convierte en un Creador de Aplicaciones Completas, Funcionales y Personalizadas para el Usuario.**

La idea central es que Geo permita a un usuario (o grupo cerrado de usuarios autorizados) describir la app que quiere, y Geo la construye, la publica y la mantiene. **No es una tienda ni un marketplace de apps.** Es una herramienta de creación y entrega privada.

---

## 🚨 PRIORIDAD MÁXIMA — Deadline: 29 de Abril

> **El 29 de Abril se paga el registro de Google Play Store ($25 USD).**
> Para esa fecha, la app debe estar lista para ingresar a la Play Store de Android.

### Lo que necesita estar listo para el 29:
- [ ] App funcional compilada (APK / AAB firmado)
- [ ] Nombre, ícono y descripción lista para la Play Store
- [ ] Cuenta de Google Play Console activa (pago $25)
- [ ] Al menos una función CORE demostrable
- [ ] Screenshots y assets para la listing de la Play Store

---

## 🔄 Cambio de Prioridades en Geo

**Antes:** Infraestructura, agentes, seguridad, VPS, orquestación.

**Ahora (nueva prioridad en orden):**

1. 🥇 **La Aplicación** — Lo más importante. Funcional, publicable, que genere ingresos.
2. 🥈 **Play Store** — Presencia real en el mercado Android.
3. 🥉 **Revenue** — Modelo de monetización activo desde el día 1.
4. ⚙️ Infraestructura/Agentes — Como soporte, no como fin.

---

## 🏗️ Qué es Geo App Creator

### Concepto

Geo es una aplicación móvil (Android primero) que actúa como un **asistente inteligente de creación de apps**. El usuario describe lo que quiere (en lenguaje natural, voz, o formulario), y Geo:

1. **Genera la app** — interfaz, lógica, base de datos local/nube.
2. **Personaliza** — colores, nombre, ícono, funciones específicas del usuario.
3. **Instala / entrega** — la app queda disponible para el usuario en su dispositivo.
4. **Mantiene** — actualizaciones, correcciones, nuevas funciones a pedido.

### Diferencial clave

- **No es para intercambiar apps entre usuarios** — es una herramienta de creación PERSONAL.
- El usuario es el dueño de su app.
- Geo no es un marketplace, es un **taller de apps a pedido**.
- Orientado al usuario individual o pequeño grupo privado (familia, equipo, comunidad).

---

## 💰 Modelo de Monetización

> El objetivo es **ganar dinero desde el primer día en la Play Store.**

### Opciones a evaluar:
1. **Suscripción mensual** — acceso al creador de apps (ej: $4.99/mes, $9.99/mes premium)
2. **Pago por app** — el usuario paga por cada app que Geo le crea (ej: $2.99 por app)
3. **Freemium** — crear 1 app gratis, pagar por más o por funciones avanzadas
4. **One-time payment** — acceso de por vida (ej: $19.99)

### Recomendación inicial:
**Freemium + Suscripción.** Una app gratuita con funciones básicas, y plan premium para apps más complejas o ilimitadas.

---

## 📱 Flujo del Usuario (MVP)

```
1. Usuario abre Geo
2. Toca "Crear nueva app"
3. Describe qué quiere: "Una app para rastrear mis gastos diarios"
4. Geo genera la app (nombre, ícono, interfaz, funciones)
5. Preview de la app generada
6. Usuario confirma → App instalada en su dispositivo
7. El usuario la usa como cualquier otra app
8. Puede volver a Geo para editarla, agregar funciones o crear otra
```

---

## 🧩 Funciones CORE para MVP (Play Store)

| Función | Descripción | Prioridad |
|---------|-------------|-----------|
| Creador por prompt | Descripción en texto → App generada | 🔴 Crítico |
| Templates base | 10-15 tipos de apps listas para personalizar | 🔴 Crítico |
| Personalización visual | Colores, nombre, ícono | 🔴 Crítico |
| Instalación directa | La app queda en el dispositivo | 🔴 Crítico |
| Gestión de mis apps | Ver, editar, eliminar apps creadas | 🟡 Importante |
| Modo voz | Describir la app con voz | 🟢 Deseable |
| Nube / Sync | Respaldar apps en la nube | 🟢 Deseable |
| Monetización in-app | Sistema de pago integrado | 🟡 Importante |

---

## 📦 Templates de Apps Sugeridas para v1

Tipos de apps que Geo puede crear para el usuario:

- 📊 Rastreador de gastos / finanzas personales
- 📝 Notas y listas de tareas
- 🏋️ Rutinas de ejercicio
- 🍽️ Recetario personal
- 📅 Agenda / calendario personal
- 🧘 Hábitos y metas diarias
- 📦 Inventario del hogar
- 🐾 Cuidado de mascotas
- 💊 Recordatorio de medicamentos
- 📚 Biblioteca personal (libros, películas, series)

---

## 🛠️ Stack Técnico Propuesto

| Capa | Tecnología | Razón |
|------|-----------|-------|
| App móvil | **React Native / Expo** | Ya en uso en Geo, compilable a APK/AAB |
| Backend / IA | **GeoCore (Node.js)** | Orquestador existente |
| IA generativa | **Gemini API** | Generación de lógica de apps |
| Base de datos local | **SQLite / MMKV** | Apps rápidas y offline-first |
| Auth | **Firebase Auth** | Simple, escalable |
| Pagos | **Google Play Billing** | Obligatorio para Play Store |
| Cloud storage | **Firebase / Supabase** | Backup de apps del usuario |

---

## 📋 Documentos a Crear desde IDEAS

Estos documentos se derivarán de esta hoja de ideas:

- [ ] `GEO_APP_CREATOR_MVP.md` — Especificación técnica del MVP
- [ ] `GEO_PLAYSTORE_CHECKLIST.md` — Todo lo que necesitamos para el 29
- [ ] `GEO_MONETIZACION.md` — Modelo de negocio detallado
- [ ] `GEO_ROADMAP_Q2_2026.md` — Hoja de ruta Q2 2026
- [ ] `GEO_TEMPLATES_SPEC.md` — Especificación de templates de apps

---

## 🗓️ Timeline Comprimido (hacia el 29 de Abril)

```
Hoy (23 Abr)   → Definición final del MVP, priorización
24-25 Abr      → Construcción del flujo principal (creador + templates)
26-27 Abr      → Integración IA + personalización
28 Abr         → APK firmado, testing en dispositivo real
29 Abr         → PAGO Google Play Console + Subida de la app
```

---

## 💬 Notas del Usuario

> *"la idea no es un creador de app para intercambiar. sino que solo permita crear apps para el usuario"*

> *"Voy a pagar los 25mil para appstore el 29. en esa fecha debemos tener la app lista para ingresarla a la appstore de android."*

> *"las prioridades de Geo deben cambiar! la aplicacion es lo mas importante!"*

> *"tener algo funcional, que esté en la appstore de Android y que ganemos plata de ella."*

---

*Este documento es el punto de partida. Cada sección puede convertirse en un documento propio cuando esté suficientemente definida.*
