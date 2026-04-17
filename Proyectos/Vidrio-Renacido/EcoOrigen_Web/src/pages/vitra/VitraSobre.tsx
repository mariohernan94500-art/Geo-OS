import React from 'react';
import { Link } from 'react-router-dom';
import '../../vitra.css';
import { VitraHeader } from '../../components/vitra/VitraHeader';
import { VitraFooter } from '../../components/vitra/VitraFooter';

const values = [
  {
    icon: '♻️',
    title: 'Economía circular',
    text: 'Nada se desperdicia. Cada botella tiene una segunda vida y los recortes de vidrio vuelven a reciclarse.',
  },
  {
    icon: '🤲',
    title: 'Hecho a mano',
    text: 'Cada vaso pasa por manos humanas en cada etapa. No hay líneas de producción masiva aquí.',
  },
  {
    icon: '🌿',
    title: 'Sin químicos',
    text: 'No usamos pinturas, barnices ni adhesivos. El grabado láser es limpio y permanente.',
  },
];

export default function VitraSobre() {
  return (
    <div className="vitra-page">
      <VitraHeader />

      <div className="vitra-page-header">
        <div className="vitra-wrap">
          <div className="vitra-eyebrow">Nuestra historia</div>
          <h1 className="vitra-page-header-title">Sobre VITRA</h1>
          <p className="vitra-page-header-sub">Nacimos de una botella, crecimos con una idea</p>
        </div>
      </div>

      {/* Historia */}
      <section className="vitra-section">
        <div className="vitra-wrap">
          <div className="vitra-about-grid">
            <div>
              <div className="vitra-eyebrow">Quiénes somos</div>
              <h2 className="vitra-section-title">Una idea simple<br />con impacto real</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--vitra-text-muted)', marginBottom: 20 }}>
                VITRA nació en Chile con una pregunta: ¿por qué botar una botella de vidrio
                que puede convertirse en algo hermoso y útil?
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--vitra-text-muted)', marginBottom: 20 }}>
                Lo que empezó como un experimento artesanal se convirtió en una marca
                que combina diseño editorial, sustentabilidad real y producción local.
                Somos parte de <strong style={{ color: 'var(--vitra-green)' }}>EcoOrigen Chile</strong>,
                un ecosistema de productos ecológicos con alma chilena.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--vitra-text-muted)', marginBottom: 36 }}>
                Cada vaso VITRA es diferente, porque cada botella lo es.
                Eso no es un defecto — es la firma del proceso artesanal.
              </p>
              <Link to="/vitra/como-se-hace" className="vitra-btn">
                Ver el Proceso →
              </Link>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, var(--vitra-green-light), var(--vitra-gold-light))',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              aspectRatio: '4/5',
              fontSize: 80,
            }}>
              🏺
            </div>
          </div>
        </div>
      </section>

      <div className="vitra-divider" />

      {/* Valores */}
      <section className="vitra-section vitra-section-cream">
        <div className="vitra-wrap">
          <div className="vitra-eyebrow">Nuestros valores</div>
          <h2 className="vitra-section-title">Lo que nos guía</h2>
          <div className="vitra-values">
            {values.map(v => (
              <div key={v.title} className="vitra-value-card">
                <div className="vitra-value-icon">{v.icon}</div>
                <div className="vitra-value-title">{v.title}</div>
                <div className="vitra-value-text">{v.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vitra-section vitra-section-dark" style={{ textAlign: 'center' }}>
        <div className="vitra-wrap">
          <h2 className="vitra-section-title">¿Te identificas con VITRA?</h2>
          <p className="vitra-section-lead" style={{ margin: '0 auto 36px' }}>
            Forma parte de la comunidad que elige consumir mejor.
          </p>
          <a href="https://ecoorigenchile.myshopify.com/collections/all" target="_blank" rel="noopener noreferrer" className="vitra-btn vitra-btn-gold">
            Explorar la Tienda →
          </a>
        </div>
      </section>

      <VitraFooter />
    </div>
  );
}
