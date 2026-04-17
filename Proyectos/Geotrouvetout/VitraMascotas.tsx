import React from 'react';
import { Link } from 'react-router-dom';
import '../../vitra.css';
import { VitraHeader } from '../../components/vitra/VitraHeader';
import { VitraFooter } from '../../components/vitra/VitraFooter';

const WHATSAPP_NUM = '56912345678'; // ← Actualiza con tu número real
const WA_LINK = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent('Hola VITRA 🐾 quiero un vaso con el retrato de mi mascota!')}`;

const products = [
  {
    name: 'Retrato Individual',
    price: '$18.990',
    desc: 'Un vaso con el retrato de tu mascota + nombre + frase personalizada.',
    example: '"Bruno · Golden Retriever · 8 años · Mi compañero fiel"',
    emoji: '🐕',
  },
  {
    name: 'Mascota + Dueño',
    price: '$21.990',
    desc: 'Foto de tu mascota contigo grabada en el vaso. El recuerdo perfecto.',
    example: '"Rocky & Yo · Mejor amigo · 2024"',
    emoji: '🤝',
  },
  {
    name: 'Set Familiar (3 vasos)',
    price: '$49.990',
    desc: 'Tres vasos con diferentes mascotas o ángulos. En caja premium kraft.',
    example: 'Ideal para familias con varios peludos',
    emoji: '👨‍👩‍👦',
  },
  {
    name: 'Memorial',
    price: '$19.990',
    desc: 'Homenaje a una mascota que ya no está. Diseño especial con marco conmemorativo.',
    example: '"En memoria de Max · 2015-2024 · Siempre en mi corazón ★"',
    emoji: '⭐',
  },
];

const steps = [
  { num: '01', title: 'Envía tu foto', desc: 'Mándanos la mejor foto de tu mascota por WhatsApp. Mientras más nítida, mejor queda el retrato.', icon: '📸' },
  { num: '02', title: 'Creamos el retrato', desc: 'Nuestro equipo convierte tu foto en un retrato artístico digital optimizado para grabado en vidrio. (1-2 días)', icon: '🎨' },
  { num: '03', title: 'Tú lo apruebas', desc: 'Te enviamos el diseño por WhatsApp para que lo revises. Si quieres cambios, los hacemos sin costo.', icon: '✅' },
  { num: '04', title: 'Grabamos y enviamos', desc: 'Aprobado el diseño, grabamos con láser HD en vidrio reciclado y lo enviamos en caja kraft. (3-5 días)', icon: '📦' },
];

export default function VitraMascotas() {
  return (
    <div className="vitra-page">
      <VitraHeader />

      {/* HERO */}
      <section className="vitra-hero" style={{ minHeight: '80vh' }}>
        <div className="vitra-wrap" style={{ width: '100%' }}>
          <div className="vitra-hero-grid">
            <div className="vitra-fade-in">
              <div className="vitra-hero-label">🐾 Categoría Especial</div>
              <h1 className="vitra-hero-title">
                Retrato de<br /><em>Mascota</em>
              </h1>
              <p className="vitra-hero-tagline">
                De tu foto → al vidrio.<br />
                Un recuerdo único, artesanal y para siempre.
              </p>
              <div className="vitra-hero-actions">
                <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="vitra-btn vitra-btn-gold">
                  📸 Enviar mi Foto →
                </a>
                <a href="#como-funciona" className="vitra-btn vitra-btn-outline" style={{ color: 'var(--vitra-warm)', borderColor: 'rgba(246,243,238,0.4)' }}>
                  ¿Cómo funciona?
                </a>
              </div>
            </div>
            <div className="vitra-hero-img">
              {/* Placeholder — reemplazar con foto real del vaso de Bruno */}
              <div style={{
                width: '100%', maxWidth: 460, aspectRatio: '4/5',
                background: 'linear-gradient(135deg, rgba(184,149,106,.15), rgba(15,61,46,.2))',
                borderRadius: 4, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 16,
                border: '1px solid rgba(246,243,238,.1)',
              }}>
                <span style={{ fontSize: 80 }}>🐕</span>
                <span style={{ color: 'var(--vitra-warm)', opacity: .6, fontSize: 14, fontStyle: 'italic' }}>
                  Tu foto aquí → vaso grabado
                </span>
              </div>
              <div className="vitra-hero-badge">
                <span className="vitra-hero-badge-num">HD</span>
                <span className="vitra-hero-badge-text">Grabado láser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="vitra-section" id="como-funciona">
        <div className="vitra-wrap">
          <div className="vitra-eyebrow">El proceso</div>
          <h2 className="vitra-section-title">Cómo funciona</h2>
          <p className="vitra-section-lead">
            De tu foto al vidrio en 4 pasos simples. Aprobación incluida — grabamos solo cuando tú dices "dale".
          </p>
          <div className="vitra-steps">
            {steps.map(s => (
              <div className="vitra-step" key={s.num}>
                <div className="vitra-step-icon">{s.icon}</div>
                <div className="vitra-step-num">Paso {s.num}</div>
                <div className="vitra-step-title">{s.title}</div>
                <div className="vitra-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <p style={{ fontSize: 14, color: 'var(--vitra-text-muted)', marginBottom: 8 }}>
              ⏱ Tiempo total: <strong style={{ color: 'var(--vitra-green)' }}>5-7 días hábiles</strong>
            </p>
            <p style={{ fontSize: 13, color: 'var(--vitra-text-muted)' }}>
              Vidrio 100% reciclado · Grabado láser de alta definición · Aprobación previa incluida
            </p>
          </div>
        </div>
      </section>

      <div className="vitra-divider" />

      {/* PRODUCTOS */}
      <section className="vitra-section vitra-section-cream">
        <div className="vitra-wrap">
          <div className="vitra-eyebrow">Opciones</div>
          <h2 className="vitra-section-title">Elige tu estilo</h2>
          <p className="vitra-section-lead">
            Desde un retrato individual hasta un set familiar. También ofrecemos vasos memorial para honrar a quienes ya no están.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            marginTop: 40,
          }}>
            {products.map(p => (
              <div key={p.name} style={{
                background: 'var(--vitra-white)',
                border: '1px solid var(--vitra-border)',
                borderRadius: 8,
                padding: 28,
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'default',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--vitra-shadow)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{p.emoji}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: 'var(--vitra-green)', marginBottom: 4 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--vitra-gold)', marginBottom: 12 }}>
                  {p.price}
                </div>
                <p style={{ fontSize: 14, color: 'var(--vitra-text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
                  {p.desc}
                </p>
                <p style={{ fontSize: 12, color: 'var(--vitra-text-muted)', fontStyle: 'italic', opacity: .7 }}>
                  {p.example}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIPS FOTO */}
      <section className="vitra-section">
        <div className="vitra-wrap" style={{ maxWidth: 800, textAlign: 'center' }}>
          <div className="vitra-eyebrow">Tips</div>
          <h2 className="vitra-section-title">Para el mejor resultado</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            marginTop: 32,
          }}>
            {[
              { icon: '📷', title: 'Foto nítida', desc: 'Con buena luz natural, sin flash. Cara de la mascota bien visible.' },
              { icon: '🔲', title: 'Fondo simple', desc: 'Mientras más limpio el fondo, mejor se ve el retrato en el vidrio.' },
              { icon: '😊', title: 'Expresión', desc: 'Las fotos donde la mascota mira a cámara quedan espectaculares.' },
            ].map(t => (
              <div key={t.title} style={{
                background: 'var(--vitra-green-light)',
                borderRadius: 8,
                padding: 24,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{t.icon}</div>
                <div style={{ fontWeight: 600, color: 'var(--vitra-green)', marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: 'var(--vitra-text-muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="vitra-section">
        <div className="vitra-wrap">
          <div className="vitra-cta-banner">
            <div className="vitra-eyebrow" style={{ color: 'var(--vitra-gold)', marginBottom: 16 }}>
              🐾 Solo necesitas una foto
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 4vw, 48px)',
              color: 'var(--vitra-warm)',
              marginBottom: 16,
              fontWeight: 700,
            }}>
              Inmortaliza a tu mejor amigo<br />en vidrio reciclado
            </h2>
            <p style={{ color: 'rgba(246,243,238,0.7)', marginBottom: 36, fontSize: 16 }}>
              Envíanos la foto por WhatsApp. Nosotros creamos el arte. Tú lo apruebas. Listo.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="vitra-btn vitra-btn-gold">
                📸 Enviar Foto por WhatsApp →
              </a>
              <Link to="/vitra/contacto" className="vitra-btn vitra-btn-outline" style={{ color: 'var(--vitra-warm)', borderColor: 'rgba(246,243,238,0.4)' }}>
                Tengo preguntas
              </Link>
            </div>
          </div>
        </div>
      </section>

      <VitraFooter />
    </div>
  );
}
