/**
 * Cloudflare Pages Function - Customers REST API
 * Endpoint: /api/customers
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function ensureCustomerTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contactPerson TEXT,
      phone TEXT,
      email TEXT,
      type TEXT DEFAULT 'Corporate',
      address TEXT,
      taxId TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `).run();

  const count = await db.prepare("SELECT COUNT(*) as count FROM customers").first();
  if (!count || count.count === 0) {
    await db.prepare(`
      INSERT OR IGNORE INTO customers (id, name, contactPerson, phone, email, type, address, taxId, notes, createdAt)
      VALUES ('CUST-001', 'ລູກຄ້າທົ່ວໄປ (General Customer)', 'General Contact', '+856 20 5555 8899', 'contact@customer.la', 'Retail', 'Vientiane, Lao PDR', '', 'Default Client', datetime('now'))
    `).run();
  }
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
    await ensureCustomerTable(db);

    if (request.method === 'GET') {
      if (id) {
        const cust = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(id).first();
        if (!cust) return new Response(JSON.stringify({ error: "Customer not found" }), { status: 404, headers: CORS_HEADERS });
        return new Response(JSON.stringify({ success: true, data: cust }), { status: 200, headers: CORS_HEADERS });
      }

      const { results } = await db.prepare("SELECT * FROM customers ORDER BY name ASC").all();
      return new Response(JSON.stringify({ success: true, data: results || [] }), { status: 200, headers: CORS_HEADERS });
    }

    if (request.method === 'POST') {
      const c = await request.json();
      const newId = c.id || `CUST-${Date.now()}`;
      await db.prepare(`
        INSERT INTO customers (id, name, contactPerson, phone, email, type, address, taxId, notes, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          contactPerson = excluded.contactPerson,
          phone = excluded.phone,
          email = excluded.email,
          type = excluded.type,
          address = excluded.address,
          taxId = excluded.taxId,
          notes = excluded.notes;
      `).bind(
        newId, c.name || 'Client', c.contactPerson || '', c.phone || '', c.email || '',
        c.type || 'Corporate', c.address || '', c.taxId || '', c.notes || '',
        c.createdAt || new Date().toISOString()
      ).run();

      const saved = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(newId).first();
      return new Response(JSON.stringify({ success: true, data: saved }), { status: 200, headers: CORS_HEADERS });
    }

    if (request.method === 'DELETE') {
      const targetId = id || (await request.json().catch(() => ({}))).id;
      if (!targetId) return new Response(JSON.stringify({ error: "Missing customer id" }), { status: 400, headers: CORS_HEADERS });
      await db.prepare("DELETE FROM customers WHERE id = ?").bind(targetId).run();
      return new Response(JSON.stringify({ success: true, message: "Customer deleted" }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), { status: 500, headers: CORS_HEADERS });
  }
}
