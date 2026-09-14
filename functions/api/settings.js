/**
 * Cloudflare Pages Function - Settings REST API
 * Endpoint: /api/settings
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function ensureSettingsTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT DEFAULT (datetime('now'))
    );
  `).run();
}

export async function onRequest(context) {
  const { env, request } = context;
  const db = env.DB;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (!db) {
    return new Response(JSON.stringify({ success: false, error: "D1 DB binding not found." }), { status: 500, headers: CORS_HEADERS });
  }

  try {
    await ensureSettingsTable(db);

    if (request.method === 'GET') {
      const row = await db.prepare("SELECT value FROM settings WHERE key = 'profile'").first();
      let settings = {};
      if (row && row.value) {
        settings = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
      }
      return new Response(JSON.stringify({ success: true, data: settings }), { status: 200, headers: CORS_HEADERS });
    }

    if (request.method === 'POST') {
      const payload = await request.json();
      await db.prepare(`
        INSERT INTO settings (key, value, updatedAt)
        VALUES ('profile', ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updatedAt = datetime('now');
      `).bind(JSON.stringify(payload)).run();

      return new Response(JSON.stringify({ success: true, message: "Settings updated in Cloudflare D1" }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), { status: 500, headers: CORS_HEADERS });
  }
}
