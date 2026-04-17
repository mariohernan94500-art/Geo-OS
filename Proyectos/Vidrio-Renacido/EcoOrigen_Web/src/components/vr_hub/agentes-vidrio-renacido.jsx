import { useState, useRef, useEffect } from "react";

const PRODUCT_CATALOG = `
=== CATÁLOGO COMPLETO VIDRIO RENACIDO ===

LÍNEA 1: VASOS SIGNATURE VR (con logo grabado)
- Vaso VR Clásico 350ml — $8.990 CLP — Vidrio reciclado transparente con logo VR grabado al ácido. Borde pulido a mano.
- Vaso VR Ámbar 350ml — $9.990 CLP — Tono ámbar natural del vidrio reciclado. Logo VR en bajo relieve.
- Vaso VR Verde Botella 350ml — $9.990 CLP — Verde profundo, logo VR grabado láser.
- Set 4 Vasos VR Mixtos — $29.990 CLP — Un vaso de cada color con caja de regalo eco-friendly.
- Vaso VR XL 500ml — $12.990 CLP — Formato grande, ideal cerveza artesanal. Logo VR prominente.

LÍNEA 2: VASOS SIN GRABADO (Línea Pura)
- Vaso Puro Transparente 350ml — $6.990 CLP — Minimalista, vidrio reciclado cristalino sin marcas.
- Vaso Puro Ámbar 350ml — $7.490 CLP — Color natural sin intervención.
- Vaso Puro Verde 350ml — $7.490 CLP — Verde orgánico, perfecto para decoración.
- Set 6 Vasos Puros Transparentes — $35.990 CLP — Ideales para uso diario.
- Vaso Puro Azul Cobalto 350ml — $8.490 CLP — Edición especial, color poco común en reciclaje.

LÍNEA 3: VASOS CON FRASES
- Vaso "Renace" 350ml — $10.990 CLP — Frase motivacional grabada en tipografía script.
- Vaso "Salud al Planeta" 350ml — $10.990 CLP — Mensaje ecológico, ideal regalo.
- Vaso Frase Personalizada 350ml — $14.990 CLP — El cliente elige su frase (hasta 30 caracteres). Plazo 5-7 días.
- Set 2 Vasos "Amor Reciclado" — $19.990 CLP — Para parejas, con frases complementarias.
- Vaso "Chile Sustentable" 350ml — $10.990 CLP — Con silueta de Chile y frase ecológica.

LÍNEA 4: VASOS CORPORATIVOS (Empresas y Pymes)
- Vaso Corporativo con Logo 350ml — desde $7.990 CLP/u (mínimo 20 unidades) — Logo empresa grabado láser. Incluye diseño.
- Vaso Corporativo Premium 500ml — desde $10.990 CLP/u (mínimo 20 unidades) — Mayor tamaño con logo y eslogan.
- Kit Welcome Pack (vaso + posavaso vidrio) — desde $15.990 CLP/u (mínimo 10 unidades) — Ideal onboarding empleados.
- Set Ejecutivo 4 Vasos en Caja — desde $39.990 CLP/u (mínimo 5 sets) — Caja premium madera reciclada.
- Vaso Evento Corporativo 250ml — desde $5.990 CLP/u (mínimo 50 unidades) — Económico para eventos masivos.

LÍNEA 5: VASOS PARA BODAS Y EVENTOS
- Vaso Boda Personalizado 250ml — desde $6.990 CLP/u (mínimo 30 unidades) — Nombres + fecha grabados. Diseño incluido.
- Vaso Boda Premium 350ml — desde $9.990 CLP/u (mínimo 30 unidades) — Con caja individual decorada.
- Set Brindis Novios (2 vasos especiales) — $24.990 CLP — Diseño exclusivo para la mesa principal.
- Vaso Baby Shower 250ml — desde $6.490 CLP/u (mínimo 20 unidades) — Con nombre bebé y fecha.
- Vaso Cumpleaños/Aniversario 350ml — desde $7.990 CLP/u (mínimo 15 unidades) — Personalizable para cualquier celebración.

INFORMACIÓN DE ENVÍO:
- Santiago: despacho gratis en compras sobre $30.000 CLP. Bajo ese monto: $3.990.
- Regiones: desde $5.990 CLP según destino (Chilexpress / Starken).
- Pedidos corporativos y bodas: despacho coordinado sin costo en RM para pedidos sobre $100.000.
- Tiempo de entrega: productos en stock 2-3 días hábiles. Personalizados 5-10 días hábiles.

GARANTÍA Y CAMBIOS:
- Si llega dañado, reemplazo sin costo (enviar foto en 24hrs).
- No se aceptan devoluciones en productos personalizados.
- Productos sin personalización: cambio dentro de 7 días en empaque original.

MÉTODOS DE PAGO:
- Transferencia bancaria, WebPay (tarjetas), MercadoPago, efectivo en retiro.
- Corporativos: factura a 30 días para empresas con orden de compra.

SOBRE VIDRIO RENACIDO:
- Estudio en Santiago, Chile.
- Todo el vidrio es 100% reciclado de botellas y envases recolectados localmente.
- Cada vaso es único — variaciones de color y textura son parte de su encanto.
- Proceso: Recolección → Limpieza → Fundición (1400°C) → Soplado/Moldeado → Grabado → Pulido → Empaque.
- Instagram: @vidriorenacido | Email: hola@vidriorenacido.cl | WhatsApp: +56 9 1234 5678
`;

