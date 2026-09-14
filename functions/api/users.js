/**
 * Cloudflare Pages Function - Users & Roles REST API
 * Endpoint: /api/users
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function ensureUserTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL DEFAULT 'admin123',
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      avatar TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `).run();

  const userCount = await db.prepare("SELECT COUNT(*) as count FROM users").first();
  if (!userCount || userCount.count === 0) {
    await db.batch([
      db.prepare(`INSERT OR IGNORE INTO users (id, email, password, name, role, avatar) VALUES ('USR-001', 'netdit.admin@gmail.com', 'admin123', 'Keoviengxay (Admin)', 'admin', 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminNETD')`),
      db.prepare(`INSERT OR IGNORE INTO users (id, email, password, name, role, avatar) VALUES ('USR-002', 'staff.viewer@gmail.com', 'viewer123', 'Staff Member (Viewer)', 'viewer', 'https://api.dicebear.com/7.x/bottts/svg?seed=StaffViewer')`)
    ]);
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
    await ensureUserTable(db);

    // GET: List all users or single user
    if (request.method === 'GET') {
      if (id) {
        const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
        if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: CORS_HEADERS });
        return new Response(JSON.stringify({ success: true, data: user }), { status: 200, headers: CORS_HEADERS });
      }
      const { results } = await db.prepare("SELECT * FROM users ORDER BY createdAt ASC").all();
      return new Response(JSON.stringify({ success: true, data: results || [] }), { status: 200, headers: CORS_HEADERS });
    }

    // POST: Create or Update User
    if (request.method === 'POST') {
      const u = await request.json();
      const newId = u.id || `USR-${Date.now().toString().slice(-4)}`;
      const avatar = u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.email || newId)}`;
      
      await db.prepare(`
        INSERT INTO users (id, email, password, name, role, avatar, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          email = excluded.email,
          password = excluded.password,
          name = excluded.name,
          role = excluded.role,
          avatar = excluded.avatar;
      `).bind(
        newId,
        (u.email || '').trim().toLowerCase(),
        u.password || 'admin123',
        u.name || 'Staff User',
        u.role || 'viewer',
        avatar,
        u.createdAt || new Date().toISOString()
      ).run();

      const saved = await db.prepare("SELECT * FROM users WHERE id = ?").bind(newId).first();
      return new Response(JSON.stringify({ success: true, data: saved }), { status: 200, headers: CORS_HEADERS });
    }

    // DELETE: Delete user
    if (request.method === 'DELETE') {
      const targetId = id || (await request.json().catch(() => ({}))).id;
      if (!targetId) return new Response(JSON.stringify({ error: "Missing user id" }), { status: 400, headers: CORS_HEADERS });
      
      // Ensure at least one admin remains
      const adminCount = await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND id != ?").bind(targetId).first();
      if (adminCount && adminCount.count === 0) {
        return new Response(JSON.stringify({ success: false, error: "Cannot delete the last remaining admin user." }), { status: 400, headers: CORS_HEADERS });
      }

      await db.prepare("DELETE FROM users WHERE id = ?").bind(targetId).run();
      return new Response(JSON.stringify({ success: true, message: "User deleted" }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), { status: 500, headers: CORS_HEADERS });
  }
}
