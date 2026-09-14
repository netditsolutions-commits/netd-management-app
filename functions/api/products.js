/**
 * Cloudflare Pages Function - Products REST API
 * Endpoint: /api/products
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function ensureProductTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      brand TEXT,
      model TEXT,
      category TEXT NOT NULL DEFAULT 'General',
      costPrice REAL NOT NULL DEFAULT 0,
      salePrice REAL NOT NULL DEFAULT 0,
      stockQty INTEGER NOT NULL DEFAULT 0,
      minAlert INTEGER NOT NULL DEFAULT 5,
      unit TEXT DEFAULT 'Unit',
      warrantyMonths INTEGER DEFAULT 12,
      serial TEXT,
      serials TEXT,
      status TEXT DEFAULT 'Active',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
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
    return new Response(JSON.stringify({ success: false, error: "D1 database binding 'DB' not found." }), { status: 500, headers: CORS_HEADERS });
  }

  try {
    await ensureProductTable(db);

    // GET: List all products or single by ID
    if (request.method === 'GET') {
      if (id) {
        const prod = await db.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
        if (!prod) return new Response(JSON.stringify({ error: "Product not found" }), { status: 404, headers: CORS_HEADERS });
        return new Response(JSON.stringify({
          success: true,
          data: {
            ...prod,
            serials: prod.serials ? (typeof prod.serials === 'string' ? JSON.parse(prod.serials) : prod.serials) : []
          }
        }), { status: 200, headers: CORS_HEADERS });
      }
      const { results } = await db.prepare("SELECT * FROM products ORDER BY createdAt DESC").all();
      const mapped = (results || []).map(p => ({
        ...p,
        serials: p.serials ? (typeof p.serials === 'string' ? JSON.parse(p.serials) : p.serials) : []
      }));
      return new Response(JSON.stringify({ success: true, data: mapped }), { status: 200, headers: CORS_HEADERS });
    }

    // POST: Create or Update Product
    if (request.method === 'POST') {
      const p = await request.json();
      const newId = p.id || `PROD-${Date.now()}`;
      
      await db.prepare(`
        INSERT INTO products (id, sku, name, brand, model, category, costPrice, salePrice, stockQty, minAlert, unit, warrantyMonths, serial, serials, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          sku = excluded.sku,
          name = excluded.name,
          brand = excluded.brand,
          model = excluded.model,
          category = excluded.category,
          costPrice = excluded.costPrice,
          salePrice = excluded.salePrice,
          stockQty = excluded.stockQty,
          minAlert = excluded.minAlert,
          unit = excluded.unit,
          warrantyMonths = excluded.warrantyMonths,
          serial = excluded.serial,
          serials = excluded.serials,
          status = excluded.status,
          updatedAt = datetime('now');
      `).bind(
        newId, p.sku || `NET-${Date.now().toString().slice(-4)}`, p.name || 'Product',
        p.brand || '', p.model || '', p.category || 'General',
        Number(p.costPrice) || 0, Number(p.salePrice) || 0, Number(p.stockQty) || 0,
        Number(p.minAlert) || 5, p.unit || 'Unit', Number(p.warrantyMonths) || 12,
        p.serial || '', JSON.stringify(p.serials || []), p.status || 'Active',
        p.createdAt || new Date().toISOString(), new Date().toISOString()
      ).run();

      const saved = await db.prepare("SELECT * FROM products WHERE id = ?").bind(newId).first();
      return new Response(JSON.stringify({
        success: true,
        data: {
          ...saved,
          serials: saved && saved.serials ? (typeof saved.serials === 'string' ? JSON.parse(saved.serials) : saved.serials) : []
        }
      }), { status: 200, headers: CORS_HEADERS });
    }

    // DELETE: Delete Product
    if (request.method === 'DELETE') {
      const targetId = id || (await request.json().catch(() => ({}))).id;
      if (!targetId) return new Response(JSON.stringify({ error: "Missing product id" }), { status: 400, headers: CORS_HEADERS });
      await db.prepare("DELETE FROM products WHERE id = ?").bind(targetId).run();
      return new Response(JSON.stringify({ success: true, message: "Product deleted" }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), { status: 500, headers: CORS_HEADERS });
  }
}
