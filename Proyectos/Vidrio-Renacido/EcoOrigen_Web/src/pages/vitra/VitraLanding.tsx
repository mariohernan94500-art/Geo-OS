import React from 'react';
import { Link } from 'react-router-dom';
import '../../vitra.css';
import { VitraHeader } from '../../components/vitra/VitraHeader';
import { VitraFooter } from '../../components/vitra/VitraFooter';

const SHOPIFY_ALL = 'https://ecoorigenchile.myshopify.com/collections/all';

const collections = [
  {
    name: 'Simples',
    desc: 'Diseño limpio, elegante y minimalista. Perfectos para el día a día.',
    emoji: '🥃',
    url: 'https://ecoorigenchile.myshopify.com/collections/simples',
  },
  {
    name: 'Con Frases',
    desc: 'Vasos que hablan por ti. Mensajes grabados con láser a fuego.',
    emoji: '✍️',
    url: 'https://ecoorigenchile.myshopify.com/collections/frases',
  },
  {
    name: 'Animales',
    desc: 'Fauna chilena e internacional grabada en vidrio. Únicos.',
    emoji: '🦁',
    url: 'https://ecoorigenchile.myshopify.com/collections/animales',
  },
  {
    name: 'Bodas & Empresas',
    desc: 'Personalización total. Tu logo, tu fecha, tu historia.',
    emoji: '💍',
    url: 'https://ecoorigenchile.myshopify.com/collections/bodas-empresas',
  },
];

export default function VitraLanding() {
  return (
    <div className="vitra-page">
      <VitraHeader />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="vitra-hero">
        <div className="vitra-wrap" style={{ width: '100%' }}>
          <div className="vitra-hero-grid">
            <div className="vitra-fade-in">
              <div className="vitra-hero-label">Vasos de vidrio reciclado</div>
              <h1 className="vitra-hero-title">
                De botella<br />a vaso,<br /><em>con estilo.</em>
              </h1>
              <p className="vitra-hero-tagline">
                Cada vaso VITRA nació del vidrio que iba a perderse.<br />Ahora brilla en tu mesa.
              </p>
              <div className="vitra-hero-actions">
                <a href={SHOPIFY_ALL} target="_blank" rel="noopener noreferrer" className="vitra-btn">
                  Comprar Vasos →
                </a>
                <Link to="/vitra/como-se-hace" className="vitra-btn vitra-btn-outline" style={{ color: 'var(--vitra-warm)', borderColor: 'rgba(246,243,238,0.4)' }}>
                  Ver el Proceso
                </Link>
              </div>
            </div>

            <div className="vitra-hero-img">
              <img
               src="/images/caja-kit.png"
               alt="Vasos VITRA de vidrio reciclado"
               style={{ objectFit: 'contain', aspectRatio: 'auto', width: '100%', maxWidth: 600 }}
              />
              <div className="vitra-hero-badge">
                <span className="vitra-hero-badge-num">100%</span>
                <span className="vitra-hero-badge-text">Vidrio reciclado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────── */}
      <div className="vitra-section-dark">
        <div className="vitra-wrap">
          <div className="vitra-stats">
            {[
              { num: '+500', label: 'Botellas rescatadas' },
              { num: '4', label: 'Colecciones únicas' },
              { num: '0', label: 'Huella de carbono adicional' },
              { num: '♾️', label: 'Diseños posibles' },
            ].map(s => (
              <div className="vitra-stat" key={s.label}>
                <div className="vitra-stat-num">{s.num}</div>
                <div className="vitra-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COLECCIONES ───────────────────────────────────── */}
      <section className="vitra-section">
        <div className="vitra-wrap">
          <div className="vitra-eyebrow">Nuestras colecciones</div>
          <h2 className="vitra-section-title">Un vaso para cada historia</h2>
          <p className="vitra-section-lead">
            Cada colección tiene su carácter. Elige la tuya o personaliza desde cero.
          </p>

          <div className="vitra-collections-grid">
            {collections.map(col => (
              <a href={col.url} target="_blank" rel="noopener noreferrer" key={col.name} className="vitra-collection-card">
                <div className="vitra-collection-thumb-placeholder">
                  {col.emoji}
                </div>
                <div className="vitra-collection-info">
                  <div className="vitra-collection-name">{col.name}</div>
                  <div className="vitra-collection-desc">{col.desc}</div>
                  <div className="vitra-collection-link">Ver colección →</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="vitra-divider" />

      {/* ── PROCESO TEASER ────────────────────────────────── */}
      <section className="vitra-section vitra-section-cream">
        <div className="vitra-wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="vitra-eyebrow">El proceso</div>
            <h2 className="vitra-section-title">
              Artesanía que<br />cuida el planeta
            </h2>
            <p className="vitra-section-lead">
              Recolectamos botellas de vidrio, las cortamos a mano,
              pulimos los bordes y grabamos cada diseño con precisión láser.
              Cero plástico, cero desperdicio.
            </p>
            <Link to="/vitra/como-se-hace" className="vitra-btn">
              Ver Cómo se Hace →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {['🍾', '✂️', '✨', '🎨'].map((e, i) => (
              <div key={i} style={{
                background: 'var(--vitra-white)',
                borderRadius: 8,
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                border: '1px solid var(--vitra-border)',
                fontSize: 36,
              }}>
                {e}
                <span style={{ fontSize: 12, color: 'var(--vitra-text-muted)', textAlign: 'center' }}>
                  {['Recolección', 'Corte', 'Pulido', 'Grabado'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────── */}
      <section className="vitra-section">
        <div className="vitra-wrap">
          <div className="vitra-cta-banner">
            <div className="vitra-eyebrow" style={{ color: 'var(--vitra-gold)', marginBottom: 16 }}>
              Listo para tu mesa
            </div>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(28px, 4vw, 48px)',
              color: 'var(--vitra-warm)',
              marginBottom: 16,
              fontWeight: 700,
            }}>
              Tu próximo vaso favorito<br />te está esperando
            </h2>
            <p style={{ color: 'rgba(246,243,238,0.7)', marginBottom: 36, fontSize: 16 }}>
              Compra directo en nuestra tienda Shopify. Envío a todo Chile.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={SHOPIFY_ALL} target="_blank" rel="noopener noreferrer" className="vitra-btn vitra-btn-gold">
                Comprar Ahora →
              </a>
              <Link to="/vitra/tienda" className="vitra-btn vitra-btn-outline" style={{ color: 'var(--vitra-warm)', borderColor: 'rgba(246,243,238,0.4)' }}>
                Ver Catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <VitraFooter />
    </div>
  );
}
