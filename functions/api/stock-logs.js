/**
 * Cloudflare Pages Function - Stock Logs & Disbursed Registry REST API
 * Endpoint: /api/stock-logs
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function ensureStockLogsTable(db) {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS stock_logs (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        productId TEXT NOT NULL,
        productName TEXT NOT NULL,
        sku TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        previousStock INTEGER NOT NULL DEFAULT 0,
        newStock INTEGER NOT NULL DEFAULT 0,
        serials TEXT,
        recipient TEXT,
        projectName TEXT,
        referenceDoc TEXT,
        note TEXT,
        operator TEXT,
        createdAt TEXT DEFAULT (datetime('now'))
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS disbursed_logs (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        productId TEXT NOT NULL,
        productName TEXT NOT NULL,
        sku TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        serials TEXT,
        recipient TEXT,
        projectName TEXT,
        technician TEXT,
        note TEXT,
        status TEXT DEFAULT 'Delivered',
        createdAt TEXT DEFAULT (datetime('now'))
      );
    `)
  ]);
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
    await ensureStockLogsTable(db);

    // GET: Retrieve all stock movement logs and disbursed equipment logs
    if (request.method === 'GET') {
      const [stockLogsRes, disbursedLogsRes] = await Promise.all([
        db.prepare("SELECT * FROM stock_logs ORDER BY createdAt DESC LIMIT 200").all(),
        db.prepare("SELECT * FROM disbursed_logs ORDER BY createdAt DESC LIMIT 200").all()
      ]);

      const stockLogs = (stockLogsRes.results || []).map(l => ({
        ...l,
        serials: l.serials ? (typeof l.serials === 'string' ? JSON.parse(l.serials) : l.serials) : []
      }));

      const disbursedLogs = (disbursedLogsRes.results || []).map(d => ({
        ...d,
        serials: d.serials ? (typeof d.serials === 'string' ? JSON.parse(d.serials) : d.serials) : []
      }));

      return new Response(JSON.stringify({
        success: true,
        data: {
          stockLogs,
          disbursedLogs
        }
      }), { status: 200, headers: CORS_HEADERS });
    }

    // POST: Record new stock movement or disbursement
    if (request.method === 'POST') {
      const body = await request.json();
      const { type, logType } = body;

      // Check if this is a disbursed log
      if (logType === 'disbursed' || body.recipient || body.technician) {
        const disbId = body.id || `DISB-${Date.now().toString().slice(-6)}`;
        await db.prepare(`
          INSERT INTO disbursed_logs (id, date, productId, productName, sku, quantity, serials, recipient, projectName, technician, note, status, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          disbId,
          body.date || new Date().toISOString().slice(0, 10),
          body.productId || '',
          body.productName || '',
          body.sku || '',
          Number(body.quantity) || 1,
          JSON.stringify(body.serials || []),
          body.recipient || '',
          body.projectName || '',
          body.technician || 'Admin',
          body.note || '',
          body.status || 'Delivered',
          body.createdAt || new Date().toISOString()
        ).run();
      }

      // Record in stock_logs
      const logId = body.id || `LOG-${Date.now().toString().slice(-6)}`;
      await db.prepare(`
        INSERT INTO stock_logs (id, date, productId, productName, sku, type, quantity, previousStock, newStock, serials, recipient, projectName, referenceDoc, note, operator, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        logId,
        body.date || new Date().toISOString().slice(0, 10),
        body.productId || '',
        body.productName || '',
        body.sku || '',
        type || 'In',
        Number(body.quantity) || 1,
        Number(body.previousStock) || 0,
        Number(body.newStock) || 0,
        JSON.stringify(body.serials || []),
        body.recipient || '',
        body.projectName || '',
        body.referenceDoc || '',
        body.note || '',
        body.operator || 'Admin',
        body.createdAt || new Date().toISOString()
      ).run();

      return new Response(JSON.stringify({
        success: true,
        message: "Stock movement recorded successfully in Cloudflare D1."
      }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), { status: 500, headers: CORS_HEADERS });
  }
}
