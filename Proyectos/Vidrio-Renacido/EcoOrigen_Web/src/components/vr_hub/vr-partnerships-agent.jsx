import { useState, useRef, useEffect } from "react";

const BUSINESS_SYSTEM_PROMPT = `Eres "VR Partnerships", el agente de desarrollo de negocios y publicidad de Vidrio Renacido — tienda online de vasos de vidrio reciclado en Santiago, Chile.

TU MISIÓN PRINCIPAL:
Encontrar, evaluar y negociar acuerdos publicitarios con marcas y negocios que sean compatibles con Vidrio Renacido. Tu objetivo es MAXIMIZAR ingresos publicitarios sin comprometer la identidad de marca.

PERFIL DE VIDRIO RENACIDO:
- Tienda online de vasos de vidrio 100% reciclado
- Público: personas eco-conscientes, empresas con RSE, parejas que se casan, sector gastronómico
- Valores: sustentabilidad, artesanía, economía circular, diseño chileno
- Sitio web con espacios publicitarios disponibles: banner header, sidebar, entre productos, footer, newsletter
- Instagram: @vidriorenacido | Web: vidriorenacido.cl | Santiago, Chile

MARCAS Y NEGOCIOS COMPATIBLES (buscar activamente):
Tier 1 — Perfecta compatibilidad (prioridad máxima, cobrar premium):
- Cervecerías artesanales chilenas (Kunstmann, Kross, Szot, Jester, Bundor, etc.)
- Restaurantes sustentables / farm-to-table
- Tiendas de decoración eco-friendly
- Marcas de cosmética natural chilena (Natura, Majen, Ríos)
- Viñas y bodegas boutique chilenas
- Tiendas zero waste / granel
- Marcas de ropa sustentable chilena

Tier 2 — Buena compatibilidad (cobrar tarifa estándar):
- Floristerías y gift shops
- Organizadoras de bodas y eventos
- Empresas de catering
- Tiendas gourmet / delicatessen
- Marcas de café de especialidad
- Hoteles boutique
- Empresas de reciclaje y gestión de residuos

Tier 3 — Aceptable con condiciones (solo si pagan bien):
- Inmobiliarias enfocadas en sustentabilidad
- Apps de delivery con programa eco
- Marcas de alimentos orgánicos
- Librerías y papelerías eco

RECHAZAR SIEMPRE (no son compatibles con la marca):
- Fast food / cadenas masivas
- Productos de plástico desechable
- Tabacaleras / vapeadores
- Casinos / apuestas online
- Productos de limpieza químicos agresivos
- Cualquier marca que contradiga valores de sustentabilidad
- Empresas con escándalos ambientales conocidos
- Productos financieros agresivos (préstamos rápidos, crypto dudoso)

TARIFAS PUBLICITARIAS (tu piso de negociación, NUNCA aceptar menos):
- Banner Header (máxima visibilidad): $40.000 - $80.000 CLP/mes
- Banner Sidebar: $25.000 - $50.000 CLP/mes
- Banner entre productos: $30.000 - $60.000 CLP/mes
- Banner Footer: $15.000 - $30.000 CLP/mes
- Mención en Newsletter: $20.000 - $40.000 CLP/envío
- Post patrocinado (artículo/review): $50.000 - $120.000 CLP/post
- Paquete completo (todos los espacios): $120.000 - $250.000 CLP/mes
- Descuento trimestral: 10% | Descuento semestral: 15% | Descuento anual: 20%

REGLAS DE NEGOCIACIÓN:
1. NUNCA aceptes la primera oferta. Siempre evalúa y compara.
2. Pide siempre más de lo que esperas recibir (empieza por el techo de la tarifa).
3. Si una marca quiere negociar, pide contrato mínimo de 3 meses.
4. Para Tier 1, ofrece exclusividad de categoría como incentivo (solo una cervecería, solo una viña, etc.).
5. Prioriza contratos largos sobre pagos únicos.
6. Si tienes varias opciones, crea competencia ("tenemos otra cervecería interesada").
7. Siempre menciona el valor de la audiencia: eco-consciente, poder adquisitivo medio-alto, Santiago.
8. Pide siempre que la marca provea su propio material gráfico.
9. Para afiliados, negocia mínimo 10-15% de comisión por venta referida.
10. NUNCA reveles las tarifas mínimas. Empieza siempre por el máximo.

PROCESO DE EVALUACIÓN (seguir siempre):
Cuando encuentres o te propongan una marca:
1. INVESTIGAR: ¿Qué hace la marca? ¿Es compatible con VR?
2. CLASIFICAR: ¿Tier 1, 2 o 3? ¿O rechazar?
3. EVALUAR: ¿Cuánto podrían pagar? ¿Qué beneficio trae a VR?
4. COMPARAR: ¿Hay mejores opciones en la misma categoría?
5. RECOMENDAR: Presentar análisis al dueño con pros, contras y recomendación
6. Solo después de aprobación: CONTACTAR y NEGOCIAR

FORMATO DE ANÁLISIS DE MARCA:
Para cada marca evaluada, presenta:
━━━━━━━━━━━━━━━━━━━━━━
📊 EVALUACIÓN: [Nombre Marca]
━━━━━━━━━━━━━━━━━━━━━━
• Categoría: [tipo de negocio]
• Compatibilidad: [Tier 1/2/3 + nota 1-10]
• Por qué encaja: [razón]
• Riesgo: [posibles problemas]
• Tarifa sugerida: [rango CLP/mes]
• Tipo de acuerdo: [banner/afiliado/post/paquete]
• Recomendación: ✅ CONTACTAR / ⏳ ESPERAR / ❌ RECHAZAR
━━━━━━━━━━━━━━━━━━━━━━

REDACCIÓN DE EMAILS:
Cuando redactes emails a marcas potenciales:
- Tono profesional pero cercano, nunca corporativo frío
- Mencionar valores compartidos de sustentabilidad
- Destacar el perfil de audiencia de VR
- NO mencionar tarifas en el primer email (generar interés primero)
- Incluir datos: "nuestra audiencia es 70% mujeres 25-45 años, eco-conscientes, Santiago"
- Call to action: proponer una videollamada o reunión
- Firmar como "Equipo Comercial, Vidrio Renacido"

CUANDO RESPONDAS EMAILS DE MARCAS INTERESADAS:
- Agradecer el interés
- Hacer preguntas: presupuesto, duración deseada, materiales que tienen
- NO dar precio inmediatamente — primero entender qué necesitan
- Si presionan por precio, dar el rango ALTO
- Crear sensación de demanda: "estamos evaluando varias propuestas para ese espacio"

ESTILO DE COMUNICACIÓN CONTIGO (el dueño):
- Directo y analítico
- Siempre con datos y recomendaciones claras
- Presenta opciones rankeadas de mejor a peor
- Avisa cuando algo no conviene aunque el dinero sea tentador
- Celebra los buenos deals pero sin exagerar
- Habla en español chileno profesional

CAPACIDADES ADICIONALES:
- Puedes buscar marcas en internet con web search
- Puedes redactar emails de primer contacto, seguimiento y negociación
- Puedes crear media kits y propuestas comerciales
- Puedes analizar si una marca es compatible revisando su web/redes
- Puedes calcular ROI de diferentes acuerdos publicitarios
- Puedes sugerir estrategias de pricing dinámico según temporada`;

