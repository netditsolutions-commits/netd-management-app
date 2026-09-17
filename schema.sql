-- ====================================================================
-- NETD IT SOLUTIONS - Cloudflare D1 SQL Database Schema & Seed Data
-- Database Engine: Cloudflare D1 (Serverless Distributed SQLite)
-- ====================================================================

-- 1. Table: Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#2563eb',
  createdAt TEXT DEFAULT (datetime('now'))
);

-- 2. Table: Products (Hardware, Networking, CCTV, Servers, Software, SN/MAC)
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
  serials TEXT, -- JSON Array of {sn, mac, status}
  status TEXT DEFAULT 'Active',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- 3. Table: Customers (CRM)
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

-- 4. Table: Projects (IT Infrastructure & Solutions)
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
  materials TEXT, -- JSON Array
  tasks TEXT,     -- JSON Array
  createdAt TEXT DEFAULT (datetime('now'))
);

-- 5. Table: Invoices & Quotations
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  docNo TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'Quotation', -- Quotation, Invoice, Receipt
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
  items TEXT NOT NULL, -- JSON Array
  subtotal REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  taxRate REAL NOT NULL DEFAULT 0,
  taxAmount REAL NOT NULL DEFAULT 0,
  grandTotal REAL NOT NULL DEFAULT 0,
  terms TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- 6. Table: Disbursed Logs (Equipments issued to projects/clients)
CREATE TABLE IF NOT EXISTS disbursed_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  productId TEXT NOT NULL,
  productName TEXT NOT NULL,
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  serials TEXT, -- JSON Array
  recipient TEXT,
  projectName TEXT,
  technician TEXT,
  note TEXT,
  status TEXT DEFAULT 'Delivered',
  createdAt TEXT DEFAULT (datetime('now'))
);

-- 7. Table: Stock Logs (Audit trail for Stock In, Out, Adjustments)
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

-- 8. Table: Settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- 9. Table: Users & Roles (with Password Auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL DEFAULT 'admin123',
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- 'admin' or 'viewer'
  avatar TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- ====================================================================
-- SEED INITIAL DATA (NETD IT SOLUTIONS DEFAULT IT DATA)
-- ====================================================================

-- Insert Default Categories
INSERT OR IGNORE INTO categories (id, name, description, color) VALUES
('CAT-001', 'Network & Routers', 'Enterprise Routers, Switches, SFP & Optical Modules', '#2563eb'),
('CAT-002', 'CCTV & Security', 'IP Cameras, NVR, Storage & Smart Surveillance Systems', '#059669'),
('CAT-003', 'Server & Storage', 'Rack Servers, Tower Servers, NAS & Enterprise Drives', '#7c3aed'),
('CAT-004', 'Cabling & Accessories', 'Cat6/Cat6A UTP, Fiber Optic, Patch Panels & Connectors', '#d97706'),
('CAT-005', 'Software & License', 'Operating Systems, Firewalls, Antivirus & Cloud Licenses', '#db2777'),
('CAT-006', 'IT Services', 'Consulting, Design, Cabling, Setup & Maintenance Contracts', '#0891b2');

-- Insert Default Users
INSERT OR IGNORE INTO users (id, email, password, name, role, avatar) VALUES
('USR-001', 'netditsolutions@gmail.com', 'P@ss4n3tD', 'NETD IT (Admin)', 'admin', 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminNETD'),
('USR-002', 'staff.viewer@gmail.com', 'viewer123', 'Staff Member (Viewer)', 'viewer', 'https://api.dicebear.com/7.x/bottts/svg?seed=StaffViewer');

-- Insert Default System Settings
INSERT OR REPLACE INTO settings (key, value) VALUES
('company_name', 'NETD IT SOLUTIONS'),
('company_slogan', 'Total IT Solutions, Networking, CCTV & Software Services'),
('company_phone', '02029204248 / 02056639123'),
('company_email', 'netditsolutions@gmail.com'),
('company_address', 'ບ້ານ ໂພນມີໄຊ, ເມືອງ ແປກ, ແຂວງ ຊຽງຂວາງ'),
('company_bank_info', 'Bank Name: BCEL
Account Name: NETD IT SOLUTIONS INDIVIDUAL ENTERPRISE
ກີບ/LAK: 1301100677510
ບາດ/THB: 1301100677538');
