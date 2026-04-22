import React, { useState, useEffect } from 'react';
import '../../vitra.css';
import { VitraHeader } from '../../components/vitra/VitraHeader';
import { VitraFooter } from '../../components/vitra/VitraFooter';

// ⚠️ SEGURIDAD: tokens en .env — nunca hardcodeados
const SHOPIFY_STORE = import.meta.env.VITE_SHOPIFY_STORE || 'ecoorigenchile.myshopify.com';
const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';

interface Product {
  id: string;
  title: string;
  price: string;
  currency: string;
  image: string;
  handle: string;
}

const COLLECTIONS = [
  { label: 'Todos', tag: '' },
  { label: 'Simples', tag: 'simples' },
  { label: 'Con Frases', tag: 'frases' },
  { label: 'Animales', tag: 'animales' },
  { label: 'Mascotas', tag: 'mascotas' },
  { label: 'Bodas & Empresas', tag: 'bodas' },
];

export default function VitraTienda() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!SHOPIFY_TOKEN) {
        console.warn('VITE_SHOPIFY_STOREFRONT_TOKEN no configurado en .env');
        setLoading(false);
        return;
      }
      setLoading(true);
      const tagFilter = activeFilter ? `, query: "tag:${activeFilter}"` : '';
      const query = `{
        products(first: 24${tagFilter}) {
          edges {
            node {
              id title handle
              priceRange { minVariantPrice { amount currencyCode } }
              images(first: 1) { edges { node { url } } }
            }
          }
        }
      }`;
      try {
        const res = await fetch(`https://${SHOPIFY_STORE}/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
          },
          body: JSON.stringify({ query }),
        });
        const json = await res.json();
        setProducts(json.data.products.edges.map((e: any) => ({
          id: e.node.id,
          title: e.node.title,
          handle: e.node.handle,
          price: e.node.priceRange.minVariantPrice.amount,
          currency: e.node.priceRange.minVariantPrice.currencyCode,
          image: e.node.images.edges[0]?.node.url || '',
        })));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [activeFilter]);

  return (
    <div className="vitra-page">
      <VitraHeader />

      <div className="vitra-page-header">
        <div className="vitra-wrap">
          <div className="vitra-eyebrow">Tienda VITRA</div>
          <h1 className="vitra-page-header-title">Catálogo</h1>
          <p className="vitra-page-header-sub">Vasos únicos, hechos de botellas recicladas</p>
        </div>
      </div>

      <section className="vitra-section">
        <div className="vitra-wrap">
          {/* Filtros */}
          <div className="vitra-filters">
            {COLLECTIONS.map(c => (
              <button
                key={c.label}
                id={`filter-${c.label.toLowerCase().replace(/\s/g, '-')}`}
                className={`vitra-filter-pill ${activeFilter === c.tag ? 'active' : ''}`}
                onClick={() => setActiveFilter(c.tag)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {!SHOPIFY_TOKEN ? (
            <div className="vitra-loading">
              ⚠️ Token de Shopify no configurado.<br />
              <span style={{ fontSize: 14, color: 'var(--vitra-text-muted)' }}>
                Configura VITE_SHOPIFY_STOREFRONT_TOKEN en tu archivo .env
              </span>
            </div>
          ) : loading ? (
            <div className="vitra-loading">Cargando vasos...</div>
          ) : products.length === 0 ? (
            <div className="vitra-loading">
              No hay productos en esta colección aún.<br />
              <a
                href={`https://${SHOPIFY_STORE}/collections/all`}
                target="_blank"
                rel="noopener noreferrer"
                className="vitra-btn"
                style={{ marginTop: 24, display: 'inline-flex' }}
              >
                Ver todos en Shopify →
              </a>
            </div>
          ) : (
            <div className="vitra-products-grid">
              {products.map(p => (
                <div key={p.id} className="vitra-product-card">
                  <div className="vitra-product-img-wrap">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="vitra-product-img" loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🥃</div>
                    )}
                  </div>
                  <div className="vitra-product-body">
                    <div className="vitra-product-name">{p.title}</div>
                    <div className="vitra-product-price">
                      ${parseFloat(p.price).toLocaleString('es-CL')} {p.currency}
                    </div>
                    <a
                      href={`https://${SHOPIFY_STORE}/products/${p.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="vitra-btn"
                      style={{ width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}
                    >
                      Comprar →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <VitraFooter />
    </div>
  );
}
