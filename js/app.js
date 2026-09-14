/**
 * NETD IT SOLUTIONS - Main Application Controller & Router
 */

const App = {
  currentView: 'dashboard',

  async init() {
    try {
      this.initTheme();
      this.initNavigation();
      this.initGlobalSearch();
      this.initSettings();
      this.bindGlobalShortcuts();

      // Initialize Authentication Module immediately
      if (window.AuthModule && typeof window.AuthModule.init === 'function') {
        window.AuthModule.init();
      }

      // Initialize all modules safely with local/cached state
      if (window.StockModule && typeof window.StockModule.init === 'function') window.StockModule.init();
      if (window.ProjectsModule && typeof window.ProjectsModule.init === 'function') window.ProjectsModule.init();
      if (window.CustomersModule && typeof window.CustomersModule.init === 'function') window.CustomersModule.init();
      if (window.InvoicesModule && typeof window.InvoicesModule.init === 'function') window.InvoicesModule.init();
      if (window.DashboardModule && typeof window.DashboardModule.init === 'function') window.DashboardModule.init();

      // Initialize language
      this.initLanguage();

      // Navigate to initial view immediately so buttons and navigation are active
      this.navigateTo(this.currentView);

      // Apply initial RBAC permissions
      if (window.AuthModule && typeof window.AuthModule.applyPermissions === 'function') {
        window.AuthModule.applyPermissions();
      }

      // Initialize Lucide Icons
      if (window.lucide) {
        window.lucide.createIcons();
      }

      // Hydrate direct real-time data from Cloudflare D1 in background (does not freeze UI)
      if (window.db && typeof window.db.fetchAll === 'function') {
        window.db.fetchAll(false).catch(e => console.warn("Initial D1 fetch warning:", e));
      }
    } catch (err) {
      console.error("App init error:", err);
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem('netd_theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('netd_theme', isDark ? 'dark' : 'light');
    if (window.DashboardModule && typeof window.DashboardModule.renderCharts === 'function') {
      window.DashboardModule.renderCharts();
    }
  },

  initLanguage() {
    if (typeof setLanguage === 'function') {
      setLanguage(currentLang);
    }
  },

  toggleLanguage() {
    const nextLang = currentLang === 'lo' ? 'en' : 'lo';
    if (typeof setLanguage === 'function') {
      setLanguage(nextLang);
    }
    const label = document.getElementById('current-lang-label');
    if (label) {
      label.textContent = nextLang === 'lo' ? '🇱🇦 ລາວ' : '🇺🇸 EN';
    }
    this.showToast(nextLang === 'lo' ? 'ສະຫຼັບເປັນພາສາລາວແລ້ວ' : 'Switched to English', 'info');
  },

  initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        if (view) this.navigateTo(view);
      });
    });
  },

  navigateTo(viewId) {
    this.currentView = viewId;

    // Update nav link styles
    document.querySelectorAll('.nav-link').forEach(link => {
      const isTarget = link.getAttribute('data-view') === viewId;
      link.classList.toggle('bg-blue-600', isTarget);
      link.classList.toggle('text-white', isTarget);
      link.classList.toggle('shadow-md', isTarget);
      link.classList.toggle('text-slate-600', !isTarget);
      link.classList.toggle('dark:text-slate-300', !isTarget);
    });

    // Hide all views, show active
    document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.remove('hidden');
    }

    // Close mobile sidebar if open
    this.closeMobileSidebar();

    // Trigger module refresh
    this.refreshCurrentView();

    // Apply permissions on view change
    if (window.AuthModule && typeof window.AuthModule.applyPermissions === 'function') {
      window.AuthModule.applyPermissions();
    }

    if (window.lucide) window.lucide.createIcons();
  },

  refreshCurrentView() {
    try {
      if (this.currentView === 'dashboard' && window.DashboardModule) window.DashboardModule.render();
      if (this.currentView === 'stock' && window.StockModule) window.StockModule.render();
      if (this.currentView === 'projects' && window.ProjectsModule) window.ProjectsModule.render();
      if (this.currentView === 'customers' && window.CustomersModule) window.CustomersModule.render();
      if (this.currentView === 'invoices' && window.InvoicesModule) window.InvoicesModule.render();
      if (this.currentView === 'settings') this.loadSettingsForm();

      if (window.AuthModule && typeof window.AuthModule.applyPermissions === 'function') {
        window.AuthModule.applyPermissions();
      }
    } catch (e) {
      console.warn("View refresh warning:", e);
    }
  },

  initGlobalSearch() {
    const input = document.getElementById('global-search-input');
    if (!input) return;

    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q || !window.db) return;

      const products = window.db.getProducts().filter(p => (p.name && p.name.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q)));
      const projects = window.db.getProjects().filter(p => (p.name && p.name.toLowerCase().includes(q)) || (p.code && p.code.toLowerCase().includes(q)));
      const customers = window.db.getCustomers().filter(c => (c.name && c.name.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q)));

      if (products.length > 0) {
        this.navigateTo('stock');
        if (window.StockModule) {
          window.StockModule.searchQuery = q;
          const sInput = document.getElementById('stock-search-input');
          if (sInput) sInput.value = q;
          window.StockModule.renderTable();
        }
      } else if (projects.length > 0) {
        this.navigateTo('projects');
        if (window.ProjectsModule) {
          window.ProjectsModule.searchQuery = q;
          const pInput = document.getElementById('project-search-input');
          if (pInput) pInput.value = q;
          window.ProjectsModule.render();
        }
      } else if (customers.length > 0) {
        this.navigateTo('customers');
        if (window.CustomersModule) {
          window.CustomersModule.searchQuery = q;
          const cInput = document.getElementById('customer-search-input');
          if (cInput) cInput.value = q;
          window.CustomersModule.render();
        }
      }
    });
  },

  // Modal Manager
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  },

  bindGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(modal => {
          this.closeModal(modal.id);
        });
      }
    });
  },

  // Mobile sidebar
  toggleMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
  },

  closeMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar && window.innerWidth < 1024) {
      sidebar.classList.add('-translate-x-full');
    }
  },

  // Toast Engine
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    let bg = 'bg-gray-900 text-white';
    let icon = 'info';

    if (type === 'success') {
      bg = 'bg-emerald-600 text-white';
      icon = 'check-circle';
    } else if (type === 'error') {
      bg = 'bg-red-600 text-white';
      icon = 'alert-triangle';
    }

    toast.className = `toast ${bg} shadow-lg`;
    toast.innerHTML = `
      <i data-lucide="${icon}" class="w-5 h-5 shrink-0"></i>
      <span class="text-xs font-semibold flex-1">${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Settings & Backups
  initSettings() {
    const form = document.getElementById('settings-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (window.AuthModule && !window.AuthModule.isAdmin()) {
          this.showToast("ທ່ານບໍ່ມີສິດທິແກ້ໄຂການຕັ້ງຄ່າ (Admin Only)", "error");
          return;
        }

        const settings = {
          companyName: document.getElementById('set-company-name').value.trim(),
          tagline: document.getElementById('set-tagline').value.trim(),
          phone: document.getElementById('set-phone').value.trim(),
          email: document.getElementById('set-email').value.trim(),
          address: document.getElementById('set-address').value.trim(),
          bankInfo: document.getElementById('set-bank-info').value.trim(),
          taxId: document.getElementById('set-tax-id').value.trim(),
          currency: document.getElementById('set-currency').value
        };
        await window.db.saveSettings(settings);
        this.showToast(typeof t === 'function' ? t('toast_success_save') : 'Settings saved to Cloudflare D1!', 'success');
      });
    }
  },

  loadSettingsForm() {
    if (!window.db) return;
    const s = window.db.getSettings();
    if (!s) return;
    
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };

    setVal('set-company-name', s.companyName || 'NETD IT SOLUTIONS');
    setVal('set-tagline', s.tagline || '');
    setVal('set-phone', s.phone || '');
    setVal('set-email', s.email || '');
    setVal('set-address', s.address || '');
    setVal('set-bank-info', s.bankInfo || '');
    setVal('set-tax-id', s.taxId || '');
    setVal('set-currency', s.currency || 'LAK');

    const isAdmin = window.AuthModule ? window.AuthModule.isAdmin() : true;
    const form = document.getElementById('settings-form');
    if (form) {
      form.querySelectorAll('input, select, textarea').forEach(input => {
        if (isAdmin) {
          input.removeAttribute('disabled');
        } else {
          input.setAttribute('disabled', 'true');
        }
      });
    }
  },

  triggerExportBackup() {
    if (window.db) window.db.exportBackupJSON();
    this.showToast(typeof t === 'function' ? t('toast_backup_exported') : 'Backup exported!', 'success');
  },

  triggerImportBackup() {
    if (window.AuthModule && !window.AuthModule.isAdmin()) {
      this.showToast("ທ່ານບໍ່ມີສິດທິນຳເຂົ້າຖານຂໍ້ມູນ (Admin Only)", "error");
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        const ok = await window.db.importBackupJSON(event.target.result);
        if (ok) {
          this.showToast(typeof t === 'function' ? t('toast_backup_imported') : 'Restored to Cloudflare D1!', 'success');
          this.refreshCurrentView();
        } else {
          this.showToast('Invalid backup JSON file format', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  triggerResetDemo() {
    if (window.AuthModule && !window.AuthModule.isAdmin()) {
      this.showToast("ທ່ານບໍ່ມີສິດທິຣີເຊັດຖານຂໍ້ມູນ (Admin Only)", "error");
      return;
    }

    if (confirm("Sync fresh data from Cloudflare D1?")) {
      if (window.db) window.db.fetchAll(false);
      this.showToast("Refreshed from Cloudflare D1!", 'success');
      this.refreshCurrentView();
    }
  },

  triggerClearData() {
    if (window.AuthModule && !window.AuthModule.isAdmin()) {
      this.showToast("ທ່ານບໍ່ມີສິດທິລຶບຂໍ້ມູນທັງໝົດ (Admin Only)", "error");
      return;
    }

    if (confirm("WARNING: Are you sure you want to refresh all views?")) {
      if (window.db) window.db.fetchAll(false);
      this.showToast("Synced with Cloudflare D1", 'info');
      this.refreshCurrentView();
    }
  }
};

window.App = App;

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
  });
} else {
  window.App.init();
}
