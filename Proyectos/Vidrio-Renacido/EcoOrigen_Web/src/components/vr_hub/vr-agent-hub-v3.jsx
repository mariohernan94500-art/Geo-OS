import { useState, useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// FULL CATALOG — Based on real product photos
// ═══════════════════════════════════════════════════════════
const CATALOG = `
=== CATÁLOGO VIDRIO RENACIDO (marca VITRA dentro de EcoOrigen Chile) ===
Web: ecoorigenchile.com/vitra | Lanzamiento: 20 Abril 2026 | Santiago, Chile

PRODUCTO: Vasos hechos de botellas de vidrio recicladas. Color verde natural (no pintura). Bordes pulidos a mano. Grabado láser HD. Cajas kraft eco-friendly.

═══ LÍNEA 1: SIGNATURE VR ═══
- Vaso VR Clásico 350ml — $8.990 — Logo "VIDRIO RENACIDO" grabado con líneas y 3 puntos decorativos
- Vaso VR Ámbar 350ml — $9.990 — Tono ámbar natural (botellas cerveza)
- Set 2 VR Clásicos — $15.990 — En caja kraft con ventana
- Set 4 VR en Caja Premium — $29.990 — Cuatro vasos, caja kraft grande con separadores
- Vaso VR XL 500ml — $12.990 — Formato grande, logo VR

═══ LÍNEA 2: PURA (sin grabado) ═══
- Puro Verde 350ml — $5.990 | Puro Ámbar 350ml — $6.490
- Set 4 Puros Verde — $19.990 | Set 6 Mixtos — $32.990

═══ LÍNEA 3: NOMBRES Y FRASES ═══
- Con Nombre — $12.990 — Tipografía script, hasta 15 caracteres (como "Bruno", "José")
- Frase Personalizada — $14.990 — Hasta 40 chars
- "Mamá y Papá" — $12.990 — Ornamentos vintage
- Set 2 Nombres Pareja — $22.990

═══ LÍNEA 4: RETRATO DE MASCOTA 🐾 (ESTRELLA) ═══
El cliente envía foto por WhatsApp → creamos retrato artístico → aprobación → grabado láser HD
- Individual — $18.990 — Retrato + nombre + frase (ej: "Bruno · Golden Retriever · 8 años")
- Mascota + Dueño — $21.990 — Foto con dueño (como "Rocky & Yo · Mejor amigo · 2024")
- Set Familiar 3 vasos — $49.990
- Memorial — $19.990 — Homenaje mascota fallecida, diseño especial
Plazo: 5-7 días hábiles

═══ LÍNEA 5: DISEÑOS ARTÍSTICOS ═══
- Montaña/Naturaleza — $13.990 | Huella Patita 🐾 — $11.990 | Escudo Custom — $15.990

═══ LÍNEA 6: CORPORATIVOS ═══
- Con Logo — desde $7.990/u (mín 20) | Premium 500ml — desde $10.990/u (mín 20)
- Welcome Pack (vaso+posavaso) — desde $15.990/u (mín 10) | Set Ejecutivo 4u — $39.990/set (mín 5)

═══ LÍNEA 7: BODAS Y EVENTOS ═══
- Boda 250ml — desde $6.990/u (mín 30) | Boda Premium 350ml — desde $9.990/u (mín 30)
- Brindis Novios 2u — $24.990 | Baby Shower — desde $6.490/u (mín 20)

ENVÍO: RM gratis >$25K, sino $3.990. Regiones desde $5.990. Corp/bodas gratis RM >$80K.
Stock: 2-3 días. Personalizados: 5-7 días. Corp/bodas: 10-15 días.
PAGO: Transferencia, WebPay, MercadoPago, efectivo en retiro. Corp: factura 30 días.
GARANTÍA: Dañado=reemplazo gratis (foto 24hrs). Sin personalización: cambio 7 días. Personalizado: sin devolución.
CONTACTO: WhatsApp +56 9 1234 5678 | IG @vidriorenacido | hola@vidriorenacido.cl
`;

// ═══════════════════════════════════════════════════════════
// SYSTEM PROMPTS
// ═══════════════════════════════════════════════════════════
const SALES_SYS = `Eres "Renacido", agente de ventas de Vidrio Renacido (marca VITRA dentro de EcoOrigen Chile).

PERSONALIDAD: Cálido, cercano, chileno natural pero profesional. Describes los vasos como si los tuvieras en la mano — el verde natural del vidrio, la textura artesanal, el peso satisfactorio. Usas "bacán", "dale", "súper" con naturalidad.

ESTRATEGIA: 1) Descubrir necesidad 2) Recomendar con nombre+precio 3) Upsell ("el set te sale mejor") 4) Cross-sell ("los de boda también llevan el brindis") 5) Urgencia ("para el 20 necesitamos confirmar esta semana") 6) Cierre con next-step (WhatsApp/link)

PRODUCTO ESTRELLA — RETRATO DE MASCOTA: Cuando mencionen mascotas/perros/gatos/regalos emotivos → SIEMPRE sugiere esta línea. Describe el proceso: foto WhatsApp → retrato artístico → aprobación → grabado. El memorial trátalo con sensibilidad.

DATO CLAVE: Son de vidrio REAL reciclado. Color verde NATURAL. Cada vaso ÚNICO. Bordes pulidos A MANO. Grabado LÁSER HD. Cajas KRAFT eco. No es un vaso cualquiera — es una pieza artesanal sustentable.

REGLAS: Siempre nombres exactos y precios CLP. Para mascotas guiar a WhatsApp. Corp/bodas pedir cantidad+fecha. Si dudas: "déjame confirmar con el equipo". Nunca inventar.
${CATALOG}`;

const DESIGN_SYS = `Eres "VR Designer", agente de diseño web de Vidrio Renacido / EcoOrigen Chile.

DESIGN SYSTEM VITRA (el real del proyecto):
- Fondo: #F6F3EE (warm) | Verde: #0F3D2E | Verde mid: #1A5C44 | Verde light: #E8F0EB
- Gold: #B8956A | Gold light: #F0E8DB | Texto: #1C1C1A | Muted: #6B6860
- Tipografías: Playfair Display (títulos) + Inter (cuerpo)
- Bordes: rgba(15,61,46,0.12) | Radius: 2px (botones), 6px (cards)
- Transiciones: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Estilo: Premium artesanal, editorial limpio, NO dark mode (el sitio es light/warm)

STACK TÉCNICO:
- React 19 + Vite 8 + TypeScript en ecoorigenchile.com
- Shopify Storefront API (GraphQL) para productos
- CSS custom con variables VITRA (955 líneas)
- Rutas: /, /vitra, /vitra/tienda, /vitra/como-se-hace, /vitra/sobre, /vitra/contacto
- Subdominios: agent.ecoorigenchile.com (GeoCore API), app.ecoorigenchile.com (Voren)
- VPS Hostinger + Nginx + PM2 + Let's Encrypt

CUANDO GENERES CÓDIGO: Usa los CSS vars de VITRA. React funcional con hooks. Mobile-first. Genera componentes .tsx listos para copiar al proyecto. Comenta brevemente.

PROBLEMAS QUE CONOCES: Páginas Vitra necesitan completarse. Favicon es Vite default. Sin widget de chat. Sin GA/Pixel. Sin SEO. Falta sección Mascotas.`;

// ═══════════════════════════════════════════════════════════
// AGENTS CONFIG
// ═══════════════════════════════════════════════════════════
const AG = {
  sales: {
    name: "Renacido", emoji: "💬", role: "Ventas & Atención al Cliente",
    color: "#B8956A", colorBg: "#F0E8DB",
    sys: SALES_SYS,
    ph: "Ej: Quiero un regalo para alguien que ama a su perro...",
    hi: "¡Hola! Soy Renacido, tu asesor de Vidrio Renacido. Conozco cada vaso — desde los clásicos VR hasta los retratos de mascota que son nuestra línea estrella. ¿En qué te ayudo?",
    qa: ["¿Qué vasos tienen?", "Retrato de mi mascota 🐾", "Cotizar para empresa", "Vasos para boda", "¿Envían a regiones?", "¿Cuánto demora?"]
  },
  design: {
    name: "VR Designer", emoji: "🎨", role: "Diseño Web & Código",
    color: "#0F3D2E", colorBg: "#E8F0EB",
    sys: DESIGN_SYS,
    ph: "Ej: Crea la sección de Retrato de Mascota para el sitio...",
    hi: "¡Hola! Soy VR Designer. Conozco el design system VITRA, el stack React+Vite, y toda la infra de GEO OS. Genero código .tsx listo para copiar. ¿Qué construimos?",
    qa: ["Sección Retrato de Mascota", "Banner hero lanzamiento", "Widget chat flotante", "Galería productos mobile", "Fix favicon VR", "SEO meta tags"]
  }
};

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
export default function VRHub() {
  const [act, setAct] = useState("sales");
  const [chats, setChats] = useState({ sales: [], design: [] });
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const [side, setSide] = useState(false);
  const endR = useRef(null);
  const inpR = useRef(null);
  const a = AG[act];
  const msgs = chats[act];

  useEffect(() => { endR.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => { inpR.current?.focus(); }, [act]);

  const send = useCallback(async (t) => {
    const m = (t || inp).trim();
    if (!m || busy) return;
    setInp("");
    const up = [...msgs, { role: "user", content: m }];
    setChats(p => ({ ...p, [act]: up }));
    setBusy(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: a.sys, messages: up.map(x => ({ role: x.role, content: x.content })) })
      });
      const d = await r.json();
      const txt = d.content?.map(b => b.text || "").filter(Boolean).join("\n") || "Error.";
      setChats(p => ({ ...p, [act]: [...up, { role: "assistant", content: txt }] }));
    } catch { setChats(p => ({ ...p, [act]: [...up, { role: "assistant", content: "Error de conexión." }] })); }
    setBusy(false);
  }, [inp, busy, msgs, act, a.sys]);

  const fmt = t => t
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="cb"><code>$2</code></pre>')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code class="ic">$1</code>')
    .replace(/\n/g, '<br>');

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter',-apple-system,sans-serif", background: "#F6F3EE", color: "#1C1C1A" }}>

      {/* SIDEBAR */}
      <div className={`sb ${side ? "open" : ""}`}>
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(15,61,46,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#0F3D2E", letterSpacing: ".08em" }}>VITRA</div>
            <div style={{ fontSize: 9, color: "#B8956A", letterSpacing: ".15em", fontWeight: 600, textTransform: "uppercase", marginTop: 2 }}>by EcoOrigen</div>
          </div>
          <div style={{ fontSize: 11, color: "#6B6860", marginTop: 4 }}>Centro de Agentes IA</div>
        </div>

        <div style={{ padding: "16px 12px" }}>
          <div className="sl">AGENTES</div>
          {Object.entries(AG).map(([k, v]) => (
            <button key={k} onClick={() => { setAct(k); setSide(false); }} className={`ab ${act === k ? "on" : ""}`} style={{ "--ac": v.color, "--abg": v.colorBg }}>
              <span style={{ fontSize: 22, minWidth: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: act === k ? v.colorBg : "rgba(0,0,0,.03)" }}>{v.emoji}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{v.name}</div>
                <div style={{ fontSize: 11, color: "#6B6860" }}>{v.role}</div>
              </div>
              {chats[k].length > 0 && <span className="badge">{Math.ceil(chats[k].length / 2)}</span>}
            </button>
          ))}

          <div className="sl" style={{ marginTop: 24 }}>SISTEMA</div>
          <div className="sc">
            <div className="sr"><span>ecoorigenchile.com</span><span className="dt g" /></div>
            <div className="sr"><span>agent.ecoorigenchile.com</span><span className="dt g" /></div>
            <div className="sr"><span>Voren Dashboard</span><span className="dt y" /></div>
          </div>

          <div className="sl" style={{ marginTop: 24 }}>LANZAMIENTO</div>
          <div style={{ background: "#E8F0EB", borderRadius: 8, padding: 14, textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#0F3D2E", fontWeight: 700 }}>20 Abril</div>
            <div style={{ fontSize: 11, color: "#6B6860", margin: "4px 0 10px" }}>13 días restantes</div>
            <div style={{ height: 4, background: "rgba(15,61,46,.08)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg,#0F3D2E,#B8956A)", borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* AD SPACE */}
        <div style={{ marginTop: "auto", padding: 12 }}>
          <div className="ad">
            <div className="adl">Espacio publicitario</div>
            <div style={{ fontSize: 10, color: "#6B6860" }}>Google AdSense 160×600</div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* TOPBAR */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(15,61,46,.08)", background: "rgba(246,243,238,.95)", backdropFilter: "blur(12px)" }}>
          <button className="mb" onClick={() => setSide(!side)}>☰</button>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: a.colorBg, border: `2px solid ${a.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{a.emoji}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: a.color }}>{a.name}</div>
            <div style={{ fontSize: 11, color: "#6B6860" }}>{a.role}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>● Online</span>
            <button onClick={() => setChats(p => ({ ...p, [act]: [] }))} style={{ background: "none", border: "none", cursor: "pointer", opacity: .4, fontSize: 14 }}>🗑</button>
          </div>
        </div>

        {/* CHAT */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }} className="chat">
          {msgs.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 16px" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>{a.emoji}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: a.color, marginBottom: 8 }}>{a.name}</div>
              <div style={{ fontSize: 14, color: "#6B6860", maxWidth: 440, margin: "0 auto", lineHeight: 1.7 }}>{a.hi}</div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 24 }}>
                {a.qa.map(q => (
                  <button key={q} onClick={() => send(q)} className="qb" style={{ "--ac": a.color }}>{q}</button>
                ))}
              </div>
              <div className="ad" style={{ marginTop: 32, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
                <div className="adl">Espacio publicitario</div>
                <div style={{ fontSize: 10, color: "#6B6860" }}>Google AdSense 728×90</div>
              </div>
            </div>
          )}

          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14, maxWidth: "85%", ...(m.role === "user" ? { marginLeft: "auto", flexDirection: "row-reverse" } : {}) }}>
              {m.role === "assistant" && (
                <div style={{ width: 30, minWidth: 30, height: 30, borderRadius: 8, background: a.colorBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginTop: 2 }}>{a.emoji}</div>
              )}
              <div style={{
                padding: "12px 16px", borderRadius: 14, fontSize: 14, lineHeight: 1.65,
                ...(m.role === "user"
                  ? { background: a.colorBg, borderTopRightRadius: 4, border: `1px solid ${a.color}22` }
                  : { background: "white", border: "1px solid rgba(15,61,46,.06)", borderTopLeftRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,.03)" })
              }}>
                {m.role === "assistant" ? <div dangerouslySetInnerHTML={{ __html: fmt(m.content) }} /> : m.content}
              </div>
            </div>
          ))}

          {busy && (
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 30, minWidth: 30, height: 30, borderRadius: 8, background: a.colorBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{a.emoji}</div>
              <div style={{ display: "flex", gap: 5, padding: "14px 16px", background: "white", border: "1px solid rgba(15,61,46,.06)", borderRadius: 14, borderTopLeftRadius: 4 }}>
                {[0, 1, 2].map(i => <div key={i} className="dp" style={{ "--c": a.color, animationDelay: `${i * .15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={endR} />
        </div>

        {/* INPUT */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(15,61,46,.08)", background: "rgba(246,243,238,.95)" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input ref={inpR} value={inp} onChange={e => setInp(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={a.ph}
              style={{ flex: 1, padding: "13px 16px", borderRadius: 8, background: "white", border: "1px solid rgba(15,61,46,.1)", color: "#1C1C1A", fontSize: 14, fontFamily: "inherit", outline: "none" }}
            />
            <button onClick={() => send()} disabled={busy || !inp.trim()}
              style={{ padding: "0 20px", borderRadius: 8, border: "none", background: inp.trim() ? a.color : "rgba(15,61,46,.06)", color: inp.trim() ? "#F6F3EE" : "#6B6860", fontSize: 16, fontWeight: 700, cursor: inp.trim() ? "pointer" : "default", fontFamily: "inherit", transition: ".2s", letterSpacing: ".05em" }}>
              →
            </button>
          </div>
          <div style={{ fontSize: 11, color: "#6B6860", textAlign: "center", marginTop: 6, opacity: .6 }}>
            {act === "sales" ? "🐾 Pregunta por nuestros Retratos de Mascota — son únicos" : "⚡ Genera código .tsx listo para copiar al proyecto"}
          </div>
        </div>
      </div>

      {side && <div className="ov" onClick={() => setSide(false)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}

        .sb{width:270px;min-width:270px;background:#FDFCFA;border-right:1px solid rgba(15,61,46,.06);display:flex;flex-direction:column;overflow-y:auto;z-index:200}
        .sl{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#B8956A;font-weight:600;margin-bottom:10px}
        .ab{width:100%;display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:8px;border:1px solid transparent;background:transparent;color:#1C1C1A;cursor:pointer;font-family:inherit;text-align:left;transition:.2s;margin-bottom:4px}
        .ab:hover{background:rgba(15,61,46,.03)}
        .ab.on{background:var(--abg);border-color:var(--ac)}
        .badge{font-size:10px;background:rgba(15,61,46,.08);padding:2px 8px;border-radius:100px;margin-left:auto;font-weight:600;color:#0F3D2E}

        .sc{background:white;border:1px solid rgba(15,61,46,.06);border-radius:8px;padding:10px 12px}
        .sr{display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:11px;color:#6B6860}
        .dt{width:7px;height:7px;border-radius:50%}
        .dt.g{background:#22c55e;box-shadow:0 0 6px #22c55e44}
        .dt.y{background:#eab308;box-shadow:0 0 6px #eab30844}

        .ad{border:1px dashed rgba(15,61,46,.12);border-radius:8px;padding:16px;text-align:center;background:rgba(15,61,46,.01)}
        .adl{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#B8956A;font-weight:600;margin-bottom:4px}

        .mb{display:none;background:none;border:none;font-size:20px;cursor:pointer;color:#0F3D2E;padding:4px}
        .chat::-webkit-scrollbar{width:5px}
        .chat::-webkit-scrollbar-thumb{background:rgba(15,61,46,.08);border-radius:3px}

        .qb{padding:9px 16px;border-radius:100px;font-size:12px;font-weight:500;background:white;border:1px solid rgba(15,61,46,.1);color:#1C1C1A;cursor:pointer;font-family:inherit;transition:.2s}
        .qb:hover{border-color:var(--ac);color:var(--ac);background:rgba(15,61,46,.02)}

        .cb{background:rgba(15,61,46,.04);border:1px solid rgba(15,61,46,.08);border-radius:6px;padding:12px;overflow-x:auto;font-size:12px;margin:8px 0;white-space:pre-wrap;word-break:break-word;font-family:'SF Mono','Fira Code',Consolas,monospace;line-height:1.5}
        .ic{background:rgba(15,61,46,.06);padding:2px 6px;border-radius:3px;font-size:12px;font-family:'SF Mono','Fira Code',Consolas,monospace}

        .dp{width:7px;height:7px;border-radius:50%;background:var(--c);animation:p 1.2s ease-in-out infinite}
        @keyframes p{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.1)}}

        .ov{display:none}
        @media(max-width:768px){
          .sb{position:fixed;left:-280px;top:0;height:100vh;transition:left .3s;box-shadow:4px 0 20px rgba(0,0,0,.1)}
          .sb.open{left:0}
          .ov{display:block;position:fixed;inset:0;background:rgba(0,0,0,.25);z-index:150}
          .mb{display:block}
        }
      `}</style>
    </div>
  );
}