const PIPELINE_STAGES = [
  { key: "prospecting", label: "Prospección", icon: "🔍", color: "#7ecba1" },
  { key: "evaluation", label: "Evaluación", icon: "📊", color: "#60a5fa" },
  { key: "contact", label: "Contacto", icon: "📧", color: "#d4a853" },
  { key: "negotiation", label: "Negociación", icon: "🤝", color: "#f59e0b" },
  { key: "closed", label: "Cerrado", icon: "✅", color: "#22c55e" },
  { key: "rejected", label: "Rechazado", icon: "❌", color: "#ef4444" }
];

const SAMPLE_LEADS = [
  { name: "Cervecería Kross", tier: 1, stage: "prospecting", value: "80.000", category: "Cervecería artesanal" },
  { name: "Viña Emiliana", tier: 1, stage: "prospecting", value: "70.000", category: "Viña orgánica" },
  { name: "Tienda Granel", tier: 2, stage: "prospecting", value: "40.000", category: "Zero waste" },
];

const quickActions = [
  { label: "🔍 Buscar cervecerías artesanales", msg: "Busca las mejores cervecerías artesanales de Chile que podrían querer publicitar en nuestro sitio. Evalúa las top 5." },
  { label: "🍷 Buscar viñas boutique", msg: "Encuentra viñas boutique chilenas que sean sustentables y compatibles con nuestra marca. Dame tu top 5 con evaluación." },
  { label: "📧 Redactar email de contacto", msg: "Redacta un email de primer contacto para enviar a una cervecería artesanal interesante. Debe generar interés sin revelar precios." },
  { label: "💰 Calcular ingresos potenciales", msg: "Si logramos llenar todos los espacios publicitarios, ¿cuánto podríamos ganar al mes? Dame un escenario conservador, realista y optimista." },
  { label: "📋 Crear media kit", msg: "Crea un media kit profesional de Vidrio Renacido para enviar a marcas potenciales. Incluye datos de audiencia, espacios disponibles y beneficios." },
  { label: "🏪 Buscar tiendas eco Santiago", msg: "Busca tiendas de decoración eco-friendly y tiendas zero waste en Santiago que podrían ser buenas aliadas publicitarias." },
  { label: "🤝 Evaluar propuesta entrante", msg: "Una marca de café de especialidad nos contactó ofreciendo $25.000/mes por el banner sidebar. ¿Acepto o negocio? ¿Cuánto podríamos pedir?" },
  { label: "📊 Pipeline mensual", msg: "Dame un resumen del pipeline ideal: cuántas marcas deberíamos contactar por semana, tasa de conversión esperada, e ingreso mensual objetivo." }
];

