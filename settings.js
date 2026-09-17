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

function parseSettingsRows(rows) {
  if (!Array.isArray(rows)) return {};
  let settings = {};

  // 1. Profile JSON row if exists
  const profileRow = rows.find(r => r.key === 'profile');
  if (profileRow && profileRow.value) {
    try {
      settings = typeof profileRow.value === 'string' ? JSON.parse(profileRow.value) : profileRow.value;
    } catch (e) {}
  }

  // 2. Individual key mapping (from manual SQL inserts or form updates)
  const keyMap = {
    'company_name': 'companyName',
    'companyName': 'companyName',
    'company_slogan': 'tagline',
    'tagline': 'tagline',
    'company_phone': 'phone',
    'phone': 'phone',
    'company_email': 'email',
    'email': 'email',
    'company_address': 'address',
    'address': 'address',
    'company_bank_info': 'bankInfo',
    'bankInfo': 'bankInfo',
    'company_tax_id': 'taxId',
    'tax_id': 'taxId',
    'taxId': 'taxId',
    'currency': 'currency',
    'currencySymbol': 'currencySymbol',
    'vatRate': 'vatRate',
    'logoUrl': 'logoUrl'
  };

  for (const row of rows) {
    if (row.key === 'profile') continue;
    const mapped = keyMap[row.key] || row.key;
    if (row.value !== undefined && row.value !== null && row.value !== '') {
      settings[mapped] = row.value;
    }
  }

  return settings;
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
      const { results } = await db.prepare("SELECT key, value FROM settings").all();
      const settings = parseSettingsRows(results || []);
      return new Response(JSON.stringify({ success: true, data: settings }), { status: 200, headers: CORS_HEADERS });
    }

    if (request.method === 'POST') {
      const payload = await request.json();
      const stmts = [
        db.prepare(`
          INSERT INTO settings (key, value, updatedAt)
          VALUES ('profile', ?, datetime('now'))
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = datetime('now');
        `).bind(JSON.stringify(payload))
      ];

      const keyMapping = [
        { key: 'company_name', val: payload.companyName },
        { key: 'company_slogan', val: payload.tagline },
        { key: 'company_phone', val: payload.phone },
        { key: 'company_email', val: payload.email },
        { key: 'company_address', val: payload.address },
        { key: 'company_bank_info', val: payload.bankInfo },
        { key: 'company_tax_id', val: payload.taxId },
        { key: 'tax_id', val: payload.taxId },
        { key: 'currency', val: payload.currency }
      ];

      for (const item of keyMapping) {
        if (item.val !== undefined && item.val !== null) {
          stmts.push(
            db.prepare(`
              INSERT INTO settings (key, value, updatedAt)
              VALUES (?, ?, datetime('now'))
              ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = datetime('now');
            `).bind(item.key, String(item.val))
          );
        }
      }

      await db.batch(stmts);

      return new Response(JSON.stringify({ success: true, message: "Settings updated in Cloudflare D1" }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), { status: 500, headers: CORS_HEADERS });
  }
}
