/**
 * NETD IT SOLUTIONS - Customer Relationship Management (CRM 360°)
 */

const CustomersModule = {
  searchQuery: '',

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    const searchInput = document.getElementById('customer-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.render();
      });
    }
  },

  render() {
    if (!window.db) return;
    let customers = window.db.getCustomers();

    if (this.searchQuery) {
      customers = customers.filter(c => 
        (c.name && c.name.toLowerCase().includes(this.searchQuery)) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(this.searchQuery)) ||
        (c.phone && c.phone.toLowerCase().includes(this.searchQuery)) ||
        (c.email && c.email.toLowerCase().includes(this.searchQuery)) ||
        (c.type && c.type.toLowerCase().includes(this.searchQuery))
      );
    }

    const container = document.getElementById('customers-table-body');
    if (!container) return;

    if (customers.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-12 text-gray-500 dark:text-gray-400">
            <i data-lucide="users" class="w-12 h-12 mx-auto mb-3 opacity-40"></i>
            <p class="text-base font-medium">${typeof t === 'function' ? t('all_caught_up') : 'No clients found'}</p>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const isAdmin = window.AuthModule ? window.AuthModule.isAdmin() : true;

    container.innerHTML = customers.map(c => `
      <tr class="border-b border-gray-100 dark:border-gray-800/60 hover:bg-blue-50/30 transition">
        <td>
          <div class="font-bold text-slate-900 dark:text-white text-sm cursor-pointer hover:text-blue-600 transition" onclick="CustomersModule.openProfile360('${c.id}')">${c.name}</div>
          ${c.taxId ? `<div class="text-[11px] text-slate-400 font-mono mt-0.5">Tax ID: ${c.taxId}</div>` : ''}
        </td>
        <td>
          <div class="text-xs text-slate-700 dark:text-slate-300 font-semibold">${c.contactPerson || '-'}</div>
        </td>
        <td>
          <div class="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">${c.phone || '-'}</div>
          ${c.email ? `<div class="text-[11px] text-slate-400 truncate max-w-[180px]">${c.email}</div>` : ''}
        </td>
        <td>
          <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 whitespace-nowrap">
            ${c.type || 'Corporate'}
          </span>
        </td>
        <td class="text-xs text-slate-600 dark:text-slate-300 max-w-xs">
          ${c.address || '-'}
        </td>
        <td>
          <div class="flex items-center gap-1.5 whitespace-nowrap">
            <button onclick="CustomersModule.openProfile360('${c.id}')" title="360 Profile" class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl dark:hover:bg-blue-900/40 transition">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
            ${isAdmin ? `
              <button onclick="CustomersModule.openEditModal('${c.id}')" title="${typeof t === 'function' ? t('btn_edit') : 'Edit'}" class="p-2 text-slate-600 hover:bg-slate-100 rounded-xl dark:text-slate-300 dark:hover:bg-slate-800 transition">
                <i data-lucide="edit-2" class="w-4 h-4"></i>
              </button>
              <button onclick="CustomersModule.deleteCustomer('${c.id}')" title="${typeof t === 'function' ? t('btn_delete') : 'Delete'}" class="p-2 text-red-600 hover:bg-red-50 rounded-xl dark:hover:bg-red-900/40 transition">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openAddModal() {
    const titleEl = document.getElementById('customer-modal-title');
    if (titleEl && typeof t === 'function') titleEl.textContent = t('modal_add_customer');
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    const idEl = document.getElementById('customer-id');
    if (idEl) idEl.value = '';
    window.App.openModal('customer-modal');
  },

  openEditModal(id) {
    const c = window.db.getCustomer(id);
    if (!c) return;

    const titleEl = document.getElementById('customer-modal-title');
    if (titleEl && typeof t === 'function') titleEl.textContent = t('modal_edit_customer');
    
    const setVal = (fieldId, val) => {
      const el = document.getElementById(fieldId);
      if (el) el.value = val;
    };

    setVal('customer-id', c.id);
    setVal('cust-name', c.name || '');
    setVal('cust-contact', c.contactPerson || '');
    setVal('cust-phone', c.phone || '');
    setVal('cust-email', c.email || '');
    setVal('cust-address', c.address || '');
    setVal('cust-tax-id', c.taxId || '');
    setVal('cust-type', c.type || 'Corporate');
    setVal('cust-notes', c.notes || '');

    window.App.openModal('customer-modal');
  },

  // 🌟 Safe Customer Form Saver with direct Cloudflare D1 persistence
  async saveCustomerForm(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const getVal = (id, fallback = '') => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : fallback;
    };

    const id = getVal('customer-id');

    const customerData = {
      id: id || undefined,
      name: getVal('cust-name', 'Client'),
      contactPerson: getVal('cust-contact'),
      phone: getVal('cust-phone'),
      email: getVal('cust-email'),
      address: getVal('cust-address'),
      taxId: getVal('cust-tax-id'),
      type: getVal('cust-type', 'Corporate'),
      notes: getVal('cust-notes')
    };

    await window.db.saveCustomer(customerData);
    window.App.closeModal('customer-modal');
    window.App.showToast(typeof t === 'function' ? t('toast_success_save') : 'ບັນທຶກລູກຄ້າສໍາເລັດແລ້ວ!', 'success');
    this.render();
    if (window.ProjectsModule) window.ProjectsModule.render();
    if (window.DashboardModule) window.DashboardModule.render();
  },

  async saveQuickCustomerForm(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const getVal = (id, fallback = '') => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : fallback;
    };

    const source = getVal('quick-cust-source', 'project');
    
    const customerData = {
      name: getVal('quick-cust-name', 'Client'),
      contactPerson: getVal('quick-cust-contact'),
      phone: getVal('quick-cust-phone'),
      email: getVal('quick-cust-email'),
      address: getVal('quick-cust-address'),
      type: getVal('quick-cust-type', 'Corporate'),
      notes: ''
    };

    const saved = await window.db.saveCustomer(customerData);
    window.App.closeModal('quick-customer-modal');
    window.App.showToast(typeof t === 'function' ? t('toast_success_save') : 'ເພີ່ມລູກຄ້າໃໝ່ສໍາເລັດແລ້ວ!', 'success');

    if (source === 'project' && window.ProjectsModule) {
      window.ProjectsModule.handleQuickCustomerSaved(saved);
    } else if (source === 'invoice' && window.InvoicesModule) {
      window.InvoicesModule.handleQuickCustomerSaved(saved);
    }

    this.render();
    if (window.DashboardModule) window.DashboardModule.render();
  },

  async deleteCustomer(id) {
    const msg = typeof t === 'function' ? t('confirm_delete') : 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລູກຄ້ານີ້?';
    if (confirm(msg)) {
      await window.db.deleteCustomer(id);
      window.App.showToast(typeof t === 'function' ? t('toast_success_delete') : 'Deleted from Cloudflare D1!', 'info');
      this.render();
      if (window.DashboardModule) window.DashboardModule.render();
    }
  },

  // Customer 360 View Modal
  openProfile360(id) {
    const c = window.db.getCustomer(id);
    if (!c) return;

    const projects = window.db.getProjects().filter(p => p.customerId === c.id);
    const invoices = window.db.getInvoices().filter(inv => inv.customerId === c.id);
    const totalSpent = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);

    const modalContent = document.getElementById('customer-360-content');
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="space-y-6">
        <!-- Customer Profile Card -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span class="bg-white/20 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ${c.type || 'Corporate'}
              </span>
              <h2 class="text-2xl font-extrabold mt-2">${c.name}</h2>
              <p class="text-xs text-blue-100 mt-1">${c.address || 'No address'}</p>
            </div>
            <div class="text-right">
              <div class="text-xs text-blue-100">Total Spent</div>
              <div class="text-xl font-bold font-mono">${window.db.formatMoney(totalSpent)}</div>
            </div>
          </div>
        </div>

        <!-- Contact Information Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <span class="text-gray-400 block mb-1">Contact Person</span>
            <strong class="text-gray-900 dark:text-white text-sm">${c.contactPerson || '-'}</strong>
          </div>
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <span class="text-gray-400 block mb-1">Phone / WhatsApp</span>
            <strong class="text-blue-600 font-mono text-sm">${c.phone || '-'}</strong>
          </div>
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <span class="text-gray-400 block mb-1">Email</span>
            <strong class="text-gray-900 dark:text-white">${c.email || '-'}</strong>
          </div>
        </div>

        <!-- Associated Projects -->
        <div>
          <h4 class="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Projects (${projects.length})</h4>
          <div class="space-y-2">
            ${projects.length === 0 ? '<p class="text-xs text-gray-400">No projects associated with this client.</p>' : projects.map(p => `
              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-xs">
                <div>
                  <span class="font-mono text-blue-600 font-bold">${p.code}</span>
                  <div class="font-semibold text-gray-900 dark:text-white">${p.name}</div>
                </div>
                <div class="text-right">
                  <span class="badge ${p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'} text-[10px]">${p.status}</span>
                  <div class="font-mono font-bold mt-0.5">${window.db.formatMoney(p.contractValue)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Invoices & Quotations History -->
        <div>
          <h4 class="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Financial Documents (${invoices.length})</h4>
          <div class="space-y-2">
            ${invoices.length === 0 ? '<p class="text-xs text-gray-400">No invoices issued for this client yet.</p>' : invoices.map(inv => `
              <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-xs">
                <div>
                  <span class="font-mono font-bold text-blue-600">${inv.docNo}</span>
                  <span class="text-gray-400 text-[11px] ml-2">• ${inv.type} (${window.db.formatDate(inv.issueDate)})</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-mono font-bold">${window.db.formatMoney(inv.grandTotal)}</span>
                  <button onclick="InvoicesModule.previewPrint('${inv.id}')" class="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    window.App.openModal('customer-360-modal');
    if (window.lucide) window.lucide.createIcons();
  }
};

window.CustomersModule = CustomersModule;