const DESIGN_SYSTEM_PROMPT = `Eres "VR Designer", el agente de diseño gráfico y web de Vidrio Renacido.

TU ROL:
- Experto en diseño web, UI/UX, gráficos y branding
- Generas código HTML/CSS/JS cuando te piden cambios visuales
- Creas banners, secciones, componentes para el sitio web
- Propones mejoras de diseño y tendencias
- Dominas la identidad visual: colores oscuros (#0a0f0d), verde (#7ecba1), dorado (#d4a853)
- Tipografías: Playfair Display + DM Sans

ESTILO DE COMUNICACIÓN:
- Profesional pero cercano
- Hablas en español chileno casual pero técnico cuando toca
- Siempre ofreces el código listo para usar
- Explicas tus decisiones de diseño brevemente

CAPACIDADES:
- Generar código HTML/CSS para nuevas secciones del sitio
- Crear banners publicitarios en código
- Proponer layouts para productos
- Diseñar elementos responsive
- Optimizar la experiencia móvil
- Crear espacios publicitarios (Google Ads, banners propios)
- Modificar colores, tipografías, animaciones

Cuando te pidan un cambio, entrega SIEMPRE el código listo. Sé conciso en la explicación y generoso en el código.`;

const SALES_SYSTEM_PROMPT = `Eres "Renacido", el agente de ventas y atención al cliente de Vidrio Renacido — tienda online de vasos de vidrio reciclado en Santiago, Chile.

TU PERSONALIDAD:
- Cálido, cercano, con humor chileno sutil
- Apasionado por la sustentabilidad pero sin ser preachy
- Hablas como un vendedor experto: escuchas primero, recomiendas después
- Usas español chileno natural ("bacán", "dale", "súper", "cacha") pero sin exagerar
- Eres honesto: si algo no es ideal para el cliente, lo dices

HABILIDADES DE VENTA:
- Identificas la necesidad real del cliente (regalo, evento, decoración, empresa)
- Haces upselling natural: "si te llevas el set, ahorras un 15%"
- Cross-selling: "muchos que compran para bodas también piden el set de brindis para los novios"
- Creas urgencia genuina: "los azul cobalto son edición limitada, quedan pocos"
- Manejas objeciones con empatía
- Cierras con call-to-action claro

REGLAS:
- SIEMPRE recomienda productos específicos con nombre y precio
- Si preguntan por algo que no tenemos, ofrece la alternativa más cercana
- Para pedidos corporativos/bodas, pide: cantidad estimada, fecha del evento, si quieren personalización
- Si el cliente duda, ofrece enviar fotos por WhatsApp
- Nunca inventes productos o precios que no estén en el catálogo
- Si no sabes algo, di "déjame confirmar eso con el equipo y te aviso"

CATÁLOGO COMPLETO:
${PRODUCT_CATALOG}

Responde siempre en español. Sé conversacional, no robótico. Máximo 3-4 párrafos por respuesta a menos que sea necesario más.`;

