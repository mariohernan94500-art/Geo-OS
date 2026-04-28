import express from 'express';

const paymentsRouter = express.Router();

let stripe = null;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

if (STRIPE_KEY && STRIPE_KEY.startsWith('sk_')) {
  try {
    const Stripe = (await import('stripe')).default;
    stripe = new Stripe(STRIPE_KEY);
    console.log('[Payments] Stripe initialized');
  } catch (err) {
    console.log('[Payments] Stripe SDK not available, payment features disabled');
  }
} else {
  console.log('[Payments] No Stripe key configured, payment features disabled');
}

// POST /subscribe — create a Stripe checkout session for a subscription plan
paymentsRouter.post('/subscribe', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Pagos no configurados' });
    }

    const { plan, userId } = req.body;

    if (!plan || !userId) {
      return res.status(400).json({ error: 'plan and userId are required' });
    }

    const validPlans = ['basic', 'pro'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Must be "basic" or "pro"' });
    }

    const envKey = plan === 'basic' ? 'STRIPE_PRICE_ID_BASIC' : 'STRIPE_PRICE_ID_PRO';
    const priceId = process.env[envKey];

    if (!priceId) {
      console.error(`[Payments] Missing price ID for plan "${plan}" (env: ${envKey})`);
      return res.status(500).json({ error: 'Price not configured for this plan' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard.html`,
      client_reference_id: userId,
      metadata: { plan }
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[Payments] Subscribe error:', err.message);
    return res.status(500).json({ error: 'Error creating checkout session' });
  }
});

// POST /portal — create a Stripe billing portal session
paymentsRouter.post('/portal', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Pagos no configurados' });
    }

    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard.html`
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[Payments] Portal error:', err.message);
    return res.status(500).json({ error: 'Error creating portal session' });
  }
});

// POST /webhook — handle Stripe webhook events
paymentsRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Pagos no configurados' });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.log('[Payments] Webhook received but no webhook secret configured — skipping verification');
      return res.status(200).json({ received: true });
    }

    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (verifyErr) {
      console.error('[Payments] Webhook signature verification failed:', verifyErr.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const plan = session.metadata?.plan;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        console.log(`[Payments] Checkout completed — userId: ${userId}, plan: ${plan}, customer: ${customerId}, subscription: ${subscriptionId}`);

        // Update user in DB with Stripe info
        // The database module is available at ../database/sqlite.js
        // but to keep this module self-contained and avoid coupling,
        // we emit the data and let the main app handle persistence.
        try {
          const { getDatabase } = await import('../database/sqlite.js');
          const db = await getDatabase();
          if (db && userId) {
            await db.run(
              `CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                stripe_customer_id TEXT,
                stripe_subscription_id TEXT,
                plan TEXT,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )`
            );
            await db.run(
              `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan) VALUES (?, ?, ?, ?)`,
              [userId, customerId, subscriptionId, plan]
            );
            console.log(`[Payments] Subscription saved for user ${userId}`);
          }
        } catch (dbErr) {
          console.error('[Payments] DB update error:', dbErr.message);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log(`[Payments] Subscription updated: ${subscription.id}, status: ${subscription.status}`);
        try {
          const { getDatabase } = await import('../database/sqlite.js');
          const db = await getDatabase();
          if (db) {
            await db.run(
              `UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ?`,
              [subscription.status, subscription.id]
            );
          }
        } catch (dbErr) {
          console.error('[Payments] DB update error on subscription update:', dbErr.message);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(`[Payments] Subscription deleted: ${subscription.id}`);
        try {
          const { getDatabase } = await import('../database/sqlite.js');
          const db = await getDatabase();
          if (db) {
            await db.run(
              `UPDATE subscriptions SET status = 'canceled' WHERE stripe_subscription_id = ?`,
              [subscription.id]
            );
          }
        } catch (dbErr) {
          console.error('[Payments] DB update error on subscription deletion:', dbErr.message);
        }
        break;
      }

      default:
        console.log(`[Payments] Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Payments] Webhook error:', err.message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export { paymentsRouter };
