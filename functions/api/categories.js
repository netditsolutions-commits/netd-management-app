/**
 * Cloudflare Pages Function - Categories REST API
 * Endpoint: /api/categories
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function ensureCategoryTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#2563eb',
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `).run();
}

export async function onRequest(context) {
  const { env, request } = context;
  const db = env.DB;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (!db) {
    return new Response(JSON.stringify({ success: false, error: "D1 DB binding not found." }), { status: 500, headers: CORS_HEADERS });
  }

  try {
    await ensureCategoryTable(db);

    if (request.method === 'GET') {
      const { results } = await db.prepare("SELECT * FROM categories ORDER BY name ASC").all();
      return new Response(JSON.stringify({ success: true, data: results || [] }), { status: 200, headers: CORS_HEADERS });
    }

    if (request.method === 'POST') {
      const cat = await request.json();
      const newId = cat.id || `CAT-${(cat.name || Date.now()).toString().replace(/\s+/g, '-').toUpperCase()}`;
      await db.prepare(`
        INSERT INTO categories (id, name, description, color, createdAt)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          color = excluded.color;
      `).bind(newId, cat.name || 'General', cat.description || '', cat.color || '#2563eb', cat.createdAt || new Date().toISOString()).run();

      const saved = await db.prepare("SELECT * FROM categories WHERE id = ?").bind(newId).first();
      return new Response(JSON.stringify({ success: true, data: saved }), { status: 200, headers: CORS_HEADERS });
    }

    if (request.method === 'DELETE') {
      let body = {};
      try { body = await request.json(); } catch (_) {}
      const targetId = id || body.id;
      const targetName = body.name;
      if (targetId) {
        await db.prepare("DELETE FROM categories WHERE id = ?").bind(targetId).run();
      } else if (targetName) {
        await db.prepare("DELETE FROM categories WHERE name = ?").bind(targetName).run();
      }
      return new Response(JSON.stringify({ success: true, message: "Category deleted" }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), { status: 500, headers: CORS_HEADERS });
  }
}
