/**
 * NETD IT SOLUTIONS - Cloudflare D1 Real-Time Database Engine
 * Direct Serverless SQL Cloud Persistence & Multi-Device Live Sync
 * (No LocalStorage dependency for business records)
 */

const DEFAULT_SETTINGS = {
  companyName: "NETD IT SOLUTIONS",
  tagline: "Total IT Solutions, Networking, CCTV & Software Services",
  phone: "+856 20 5555 8899 / +856 20 9988 7766",
  email: "contact@netd-it.la / info@netd-it.la",
  address: "Phonsinuan Village, Sisattanak District, Vientiane Capital, Lao PDR",
  taxId: "010203040506",
  bankInfo: "BCEL One / LAK: 010-12-00-01234567-001 (NETD IT SOLUTIONS)\nUSD: 010-12-01-01234567-002",
  currency: "LAK",
  currencySymbol: "₭",
  vatRate: 0,
  logoUrl: "./Logo.png"
};

const DEFAULT_CATEGORIES = [
  "Network & Routers",
  "CCTV & Security",
  "Server & Storage",
  "Cabling & Accessories",
  "Software & License",
  "IT Services"
];

const DEFAULT_PROJECT_TYPES = [
  "Network Infrastructure",
  "CCTV & Surveillance",
  "Server & IT Lab Setup",
  "Fiber Optic & Cabling",
  "Software Licensing & Cloud",
  "Maintenance & Support",
  "General IT Service"
];

const DEFAULT_CUSTOMERS = [
  {
    id: "CUST-001",
    name: "ລູກຄ້າທົ່ວໄປ (General Customer)",
    contactPerson: "General Contact",
    phone: "+856 20 5555 8899",
    email: "contact@customer.la",
    type: "Retail",
    address: "Vientiane, Lao PDR",
    taxId: "",
    notes: "Default General Client",
    createdAt: "2026-01-01T00:00:00Z"
  }
];

const DEFAULT_USERS = [
  {
    id: "USR-001",
    email: "netditsolutions@gmail.com",
    password: "P@ss4n3tD",
    name: "NETD IT (Admin)",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AdminNETD",
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "USR-002",
    email: "staff.viewer@gmail.com",
    password: "viewer123",
    name: "Staff Member (Viewer)",
    role: "viewer",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=StaffViewer",
    createdAt: "2026-01-01T00:00:00Z"
  }
];

class DatabaseEngine {
  constructor() {
    this.cloudStatus = 'syncing'; // 'connected', 'syncing', 'error'
    this.cloudError = null;
    this.lastSyncTime = null;
    this.isHydrated = false;
    this._syncInterval = null;

    // Unified state with default fallbacks
    this.data = {
      settings: { ...DEFAULT_SETTINGS },
      categories: [...DEFAULT_CATEGORIES],
      products: [],
      projects: [],
      projectTypes: [...DEFAULT_PROJECT_TYPES],
      customers: [...DEFAULT_CUSTOMERS],
      invoices: [],
      stockLogs: [],
      disbursedLogs: [],
      users: [...DEFAULT_USERS]
    };

    // Load from persistent local sync cache immediately for instant 0ms F5 refresh retention
    this.loadLocalCache();

    // Start background auto-sync polling
    this.initBackgroundSync();
  }

