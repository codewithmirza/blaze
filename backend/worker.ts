import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Env = {
  DB: D1Database;
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

app.get('/ping', c => c.text('blaze-it-worker v1'));

// API routes
app.get('/api/tokens', async c => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM tokens 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all();
    return c.json({ success: true, tokens: results || [] });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ success: false, error: 'Failed to fetch tokens' }, 500);
  }
});

app.get('/api/portfolio/:userId', async c => {
  const userId = c.req.param('userId');
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM portfolios 
      WHERE user_id = ? AND balance > 0
    `).bind(userId).all();
    return c.json({ success: true, portfolio: results || [] });
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ success: false, error: 'Failed to fetch portfolio' }, 500);
  }
});

// Serve static assets with SPA fallback
app.all('*', async c => {
  const res = await c.env.ASSETS.fetch(c.req.raw);
  if (res.status === 404 && c.req.method === 'GET') {
    const accept = c.req.header('accept') || '';
    if (accept.includes('text/html')) {
      const url = new URL(c.req.url);
      return await c.env.ASSETS.fetch(new Request(new URL('/index.html', url.origin)));
    }
  }
  return res;
});

export default app;
