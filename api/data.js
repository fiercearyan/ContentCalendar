// Vercel serverless function: stores the content calendar in Upstash Redis.
// Same setup as the streaks app — env vars (set automatically when you connect Upstash Redis in Vercel → Storage):
//   KV_REST_API_URL / KV_REST_API_TOKEN   (or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)
// Plus one you add yourself:
//   APP_PASSCODE   – passcode you type once per device
// Keys are prefixed "contentcal:" so this can share one Redis database with streaks.

const env = process.env;
const pick = (names, suffix) => {
  for (const n of names) if (env[n]) return env[n];
  const k = Object.keys(env).find(k => k.endsWith(suffix) && !k.includes('READ_ONLY'));
  return k ? env[k] : undefined;
};
const DB_URL = pick(['KV_REST_API_URL', 'UPSTASH_KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL'], 'REST_API_URL') || pick([], 'REDIS_REST_URL');
const DB_TOKEN = pick(['KV_REST_API_TOKEN', 'UPSTASH_KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN'], 'REST_API_TOKEN') || pick([], 'REDIS_REST_TOKEN');
const PASSCODE = env.APP_PASSCODE;
const KEY = 'contentcal:state';

async function redis(commands) {
  const r = await fetch(`${DB_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${DB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error(`Database error ${r.status}`);
  return (await r.json()).map(x => { if (x.error) throw new Error(x.error); return x.result; });
}

// Merge two calendar states post-by-post (newest edit wins), keeping deletions as tombstones.
// Must stay in step with merge() in index.html.
function merge(a, b) {
  if (!a) return b;
  if (!b) return a;
  const deleted = { ...(a.deleted || {}) };
  Object.entries(b.deleted || {}).forEach(([id, t]) => { deleted[id] = Math.max(deleted[id] || 0, t); });
  const byId = {};
  [...(a.items || []), ...(b.items || [])].forEach(it => {
    const cur = byId[it.id];
    if (!cur || (it.updatedAt || 0) > (cur.updatedAt || 0)) byId[it.id] = it;
  });
  const cutoff = Date.now() - 90 * 864e5;
  Object.keys(deleted).forEach(id => { if (deleted[id] < cutoff) delete deleted[id]; });
  const items = Object.values(byId).filter(it => !(deleted[it.id] >= (it.updatedAt || 0)));
  const bNewer = (b.channelsAt || 0) >= (a.channelsAt || 0);
  return {
    version: 1,
    channels: bNewer ? b.channels : a.channels,
    channelsAt: Math.max(a.channelsAt || 0, b.channelsAt || 0),
    items, deleted,
  };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!DB_URL || !DB_TOKEN) return res.status(500).json({ error: 'Database not connected. Add Upstash Redis under Vercel → Storage.' });
  if (!PASSCODE) return res.status(500).json({ error: 'APP_PASSCODE is not set in Vercel environment variables.' });
  if (req.headers['x-passcode'] !== PASSCODE) return res.status(401).json({ error: 'Wrong passcode' });

  try {
    const [raw] = await redis([['GET', KEY]]);
    const current = raw ? JSON.parse(raw) : null;

    if (req.method === 'GET') return res.status(200).json({ state: current });

    if (req.method === 'PUT') {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!body || !Array.isArray(body.items) || !Array.isArray(body.channels))
        return res.status(400).json({ error: 'Invalid calendar data' });
      const merged = merge(current, body);
      const json = JSON.stringify(merged);
      if (json.length > 900000) return res.status(413).json({ error: 'Calendar too large' });
      await redis([['SET', KEY, json]]);
      return res.status(200).json({ state: merged });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
};
