/**
 * Cloudflare Pages Function - Full Data Sync Endpoint
 * Endpoint: /api/sync
 * Auto-creates D1 tables if missing, seeds default users, and supports GET & POST
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function ensureTablesExist(db) {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT DEFAULT '#2563eb',
        createdAt TEXT DEFAULT (datetime('now'))
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        sku TEXT NOT NULL UNIQUE,
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
    `),
    db.prepare(`
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
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
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
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        docNo TEXT NOT NULL UNIQUE,
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
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT DEFAULT (datetime('now'))
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL DEFAULT 'admin123',
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        avatar TEXT,
        createdAt TEXT DEFAULT (datetime('now'))
      );
    `),
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

  // Self-heal optional columns if tables existed from earlier schemas
  try { await db.prepare("ALTER TABLE invoices ADD COLUMN status TEXT DEFAULT 'Draft'").run(); } catch (e) {}
  try { await db.prepare("ALTER TABLE invoices ADD COLUMN validUntil TEXT").run(); } catch (e) {}

  // Seed default admin and viewer if users table empty
  const userCount = await db.prepare("SELECT COUNT(*) as count FROM users").first();
  if (!userCount || userCount.count === 0) {
    await db.batch([
      db.prepare(`INSERT OR IGNORE INTO users (id, email, password, name, role, avatar) VALUES ('USR-001', 'netditsolutions@gmail.com', 'P@ss4n3tD', 'NETD IT (Admin)', 'admin', 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminNETD')`),
      db.prepare(`INSERT OR IGNORE INTO users (id, email, password, name, role, avatar) VALUES ('USR-002', 'staff.viewer@gmail.com', 'viewer123', 'Staff Member (Viewer)', 'viewer', 'https://api.dicebear.com/7.x/bottts/svg?seed=StaffViewer')`)
    ]);
  }

  // Seed default customer if customers table empty
  const custCount = await db.prepare("SELECT COUNT(*) as count FROM customers").first();
  if (!custCount || custCount.count === 0) {
    await db.prepare(`
      INSERT OR IGNORE INTO customers (id, name, contactPerson, phone, email, type, address, taxId, notes, createdAt)
      VALUES ('CUST-001', 'ລູກຄ້າທົ່ວໄປ (General Customer)', 'General Contact', '+856 20 5555 8899', 'contact@customer.la', 'Retail', 'Vientiane, Lao PDR', '', 'Default Client', datetime('now'))
    `).run();
  }

  // Seed default categories if empty
  const catCount = await db.prepare("SELECT COUNT(*) as count FROM categories").first();
  if (!catCount || catCount.count === 0) {
    await db.batch([
      db.prepare(`INSERT OR IGNORE INTO categories (id, name, description, color) VALUES ('CAT-001', 'Network & Routers', 'Enterprise Routers, Switches, SFP & Optical Modules', '#2563eb')`),
      db.prepare(`INSERT OR IGNORE INTO categories (id, name, description, color) VALUES ('CAT-002', 'CCTV & Security', 'IP Cameras, NVR, Storage & Smart Surveillance Systems', '#059669')`),
      db.prepare(`INSERT OR IGNORE INTO categories (id, name, description, color) VALUES ('CAT-003', 'Server & Storage', 'Rack Servers, Tower Servers, NAS & Enterprise Drives', '#7c3aed')`),
      db.prepare(`INSERT OR IGNORE INTO categories (id, name, description, color) VALUES ('CAT-004', 'Cabling & Accessories', 'Cat6/Cat6A UTP, Fiber Optic, Patch Panels & Connectors', '#d97706')`),
      db.prepare(`INSERT OR IGNORE INTO categories (id, name, description, color) VALUES ('CAT-005', 'Software & License', 'Operating Systems, Firewalls, Antivirus & Cloud Licenses', '#db2777')`),
      db.prepare(`INSERT OR IGNORE INTO categories (id, name, description, color) VALUES ('CAT-006', 'IT Services', 'Consulting, Design, Cabling, Setup & Maintenance Contracts', '#0891b2')`)
    ]);
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
    return new Response(JSON.stringify({
      success: false,
      error: "Cloudflare D1 binding 'DB' not configured in Pages Settings (Settings > Functions > D1 database bindings)."
    }), { status: 500, headers: CORS_HEADERS });
  }

  try {
    // 1. Ensure all tables and seed data exist
    await ensureTablesExist(db);

    // 2. Handle GET (Pull all 9 tables)
    if (request.method === 'GET') {
      const [productsRes, categoriesRes, projectsRes, customersRes, invoicesRes, settingsRes, usersRes, stockLogsRes, disbursedLogsRes] = await Promise.all([
        db.prepare("SELECT * FROM products ORDER BY createdAt DESC").all(),
        db.prepare("SELECT * FROM categories ORDER BY name ASC").all(),
        db.prepare("SELECT * FROM projects ORDER BY createdAt DESC").all(),
        db.prepare("SELECT * FROM customers ORDER BY name ASC").all(),
        db.prepare("SELECT * FROM invoices ORDER BY issueDate DESC").all(),
        db.prepare("SELECT * FROM settings").all(),
        db.prepare("SELECT * FROM users ORDER BY createdAt ASC").all(),
        db.prepare("SELECT * FROM stock_logs ORDER BY createdAt DESC LIMIT 200").all(),
        db.prepare("SELECT * FROM disbursed_logs ORDER BY createdAt DESC LIMIT 200").all()
      ]);

      const products = (productsRes.results || []).map(p => ({
        ...p,
        serials: p.serials ? (typeof p.serials === 'string' ? JSON.parse(p.serials) : p.serials) : []
      }));

      const projects = (projectsRes.results || []).map(p => ({
        ...p,
        materials: p.materials ? (typeof p.materials === 'string' ? JSON.parse(p.materials) : p.materials) : [],
        tasks: p.tasks ? (typeof p.tasks === 'string' ? JSON.parse(p.tasks) : p.tasks) : []
      }));

      const invoices = (invoicesRes.results || []).map(inv => ({
        ...inv,
        items: inv.items ? (typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items) : []
      }));

      const stockLogs = (stockLogsRes.results || []).map(l => ({
        ...l,
        serials: l.serials ? (typeof l.serials === 'string' ? JSON.parse(l.serials) : l.serials) : []
      }));

      const disbursedLogs = (disbursedLogsRes.results || []).map(d => ({
        ...d,
        serials: d.serials ? (typeof d.serials === 'string' ? JSON.parse(d.serials) : d.serials) : []
      }));

      const settings = parseSettingsRows(settingsRes.results || []);

      return new Response(JSON.stringify({
        success: true,
        data: {
          products,
          categories: (categoriesRes.results || []).map(c => c.name || c),
          projects,
          customers: customersRes.results || [],
          invoices,
          settings,
          users: usersRes.results || [],
          stockLogs,
          disbursedLogs
        },
        syncedAt: new Date().toISOString()
      }), { status: 200, headers: CORS_HEADERS });
    }

    // 3. Handle POST (Push / Restore)
    if (request.method === 'POST') {
      const payload = await request.json();
      const { products, categories, projects, customers, invoices, settings, users } = payload || {};
      const statements = [];

      // Categories
      if (Array.isArray(categories)) {
        for (const cat of categories) {
          const name = typeof cat === 'string' ? cat : cat.name;
          const id = typeof cat === 'string' ? 'CAT-' + name.replace(/\s+/g, '-').toUpperCase() : (cat.id || 'CAT-' + name);
          statements.push(
            db.prepare(`
              INSERT INTO categories (id, name, description, color, createdAt)
              VALUES (?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET name = excluded.name;
            `).bind(id, name, '', '#2563eb', new Date().toISOString())
          );
        }
      }

      // Products
      if (Array.isArray(products)) {
        for (const p of products) {
          statements.push(
            db.prepare(`
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
              p.id, p.sku, p.name, p.brand || '', p.model || '', p.category || 'General',
              Number(p.costPrice) || 0, Number(p.salePrice) || 0, Number(p.stockQty) || 0,
              Number(p.minAlert) || 5, p.unit || 'Unit', Number(p.warrantyMonths) || 12,
              p.serial || '', JSON.stringify(p.serials || []), p.status || 'Active',
              p.createdAt || new Date().toISOString(), p.updatedAt || new Date().toISOString()
            )
          );
        }
      }

      // Customers
      if (Array.isArray(customers)) {
        for (const c of customers) {
          statements.push(
            db.prepare(`
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
              c.id, c.name, c.contactPerson || '', c.phone || '', c.email || '',
              c.type || 'Corporate', c.address || '', c.taxId || '', c.notes || '',
              c.createdAt || new Date().toISOString()
            )
          );
        }
      }

      // Projects
      if (Array.isArray(projects)) {
        for (const prj of projects) {
          statements.push(
            db.prepare(`
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
              prj.id, prj.code, prj.name, prj.customerId || '', prj.customerName || '',
              prj.type || 'Network Infrastructure', Number(prj.contractValue) || 0, Number(prj.estimatedCost) || 0,
              prj.startDate || '', prj.endDate || '', prj.priority || 'High', prj.status || 'In Progress',
              prj.teamLead || '', prj.description || '', JSON.stringify(prj.materials || []), JSON.stringify(prj.tasks || []),
              prj.createdAt || new Date().toISOString()
            )
          );
        }
      }

      // Invoices
      if (Array.isArray(invoices)) {
        for (const inv of invoices) {
          statements.push(
            db.prepare(`
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
              inv.id, inv.docNo, inv.type || 'Quotation', inv.refQuotationId || '', inv.refQuotationNo || '',
              inv.customerId || '', inv.customerName || '', inv.contactPerson || '', inv.phone || '', inv.email || '',
              inv.address || '', inv.projectId || '', inv.projectName || '', inv.issueDate, inv.validUntil || '', inv.dueDate || '',
              inv.status || (inv.type === 'Quotation' ? 'Sent' : 'Unpaid'),
              JSON.stringify(inv.items || []), Number(inv.subtotal) || 0, Number(inv.discount) || 0,
              0, 0, Number(inv.grandTotal) || 0,
              inv.terms || '', inv.createdAt || new Date().toISOString()
            )
          );
        }
      }

      // Settings
      if (settings && typeof settings === 'object') {
        statements.push(
          db.prepare(`
            INSERT INTO settings (key, value, updatedAt)
            VALUES ('profile', ?, datetime('now'))
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = datetime('now');
          `).bind(JSON.stringify(settings))
        );

        const keyMapping = [
          { key: 'company_name', val: settings.companyName },
          { key: 'company_slogan', val: settings.tagline },
          { key: 'company_phone', val: settings.phone },
          { key: 'company_email', val: settings.email },
          { key: 'company_address', val: settings.address },
          { key: 'company_bank_info', val: settings.bankInfo },
          { key: 'company_tax_id', val: settings.taxId },
          { key: 'tax_id', val: settings.taxId },
          { key: 'currency', val: settings.currency }
        ];

        for (const item of keyMapping) {
          if (item.val !== undefined && item.val !== null) {
            statements.push(
              db.prepare(`
                INSERT INTO settings (key, value, updatedAt)
                VALUES (?, ?, datetime('now'))
                ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = datetime('now');
              `).bind(item.key, String(item.val))
            );
          }
        }
      }

      // Users
      if (Array.isArray(users)) {
        for (const u of users) {
          statements.push(
            db.prepare(`
              INSERT INTO users (id, email, password, name, role, avatar, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                email = excluded.email,
                password = excluded.password,
                name = excluded.name,
                role = excluded.role,
                avatar = excluded.avatar;
            `).bind(
              u.id, u.email, u.password || 'admin123', u.name, u.role || 'admin',
              u.avatar || '', u.createdAt || new Date().toISOString()
            )
          );
        }
      }

      if (statements.length > 0) {
        await db.batch(statements);
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Synced ${statements.length} records successfully to Cloudflare D1.`,
        syncedCount: statements.length,
        timestamp: new Date().toISOString()
      }), { status: 200, headers: CORS_HEADERS });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || String(err)
    }), { status: 500, headers: CORS_HEADERS });
  }
}