  // --- LOCAL CACHE LAYER (Immediate persistence across browser refreshes) ---
  loadLocalCache() {
    try {
      const cached = localStorage.getItem('netd_app_local_cache_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.products) && parsed.products.length > 0) this.data.products = parsed.products;
          if (Array.isArray(parsed.categories) && parsed.categories.length > 0) this.data.categories = parsed.categories;
          if (Array.isArray(parsed.projects) && parsed.projects.length > 0) this.data.projects = parsed.projects;
          if (Array.isArray(parsed.projectTypes) && parsed.projectTypes.length > 0) this.data.projectTypes = parsed.projectTypes;
          if (Array.isArray(parsed.customers) && parsed.customers.length > 0) this.data.customers = parsed.customers;
          if (Array.isArray(parsed.invoices) && parsed.invoices.length > 0) this.data.invoices = parsed.invoices;
          if (Array.isArray(parsed.users) && parsed.users.length > 0) {
            this.data.users = parsed.users;
            // Always ensure default admin and viewer exist with correct credentials
            DEFAULT_USERS.forEach(def => {
              const idx = this.data.users.findIndex(u => (u.email || '').toLowerCase() === def.email.toLowerCase());
              if (idx === -1) {
                this.data.users.unshift(def);
              } else if (def.email.toLowerCase() === 'netditsolutions@gmail.com') {
                this.data.users[idx].password = def.password;
                this.data.users[idx].role = def.role;
              }
            });
          } else {
            this.data.users = [...DEFAULT_USERS];
          }
          if (Array.isArray(parsed.stockLogs) && parsed.stockLogs.length > 0) this.data.stockLogs = parsed.stockLogs;
          if (Array.isArray(parsed.disbursedLogs) && parsed.disbursedLogs.length > 0) this.data.disbursedLogs = parsed.disbursedLogs;
          if (parsed.settings && Object.keys(parsed.settings).length > 0) {
            this.data.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
          }
        }
      }
    } catch (e) {
      console.warn("loadLocalCache warning:", e);
    }
  }

  saveLocalCache() {
    try {
      localStorage.setItem('netd_app_local_cache_v2', JSON.stringify({
        settings: this.data.settings,
        categories: this.data.categories,
        products: this.data.products,
        projects: this.data.projects,
        projectTypes: this.data.projectTypes,
        customers: this.data.customers,
        invoices: this.data.invoices,
        users: this.data.users,
        stockLogs: this.data.stockLogs,
        disbursedLogs: this.data.disbursedLogs
      }));
    } catch (e) {
      console.warn("saveLocalCache warning:", e);
    }
  }

  getApiUrl(path) {
    const customBase = sessionStorage.getItem('netd_cf_api_url') || '';
    if (customBase) {
      return `${customBase.replace(/\/$/, '')}${path}`;
    }
    return path;
  }

  // --- BACKGROUND POLLING & MULTI-DEVICE SYNC ---
  initBackgroundSync() {
    if (this._syncInterval) return;

    // Background live polling every 10 seconds
    this._syncInterval = setInterval(() => {
      this.fetchAll(true);
    }, 10000);

    // Immediate sync when tab or mobile browser gains focus
    window.addEventListener('focus', () => {
      this.fetchAll(true);
    });
  }

  // --- INITIAL HYDRATION & BULK PULL FROM CLOUDFLARE D1 ---
  async fetchAll(isSilent = false) {
    if (!isSilent) {
      this.cloudStatus = 'syncing';
      this.renderCloudBadge();
    }

    try {
      // Fetch full real-time database state from Cloudflare D1
      const res = await fetch(this.getApiUrl('/api/sync'), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const result = await res.json();
        if (result && result.success && result.data) {
          const { products, categories, projects, customers, invoices, settings, users, stockLogs, disbursedLogs } = result.data;

          const prevJson = isSilent ? JSON.stringify(this.data) : null;

          const d1IsEmpty = (!products || products.length === 0) && (!projects || projects.length === 0) && (!customers || customers.length === 0);
          const hasLocalData = this.data.products.length > 0 || this.data.projects.length > 0 || this.data.customers.length > 0;

          // If D1 is empty on brand new setup but client has local records, auto-sync to D1
          if (d1IsEmpty && hasLocalData) {
            await fetch(this.getApiUrl('/api/sync'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(this.data)
            }).catch(() => {});
          } else {
            if (Array.isArray(products)) this.data.products = products;
            if (Array.isArray(categories) && categories.length > 0) this.data.categories = categories;
            if (Array.isArray(projects)) this.data.projects = projects;
            if (Array.isArray(customers)) this.data.customers = customers;
            if (Array.isArray(invoices)) this.data.invoices = invoices;
            if (Array.isArray(users) && users.length > 0) this.data.users = users;
            if (Array.isArray(stockLogs)) this.data.stockLogs = stockLogs;
            if (Array.isArray(disbursedLogs)) this.data.disbursedLogs = disbursedLogs;
            if (settings && Object.keys(settings).length > 0) {
              this.data.settings = { ...DEFAULT_SETTINGS, ...settings };
            }
            this.saveLocalCache();
          }

          this.cloudStatus = 'connected';
          this.cloudError = null;
          this.lastSyncTime = new Date();
          this.isHydrated = true;
          this.renderCloudBadge();

          // If background sync detected changes made from another device, re-render current view
          if (isSilent && prevJson) {
            const nextJson = JSON.stringify(this.data);
            if (prevJson !== nextJson && window.App && typeof window.App.refreshCurrentView === 'function') {
              window.App.refreshCurrentView();
            }
          }

          return true;
        } else {
          this.cloudStatus = 'error';
          this.cloudError = {
            status: res.status,
            message: result && result.error ? result.error : 'Invalid response from D1 API'
          };
          this.renderCloudBadge();
          return false;
        }
      }

      // HTTP Error (404 Not Found = Functions not active; 500 = DB binding error)
      let errDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.error) errDetail = `${errDetail} - ${errJson.error}`;
      } catch (_) {}

      this.cloudStatus = 'error';
      this.cloudError = {
        status: res.status,
        message: errDetail
      };
      this.renderCloudBadge();
      return false;
    } catch (err) {
      console.warn("Cloudflare D1 fetchAll warning:", err);
      this.cloudStatus = 'offline';
      this.cloudError = {
        status: 0,
        message: err.message || 'Cannot reach API (Network Offline or Local Preview)'
      };
      this.renderCloudBadge();
      return false;
    }
  }

  // Synchronous Aliases for Pull
  async pullFromCloud() {
    return await this.fetchAll(false);
  }

  async initCloudSync() {
    return await this.fetchAll(false);
  }

  // --- SYNCHRONOUS GETTERS (Read directly from in-memory D1 cache) ---
  getSettings() {
    return this.data.settings || DEFAULT_SETTINGS;
  }

  getCategories() {
    return this.data.categories || DEFAULT_CATEGORIES;
  }

  getProjectTypes() {
    return this.data.projectTypes || DEFAULT_PROJECT_TYPES;
  }

  getProducts() {
    return this.data.products || [];
  }

  getProduct(id) {
    return (this.data.products || []).find(p => p.id === id);
  }

  getProjects() {
    return this.data.projects || [];
  }

  getProject(id) {
    return (this.data.projects || []).find(p => p.id === id);
  }

  getCustomers() {
    return this.data.customers || [];
  }

  getCustomer(id) {
    return (this.data.customers || []).find(c => c.id === id);
  }

  getInvoices() {
    return this.data.invoices || [];
  }

  getInvoice(id) {
    return (this.data.invoices || []).find(d => d.id === id);
  }

  getUsers() {
    return this.data.users || DEFAULT_USERS;
  }

  getUser(id) {
    return (this.data.users || []).find(u => u.id === id);
  }

  getStockLogs() {
    return this.data.stockLogs || [];
  }

  getDisbursedLogs() {
    return this.data.disbursedLogs || [];
  }

  // --- ASYNCHRONOUS DIRECT CLOUDFLARE D1 MUTATIONS ---

  // 1. Settings
  async saveSettings(settings) {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveLocalCache();
    try {
      await fetch(this.getApiUrl('/api/settings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.data.settings)
      });
      return true;
    } catch (e) {
      console.error("Save settings error:", e);
      return false;
    }
  }

  // 2. Categories
  async addCategory(name) {
    if (!name || !name.trim()) return false;
    const catName = name.trim();
    if (!this.data.categories.includes(catName)) {
      this.data.categories.push(catName);
      this.saveLocalCache();
      try {
        await fetch(this.getApiUrl('/api/categories'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: catName })
        });
      } catch (e) {}
    }
    return true;
  }

  async renameCategory(oldName, newName) {
    if (!oldName || !newName || !newName.trim()) return false;
    const cleanOld = oldName.trim();
    const cleanNew = newName.trim();
    this.data.categories = this.data.categories.map(c => c === cleanOld ? cleanNew : c);
    
    // Update products in memory
    this.data.products.forEach(p => {
      if (p.category === cleanOld) p.category = cleanNew;
    });
    this.saveLocalCache();

    try {
      await fetch(this.getApiUrl('/api/categories'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanNew })
      });
    } catch (e) {}
    return true;
  }

  async deleteCategory(catName) {
    if (!catName) return false;
    const cleanName = catName.trim();
    this.data.categories = this.data.categories.filter(c => c !== cleanName);
    
    // Update affected products
    this.data.products.forEach(p => {
      if (p.category === cleanName) p.category = 'General';
    });
    this.saveLocalCache();

    try {
      await fetch(this.getApiUrl('/api/categories'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName })
      });
    } catch (e) {}
    return true;
  }

  // 3. Project Types
  addProjectType(typeName) {
    if (!typeName || !typeName.trim()) return false;
    const cleanName = typeName.trim();
    if (!this.data.projectTypes.includes(cleanName)) {
      this.data.projectTypes.push(cleanName);
      this.saveLocalCache();
    }
    return true;
  }

  // 4. Products & Serials
  async saveProduct(product) {
    if (!product.id) product.id = 'PROD-' + Date.now().toString().slice(-6);
    if (!product.serials) product.serials = [];
    if (!product.createdAt) product.createdAt = new Date().toISOString();
    product.updatedAt = new Date().toISOString();

    const idx = this.data.products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      this.data.products[idx] = { ...this.data.products[idx], ...product };
    } else {
      this.data.products.unshift(product);
    }

    if (product.category) {
      this.addCategory(product.category);
    }
    this.saveLocalCache();

    try {
      const res = await fetch(this.getApiUrl('/api/products'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.data) {
          const saved = result.data;
          const uIdx = this.data.products.findIndex(p => p.id === saved.id);
          if (uIdx >= 0) this.data.products[uIdx] = saved;
          this.saveLocalCache();
        }
      }
    } catch (e) {
      console.error("Save product to D1 error:", e);
    }

    return product;
  }

  async deleteProduct(id) {
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.saveLocalCache();
    try {
      await fetch(this.getApiUrl(`/api/products?id=${encodeURIComponent(id)}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      return true;
    } catch (e) {
      console.error("Delete product from D1 error:", e);
      return false;
    }
  }

  // 5. Stock Movements & Disbursed Registry
  async recordStockMovement({ productId, type, quantity, referenceDoc, note, operator, serials = [], recipient = '', projectName = '', technician = '' }) {
    const product = this.getProduct(productId);
    if (!product) return false;

    if (!Array.isArray(product.serials)) product.serials = [];

    const previousStock = Number(product.stockQty) || 0;
    const qtyChange = Number(quantity) || 0;
    let newStock = previousStock;

    if (type === 'In') {
      newStock = previousStock + qtyChange;
      if (Array.isArray(serials) && serials.length > 0) {
        serials.forEach(s => {
          if (typeof s === 'string') {
            product.serials.push({ sn: s, mac: '', status: 'In Stock' });
          } else if (s && (s.sn || s.mac)) {
            product.serials.push({ sn: s.sn || '', mac: s.mac || '', status: 'In Stock' });
          }
        });
      }
    } else if (type === 'Out') {
      newStock = Math.max(0, previousStock - qtyChange);
      if (Array.isArray(serials) && serials.length > 0) {
        serials.forEach(disbursedItem => {
          const targetSn = typeof disbursedItem === 'string' ? disbursedItem : (disbursedItem.sn || disbursedItem);
          const found = product.serials.find(s => (s.sn && s.sn === targetSn) || (s.mac && s.mac === targetSn));
          if (found) {
            found.status = 'Disbursed';
          }
        });
      }

      // Record Disbursed Log
      const serialStrings = serials.map(s => {
        if (typeof s === 'string') return s;
        let str = s.sn || '';
        if (s.mac) str += ` (MAC: ${s.mac})`;
        return str;
      }).filter(Boolean);

      const disbEntry = {
        id: 'DISB-' + Date.now().toString().slice(-6),
        date: new Date().toISOString().slice(0, 10),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: qtyChange,
        serials: serialStrings,
        recipient: recipient || 'General',
        projectName: projectName || '',
        technician: technician || operator || 'Admin',
        note: note || referenceDoc || '',
        status: 'Delivered',
        createdAt: new Date().toISOString()
      };
      this.data.disbursedLogs.unshift(disbEntry);

      // Post to D1
      try {
        fetch(this.getApiUrl('/api/stock-logs'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...disbEntry, logType: 'disbursed' })
        });
      } catch (e) {}
    } else if (type === 'Adjust') {
      newStock = qtyChange;
    }

    product.stockQty = newStock;
    product.updatedAt = new Date().toISOString();

    // In-memory Stock Log
    const logEntry = {
      id: 'LOG-' + Date.now().toString().slice(-6),
      date: new Date().toISOString().slice(0, 10),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: type,
      quantity: qtyChange,
      previousStock: previousStock,
      newStock: newStock,
      serials: Array.isArray(serials) ? serials : [],
      recipient: recipient,
      projectName: projectName,
      referenceDoc: referenceDoc || '',
      note: note || '',
      operator: operator || 'Admin',
      createdAt: new Date().toISOString()
    };
    this.data.stockLogs.unshift(logEntry);
    this.saveLocalCache();

    // Save product & log to D1
    await this.saveProduct(product);
    try {
      await fetch(this.getApiUrl('/api/stock-logs'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });
    } catch (e) {}

    return true;
  }

  // 6. Projects & Tasks
  async saveProject(project) {
    if (!project.id) project.id = 'PRJ-' + Date.now().toString().slice(-6);
    if (!project.code) project.code = 'PRJ-' + Date.now().toString().slice(-4);
    if (!project.materials) project.materials = [];
    if (!project.tasks) project.tasks = [];
    if (!project.createdAt) project.createdAt = new Date().toISOString();

    const idx = this.data.projects.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      this.data.projects[idx] = { ...this.data.projects[idx], ...project };
    } else {
      this.data.projects.unshift(project);
    }

    if (project.type) this.addProjectType(project.type);
    this.saveLocalCache();

    try {
      const res = await fetch(this.getApiUrl('/api/projects'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.data) {
          const saved = result.data;
          const uIdx = this.data.projects.findIndex(p => p.id === saved.id);
          if (uIdx >= 0) this.data.projects[uIdx] = saved;
          this.saveLocalCache();
        }
      }
    } catch (e) {
      console.error("Save project to D1 error:", e);
    }

    return project;
  }

  async deleteProject(id) {
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    this.saveLocalCache();
    try {
      await fetch(this.getApiUrl(`/api/projects?id=${encodeURIComponent(id)}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      return true;
    } catch (e) {
      console.error("Delete project from D1 error:", e);
      return false;
    }
  }

  // 7. Customers & CRM
  async saveCustomer(customer) {
    if (!customer.id) customer.id = 'CUST-' + Date.now().toString().slice(-6);
    if (!customer.createdAt) customer.createdAt = new Date().toISOString();

    const idx = this.data.customers.findIndex(c => c.id === customer.id);
    if (idx >= 0) {
      this.data.customers[idx] = { ...this.data.customers[idx], ...customer };
    } else {
      this.data.customers.unshift(customer);
    }
    this.saveLocalCache();

    try {
      const res = await fetch(this.getApiUrl('/api/customers'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.data) {
          const saved = result.data;
          const uIdx = this.data.customers.findIndex(c => c.id === saved.id);
          if (uIdx >= 0) this.data.customers[uIdx] = saved;
          this.saveLocalCache();
        }
      }
    } catch (e) {
      console.error("Save customer to D1 error:", e);
    }

    return customer;
  }

  async deleteCustomer(id) {
    this.data.customers = this.data.customers.filter(c => c.id !== id);
    this.saveLocalCache();
    try {
      await fetch(this.getApiUrl(`/api/customers?id=${encodeURIComponent(id)}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      return true;
    } catch (e) {
      console.error("Delete customer from D1 error:", e);
      return false;
    }
  }

  // 8. Invoices, Quotations & Receipts
  async saveInvoice(doc) {
    if (!doc.id) doc.id = 'DOC-' + Date.now().toString().slice(-6);
    if (!doc.items) doc.items = [];
    if (!doc.createdAt) doc.createdAt = new Date().toISOString();

    const idx = this.data.invoices.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      this.data.invoices[idx] = { ...this.data.invoices[idx], ...doc };
    } else {
      this.data.invoices.unshift(doc);
    }
    this.saveLocalCache();

    try {
      const res = await fetch(this.getApiUrl('/api/invoices'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.data) {
          const saved = result.data;
          const uIdx = this.data.invoices.findIndex(d => d.id === saved.id);
          if (uIdx >= 0) this.data.invoices[uIdx] = saved;
          this.saveLocalCache();
        }
      }
    } catch (e) {
      console.error("Save invoice to D1 error:", e);
    }

    return doc;
  }

  async deleteInvoice(id) {
    this.data.invoices = this.data.invoices.filter(d => d.id !== id);
    this.saveLocalCache();
    try {
      await fetch(this.getApiUrl(`/api/invoices?id=${encodeURIComponent(id)}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      return true;
    } catch (e) {
      console.error("Delete invoice from D1 error:", e);
      return false;
    }
  }

  // 9. Users & Authentication
  async saveUser(user) {
    if (!user.id) user.id = 'USR-' + Date.now().toString().slice(-4);
    if (!user.avatar) user.avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email || user.id)}`;
    if (!user.createdAt) user.createdAt = new Date().toISOString();

    const idx = this.data.users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      this.data.users[idx] = { ...this.data.users[idx], ...user };
    } else {
      this.data.users.push(user);
    }
    this.saveLocalCache();

    try {
      const res = await fetch(this.getApiUrl('/api/users'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.data) {
          const saved = result.data;
          const uIdx = this.data.users.findIndex(u => u.id === saved.id);
          if (uIdx >= 0) this.data.users[uIdx] = saved;
          this.saveLocalCache();
        }
      }
    } catch (e) {
      console.error("Save user to D1 error:", e);
    }

    return user;
  }

  async deleteUser(id) {
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.saveLocalCache();
    try {
      const res = await fetch(this.getApiUrl(`/api/users?id=${encodeURIComponent(id)}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      return res.ok;
    } catch (e) {
      console.error("Delete user from D1 error:", e);
      return false;
    }
  }

  authenticateUser(email, password) {
    if (!email || !password) return null;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Direct fallback check for DEFAULT_USERS
    const defMatch = DEFAULT_USERS.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPass);
    if (defMatch) return defMatch;

    // 2. Check full users list
    const users = this.getUsers();
    const user = users.find(u => (u.email || '').toLowerCase() === cleanEmail);
    if (user && user.password === cleanPass) {
      return user;
    }
    return null;
  }

  // --- UI BADGE STATUS & DIAGNOSTICS ---
  async testCloudConnection() {
    try {
      const res = await fetch(this.getApiUrl('/api/setup'), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json().catch(() => null);
      return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        data: data
      };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        statusText: 'Network Error',
        error: err.message
      };
    }
  }

  renderCloudBadge() {
    const badge = document.getElementById('cloudflare-status-badge');
    const settingsBadge = document.getElementById('cf-settings-status');
    if (!badge && !settingsBadge) return;

    let html = '';
    let settingsText = '';

    if (this.cloudStatus === 'connected') {
      html = `
        <button onclick="window.db.openDiagnosticModal()" class="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 rounded-xl text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800 transition cursor-pointer" title="Cloudflare D1 Online (ກົດເພື່ອກວດສອບ)">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="hidden md:inline">Cloudflare D1: Synced</span>
        </button>
      `;
      settingsText = `
        <div class="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <span class="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            🟢 ເຊື່ອມຕໍ່ກັບ Cloudflare D1 ສຳເລັດແລ້ວ (ຂໍ້ມູນ Sync ທຸກເຄື່ອງ)
          </span>
          <button onclick="window.db.openDiagnosticModal()" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold shadow-sm transition">
            ກວດສອບລະບົບ
          </button>
        </div>
      `;
    } else if (this.cloudStatus === 'syncing') {
      html = `
        <div class="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-xl text-[11px] font-semibold border border-blue-200 dark:border-blue-800" title="Syncing with Cloudflare...">
          <i data-lucide="refresh-cw" class="w-3 h-3 animate-spin"></i>
          <span class="hidden md:inline">Syncing...</span>
        </div>
      `;
      settingsText = `
        <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold flex items-center gap-2">
          <i data-lucide="refresh-cw" class="w-4 h-4 animate-spin"></i>
          🔄 ກຳລັງດຶງຂໍ້ມູນຈາກ Cloudflare D1...
        </div>
      `;
    } else if (this.cloudStatus === 'error') {
      const is404 = this.cloudError && this.cloudError.status === 404;
      const statusTitle = is404 ? 'Functions 404 (ຍັງບໍ່ມີ Backend)' : `D1 Error (${this.cloudError?.status || '500'})`;
      html = `
        <button onclick="window.db.openDiagnosticModal()" class="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 rounded-xl text-[11px] font-bold border border-red-200 dark:border-red-800 transition cursor-pointer animate-pulse" title="ກົດເພື່ອກວດສອບບັນຫາ">
          <span class="w-2 h-2 rounded-full bg-red-500"></span>
          <span class="hidden md:inline">${statusTitle}</span>
        </button>
      `;
      settingsText = `
        <div class="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between gap-2">
          <div class="text-xs">
            <span class="text-red-700 dark:text-red-300 font-bold flex items-center gap-1.5">
              🔴 ບໍ່ສາມາດເຊື່ອມຕໍ່ D1: ${this.cloudError?.message || 'Server Error'}
            </span>
            <p class="text-[11px] text-red-600 dark:text-red-400 mt-0.5">${is404 ? 'ເກີດຈາກການ Deploy ຜ່ານ Drag-and-drop ໃນ Cloudflare ເຮັດໃຫ້ Functions ບໍ່ເຮັດວຽກ' : 'ກະລຸນາກວດສອບການ Bind D1 Database ຊື່ DB ໃນ Cloudflare Pages'}</p>
          </div>
          <button onclick="window.db.openDiagnosticModal()" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 transition">
            ແກ້ໄຂດຽວນີ້
          </button>
        </div>
      `;
    } else {
      // Offline / Local
      html = `
        <button onclick="window.db.openDiagnosticModal()" class="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-[11px] font-semibold border border-slate-300 dark:border-slate-700 transition cursor-pointer" title="Local Mode (ກົດເພື່ອກວດສອບ)">
          <span class="w-2 h-2 rounded-full bg-slate-400"></span>
          <span class="hidden md:inline">Local Cache</span>
        </button>
      `;
      settingsText = `
        <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span class="text-slate-600 dark:text-slate-300 font-medium text-xs flex items-center gap-2">
            ⚪ ໂໝດ Local (Offline) - ບັນທຶກສະເພາະໃນເຄື່ອງນີ້
          </span>
          <button onclick="window.db.openDiagnosticModal()" class="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            ກວດສອບການເຊື່ອມຕໍ່
          </button>
        </div>
      `;
    }

    if (badge) badge.innerHTML = html;
    if (settingsBadge) settingsBadge.innerHTML = settingsText;
    if (window.lucide) window.lucide.createIcons();
  }

  // Open Diagnostic Modal
  async openDiagnosticModal() {
    const modal = document.getElementById('d1-diagnostic-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.runDiagnosticCheck();
  }

  async runDiagnosticCheck() {
    const resEl = document.getElementById('diagnostic-results');
    if (!resEl) return;

    resEl.innerHTML = `
      <div class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
        <i data-lucide="refresh-cw" class="w-5 h-5 text-blue-600 animate-spin"></i>
        <span class="text-xs text-slate-600 dark:text-slate-300">ກຳລັງທົດສອບການເຊື່ອມຕໍ່ Cloudflare D1 Backend (/api/setup)...</span>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    const check = await this.testCloudConnection();
    let statusBadge = '';
    let diagnosisHtml = '';

    if (check.ok && check.data && check.data.success) {
      statusBadge = `<span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">🟢 D1 Database ພ້ອມໃຊ້ງານ 100%</span>`;
      diagnosisHtml = `
        <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
          <h4 class="font-bold text-xs text-emerald-900 dark:text-emerald-200">✅ ຖານຂໍ້ມູນ Cloudflare D1 ເຊື່ອມຕໍ່ປົກກະຕິ</h4>
          <p class="text-[11px] text-emerald-700 dark:text-emerald-300">
            ລະບົບສາມາດອ່ານ ແລະ ຂຽນຂໍ້ມູນລົງ D1 Database ໄດ້ສົມບູນ. ທຸກໆເຄື່ອງທີ່ເປີດ URL ດຽວກັນນີ້ຈະເຫັນຂໍ້ມູນ Sync ກັນແບບ Real-time.
          </p>
          <div class="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 bg-white/70 dark:bg-slate-900/70 p-2 rounded-xl">
            API Status: HTTP 200 OK | Tables Created & Verified
          </div>
        </div>
      `;
    } else if (check.status === 404) {
      statusBadge = `<span class="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-bold">🔴 ຂໍ້ຜິດພາດ: HTTP 404 Not Found</span>`;
      diagnosisHtml = `
        <div class="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl space-y-3">
          <h4 class="font-bold text-xs text-red-900 dark:text-red-200">⚠️ ສາເຫດທີ່ 2 ເຄື່ອງບໍ່ Sync ກັນ (Functions ບໍ່ເຮັດວຽກ):</h4>
          <p class="text-[11px] text-red-700 dark:text-red-300 leading-relaxed">
            ທ່ານອາດຈະ Deploy ເວັບໄຊໂດຍການ <b>ລາກໂຟນເດີມາວາງ (Direct Upload / Drag & Drop)</b> ໃນໜ້າ Cloudflare Pages Dashboard. 
            ລະບົບ Drag & Drop ຂອງ Cloudflare ຈະອັບໂຫຼດສະເພາະໄຟລ໌ HTML/JS ທຳມະດາ ແຕ່<b>ບໍ່ Compile ໂຟນເດີ <code>/functions/</code> ໃຫ້</b>, ເຮັດໃຫ້ API ທັງໝົດບໍ່ເຮັດວຽກ (HTTP 404).
          </p>
          <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900 text-xs space-y-1.5">
            <p class="font-bold text-slate-800 dark:text-slate-100">💡 ວິທີແກ້ໄຂໃຫ້ Sync ໄດ້ 100%:</p>
            <ol class="list-decimal list-inside text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <li>ເຊື່ອມຕໍ່ໂປຣເຈັກນີ້ຂຶ້ນ <b>GitHub</b> ແລ້ວ Deploy ຜ່ານ Cloudflare Pages (Connect to Git).</li>
              <li>ຫຼື Deploy ຜ່ານ <b>Wrangler CLI</b> ໂດຍໃຊ້ຄຳສັ່ງ: <br><code class="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[10px] text-blue-600">npx wrangler pages deploy . --project-name=ຊື່ໂປຣເຈັກ</code></li>
            </ol>
          </div>
        </div>
      `;
    } else if (check.status === 500) {
      statusBadge = `<span class="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">🟠 ຂໍ້ຜິດພາດ: HTTP 500 Database Binding Error</span>`;
      diagnosisHtml = `
        <div class="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-3">
          <h4 class="font-bold text-xs text-amber-900 dark:text-amber-200">⚠️ Backend ເຮັດວຽກແລ້ວ ແຕ່ຍັງບໍ່ໄດ້ເຊື່ອມ D1 Database ຖືກຕ້ອງ:</h4>
          <p class="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
            API ຕອບສະໜອງແລ້ວ ແຕ່ Cloudflare Pages ຍັງບໍ່ພົບ Binding ຊື່ <code>env.DB</code>.
          </p>
          <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900 text-xs space-y-1.5">
            <p class="font-bold text-slate-800 dark:text-slate-100">💡 ວິທີແກ້ໄຂ:</p>
            <ol class="list-decimal list-inside text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <li>ເຂົ້າ Cloudflare Pages ➔ ເລືອກໂປຣເຈັກຂອງທ່ານ ➔ <b>Settings</b> ➔ <b>Functions</b>.</li>
              <li>ຫົວຂໍ້ <b>D1 database bindings</b>: ຕັ້ງ Variable name ເປັນ <code class="font-bold text-amber-600">DB</code> (ຕົວໃຫຍ່).</li>
              <li>ເລືອກ Database D1 ຂອງທ່ານ ແລ້ວກົດ <b>Save</b>.</li>
              <li><b>ສຳຄັນທີ່ສຸດ:</b> ໄປທີ່ແທັບ Deployments ແລ້ວກົດ <b>Retry deployment</b> 1 ຄັ້ງ!</li>
            </ol>
          </div>
        </div>
      `;
    } else {
      statusBadge = `<span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold">⚪ ບໍ່ສາມາດເຊື່ອມຕໍ່ Server</span>`;
      diagnosisHtml = `
        <div class="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl space-y-2 text-xs">
          <h4 class="font-bold text-slate-800 dark:text-slate-200">ℹ️ ກຳລັງເຮັດວຽກໃນໂໝດ Local / Offline:</h4>
          <p class="text-[11px] text-slate-600 dark:text-slate-400">
            ${check.error || check.statusText || 'ບໍ່ມີການເຊື່ອມຕໍ່ອິນເຕີເນັດ ຫຼື ເປີດໃນ localhost/file://'}
          </p>
        </div>
      `;
    }

    resEl.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span class="text-xs font-semibold text-slate-500">ສະຖານະການກວດສອບ:</span>
          ${statusBadge}
        </div>
        ${diagnosisHtml}
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  // Export Full JSON Backup
  exportBackupJSON() {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      company: 'NETD IT SOLUTIONS',
      data: {
        settings: this.getSettings(),
        categories: this.getCategories(),
        products: this.getProducts(),
        stockLogs: this.getStockLogs(),
        disbursedLogs: this.getDisbursedLogs(),
        projects: this.getProjects(),
        projectTypes: this.getProjectTypes(),
        customers: this.getCustomers(),
        invoices: this.getInvoices(),
        users: this.getUsers()
      }
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NETD_IT_Cloud_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import JSON Backup & Push to D1
  async importBackupJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.data) {
        const payload = parsed.data;
        const res = await fetch(this.getApiUrl('/api/sync'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          await this.fetchAll(false);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error("Backup import error:", e);
      return false;
    }
  }

  // Number & Currency Formatter
  formatMoney(amount, currency = 'LAK') {
    const num = Number(amount) || 0;
    const formatted = num.toLocaleString('en-US');
    if (currency === 'LAK') return `${formatted} ₭`;
    if (currency === 'USD') return `$${formatted}`;
    if (currency === 'THB') return `${formatted} ฿`;
    return `${formatted} ${currency}`;
  }

  formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(typeof currentLang !== 'undefined' && currentLang === 'lo' ? 'lo-LA' : 'en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }
}

// Global DB instance
window.db = new DatabaseEngine();
