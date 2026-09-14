/**
 * Cloudflare Pages Function - Projects REST API
 * Endpoint: /api/projects
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function ensureProjectTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      customerId TEXT,
      customerName TEXT,
      type TEXT DEFAULT 'Network Infrastructure',
      contractValue REAL NOT NULL DEFAULT 0,
      estimatedCost REAL NOT NULL DEFAULT 0,
      startDate TEXT,
      endDate TEXT,
      priority TEXT DEFAULT 'High',
      status TEXT DEFAULT 'In Progress',
      teamLead TEXT,
      description TEXT,
      materials TEXT,
      tasks TEXT,
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
    await ensureProjectTable(db);

    if (request.method === 'GET') {
      if (id) {
        const prj = await db.prepare("SELECT * FROM projects WHERE id = ?").bind(id).first();
        if (!prj) return new Response(JSON.stringify({ error: "Project not found" }), { status: 404, headers: CORS_HEADERS });
        return new Response(JSON.stringify({
          success: true,
          data: {
            ...prj,
            materials: prj.materials ? (typeof prj.materials === 'string' ? JSON.parse(prj.materials) : prj.materials) : [],
            tasks: prj.tasks ? (typeof prj.tasks === 'string' ? JSON.parse(prj.tasks) : prj.tasks) : []
          }
        }), { status: 200, headers: CORS_HEADERS });
      }

      const { results } = await db.prepare("SELECT * FROM projects ORDER BY createdAt DESC").all();
      const mapped = (results || []).map(p => ({
        ...p,
        materials: p.materials ? (typeof p.materials === 'string' ? JSON.parse(p.materials) : p.materials) : [],
        tasks: p.tasks ? (typeof p.tasks === 'string' ? JSON.parse(p.tasks) : p.tasks) : []
      }));
      return new Response(JSON.stringify({ success: true, data: mapped }), { status: 200, headers: CORS_HEADERS });
    }

    if (request.method === 'POST') {
      const prj = await request.json();
      const newId = prj.id || `PRJ-${Date.now()}`;
      await db.prepare(`
        INSERT INTO projects (id, code, name, customerId, customerName, type, contractValue, estimatedCost, startDate, endDate, priority, status, teamLead, description, materials, tasks, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          code = excluded.code,
          name = excluded.name,
          customerId = excluded.customerId,
          customerName = excluded.customerName,
          type = excluded.type,
          contractValue = excluded.contractValue,
          estimatedCost = excluded.estimatedCost,
          startDate = excluded.startDate,
          endDate = excluded.endDate,
          priority = excluded.priority,
          status = excluded.status,
          teamLead = excluded.teamLead,
          description = excluded.description,
          materials = excluded.materials,
          tasks = excluded.tasks;
      `).bind(
        newId, prj.code || `PRJ-${Date.now().toString().slice(-4)}`, prj.name || 'Project',
        prj.customerId || '', prj.customerName || '',
        prj.type || 'General', Number(prj.contractValue) || 0, Number(prj.estimatedCost) || 0,
        prj.startDate || '', prj.endDate || '', prj.priority || 'Medium',
        prj.status || 'In Progress', prj.teamLead || '', prj.description || '',
        JSON.stringify(prj.materials || []), JSON.stringify(prj.tasks || []),
        prj.createdAt || new Date().toISOString()
      ).run();

      const saved = await db.prepare("SELECT * FROM projects WHERE id = ?").bind(newId).first();
      return new Response(JSON.stringify({
        success: true,
        data: {
          ...saved,
          materials: saved && saved.materials ? (typeof saved.materials === 'string' ? JSON.parse(saved.materials) : saved.materials) : [],
          tasks: saved && saved.tasks ? (typeof saved.tasks === 'string' ? JSON.parse(saved.tasks) : saved.tasks) : []
        }
      }), { status: 200, headers: CORS_HEADERS });
    }

    if (request.method === 'DELETE') {
      const targetId = id || (await request.json().catch(() => ({}))).id;
      if (!targetId) return new Response(JSON.stringify({ error: "Missing project id" }), { status: 400, headers: CORS_HEADERS });
      await db.prepare("DELETE FROM projects WHERE id = ?").bind(targetId).run();
      return new Response(JSON.stringify({ success: true, message: "Project deleted" }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), { status: 500, headers: CORS_HEADERS });
  }
}
