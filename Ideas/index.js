// modules/marketplace/index.js — v4 placeholder
// Marketplace de compra/venta de apps generado por Geo
// Se implementará en la versión 4 con NFT ERC-721 en Polygon

import express from 'express';

const marketplaceRouter = express.Router();

// GET /listings — listar apps en venta
marketplaceRouter.get('/listings', async (req, res) => {
  try {
    const { getDatabase } = await import('../database/sqlite.js');
    const db = await getDatabase();
    const listings = await db.all('SELECT * FROM marketplace_listings WHERE status = ?', ['active']);
    return res.json({ listings });
  } catch (err) {
    console.error('[Marketplace] Error listing:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /list — poner una app en venta
marketplaceRouter.post('/list', async (req, res) => {
  try {
    const { appId, sellerId, price, currency } = req.body;
    if (!appId || !sellerId || !price) {
      return res.status(400).json({ error: 'appId, sellerId y price son requeridos' });
    }
    const { v4: uuidv4 } = await import('uuid');
    const { getDatabase } = await import('../database/sqlite.js');
    const db = await getDatabase();
    const id = uuidv4();
    await db.run(
      'INSERT INTO marketplace_listings (id, app_id, seller_id, price, currency) VALUES (?, ?, ?, ?, ?)',
      [id, appId, sellerId, price, currency || 'USD']
    );
    return res.json({ id, appId, price, currency: currency || 'USD', status: 'active' });
  } catch (err) {
    console.error('[Marketplace] Error listing app:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /buy — comprar una app del marketplace
marketplaceRouter.post('/buy', async (req, res) => {
  try {
    const { listingId, buyerId } = req.body;
    if (!listingId || !buyerId) {
      return res.status(400).json({ error: 'listingId y buyerId son requeridos' });
    }
    const { v4: uuidv4 } = await import('uuid');
    const { getDatabase } = await import('../database/sqlite.js');
    const db = await getDatabase();
    const listing = await db.get('SELECT * FROM marketplace_listings WHERE id = ? AND status = ?', [listingId, 'active']);
    if (!listing) {
      return res.status(404).json({ error: 'Listing no encontrado o ya vendido' });
    }
    const purchaseId = uuidv4();
    await db.run(
      'INSERT INTO marketplace_purchases (id, listing_id, buyer_id, price, currency) VALUES (?, ?, ?, ?, ?)',
      [purchaseId, listingId, buyerId, listing.price, listing.currency]
    );
    await db.run(
      'UPDATE marketplace_listings SET status = ? WHERE id = ?',
      ['sold', listingId]
    );
    return res.json({ purchaseId, listingId, buyerId, price: listing.price, currency: listing.currency });
  } catch (err) {
    console.error('[Marketplace] Error buying app:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

export { marketplaceRouter };
