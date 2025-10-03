import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@supabase/supabase-js';

type Env = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

app.get('/ping', c => c.text('blaze-it-worker v1'));

function getSupabase(c: any) {
  const SUPABASE_URL = c.env.SUPABASE_URL as string;
  const SUPABASE_ANON_KEY = c.env.SUPABASE_ANON_KEY as string;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// API routes
app.get('/api/tokens', async c => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return c.json({ success: false, error: 'Failed to fetch tokens' }, 500);
  return c.json({ success: true, tokens: data || [] });
});

app.get('/api/portfolio/:userId', async c => {
  const userId = c.req.param('userId');
  const supabase = getSupabase(c);
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .gt('balance', 0);
  if (error) return c.json({ success: false, error: 'Failed to fetch portfolio' }, 500);
  return c.json({ success: true, portfolio: data || [] });
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
