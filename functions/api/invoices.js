/**
 * Cloudflare Pages Function - Invoices & Quotations REST API
 * Endpoint: /api/invoices
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function ensureInvoiceTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      docNo TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'Quotation',
      refQuotationId TEXT,
      refQuotationNo TEXT,
      customerId TEXT,
      customerName TEXT,
      contactPerson TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      projectId TEXT,
      projectName TEXT,
      issueDate TEXT NOT NULL,
      validUntil TEXT,
      dueDate TEXT,
      status TEXT DEFAULT 'Draft',
      items TEXT NOT NULL DEFAULT '[]',
      subtotal REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      taxRate REAL NOT NULL DEFAULT 0,
      taxAmount REAL NOT NULL DEFAULT 0,
      grandTotal REAL NOT NULL DEFAULT 0,
      terms TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `).run();

  // Self-heal optional columns if the table was created by an older schema
  const alters = [
    "ALTER TABLE invoices ADD COLUMN status TEXT DEFAULT 'Draft'",
    "ALTER TABLE invoices ADD COLUMN validUntil TEXT",
    "ALTER TABLE invoices ADD COLUMN dueDate TEXT",
    "ALTER TABLE invoices ADD COLUMN refQuotationId TEXT",
    "ALTER TABLE invoices ADD COLUMN refQuotationNo TEXT",
    "ALTER TABLE invoices ADD COLUMN terms TEXT",
    "ALTER TABLE invoices ADD COLUMN validityDays INTEGER DEFAULT 30"
  ];
  for (const sql of alters) {
    try {
      await db.prepare(sql).run();
    } catch (e) {
      // Column already exists
    }
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
    await ensureInvoiceTable(db);

    if (request.method === 'GET') {
      if (id) {
        const inv = await db.prepare("SELECT * FROM invoices WHERE id = ?").bind(id).first();
        if (!inv) return new Response(JSON.stringify({ error: "Document not found" }), { status: 404, headers: CORS_HEADERS });
        return new Response(JSON.stringify({
          success: true,
          data: {
            ...inv,
            items: inv.items ? (typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items) : []
          }
        }), { status: 200, headers: CORS_HEADERS });
      }

      const { results } = await db.prepare("SELECT * FROM invoices ORDER BY issueDate DESC").all();
      const mapped = (results || []).map(inv => ({
        ...inv,
        items: inv.items ? (typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items) : []
      }));
      return new Response(JSON.stringify({ success: true, data: mapped }), { status: 200, headers: CORS_HEADERS });
    }

    if (request.method === 'POST') {
      const inv = await request.json();
      const newId = inv.id || `DOC-${Date.now()}`;

      // Check if docNo collides with another existing document
      let docNo = inv.docNo || `DOC-${Date.now().toString().slice(-4)}`;
      try {
        const existing = await db.prepare("SELECT id FROM invoices WHERE docNo = ? AND id != ?").bind(docNo, newId).first();
        if (existing) {
          docNo = `${docNo}-${Date.now().toString().slice(-4)}`;
        }
      } catch (e) {}

      await db.prepare(`
        INSERT INTO invoices (id, docNo, type, refQuotationId, refQuotationNo, customerId, customerName, contactPerson, phone, email, address, projectId, projectName, issueDate, validUntil, dueDate, status, items, subtotal, discount, taxRate, taxAmount, grandTotal, terms, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          docNo = excluded.docNo,
          type = excluded.type,
          refQuotationId = excluded.refQuotationId,
          refQuotationNo = excluded.refQuotationNo,
          customerId = excluded.customerId,
          customerName = excluded.customerName,
          contactPerson = excluded.contactPerson,
          phone = excluded.phone,
          email = excluded.email,
          address = excluded.address,
          projectId = excluded.projectId,
          projectName = excluded.projectName,
          issueDate = excluded.issueDate,
          validUntil = excluded.validUntil,
          dueDate = excluded.dueDate,
          status = excluded.status,
          items = excluded.items,
          subtotal = excluded.subtotal,
          discount = excluded.discount,
          taxRate = excluded.taxRate,
          taxAmount = excluded.taxAmount,
          grandTotal = excluded.grandTotal,
          terms = excluded.terms;
      `).bind(
        newId, docNo, inv.type || 'Quotation',
        inv.refQuotationId || null, inv.refQuotationNo || null,
        inv.customerId || '', inv.customerName || 'General Client', inv.contactPerson || '', inv.phone || '',
        inv.email || '', inv.address || '', inv.projectId || '', inv.projectName || '',
        inv.issueDate || new Date().toISOString().slice(0, 10), inv.validUntil || null, inv.dueDate || null,
        inv.status || (inv.type === 'Quotation' ? 'Sent' : 'Unpaid'),
        JSON.stringify(inv.items || []), Number(inv.subtotal) || 0, Number(inv.discount) || 0,
        0, 0, Number(inv.grandTotal) || 0,
        inv.terms || '', inv.createdAt || new Date().toISOString()
      ).run();

      const saved = await db.prepare("SELECT * FROM invoices WHERE id = ?").bind(newId).first();
      return new Response(JSON.stringify({
        success: true,
        data: {
          ...saved,
          items: saved && saved.items ? (typeof saved.items === 'string' ? JSON.parse(saved.items) : saved.items) : []
        }
      }), { status: 200, headers: CORS_HEADERS });
    }

    if (request.method === 'DELETE') {
      const targetId = id || (await request.json().catch(() => ({}))).id;
      if (!targetId) return new Response(JSON.stringify({ error: "Missing document id" }), { status: 400, headers: CORS_HEADERS });
      await db.prepare("DELETE FROM invoices WHERE id = ?").bind(targetId).run();
      return new Response(JSON.stringify({ success: true, message: "Document deleted" }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), { status: 500, headers: CORS_HEADERS });
  }
}