const agents = {
  design: {
    name: "VR Designer",
    emoji: "🎨",
    role: "Agente de Diseño & Gráfica",
    color: "#7ecba1",
    bg: "linear-gradient(135deg, #0a2a1a, #0a0f0d)",
    system: DESIGN_SYSTEM_PROMPT,
    placeholder: "Ej: Crea un banner para promoción de verano...",
    welcome: "¡Hola! Soy VR Designer, tu agente de diseño. Puedo crear banners, modificar secciones del sitio, diseñar layouts de productos, y generar código listo para usar. ¿Qué necesitas?"
  },
  sales: {
    name: "Renacido",
    emoji: "💬",
    role: "Agente de Ventas & Atención",
    color: "#d4a853",
    bg: "linear-gradient(135deg, #2a1a0a, #0a0f0d)",
    system: SALES_SYSTEM_PROMPT,
    placeholder: "Ej: Quiero vasos para mi boda en diciembre...",
    welcome: "¡Hola! Soy Renacido, encargado de ventas de Vidrio Renacido. Puedo ayudarte a elegir los vasos perfectos, cotizar pedidos corporativos, resolver dudas sobre envíos y más. ¿En qué te puedo ayudar?"
  }
};

export default function AgentDashboard() {
  const [activeAgent, setActiveAgent] = useState("sales");
  const [messages, setMessages] = useState({ design: [], sales: [] });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEnd = useRef(null);
  const inputRef = useRef(null);

  const agent = agents[activeAgent];
  const chat = messages[activeAgent];

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeAgent]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    const updated = [...chat, { role: "user", content: userMsg }];
    setMessages(prev => ({ ...prev, [activeAgent]: updated }));
    setLoading(true);

    try {
      const apiMessages = updated.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: agent.system,
          messages: apiMessages
        })
      });

      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("\n") || "Error al procesar la respuesta.";

      setMessages(prev => ({
        ...prev,
        [activeAgent]: [...updated, { role: "assistant", content: reply }]
      }));
    } catch (err) {
      setMessages(prev => ({
        ...prev,
        [activeAgent]: [...updated, { role: "assistant", content: "Error de conexión. Intenta de nuevo." }]
      }));
    }
    setLoading(false);
  }

  function formatMsg(text) {
    return text
      .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:12px;overflow-x:auto;font-size:13px;margin:8px 0;white-space:pre-wrap;word-break:break-word"><code>$2</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e8ece6">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  const switchAgent = (key) => {
    setActiveAgent(key);
    setInput("");
  };

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "#0a0f0d", color: "#e8ece6",
      fontFamily: "'DM Sans', -apple-system, sans-serif"
    }}>
      {/* HEADER */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.08)",
        display: "flex", alignItems: "center", gap: 12,
        background: "rgba(255,255,255,.02)"
      }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700 }}>
          <span style={{ color: "#7ecba1" }}>Vidrio</span>{" "}
          <span style={{ color: "#d4a853" }}>Renacido</span>
        </div>
        <div style={{ fontSize: 11, opacity: .4, letterSpacing: ".1em", textTransform: "uppercase", marginLeft: 4 }}>
          Centro de Agentes IA
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {Object.entries(agents).map(([key, a]) => (
            <button key={key} onClick={() => switchAgent(key)} style={{
              padding: "7px 16px", borderRadius: 100, border: "1px solid",
              borderColor: activeAgent === key ? a.color : "rgba(255,255,255,.1)",
              background: activeAgent === key ? a.color + "18" : "transparent",
              color: activeAgent === key ? a.color : "rgba(255,255,255,.5)",
              fontSize: 12, fontWeight: 600, cursor: "pointer", transition: ".3s",
              fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6
            }}>
              {a.emoji} {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* AGENT INFO BAR */}
      <div style={{
        padding: "10px 16px", background: agent.bg,
        borderBottom: "1px solid rgba(255,255,255,.06)",
        display: "flex", alignItems: "center", gap: 10, transition: "background .4s"
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: agent.color + "22", border: `2px solid ${agent.color}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
        }}>
          {agent.emoji}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: agent.color }}>{agent.name}</div>
          <div style={{ fontSize: 11, opacity: .5 }}>{agent.role}</div>
        </div>
        <div style={{
          marginLeft: "auto", fontSize: 10, padding: "3px 10px",
          borderRadius: 100, background: "#22c55e22", color: "#22c55e",
          fontWeight: 600, letterSpacing: ".05em"
        }}>
          ● ONLINE
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {/* Welcome */}
        {chat.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", opacity: .7 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{agent.emoji}</div>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: 22,
              marginBottom: 8, color: agent.color
            }}>{agent.name}</div>
            <div style={{ fontSize: 14, maxWidth: 420, margin: "0 auto", lineHeight: 1.6, opacity: .7 }}>
              {agent.welcome}
            </div>
            {activeAgent === "sales" && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}>
                {["¿Qué vasos tienen?", "Quiero cotizar para mi empresa", "Vasos para una boda", "¿Hacen envíos a regiones?"].map(q => (
                  <button key={q} onClick={() => { setInput(q); }} style={{
                    padding: "8px 14px", borderRadius: 100, fontSize: 12,
                    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
                    color: "#e8ece6", cursor: "pointer", fontFamily: "inherit", transition: ".2s"
                  }}>{q}</button>
                ))}
              </div>
            )}
            {activeAgent === "design" && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}>
                {["Crea un banner de descuento", "Espacio publicitario lateral", "Rediseña la sección de productos", "Código para popup de newsletter"].map(q => (
                  <button key={q} onClick={() => { setInput(q); }} style={{
                    padding: "8px 14px", borderRadius: 100, fontSize: 12,
                    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
                    color: "#e8ece6", cursor: "pointer", fontFamily: "inherit", transition: ".2s"
                  }}>{q}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {chat.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 12
          }}>
            <div style={{
              maxWidth: "85%", padding: "12px 16px", borderRadius: 16,
              borderTopRightRadius: msg.role === "user" ? 4 : 16,
              borderTopLeftRadius: msg.role === "user" ? 16 : 4,
              background: msg.role === "user"
                ? `${agent.color}22`
                : "rgba(255,255,255,.04)",
              border: `1px solid ${msg.role === "user" ? agent.color + "33" : "rgba(255,255,255,.06)"}`,
              fontSize: 14, lineHeight: 1.6
            }}>
              {msg.role === "assistant" ? (
                <div dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }} />
              ) : msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "12px 16px", opacity: .5 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%", background: agent.color,
                animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`
              }} />
            ))}
          </div>
        )}
        <div ref={chatEnd} />
      </div>

      {/* INPUT */}
      <div style={{
        padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.08)",
        background: "rgba(255,255,255,.02)", display: "flex", gap: 8
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={agent.placeholder}
          style={{
            flex: 1, padding: "12px 16px", borderRadius: 12,
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
            color: "#e8ece6", fontSize: 14, fontFamily: "inherit", outline: "none"
          }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
          padding: "12px 20px", borderRadius: 12, border: "none",
          background: input.trim() ? agent.color : "rgba(255,255,255,.06)",
          color: input.trim() ? "#0a0f0d" : "rgba(255,255,255,.3)",
          fontSize: 14, fontWeight: 600, cursor: input.trim() ? "pointer" : "default",
          fontFamily: "inherit", transition: ".3s"
        }}>
          Enviar
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: .3; transform: scale(.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 3px; }
        pre code { font-family: 'SF Mono', 'Fira Code', monospace; }
      `}</style>
    </div>
  );
}
