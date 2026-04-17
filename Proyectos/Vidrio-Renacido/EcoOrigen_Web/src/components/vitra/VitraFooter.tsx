import React from 'react';
import { Link } from 'react-router-dom';

export function VitraFooter() {
  return (
    <footer className="vitra-footer">
      <div className="vitra-wrap">
        <div className="vitra-footer-grid">
          <div>
            <div className="vitra-footer-brand">VITRA</div>
            <p className="vitra-footer-tagline">"De botella a vaso, con estilo."</p>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>
              Vasos únicos hechos de botellas recicladas. Diseño chileno,
              impacto global. Cada vaso salva una botella del basural.
            </p>
          </div>

          <div>
            <div className="vitra-footer-col-title">Tienda</div>
            <ul className="vitra-footer-links">
              <li><a href="https://ecoorigenchile.myshopify.com/collections/simples" target="_blank" rel="noopener noreferrer">Simples</a></li>
              <li><a href="https://ecoorigenchile.myshopify.com/collections/frases" target="_blank" rel="noopener noreferrer">Con Frases</a></li>
              <li><a href="https://ecoorigenchile.myshopify.com/collections/animales" target="_blank" rel="noopener noreferrer">Animales</a></li>
              <li><a href="https://ecoorigenchile.myshopify.com/collections/bodas-empresas" target="_blank" rel="noopener noreferrer">Bodas & Empresas</a></li>
            </ul>
          </div>

          <div>
            <div className="vitra-footer-col-title">VITRA</div>
            <ul className="vitra-footer-links">
              <li><Link to="/vitra/como-se-hace">Cómo se hace</Link></li>
              <li><Link to="/vitra/sobre">Nosotros</Link></li>
              <li><Link to="/vitra/contacto">Contacto</Link></li>
              <li><Link to="/">EcoOrigen Chile</Link></li>
            </ul>
          </div>

          <div>
            <div className="vitra-footer-col-title">Soporte</div>
            <ul className="vitra-footer-links">
              <li><a href="https://wa.me/56900000000" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a></li>
              <li><a href="mailto:hola@ecoorigen.cl">hola@ecoorigen.cl</a></li>
              <li><a href="#">Preguntas Frecuentes</a></li>
              <li><a href="#">Envíos y Devoluciones</a></li>
            </ul>
          </div>
        </div>

        <div className="vitra-footer-bottom">
          <span>© {new Date().getFullYear()} VITRA — EcoOrigen Chile. Todos los derechos reservados.</span>
          <span>Hecho con 💚 en Chile</span>
        </div>
      </div>
    </footer>
  );
}
