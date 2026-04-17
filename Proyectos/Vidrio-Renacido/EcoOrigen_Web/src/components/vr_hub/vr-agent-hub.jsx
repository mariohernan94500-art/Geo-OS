import { useState, useRef, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════════
// REAL PRODUCT CATALOG - Based on actual product photos
// ══════════════════════════════════════════════════════════
const FULL_CATALOG = `
=== CATÁLOGO OFICIAL VIDRIO RENACIDO — Abril 2026 ===
Dominio: ecoorigenchile.com | Tienda online de vasos de vidrio 100% reciclado
Ubicación: Santiago, Chile | Lanzamiento: 20 de Abril 2026

LOS VASOS: Son vasos hechos a partir de botellas de vidrio recicladas (principalmente botellas de vino/cerveza verdes). Se cortan, pulen los bordes a mano, y se graban con láser de alta definición. El color verde es natural del vidrio reciclado — no es pintura. Cada vaso es único por las variaciones naturales del vidrio. Vienen en cajas de cartón kraft eco-friendly con ventana.

═══ LÍNEA 1: VASOS SIGNATURE VR (con logo VR grabado) ═══
- Vaso VR Clásico 350ml — $8.990 CLP — Vidrio verde reciclado con logo "VIDRIO RENACIDO" grabado al centro con líneas decorativas y tres puntos. Borde pulido a mano. El vaso insignia de la marca.
- Vaso VR Ámbar 350ml — $9.990 CLP — Tono ámbar natural (botellas de cerveza). Logo VR en bajo relieve.
- Set 2 Vasos VR Clásicos — $15.990 CLP — Par de vasos signature en caja kraft con ventana.
- Set 4 Vasos VR en Caja Premium — $29.990 CLP — Cuatro vasos VR en caja kraft grande con separadores. Ideal regalo.
- Vaso VR XL 500ml — $12.990 CLP — Formato grande para cerveza artesanal o agua. Logo VR grabado.

═══ LÍNEA 2: VASOS SIN GRABADO (Línea Pura) ═══
- Vaso Puro Verde 350ml — $5.990 CLP — Sin marcas ni grabados. Vidrio verde natural, minimalista.
- Vaso Puro Ámbar 350ml — $6.490 CLP — Color ámbar natural, perfecto para decoración o uso diario.
- Set 4 Vasos Puros Verde — $19.990 CLP — Para uso diario, en caja kraft.
- Set 6 Vasos Puros Mixtos — $32.990 CLP — 3 verdes + 3 ámbar en caja grande.

═══ LÍNEA 3: VASOS CON NOMBRES Y FRASES ═══
- Vaso Personalizado con Nombre — $12.990 CLP — Grabado láser del nombre que elijas en tipografía script elegante (como los de "Bruno" y "José" de nuestras fotos). Hasta 15 caracteres.
- Vaso con Frase Personalizada — $14.990 CLP — Frase libre hasta 40 caracteres. Tipografía a elección.
- Vaso "Mamá y Papá" — $12.990 CLP — Diseño especial con ornamentos vintage. Popular como regalo del Día de la Madre/Padre.
- Set 2 Vasos con Nombres (Pareja) — $22.990 CLP — Cada vaso con un nombre diferente en caja para dos.

═══ LÍNEA 4: RETRATO DE MASCOTA 🐾 (CATEGORÍA ESTRELLA) ═══
Esta es nuestra línea premium y más especial. El cliente envía una foto de su mascota por WhatsApp, nosotros creamos un retrato artístico digital, el cliente lo aprueba antes de grabar, y luego lo grabamos en el vaso con láser de alta definición.

- Vaso Retrato de Mascota Individual — $18.990 CLP — Un vaso con el retrato de tu mascota + nombre + frase corta (ej: "Bruno · Golden Retriever · 8 años · Mi compañero fiel"). Aprobación previa del diseño incluida.
- Vaso Mascota + Dueño — $21.990 CLP — Foto de la mascota con su dueño grabada (como el de "Rocky & Yo · Mejor amigo · 2024").
- Set Familiar de Mascotas (3 vasos) — $49.990 CLP — Tres vasos con diferentes mascotas o ángulos. En caja premium.
- Vaso Memorial de Mascota — $19.990 CLP — Homenaje a una mascota fallecida. Diseño con marco especial tipo "En memoria de...". Incluye estrella o alas opcionales.

Proceso Retrato de Mascota:
1. Cliente envía foto por WhatsApp (+56 9 1234 5678)
2. Creamos retrato artístico digital (1-2 días)
3. Enviamos preview para aprobación
4. Cliente aprueba → grabamos (1-2 días)
5. Envío (2-3 días en RM)
Tiempo total: 5-7 días hábiles

═══ LÍNEA 5: VASOS CON DISEÑOS ARTÍSTICOS ═══
- Vaso Montaña/Naturaleza — $13.990 CLP — Paisaje de montañas con bosque grabado (como el de nuestras fotos con cerro y araucarias).
- Vaso Huella de Patita 🐾 — $11.990 CLP — Huella de perro/gato grande grabada. Simple y emotivo.
- Vaso Escudo/Logo Custom — $15.990 CLP — Diseño heráldico o logo artístico personalizado.

═══ LÍNEA 6: VASOS CORPORATIVOS (Empresas y Pymes) ═══
- Vaso Corporativo con Logo — desde $7.990 CLP/u (mín. 20 unidades) — Logo de la empresa grabado láser. Diseño incluido.
- Vaso Corporativo Premium 500ml — desde $10.990 CLP/u (mín. 20 unidades) — Logo + eslogan en formato grande.
- Kit Welcome Pack (vaso + posavaso de vidrio) — desde $15.990 CLP/u (mín. 10 unidades) — Ideal onboarding de empleados.
- Set Ejecutivo 4 Vasos en Caja Kraft — desde $39.990 CLP/set (mín. 5 sets) — Caja premium, ideal regalo corporativo.
- Vaso Evento Corporativo 250ml — desde $5.990 CLP/u (mín. 50 unidades) — Formato económico para eventos masivos.

═══ LÍNEA 7: VASOS PARA BODAS Y EVENTOS ═══
- Vaso Boda Personalizado 250ml — desde $6.990 CLP/u (mín. 30 unidades) — Nombres de los novios + fecha + diseño nupcial.
- Vaso Boda Premium 350ml — desde $9.990 CLP/u (mín. 30 unidades) — Con cajita individual decorada para cada invitado.
- Set Brindis Novios (2 vasos especiales) — $24.990 CLP — Diseño exclusivo para la mesa principal.
- Vaso Baby Shower 250ml — desde $6.490 CLP/u (mín. 20 unidades) — Con nombre del bebé y fecha.
- Vaso Cumpleaños/Aniversario — desde $7.990 CLP/u (mín. 15 unidades) — Personalizable.

═══ INFORMACIÓN DE ENVÍO ═══
- Santiago (RM): despacho gratis en compras sobre $25.000 CLP. Bajo eso: $3.990.
- Regiones: desde $5.990 CLP según destino (Chilexpress/Starken).
- Pedidos corporativos y bodas: despacho sin costo en RM para pedidos sobre $80.000.
- Productos en stock: 2-3 días hábiles.
- Personalizados (nombres/frases): 5-7 días hábiles.
- Retratos de mascota: 5-7 días hábiles.
- Corporativos/Bodas (20+ unidades): 10-15 días hábiles.

═══ GARANTÍA Y CAMBIOS ═══
- Si llega dañado: reemplazo sin costo (enviar foto dentro de 24hrs).
- Productos sin personalización: cambio dentro de 7 días en empaque original.
- Productos personalizados: NO se aceptan devoluciones (por eso enviamos preview).

═══ MÉTODOS DE PAGO ═══
- Transferencia bancaria (Banco Estado)
- WebPay (tarjetas de crédito y débito)
- MercadoPago
- Efectivo en retiro (solo Santiago, coordinar)
- Corporativos: factura a 30 días con orden de compra.

═══ CONTACTO ═══
- Web: ecoorigenchile.com
- WhatsApp: +56 9 1234 5678 (principal para pedidos y fotos de mascotas)
- Instagram: @vidriorenacido
- Email: hola@vidriorenacido.cl
- Horario: Lunes a Viernes 9:00-18:00 / Sábado 10:00-14:00
`;

// ══════════════════════════════════════════════════════════
// AGENT SYSTEM PROMPTS
// ══════════════════════════════════════════════════════════

const SALES_PROMPT = `Eres "Renacido", el agente de ventas de Vidrio Renacido — tienda online de vasos de vidrio 100% reciclado en Santiago, Chile. Lanzamiento: 20 de Abril 2026.

PERSONALIDAD:
- Cálido, cercano, auténticamente chileno pero profesional
- Apasionado por los productos — los describes como si los tuvieras en la mano
- Hablas como un vendedor experto: escuchas primero, recomiendas después
- Español chileno natural ("bacán", "dale", "súper") pero sin exagerar
- Honesto: si algo no es ideal para el cliente, lo dices y ofreces la alternativa correcta

ESTRATEGIA DE VENTAS:
1. DESCUBRIR: Siempre pregunta primero para qué es (regalo, evento, uso propio, empresa)
2. RECOMENDAR: Sugiere el producto EXACTO con nombre y precio
3. UPSELL NATURAL: "El set de 4 te sale más conveniente" / "Si agregas el nombre, queda mucho más especial"
4. CROSS-SELL: "Los que piden para boda también llevan el set de brindis para los novios"
5. URGENCIA REAL: "Para el 20 de abril necesitaríamos confirmar esta semana para llegar a tiempo"
6. CIERRE: Siempre termina con un next-step claro (WhatsApp, link, confirmar pedido)

PRODUCTO ESTRELLA — RETRATO DE MASCOTA:
Esta es la línea que más emociona a la gente. Cuando alguien menciona mascotas, perros, gatos, o regalos emotivos, SIEMPRE sugiere esta línea. Describe el proceso: envían la foto por WhatsApp, nosotros creamos el retrato artístico, ellos lo aprueban, y lo grabamos en el vaso. Es único, emotivo y personal. El de "mascota fallecida/memorial" es especialmente significativo — trátalo con mucha sensibilidad y respeto.

REGLAS:
- SIEMPRE menciona productos con nombre exacto y precio en CLP
- Para mascotas: guía al cliente a enviar foto por WhatsApp
- Para corporativos/bodas: pide cantidad estimada, fecha del evento, y si quieren personalización
- Si el cliente duda: ofrece enviar fotos reales por WhatsApp
- Nunca inventes productos o precios fuera del catálogo
- Si no sabes algo: "Déjame confirmar con el equipo y te aviso al toque"
- Para preguntas post-venta o técnicas: responde con confianza usando la info del catálogo

DATO CLAVE PARA VENTA:
Los vasos son de vidrio REAL reciclado de botellas. El color verde es NATURAL (no pintura). Cada vaso es ÚNICO por las variaciones del vidrio. Los bordes se pulen A MANO. El grabado es con LÁSER de alta definición. Vienen en cajas de cartón KRAFT eco-friendly. Eso los hace especiales — no es un vaso cualquiera, es una pieza artesanal sustentable.

${FULL_CATALOG}`;

const DESIGN_PROMPT = `Eres "VR Designer", el agente de diseño y desarrollo web de Vidrio Renacido y del ecosistema GEO OS.

IDENTIDAD VISUAL VIDRIO RENACIDO:
- Colores: Fondo oscuro (#0a0f0d), Verde vidrio (#1a4a2a, #7ecba1), Dorado/Kraft (#d4a853, #c4944a), Blanco crema (#e8ece6)
- Tipografías: Playfair Display (display/títulos), DM Sans (cuerpo)
- Estilo: Orgánico, artesanal, sustentable. Fotos en fondos de madera rústica con iluminación cálida tipo atardecer
- Logo: "VR" arriba centrado, "VIDRIO RENACIDO" debajo, todo en verde oscuro sobre kraft
- Empaque: Cajas kraft con ventana, separadores de cartón, iconos de reciclaje

PRODUCTOS REALES (para diseño):
- Vasos de vidrio verde (botellas recicladas cortadas y pulidas)
- Grabados: logo VR, nombres en script, retratos de mascotas, paisajes de montaña, huellas de patita
- Presentación: en cajas kraft de 2, 4 o 5 unidades con ventana

ECOSISTEMA TÉCNICO (GEO OS):
- ecoorigenchile.com → Tienda React + Vite + TypeScript + Shopify Storefront API
- agent.ecoorigenchile.com → GeoCore API (Node.js + TypeScript, puerto 3000, PM2)
- app.ecoorigenchile.com → Voren Dashboard (HTML + JS)
- Hosting: VPS Hostinger con Nginx + Let's Encrypt SSL
- Backend: GeoCore con agentes (SecurityAgent, FinanceAgent, CommerceAgent, WarRoomAgent)
- LLMs: Gemini 1.5 Pro (principal) → Groq llama-3.3 (fallback) → OpenRouter (emergencia)
- Memoria: SQLite local + Firebase Firestore
- Bot: Telegram con voz (Whisper), video, texto

TU ROL:
- Generar código HTML/CSS/JS listo para copiar al sitio
- Crear banners, secciones, componentes, popups, ads
- Proponer mejoras de UX/UI basadas en el estilo real de la marca
- Diseñar espacios publicitarios (Google AdSense, banners propios)
- Conocer la infraestructura completa para sugerir cambios técnicos
- Optimizar mobile-first (la mayoría del tráfico será móvil)

CUANDO TE PIDAN CÓDIGO:
- Entrega SIEMPRE código completo y funcional
- Usa los colores y tipografías de la marca
- Incluye responsive design
- Agrega animaciones sutiles (hover, fade-in)
- Comenta brevemente qué hace cada sección

PROBLEMAS CONOCIDOS QUE PUEDES AYUDAR A RESOLVER:
1. Token Shopify expuesto en frontend (mover a env var)
2. EcoOrigen Web necesita secciones de producto actualizadas
3. Necesitamos espacios de ads sin arruinar la experiencia
4. Mobile UX es crítico — optimizar todo para móvil
5. Fecha límite: 20 de Abril 2026 para estar en producción`;

// ══════════════════════════════════════════════════════════
// AGENT CONFIGS
// ══════════════════════════════════════════════════════════
const AGENTS = {
  sales: {
    id: "sales",
    name: "Renacido",
    emoji: "💬",
    role: "Ventas & Atención al Cliente",
    desc: "Conoce cada producto, cierra ventas, resuelve dudas",
    color: "#d4a853",
    colorLight: "#d4a85322",
    gradient: "linear-gradient(135deg, #2a1a08, #0a0f0d 70%)",
    system: SALES_PROMPT,
    placeholder: "Ej: Quiero un regalo para mi mamá que ama a su perro...",
    welcome: "¡Hola! Soy Renacido, tu asesor de ventas. Conozco cada vaso de nuestra colección — desde los clásicos VR hasta los retratos de mascota que son nuestra estrella. ¿En qué te puedo ayudar?",
    quickActions: [
      "¿Qué vasos tienen?",
      "Quiero un retrato de mi mascota",
      "Cotizar para mi empresa",
      "Vasos para una boda",
      "¿Hacen envíos a regiones?",
      "¿Cuánto demora un pedido personalizado?"
    ]
  },
  design: {
    id: "design",
    name: "VR Designer",
    emoji: "🎨",
    role: "Diseño Web & Gráfica",
    desc: "Código listo para el sitio, banners, ads, UX",
    color: "#7ecba1",
    colorLight: "#7ecba122",
    gradient: "linear-gradient(135deg, #0a2a18, #0a0f0d 70%)",
    system: DESIGN_PROMPT,
    placeholder: "Ej: Crea un banner hero para el lanzamiento del 20 de abril...",
    welcome: "¡Hola! Soy VR Designer. Conozco la identidad visual de Vidrio Renacido y toda la infraestructura de GEO OS. Puedo generar código listo para el sitio, diseñar banners, crear espacios publicitarios y optimizar la UX. ¿Qué necesitas?",
    quickActions: [
      "Banner hero para lanzamiento",
      "Sección de Retrato de Mascota",
      "Espacio publicitario lateral",
      "Popup de pre-lanzamiento",
      "Galería de productos mobile-first",
      "Fix: mover token Shopify a env var"
    ]
  }
};

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function VRAgentHub() {
  const [active, setActive] = useState("sales");
  const [chats, setChats] = useState({ sales: [], design: [] });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const agent = AGENTS[active];
  const messages = chats[active];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => { inputRef.current?.focus(); }, [active]);

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const updated = [...messages, { role: "user", content: msg }];
    setChats(p => ({ ...p, [active]: updated }));
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: agent.system,
          messages: updated.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").filter(Boolean).join("\n") || "Error al procesar.";
      setChats(p => ({ ...p, [active]: [...updated, { role: "assistant", content: reply }] }));
    } catch {
      setChats(p => ({ ...p, [active]: [...updated, { role: "assistant", content: "Error de conexión. Intenta de nuevo." }] }));
    }
    setLoading(false);
  }, [input, loading, messages, active, agent.system]);

  const fmt = (t) => t
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\n/g, '<br>');

  const clearChat = () => setChats(p => ({ ...p, [active]: [] }));

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-vr">VR</span>
            <div>
              <div className="brand-name">Vidrio Renacido</div>
              <div className="brand-sub">Centro de Agentes IA</div>
            </div>
          </div>
        </div>

        <div className="sidebar-section-label">Agentes</div>
        {Object.values(AGENTS).map(a => (
          <button
            key={a.id}
            className={`agent-btn ${active === a.id ? "active" : ""}`}
            onClick={() => { setActive(a.id); setSidebarOpen(false); }}
            style={{ "--agent-color": a.color }}
          >
            <span className="agent-btn-emoji">{a.emoji}</span>
            <div className="agent-btn-info">
              <div className="agent-btn-name">{a.name}</div>
              <div className="agent-btn-role">{a.role}</div>
            </div>
            {chats[a.id].length > 0 && (
              <span className="agent-btn-badge">{Math.ceil(chats[a.id].length / 2)}</span>
            )}
          </button>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 24 }}>Estado del Sistema</div>
        <div className="status-card">
          <div className="status-row"><span>🌐 ecoorigenchile.com</span><span className="dot green" /></div>
          <div className="status-row"><span>🤖 GeoCore API</span><span className="dot green" /></div>
          <div className="status-row"><span>📊 Voren Dashboard</span><span className="dot yellow" /></div>
          <div className="status-row"><span>📱 Telegram Bot</span><span className="dot green" /></div>
        </div>

        <div className="sidebar-section-label" style={{ marginTop: 24 }}>Lanzamiento</div>
        <div className="launch-card">
          <div className="launch-date">20 Abril 2026</div>
          <div className="launch-sub">Todo listo para ventas</div>
          <div className="launch-bar"><div className="launch-fill" /></div>
        </div>

        {/* AD SPACE */}
        <div className="ad-space sidebar-ad">
          <div className="ad-label">📢 Espacio Publicitario</div>
          <div className="ad-placeholder">Google AdSense / Banner 160x600</div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        {/* TOP BAR */}
        <div className="topbar" style={{ background: agent.gradient }}>
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="topbar-agent">
            <div className="topbar-avatar" style={{ borderColor: agent.color, background: agent.colorLight }}>
              {agent.emoji}
            </div>
            <div>
              <div className="topbar-name" style={{ color: agent.color }}>{agent.name}</div>
              <div className="topbar-role">{agent.desc}</div>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="online-badge">● Online</span>
            <button className="clear-btn" onClick={clearChat} title="Limpiar chat">🗑</button>
          </div>
        </div>

        {/* CHAT */}
        <div className="chat-area">
          {messages.length === 0 && (
            <div className="welcome">
              <div className="welcome-emoji">{agent.emoji}</div>
              <div className="welcome-name" style={{ color: agent.color }}>{agent.name}</div>
              <div className="welcome-text">{agent.welcome}</div>
              <div className="quick-actions">
                {agent.quickActions.map(q => (
                  <button key={q} className="quick-btn" style={{ "--ac": agent.color }} onClick={() => send(q)}>
                    {q}
                  </button>
                ))}
              </div>

              {/* INLINE AD */}
              <div className="ad-space inline-ad">
                <div className="ad-label">📢 Espacio Publicitario</div>
                <div className="ad-placeholder">Google AdSense / Banner 728x90</div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.role === "assistant" && <div className="msg-avatar" style={{ background: agent.colorLight, borderColor: agent.color }}>{agent.emoji}</div>}
              <div className={`msg-bubble ${m.role}`} style={m.role === "user" ? { background: agent.colorLight, borderColor: agent.color + "44" } : {}}>
                {m.role === "assistant"
                  ? <div dangerouslySetInnerHTML={{ __html: fmt(m.content) }} />
                  : m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg assistant">
              <div className="msg-avatar" style={{ background: agent.colorLight, borderColor: agent.color }}>{agent.emoji}</div>
              <div className="typing">
                <div className="dot-pulse" style={{ "--c": agent.color }} />
                <div className="dot-pulse" style={{ "--c": agent.color, animationDelay: ".15s" }} />
                <div className="dot-pulse" style={{ "--c": agent.color, animationDelay: ".3s" }} />
              </div>
            </div>
          )}

          {/* AD after 4+ messages */}
          {messages.length >= 4 && messages.length % 6 === 0 && (
            <div className="ad-space chat-ad">
              <div className="ad-label">📢 Espacio Publicitario</div>
              <div className="ad-placeholder">Google AdSense / Banner nativo 468x60</div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* INPUT */}
        <div className="input-bar">
          <div className="input-wrap">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={agent.placeholder}
            />
            <button
              className="send-btn"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{ background: input.trim() ? agent.color : "rgba(255,255,255,.06)" }}
            >
              {loading ? "..." : "→"}
            </button>
          </div>
          <div className="input-hint">
            {active === "sales" ? "💡 Pregunta por nuestros retratos de mascota — son únicos" : "💡 Pide código listo para copiar al sitio"}
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        .app { display: flex; height: 100vh; background: #0a0f0d; color: #e8ece6; font-family: 'DM Sans', sans-serif; overflow: hidden; }

        /* SIDEBAR */
        .sidebar { width: 280px; min-width: 280px; background: #080c0a; border-right: 1px solid rgba(255,255,255,.06); display: flex; flex-direction: column; overflow-y: auto; padding: 16px 12px; z-index: 200; }
        .sidebar-header { padding: 8px 8px 20px; border-bottom: 1px solid rgba(255,255,255,.06); margin-bottom: 16px; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-vr { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #1a5a2a; background: linear-gradient(135deg, #7ecba1, #3da87a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .brand-name { font-weight: 700; font-size: 14px; }
        .brand-sub { font-size: 10px; opacity: .4; letter-spacing: .1em; text-transform: uppercase; margin-top: 2px; }

        .sidebar-section-label { font-size: 10px; letter-spacing: .15em; text-transform: uppercase; opacity: .3; padding: 0 8px; margin-bottom: 8px; }

        .agent-btn { width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 12px; border: 1px solid transparent; background: transparent; color: #e8ece6; cursor: pointer; font-family: inherit; text-align: left; transition: all .2s; margin-bottom: 4px; }
        .agent-btn:hover { background: rgba(255,255,255,.03); }
        .agent-btn.active { background: rgba(255,255,255,.05); border-color: var(--agent-color); }
        .agent-btn-emoji { font-size: 24px; min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(255,255,255,.04); }
        .agent-btn-name { font-weight: 600; font-size: 13px; }
        .agent-btn-role { font-size: 11px; opacity: .4; }
        .agent-btn-badge { font-size: 10px; background: rgba(255,255,255,.1); padding: 2px 8px; border-radius: 100px; margin-left: auto; font-weight: 600; }

        .status-card { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.05); border-radius: 10px; padding: 10px 12px; margin: 0 4px; }
        .status-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 11px; opacity: .6; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.green { background: #22c55e; box-shadow: 0 0 6px #22c55e55; }
        .dot.yellow { background: #eab308; box-shadow: 0 0 6px #eab30855; }

        .launch-card { background: rgba(126,203,161,.05); border: 1px solid rgba(126,203,161,.15); border-radius: 10px; padding: 12px; margin: 0 4px; text-align: center; }
        .launch-date { font-family: 'Playfair Display', serif; font-size: 18px; color: #7ecba1; }
        .launch-sub { font-size: 11px; opacity: .5; margin: 4px 0 8px; }
        .launch-bar { height: 4px; background: rgba(255,255,255,.06); border-radius: 2px; overflow: hidden; }
        .launch-fill { height: 100%; width: 75%; background: linear-gradient(90deg, #7ecba1, #d4a853); border-radius: 2px; }

        /* AD SPACES */
        .ad-space { border: 1px dashed rgba(255,255,255,.1); border-radius: 10px; padding: 16px; text-align: center; background: rgba(255,255,255,.01); }
        .ad-label { font-size: 9px; letter-spacing: .15em; text-transform: uppercase; opacity: .3; margin-bottom: 6px; }
        .ad-placeholder { font-size: 11px; opacity: .2; }
        .sidebar-ad { margin-top: auto; padding-top: 16px; }
        .inline-ad { margin-top: 24px; max-width: 500px; }
        .chat-ad { margin: 12px 48px; }

        /* MAIN */
        .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        /* TOPBAR */
        .topbar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.06); }
        .menu-btn { display: none; background: none; border: none; color: #e8ece6; font-size: 20px; cursor: pointer; padding: 4px; }
        .topbar-agent { display: flex; align-items: center; gap: 10px; }
        .topbar-avatar { width: 40px; height: 40px; border-radius: 12px; border: 2px solid; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .topbar-name { font-weight: 700; font-size: 15px; }
        .topbar-role { font-size: 11px; opacity: .5; }
        .topbar-actions { margin-left: auto; display: flex; align-items: center; gap: 10px; }
        .online-badge { font-size: 10px; color: #22c55e; font-weight: 600; letter-spacing: .05em; }
        .clear-btn { background: none; border: none; font-size: 16px; cursor: pointer; opacity: .3; transition: .2s; padding: 4px; }
        .clear-btn:hover { opacity: .8; }

        /* CHAT */
        .chat-area { flex: 1; overflow-y: auto; padding: 16px; }
        .chat-area::-webkit-scrollbar { width: 5px; }
        .chat-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 3px; }

        .welcome { text-align: center; padding: 40px 16px 20px; }
        .welcome-emoji { font-size: 56px; margin-bottom: 12px; }
        .welcome-name { font-family: 'Playfair Display', serif; font-size: 26px; margin-bottom: 8px; }
        .welcome-text { font-size: 14px; opacity: .55; max-width: 440px; margin: 0 auto; line-height: 1.6; font-weight: 300; }
        .quick-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 24px; max-width: 520px; margin-left: auto; margin-right: auto; }
        .quick-btn { padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 500; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); color: #e8ece6; cursor: pointer; font-family: inherit; transition: all .2s; }
        .quick-btn:hover { border-color: var(--ac); color: var(--ac); background: rgba(255,255,255,.05); }

        /* MESSAGES */
        .msg { display: flex; gap: 10px; margin-bottom: 16px; max-width: 88%; }
        .msg.user { margin-left: auto; flex-direction: row-reverse; }
        .msg-avatar { width: 32px; height: 32px; min-width: 32px; border-radius: 10px; border: 1.5px solid; display: flex; align-items: center; justify-content: center; font-size: 16px; margin-top: 2px; }
        .msg-bubble { padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.65; }
        .msg-bubble.assistant { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-top-left-radius: 4px; }
        .msg-bubble.user { border: 1px solid; border-top-right-radius: 4px; }
        .msg-bubble strong { color: #e8ece6; }

        .code-block { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 12px; overflow-x: auto; font-size: 12px; margin: 8px 0; white-space: pre-wrap; word-break: break-word; font-family: 'SF Mono', 'Fira Code', Consolas, monospace; line-height: 1.5; }
        .inline-code { background: rgba(255,255,255,.07); padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: 'SF Mono', 'Fira Code', Consolas, monospace; }

        .typing { display: flex; gap: 5px; padding: 14px 16px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 16px; border-top-left-radius: 4px; }
        .dot-pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--c); animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity:.25; transform:scale(.75); } 50% { opacity:1; transform:scale(1.1); } }

        /* INPUT */
        .input-bar { padding: 12px 16px 8px; border-top: 1px solid rgba(255,255,255,.06); }
        .input-wrap { display: flex; gap: 8px; }
        .input-wrap input { flex: 1; padding: 14px 16px; border-radius: 14px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); color: #e8ece6; font-size: 14px; font-family: inherit; outline: none; transition: border .2s; }
        .input-wrap input:focus { border-color: rgba(255,255,255,.15); }
        .send-btn { width: 48px; border-radius: 14px; border: none; color: #0a0f0d; font-size: 20px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .2s; }
        .send-btn:disabled { color: rgba(255,255,255,.2); cursor: default; }
        .input-hint { font-size: 11px; opacity: .25; margin-top: 6px; text-align: center; }

        .overlay { display: none; }

        @media (max-width: 768px) {
          .sidebar { position: fixed; left: -300px; top: 0; height: 100vh; transition: left .3s; box-shadow: 4px 0 20px rgba(0,0,0,.5); }
          .sidebar.open { left: 0; }
          .overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 150; }
          .menu-btn { display: block; }
          .msg { max-width: 92%; }
          .chat-ad { margin: 12px 8px; }
        }
      `}</style>
    </div>
  );
}
