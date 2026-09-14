/**
 * Cloudflare Pages Function - 1-Click Database Setup & Health Check
 * Endpoint: /api/setup
 * Automatically checks and initializes D1 schema with users, passwords, serials, and documents.
 */

export async function onRequest(context) {
  const { env, request } = context;
  const db = env.DB;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!db) {
    return new Response(JSON.stringify({
      success: false,
      error: "D1 database binding 'DB' not found in Cloudflare environment.",
      hint: "Make sure you bound your D1 database to the variable name 'DB' in Cloudflare Pages settings (Settings > Functions > D1 database bindings)."
    }), { status: 500, headers: corsHeaders });
  }

  try {
    // 1. Create tables if not exists
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
          category TEXT NOT NULL,
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
          items TEXT NOT NULL,
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
      `)
    ]);

    // Self-heal optional columns if tables were created earlier
    try { await db.prepare("ALTER TABLE invoices ADD COLUMN status TEXT DEFAULT 'Draft'").run(); } catch(e){}
    try { await db.prepare("ALTER TABLE invoices ADD COLUMN validUntil TEXT").run(); } catch(e){}

    // Seed default users if table is empty
    const userCount = await db.prepare("SELECT COUNT(*) as count FROM users").first();
    if (!userCount || userCount.count === 0) {
      await db.batch([
        db.prepare(`INSERT OR IGNORE INTO users (id, email, password, name, role, avatar) VALUES ('USR-001', 'netdit.admin@gmail.com', 'admin123', 'Keoviengxay (Admin)', 'admin', 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminNETD')`),
        db.prepare(`INSERT OR IGNORE INTO users (id, email, password, name, role, avatar) VALUES ('USR-002', 'staff.viewer@gmail.com', 'viewer123', 'Staff Member (Viewer)', 'viewer', 'https://api.dicebear.com/7.x/bottts/svg?seed=StaffViewer')`)
      ]);
    }

    // Seed default customer if table is empty
    const custCount = await db.prepare("SELECT COUNT(*) as count FROM customers").first();
    if (!custCount || custCount.count === 0) {
      await db.prepare(`
        INSERT OR IGNORE INTO customers (id, name, contactPerson, phone, email, type, address, taxId, notes, createdAt)
        VALUES ('CUST-001', 'ລູກຄ້າທົ່ວໄປ (General Customer)', 'General Contact', '+856 20 5555 8899', 'contact@customer.la', 'Retail', 'Vientiane, Lao PDR', '', 'Default Client', datetime('now'))
      `).run();
    }

    // Seed default categories if table is empty
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

    // Check count of products
    const prodCount = await db.prepare("SELECT COUNT(*) as count FROM products").first();

    return new Response(JSON.stringify({
      success: true,
      message: "Cloudflare D1 Database connected & tables initialized successfully!",
      productCount: prodCount ? prodCount.count : 0,
      timestamp: new Date().toISOString()
    }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || String(err)
    }), { status: 500, headers: corsHeaders });
  }
}
