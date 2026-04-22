import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import VitraLanding from './pages/vitra/VitraLanding';
import VitraTienda from './pages/vitra/VitraTienda';
import VitraComoSeHace from './pages/vitra/VitraComoSeHace';
import VitraSobre from './pages/vitra/VitraSobre';
import VitraContacto from './pages/vitra/VitraContacto';
import VitraMascotas from './pages/vitra/VitraMascotas';

// ⚠️ SEGURIDAD: tokens en .env — nunca hardcodeados
const SHOPIFY_STORE = import.meta.env.VITE_SHOPIFY_STORE || 'ecoorigenchile.myshopify.com';
const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';

interface Product {
  id: string;
  title: string;
  price: string;
  currency: string;
  image: string;
}

function EcoOrigenHome() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchShopifyProducts = async () => {
      if (!SHOPIFY_TOKEN) { setLoading(false); return; }
      const query = `{
        products(first: 8) {
          edges {
            node {
              id title
              priceRange { minVariantPrice { amount currencyCode } }
              images(first: 1) { edges { node { url } } }
            }
          }
        }
      }`;
      try {
        const res = await fetch(`https://${SHOPIFY_STORE}/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN },
          body: JSON.stringify({ query }),
        });
        const json = await res.json();
        setProducts(json.data.products.edges.map((e: any) => ({
          id: e.node.id,
          title: e.node.title,
          price: e.node.priceRange.minVariantPrice.amount,
          currency: e.node.priceRange.minVariantPrice.currencyCode,
          image: e.node.images.edges[0]?.node.url || '',
        })));
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchShopifyProducts();
  }, []);

  return (
    <div className="fade-in">
      <div className="eco-container">
        <header className="header">
          <div className="logo">🌱 EcoOrigen</div>
          <nav className="nav-links">
            <a href="#tienda">Tienda</a>
            <a href="#sustentabilidad">Sustentabilidad</a>
            <a href="/vitra" style={{ color: '#0F3D2E', fontWeight: 600 }}>VITRA ✦</a>
          </nav>
          <button className="eco-btn eco-btn-outline">🛒 Carrito (0)</button>
        </header>
      </div>
      <section className="hero-section">
        <div className="eco-container">
          <div className="hero-content">
            <h1 className="hero-title">Vuelve a lo natural</h1>
            <p className="hero-subtitle">Productos ecológicos y sostenibles para un futuro más verde.</p>
            <button className="eco-btn">Descubrir Productos</button>
          </div>
        </div>
      </section>
      <div className="feature-bar">
        <div className="feature-item">📦 Envío Gratis desde $25.000</div>
        <div className="feature-item">🌿 Productos 100% Ecológicos</div>
        <div className="feature-item">🔒 Compras Seguras y Protegidas</div>
      </div>
      <div className="eco-container" id="tienda">
        <h2 className="section-title">Nuestros Productos</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>Cargando catálogo... 🌱</div>
        ) : (
          <div className="products-grid">
            {products.map(p => (
              <div key={p.id} className="product-card">
                {p.image && <img src={p.image} alt={p.title} className="product-img" loading="lazy" />}
                <div className="product-title">{p.title}</div>
                <div className="product-stars">★★★★★</div>
                <div className="product-price">${parseFloat(p.price).toLocaleString('es-CL')} {p.currency}</div>
                <button className="eco-btn" style={{ width: '100%' }}>Añadir al Carrito</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<EcoOrigenHome />} />
      <Route path="/vitra" element={<VitraLanding />} />
      <Route path="/vitra/tienda" element={<VitraTienda />} />
      <Route path="/vitra/mascotas" element={<VitraMascotas />} />
      <Route path="/vitra/como-se-hace" element={<VitraComoSeHace />} />
      <Route path="/vitra/sobre" element={<VitraSobre />} />
      <Route path="/vitra/contacto" element={<VitraContacto />} />
    </Routes>
  );
}

export default App;
