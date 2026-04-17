import React from 'react';
import { Link } from 'react-router-dom';
import '../../vitra.css';
import { VitraHeader } from '../../components/vitra/VitraHeader';
import { VitraFooter } from '../../components/vitra/VitraFooter';

const steps = [
  {
    icon: '🍾',
    num: '01',
    title: 'Recolección',
    desc: 'Recibimos botellas de vino, cerveza y aceite de distribuidores y restaurants. Cada botella que llega es una que no va al vertedero.',
  },
  {
    icon: '✂️',
    num: '02',
    title: 'Corte',
    desc: 'Con una herramienta de hilo de tungsteno y temperatura controlada, cortamos la botella a la altura exacta para el vaso.',
  },
  {
    icon: '🪨',
    num: '03',
    title: 'Pulido',
    desc: 'El borde se pule con piedras de lijado de agua progresivas hasta quedar completamente liso y seguro al tacto.',
  },
  {
    icon: '🎨',
    num: '04',
    title: 'Grabado',
    desc: 'Usamos grabado láser de precisión para estampar diseños, frases o logos sin pintura ni químicos adicionales.',
  },
];

export default function VitraComoSeHace() {
  return (
    <div className="vitra-page">
      <VitraHeader />

      <div className="vitra-page-header">
        <div className="vitra-wrap">
          <div className="vitra-eyebrow">El proceso</div>
          <h1 className="vitra-page-header-title">Cómo se hace un VITRA</h1>
          <p className="vitra-page-header-sub">4 pasos, 0 desperdicio, 1 vaso único</p>
        </div>
      </div>

      {/* Steps */}
      <section className="vitra-section">
        <div className="vitra-wrap">
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
        </div>
      </section>

      <div className="vitra-divider" />

      {/* Impacto */}
      <section className="vitra-section vitra-section-dark">
        <div className="vitra-wrap" style={{ textAlign: 'center' }}>
          <div className="vitra-eyebrow">Impacto real</div>
          <h2 className="vitra-section-title">Cada vaso es un acto de amor al planeta</h2>
          <div className="vitra-stats">
            {[
              { num: '1', label: 'Botella rescatada por vaso' },
              { num: '74%', label: 'Menos CO₂ vs vidrio nuevo' },
              { num: '0', label: 'Plástico en el proceso' },
              { num: '∞', label: 'Años que dura un vaso VITRA' },
            ].map(s => (
              <div className="vitra-stat" key={s.label}>
                <div className="vitra-stat-num">{s.num}</div>
                <div className="vitra-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vitra-section">
        <div className="vitra-wrap" style={{ textAlign: 'center' }}>
          <h2 className="vitra-section-title">¿Te convenciste?</h2>
          <p className="vitra-section-lead" style={{ margin: '0 auto 36px' }}>
            Cada vaso que compras rescata una botella y apoya el trabajo artesanal local.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://ecoorigenchile.myshopify.com/collections/all" target="_blank" rel="noopener noreferrer" className="vitra-btn">
              Comprar un VITRA →
            </a>
            <Link to="/vitra/sobre" className="vitra-btn vitra-btn-outline">
              Conocer el Equipo
            </Link>
          </div>
        </div>
      </section>

      <VitraFooter />
    </div>
  );
}