export default function PartnershipAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("chat");
  const [leads, setLeads] = useState(SAMPLE_LEADS);
  const chatEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { inputRef.current?.focus(); }, [view]);

  async function sendMessage(text) {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput("");
    setView("chat");

    const updated = [...messages, { role: "user", content: userMsg }];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: BUSINESS_SYSTEM_PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: updated.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "Error al procesar.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error de conexión. Intenta de nuevo." }]);
    }
    setLoading(false);
  }

  function formatMsg(text) {
    return text
      .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:12px;overflow-x:auto;font-size:12px;margin:8px 0;white-space:pre-wrap"><code>$2</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e8ece6">$1</strong>')
      .replace(/━+/g, '<hr style="border:none;border-top:1px solid rgba(255,255,255,.1);margin:8px 0">')
      .replace(/\n/g, '<br>');
  }

  const totalPipeline = leads.filter(l => l.stage !== "rejected").reduce((s, l) => s + parseInt(l.value.replace(/\./g, "")), 0);

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "#08090a", color: "#e8ece6",
      fontFamily: "'DM Sans', -apple-system, sans-serif"
    }}>
      {/* HEADER */}
      <div style={{
        padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,.08)",
        background: "linear-gradient(135deg, rgba(212,168,83,.08), rgba(10,15,13,.9))",
        display: "flex", alignItems: "center", gap: 10
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "linear-gradient(135deg, #d4a853, #b8942e)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 700, color: "#0a0f0d"
        }}>$</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
            <span style={{ color: "#d4a853" }}>VR</span> Partnerships
          </div>
          <div style={{ fontSize: 10, opacity: .5, letterSpacing: ".08em" }}>AGENTE DE NEGOCIOS & PUBLICIDAD</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["chat", "pipeline", "actions"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "6px 12px", borderRadius: 8, border: "1px solid",
              borderColor: view === v ? "#d4a853" : "rgba(255,255,255,.08)",
              background: view === v ? "#d4a85318" : "transparent",
              color: view === v ? "#d4a853" : "rgba(255,255,255,.4)",
              fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              textTransform: "capitalize"
            }}>
              {v === "chat" ? "💬 Chat" : v === "pipeline" ? "📊 Pipeline" : "⚡ Acciones"}
            </button>
          ))}
        </div>
      </div>

      {/* METRICS BAR */}
      <div style={{
        padding: "8px 16px", display: "flex", gap: 12,
        borderBottom: "1px solid rgba(255,255,255,.06)",
        background: "rgba(255,255,255,.015)", overflowX: "auto"
      }}>
        {[
          { label: "Leads Activos", value: leads.filter(l => l.stage !== "rejected" && l.stage !== "closed").length, color: "#60a5fa" },
          { label: "Pipeline Total", value: `$${totalPipeline.toLocaleString("es-CL")}`, color: "#d4a853" },
          { label: "Cerrados", value: leads.filter(l => l.stage === "closed").length, color: "#22c55e" },
          { label: "Espacios Libres", value: "5/5", color: "#f59e0b" }
        ].map((m, i) => (
          <div key={i} style={{
            padding: "6px 12px", borderRadius: 8,
            background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)",
            minWidth: "fit-content"
          }}>
            <div style={{ fontSize: 10, opacity: .4, letterSpacing: ".05em" }}>{m.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: m.color, fontFamily: "'Playfair Display', serif" }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* PIPELINE VIEW */}
        {view === "pipeline" && (
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#d4a853" }}>
              Pipeline de Marcas
            </div>
            {PIPELINE_STAGES.map(stage => {
              const stageLeads = leads.filter(l => l.stage === stage.key);
              return (
                <div key={stage.key} style={{ marginBottom: 12 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
                    fontSize: 12, opacity: .6
                  }}>
                    <span>{stage.icon}</span>
                    <span style={{ fontWeight: 600, color: stage.color }}>{stage.label}</span>
                    <span style={{
                      background: stage.color + "22", color: stage.color,
                      padding: "1px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700
                    }}>{stageLeads.length}</span>
                  </div>
                  {stageLeads.map((lead, i) => (
                    <div key={i} style={{
                      padding: "10px 14px", marginBottom: 4, borderRadius: 10,
                      background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{lead.name}</div>
                        <div style={{ fontSize: 11, opacity: .4 }}>{lead.category} • Tier {lead.tier}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#d4a853" }}>
                        ${lead.value}/mes
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div style={{
                      padding: 10, fontSize: 11, opacity: .25, textAlign: "center",
                      border: "1px dashed rgba(255,255,255,.08)", borderRadius: 8
                    }}>Sin leads en esta etapa</div>
                  )}
                </div>
              );
            })}
            <button onClick={() => sendMessage("Analiza el pipeline actual y recomienda próximos pasos para cada lead.")}
              style={{
                width: "100%", padding: 12, borderRadius: 10, border: "1px solid #d4a853",
                background: "#d4a85312", color: "#d4a853", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", marginTop: 8
              }}>
              📊 Analizar Pipeline con IA
            </button>
          </div>
        )}

        {/* ACTIONS VIEW */}
        {view === "actions" && (
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: "#d4a853" }}>
              Acciones Rápidas
            </div>
            <div style={{ fontSize: 12, opacity: .4, marginBottom: 16 }}>
              Selecciona una acción y el agente la ejecutará
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quickActions.map((action, i) => (
                <button key={i} onClick={() => sendMessage(action.msg)} style={{
                  padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.08)",
                  background: "rgba(255,255,255,.025)", color: "#e8ece6", fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  transition: ".2s", fontWeight: 500
                }}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CHAT VIEW */}
        {view === "chat" && (
          <div style={{ padding: "12px 16px" }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "30px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>💰</div>
                <div style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 20,
                  color: "#d4a853", marginBottom: 8
                }}>VR Partnerships</div>
                <div style={{ fontSize: 13, opacity: .5, maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
                  Tu agente de negocios. Busco marcas compatibles, evalúo propuestas, negocio tarifas y maximizo tus ingresos publicitarios. Nunca acepto la primera oferta.
                </div>
                <div style={{
                  marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6,
                  maxWidth: 380, margin: "16px auto 0"
                }}>
                  {quickActions.slice(0, 4).map((a, i) => (
                    <button key={i} onClick={() => sendMessage(a.msg)} style={{
                      padding: "10px 8px", borderRadius: 10, fontSize: 11,
                      background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)",
                      color: "#e8ece6", cursor: "pointer", fontFamily: "inherit", textAlign: "center"
                    }}>{a.label}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 10
              }}>
                <div style={{
                  maxWidth: "88%", padding: "11px 15px", borderRadius: 14,
                  borderTopRightRadius: msg.role === "user" ? 4 : 14,
                  borderTopLeftRadius: msg.role === "user" ? 14 : 4,
                  background: msg.role === "user" ? "#d4a85320" : "rgba(255,255,255,.04)",
                  border: `1px solid ${msg.role === "user" ? "#d4a85333" : "rgba(255,255,255,.06)"}`,
                  fontSize: 13, lineHeight: 1.65
                }}>
                  {msg.role === "assistant" ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }} />
                  ) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", opacity: .5 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: "50%", background: "#d4a853",
                      animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 11 }}>Investigando y analizando...</span>
              </div>
            )}
            <div ref={chatEnd} />
          </div>
        )}
      </div>

      {/* INPUT */}
      <div style={{
        padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,.08)",
        background: "rgba(255,255,255,.02)", display: "flex", gap: 8
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ej: Busca marcas de café sustentable para publicitar..."
          style={{
            flex: 1, padding: "11px 14px", borderRadius: 10,
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
            color: "#e8ece6", fontSize: 13, fontFamily: "inherit", outline: "none"
          }}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
          padding: "11px 18px", borderRadius: 10, border: "none",
          background: input.trim() ? "#d4a853" : "rgba(255,255,255,.06)",
          color: input.trim() ? "#0a0f0d" : "rgba(255,255,255,.3)",
          fontSize: 13, fontWeight: 700, cursor: input.trim() ? "pointer" : "default",
          fontFamily: "inherit", transition: ".3s"
        }}>
          Enviar
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 3px; }
        button:hover { filter: brightness(1.1); }
      `}</style>
    </div>
  );
}
