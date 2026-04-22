import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const WHATSAPP = 'https://wa.me/56912345678?text=Hola%20VITRA%2C%20me%20interesa%20un%20vaso%20%F0%9F%A5%82';

export function VitraHeader() {
  const { pathname } = useLocation();
  const isActive = (path: string) => pathname === path ? 'active' : '';

  return (
    <>
      <header className="vitra-header">
        <div className="vitra-wrap">
          <div className="vitra-header-inner">
            <Link to="/vitra" className="vitra-logo">
              <span className="vitra-logo-main">VITRA</span>
              <span className="vitra-logo-sub">by EcoOrigen</span>
            </Link>

            <nav>
              <ul className="vitra-nav">
                <li><Link to="/vitra/tienda" className={isActive('/vitra/tienda')}>Tienda</Link></li>
                <li><Link to="/vitra/mascotas" className={isActive('/vitra/mascotas')} style={pathname === '/vitra/mascotas' ? {} : { color: '#B8956A' }}>🐾 Mascotas</Link></li>
                <li><Link to="/vitra/como-se-hace" className={isActive('/vitra/como-se-hace')}>Cómo se Hace</Link></li>
                <li><Link to="/vitra/sobre" className={isActive('/vitra/sobre')}>Nosotros</Link></li>
                <li><Link to="/vitra/contacto" className={isActive('/vitra/contacto')}>Contacto</Link></li>
              </ul>
            </nav>

            <a href="https://ecoorigenchile.myshopify.com/collections/all" target="_blank" rel="noopener noreferrer" className="vitra-header-cta">
              Comprar →
            </a>
          </div>
        </div>
      </header>

      {/* WhatsApp flotante */}
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="vitra-whatsapp-float" title="Soporte por WhatsApp">
        💬
      </a>
    </>
  );
}
