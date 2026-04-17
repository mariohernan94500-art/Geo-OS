import React, { useState } from 'react';
import '../../vitra.css';
import { VitraHeader } from '../../components/vitra/VitraHeader';
import { VitraFooter } from '../../components/vitra/VitraFooter';

const WHATSAPP_NUM = '56900000000'; // ← Actualiza con tu número real

export default function VitraContacto() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Envío por WhatsApp como fallback (sin backend)
    const msg = encodeURIComponent(
      `Hola VITRA 👋\nNombre: ${form.nombre}\nEmail: ${form.email}\nAsunto: ${form.asunto}\n\n${form.mensaje}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUM}?text=${msg}`, '_blank');
    setSent(true);
  };

  return (
    <div className="vitra-page">
      <VitraHeader />

      <div className="vitra-page-header">
        <div className="vitra-wrap">
          <div className="vitra-eyebrow">Hablemos</div>
          <h1 className="vitra-page-header-title">Contacto</h1>
          <p className="vitra-page-header-sub">¿Tienes un proyecto especial? Escríbenos.</p>
        </div>
      </div>

      <section className="vitra-section">
        <div className="vitra-wrap">
          <div className="vitra-contact-grid">
            {/* Info */}
            <div className="vitra-contact-info">
              <div>
                <div className="vitra-eyebrow">Información de contacto</div>
                <h2 className="vitra-section-title">Estamos aquí</h2>
                <p className="vitra-section-lead" style={{ marginBottom: 0 }}>
                  Para pedidos corporativos, bodas, regalos y personalizaciones,
                  prefiere contactarnos directamente.
                </p>
              </div>

              {[
                { icon: '💬', title: 'WhatsApp', text: '+56 9 0000 0000', href: `https://wa.me/${WHATSAPP_NUM}` },
                { icon: '📧', title: 'Email', text: 'hola@ecoorigen.cl', href: 'mailto:hola@ecoorigen.cl' },
                { icon: '📍', title: 'Ubicación', text: 'Santiago, Chile', href: '#' },
              ].map(item => (
                <a href={item.href} target="_blank" rel="noopener noreferrer" key={item.title}
                  style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="vitra-contact-item">
                    <div className="vitra-contact-icon">{item.icon}</div>
                    <div>
                      <div className="vitra-contact-item-title">{item.title}</div>
                      <div className="vitra-contact-item-text">{item.text}</div>
                    </div>
                  </div>
                </a>
              ))}

              {/* WhatsApp directo */}
              <a
                href={`https://wa.me/${WHATSAPP_NUM}?text=Hola%20VITRA%2C%20quiero%20hacer%20un%20pedido%20especial`}
                target="_blank"
                rel="noopener noreferrer"
                className="vitra-btn"
                style={{ marginTop: 8 }}
              >
                💬 Chatear por WhatsApp
              </a>
            </div>

            {/* Formulario */}
            <div>
              {sent ? (
                <div style={{
                  background: 'var(--vitra-green-light)',
                  border: '1.5px solid var(--vitra-green)',
                  borderRadius: 8,
                  padding: '48px 36px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--vitra-green)', marginBottom: 8 }}>
                    ¡Mensaje enviado!
                  </h3>
                  <p style={{ color: 'var(--vitra-text-muted)', marginBottom: 24 }}>
                    Te abrimos WhatsApp con tu mensaje listo. ¡Nos vemos ahí!
                  </p>
                  <button className="vitra-btn vitra-btn-outline" onClick={() => setSent(false)}>
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form className="vitra-form" onSubmit={handleSubmit}>
                  <div className="vitra-form-row">
                    <input
                      id="contact-nombre"
                      className="vitra-input"
                      type="text"
                      name="nombre"
                      placeholder="Tu nombre"
                      required
                      value={form.nombre}
                      onChange={handleChange}
                    />
                    <input
                      id="contact-email"
                      className="vitra-input"
                      type="email"
                      name="email"
                      placeholder="Tu email"
                      required
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <select
                    id="contact-asunto"
                    className="vitra-input"
                    name="asunto"
                    value={form.asunto}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona el motivo...</option>
                    <option value="Pedido corporativo">Pedido corporativo</option>
                    <option value="Diseño personalizado">Diseño personalizado</option>
                    <option value="Boda o evento">Boda o evento</option>
                    <option value="Duda sobre un pedido">Duda sobre un pedido</option>
                    <option value="Otro">Otro</option>
                  </select>

                  <textarea
                    id="contact-mensaje"
                    className="vitra-textarea"
                    name="mensaje"
                    placeholder="Cuéntanos más... ¿qué tienes en mente?"
                    required
                    value={form.mensaje}
                    onChange={handleChange}
                  />

                  <button id="contact-submit" type="submit" className="vitra-btn">
                    Enviar por WhatsApp →
                  </button>

                  <p style={{ fontSize: 12, color: 'var(--vitra-text-muted)' }}>
                    El formulario abre WhatsApp con tu mensaje listo. Sin esperas.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <VitraFooter />
    </div>
  );
}
