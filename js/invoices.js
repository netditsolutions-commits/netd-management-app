/**
 * NETD IT SOLUTIONS - Quotations, Invoices & Financial Documents Module
 * Supports Valid Until Date (ນຳໃຊ້ໄດ້ເຖີງວັນທີ່), Document Statuses in UI,
 * Clean A4 Print Layout without Status, 0% VAT, and Quotation References.
 */

const InvoicesModule = {
  activeTab: 'all',
  searchQuery: '',
  currentItems: [],

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    const searchInput = document.getElementById('invoice-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.render();
      });
    }
  },

  setTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.doc-tab-btn').forEach(btn => {
      btn.classList.remove('border-blue-600', 'text-blue-600', 'dark:text-blue-400');
      btn.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    });
    const activeBtn = document.getElementById(`doc-tab-${tab}`);
    if (activeBtn) {
      activeBtn.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
      activeBtn.classList.add('border-blue-600', 'text-blue-600', 'dark:text-blue-400');
    }
    this.render();
  },

  render() {
    if (!window.db) return;
    let docs = window.db.getInvoices();

    if (this.searchQuery) {
      docs = docs.filter(d => 
        (d.docNo && d.docNo.toLowerCase().includes(this.searchQuery)) ||
        (d.customerName && d.customerName.toLowerCase().includes(this.searchQuery)) ||
        (d.type && d.type.toLowerCase().includes(this.searchQuery)) ||
        (d.projectName && d.projectName.toLowerCase().includes(this.searchQuery)) ||
        (d.refQuotationNo && d.refQuotationNo.toLowerCase().includes(this.searchQuery))
      );
    }

    if (this.activeTab === 'quotation') {
      docs = docs.filter(d => d.type === 'Quotation');
    } else if (this.activeTab === 'invoice') {
      docs = docs.filter(d => d.type === 'Invoice');
    } else if (this.activeTab === 'receipt') {
      docs = docs.filter(d => d.type === 'Receipt');
    }

    const container = document.getElementById('invoices-table-body');
    if (!container) return;

    if (docs.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-16 text-slate-400 dark:text-slate-500">
            <i data-lucide="file-spreadsheet" class="w-14 h-14 mx-auto mb-3 opacity-30 text-slate-400"></i>
            <p class="text-sm font-bold text-slate-700 dark:text-slate-300">ຍັງບໍ່ມີລາຍການເອກະສານໃນໝວດນີ້</p>
            <p class="text-xs text-slate-400 mt-1">ກົດປຸ່ມດ້ານເທິງເພື່ອສ້າງ ໃບສະເໜີລາຄາ (Quotation) ຫຼື ໃບເກັບເງິນ (Invoice) ໃໝ່</p>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const isAdmin = window.AuthModule ? window.AuthModule.isAdmin() : true;

    container.innerHTML = docs.map(doc => {
      let typeBadge = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      if (doc.type === 'Quotation') typeBadge = 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
      if (doc.type === 'Receipt') typeBadge = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';

      let statusBadge = 'bg-slate-100 text-slate-700';
      if (doc.status === 'Paid' || doc.status === 'Accepted' || doc.status === 'Issued') statusBadge = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
      if (doc.status === 'Partial' || doc.status === 'Sent') statusBadge = 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
      if (doc.status === 'Unpaid' || doc.status === 'Overdue') statusBadge = 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300';
      if (doc.status === 'Draft') statusBadge = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

      return `
        <tr class="border-b border-gray-100 dark:border-gray-800/60 hover:bg-blue-50/30 transition">
          <td class="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
            ${doc.docNo}
          </td>
          <td>
            <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${typeBadge} whitespace-nowrap">
              ${doc.type}
            </span>
          </td>
          <td>
            <div class="font-bold text-slate-900 dark:text-white text-sm">${doc.customerName || '-'}</div>
            ${doc.projectName ? `<div class="text-xs text-slate-500 truncate max-w-xs mt-0.5">${doc.projectName}</div>` : ''}
            ${doc.refQuotationNo ? `<div class="text-[11px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">Ref: ${doc.refQuotationNo}</div>` : ''}
          </td>
          <td class="text-xs text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">
            <div class="font-semibold">${window.db.formatDate(doc.issueDate)}</div>
            ${doc.validUntil ? `<div class="text-[11px] text-purple-600 dark:text-purple-400 font-medium">ຮອດ: ${window.db.formatDate(doc.validUntil)}</div>` : ''}
            ${doc.dueDate && doc.type !== 'Quotation' ? `<div class="text-[11px] text-slate-400">ກຳນົດ: ${window.db.formatDate(doc.dueDate)}</div>` : ''}
          </td>
          <td class="font-mono font-bold text-sm text-slate-900 dark:text-white whitespace-nowrap">
            ${window.db.formatMoney(doc.grandTotal)}
          </td>
          <td>
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold ${statusBadge} whitespace-nowrap">
              ${doc.status || 'Active'}
            </span>
          </td>
          <td>
            <div class="flex items-center gap-1.5 whitespace-nowrap">
              <button onclick="InvoicesModule.previewPrint('${doc.id}')" title="${typeof t === 'function' ? t('btn_print_preview') : 'Print A4'}" class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl dark:hover:bg-blue-900/40 transition">
                <i data-lucide="printer" class="w-4 h-4"></i>
              </button>
              ${isAdmin ? `
                <button onclick="InvoicesModule.openEditModal('${doc.id}')" title="${typeof t === 'function' ? t('btn_edit') : 'Edit'}" class="p-2 text-slate-600 hover:bg-slate-100 rounded-xl dark:text-slate-300 dark:hover:bg-slate-800 transition">
                  <i data-lucide="edit-2" class="w-4 h-4"></i>
                </button>
                <button onclick="InvoicesModule.deleteDoc('${doc.id}')" title="${typeof t === 'function' ? t('btn_delete') : 'Delete'}" class="p-2 text-red-600 hover:bg-red-50 rounded-xl dark:hover:bg-red-900/40 transition">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openCreateModal(defaultType = 'Quotation') {
    const titleEl = document.getElementById('doc-modal-title');
    if (titleEl) {
      titleEl.textContent = defaultType === 'Quotation' ? 'ສ້າງໃບສະເໜີລາຄາ (New Quotation)' : 'ສ້າງໃບເກັບເງິນ (New Invoice)';
    }
    const form = document.getElementById('doc-form');
    if (form) form.reset();
    const idEl = document.getElementById('doc-id');
    if (idEl) idEl.value = '';
    
    const typeSelect = document.getElementById('doc-type');
    if (typeSelect) typeSelect.value = defaultType;

    const todayStr = new Date().toISOString().slice(0, 10);
    const issueDateEl = document.getElementById('doc-issue-date');
    if (issueDateEl) issueDateEl.value = todayStr;

    // Default Valid Until date (+30 days)
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 30);
    const validUntilEl = document.getElementById('doc-valid-until');
    if (validUntilEl) validUntilEl.value = validUntilDate.toISOString().slice(0, 10);

    const dueDateEl = document.getElementById('doc-due-date');
    if (dueDateEl) dueDateEl.value = validUntilDate.toISOString().slice(0, 10);

    this.populateCustomerDropdown();
    this.populateProjectDropdown();
    this.populateRefQuotationDropdown();
    this.handleTypeChange();

    this.currentItems = [
      { description: "IT Equipment / Consulting Service", qty: 1, price: 1500000, total: 1500000 }
    ];
    this.renderLineItems();

    window.App.openModal('doc-modal');
  },

  handleTypeChange() {
    const typeEl = document.getElementById('doc-type');
    const type = typeEl ? typeEl.value : 'Quotation';
    const yr = new Date().getFullYear();
    let count = (window.db ? window.db.getInvoices().length : 0) + 1;
    
    let prefix = 'QT';
    if (type === 'Invoice') prefix = 'INV';
    if (type === 'Receipt') prefix = 'REC';
    
    const docNoEl = document.getElementById('doc-no');
    if (docNoEl && (!docNoEl.value || docNoEl.value.startsWith('QT-') || docNoEl.value.startsWith('INV-') || docNoEl.value.startsWith('REC-'))) {
      let candidate = `${prefix}-${yr}-${count.toString().padStart(4, '0')}`;
      while (window.db && window.db.getInvoices().some(d => d.docNo === candidate)) {
        count++;
        candidate = `${prefix}-${yr}-${count.toString().padStart(4, '0')}`;
      }
      docNoEl.value = candidate;
    }

    const validUntilContainer = document.getElementById('doc-valid-until-container');
    const refQuotationContainer = document.getElementById('doc-ref-quotation-container');
    const dueDateContainer = document.getElementById('doc-due-date-container');
    const statusSelect = document.getElementById('doc-status');

    if (type === 'Quotation') {
      if (validUntilContainer) validUntilContainer.classList.remove('hidden');
      if (refQuotationContainer) refQuotationContainer.classList.add('hidden');
      if (dueDateContainer) dueDateContainer.classList.add('hidden');
      if (statusSelect) {
        statusSelect.innerHTML = `
          <option value="Draft">ຮ່າງ (Draft)</option>
          <option value="Sent" selected>ສົ່ງແລ້ວ (Sent)</option>
          <option value="Accepted">ລູກຄ້າຕົກລົງ (Accepted)</option>
          <option value="Rejected">ຍົກເລີກ/ປະຕິເສດ (Rejected)</option>
        `;
      }
    } else if (type === 'Invoice') {
      if (validUntilContainer) validUntilContainer.classList.add('hidden');
      if (refQuotationContainer) refQuotationContainer.classList.remove('hidden');
      if (dueDateContainer) dueDateContainer.classList.remove('hidden');
      if (statusSelect) {
        statusSelect.innerHTML = `
          <option value="Unpaid" selected>ຍັງບໍ່ທັນຊຳລະ (Unpaid)</option>
          <option value="Partial">ຊຳລະບາງສ່ວນ (Partial)</option>
          <option value="Paid">ຊຳລະຄົບແລ້ວ (Paid)</option>
          <option value="Overdue">ກາຍກຳນົດ (Overdue)</option>
        `;
      }
    } else {
      if (validUntilContainer) validUntilContainer.classList.add('hidden');
      if (refQuotationContainer) refQuotationContainer.classList.remove('hidden');
      if (dueDateContainer) dueDateContainer.classList.remove('hidden');
      if (statusSelect) {
        statusSelect.innerHTML = `
          <option value="Issued" selected>ອອກໃບຮັບເງິນແລ້ວ (Issued)</option>
          <option value="Cancelled">ຍົກເລີກ (Cancelled)</option>
        `;
      }
    }
  },

  populateCustomerDropdown(selectedId = '') {
    const select = document.getElementById('doc-customer');
    if (!select || !window.db) return;
    let customers = window.db.getCustomers();
    if (!customers || customers.length === 0) {
      customers = [
        { id: "CUST-001", name: "ລູກຄ້າທົ່ວໄປ (General Customer)", contactPerson: "General", phone: "" }
      ];
    }
    const defaultSelect = selectedId || (customers[0] ? customers[0].id : '');
    select.innerHTML = '<option value="">-- ເລືອກລູກຄ້າ (Select Client) --</option>' + customers.map(c => `
      <option value="${c.id}" ${c.id === defaultSelect ? 'selected' : ''}>${c.name} (${c.contactPerson || '-'})</option>
    `).join('');
    if (defaultSelect) {
      select.value = defaultSelect;
    }
  },

  populateProjectDropdown(selectedId = '') {
    const select = document.getElementById('doc-project');
    if (!select || !window.db) return;
    const projects = window.db.getProjects();
    select.innerHTML = '<option value="">-- ບໍ່ລະບຸ / ການຂາຍທົ່ວໄປ (General) --</option>' + projects.map(p => `
      <option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${p.code} - ${p.name}</option>
    `).join('');
  },

  populateRefQuotationDropdown(selectedId = '') {
    const select = document.getElementById('doc-ref-quotation');
    if (!select || !window.db) return;
    const quotations = window.db.getInvoices().filter(d => d.type === 'Quotation');
    select.innerHTML = '<option value="">-- ບໍ່ມີ / ສ້າງໃບບິນໃໝ່ (None) --</option>' + quotations.map(q => `
      <option value="${q.id}" ${q.id === selectedId ? 'selected' : ''}>${q.docNo} - ${q.customerName} (${window.db.formatMoney(q.grandTotal)})</option>
    `).join('');
  },

  handleRefQuotationChange() {
    const refSelect = document.getElementById('doc-ref-quotation');
    if (!refSelect || !refSelect.value) return;

    const quotation = window.db.getInvoice(refSelect.value);
    if (!quotation) return;

    if (quotation.customerId) {
      this.populateCustomerDropdown(quotation.customerId);
    }
    if (quotation.projectId) {
      this.populateProjectDropdown(quotation.projectId);
    }
    if (quotation.items && quotation.items.length > 0) {
      this.currentItems = JSON.parse(JSON.stringify(quotation.items));
      this.renderLineItems();
    }
    const discEl = document.getElementById('doc-discount');
    if (discEl && quotation.discount !== undefined) discEl.value = quotation.discount;

    const termsEl = document.getElementById('doc-terms');
    if (termsEl && quotation.terms) termsEl.value = quotation.terms;

    window.App.showToast(`ດຶງຂໍ້ມູນຈາກໃບສະເໜີລາຄາ ${quotation.docNo} ສຳເລັດແລ້ວ!`, 'info');
  },

  openQuickAddCustomerModal() {
    const form = document.getElementById('quick-customer-form');
    if (form) form.reset();
    const sourceEl = document.getElementById('quick-cust-source');
    if (sourceEl) sourceEl.value = 'invoice';
    window.App.openModal('quick-customer-modal');
  },

  handleQuickCustomerSaved(newCustomer) {
    if (!newCustomer) return;
    this.populateCustomerDropdown(newCustomer.id);
    const select = document.getElementById('doc-customer');
    if (select) {
      select.value = newCustomer.id;
      this.handleCustomerChange();
    }
  },

  handleCustomerChange() {
    const custId = document.getElementById('doc-customer').value;
    const customer = window.db.getCustomer(custId);
    if (!customer) return;

    const projects = window.db.getProjects().filter(p => p.customerId === custId);
    const projSelect = document.getElementById('doc-project');
    if (projSelect && projects.length > 0) {
      projSelect.innerHTML = '<option value="">-- None --</option>' + projects.map(p => `
        <option value="${p.id}">${p.code} - ${p.name}</option>
      `).join('');
      projSelect.value = projects[0].id;
    }
  },

  renderLineItems() {
    const container = document.getElementById('doc-line-items-tbody');
    if (!container) return;

    container.innerHTML = this.currentItems.map((item, idx) => `
      <tr class="border-b border-gray-100 dark:border-gray-700/60">
        <td class="p-2">
          <input type="text" value="${item.description || ''}" oninput="InvoicesModule.updateLineItem(${idx}, 'description', this.value)" class="w-full text-xs p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Item description / Service">
        </td>
        <td class="p-2 w-20">
          <input type="number" min="1" value="${item.qty || 1}" oninput="InvoicesModule.updateLineItem(${idx}, 'qty', this.value)" class="w-full text-xs p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-center font-mono font-bold">
        </td>
        <td class="p-2 w-32">
          <input type="number" min="0" step="1000" value="${item.price || 0}" oninput="InvoicesModule.updateLineItem(${idx}, 'price', this.value)" class="w-full text-xs p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-right font-mono">
        </td>
        <td class="p-2 w-36 text-right font-mono font-bold text-xs text-gray-900 dark:text-white">
          ${window.db.formatMoney(item.total || 0)}
        </td>
        <td class="p-2 w-10 text-center">
          <button type="button" onclick="InvoicesModule.removeLineItem(${idx})" class="p-1 text-red-500 hover:text-red-700">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>
      </tr>
    `).join('');

    this.calculateTotals();
    if (window.lucide) window.lucide.createIcons();
  },

  addLineItem() {
    this.currentItems.push({
      description: "",
      qty: 1,
      price: 0,
      total: 0
    });
    this.renderLineItems();
  },

  openStockPicker() {
    const products = window.db.getProducts();
    const modalContent = document.getElementById('stock-picker-list');
    if (!modalContent) return;

    modalContent.innerHTML = products.map(prod => `
      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl border border-gray-200 dark:border-gray-600 transition cursor-pointer" onclick="InvoicesModule.pickProductToDoc('${prod.id}')">
        <div>
          <div class="font-bold text-xs text-gray-900 dark:text-white">${prod.name}</div>
          <div class="text-[11px] text-gray-500 font-mono">${prod.sku} • Stock: ${prod.stockQty}</div>
        </div>
        <div class="text-right">
          <div class="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">${window.db.formatMoney(prod.salePrice)}</div>
          <button class="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-semibold mt-1">Select</button>
        </div>
      </div>
    `).join('');

    window.App.openModal('stock-picker-modal');
  },

  pickProductToDoc(productId) {
    const prod = window.db.getProduct(productId);
    if (!prod) return;

    this.currentItems.push({
      description: `${prod.name} (SKU: ${prod.sku})`,
      qty: 1,
      price: Number(prod.salePrice) || 0,
      total: Number(prod.salePrice) || 0
    });

    window.App.closeModal('stock-picker-modal');
    this.renderLineItems();
  },

  updateLineItem(index, field, value) {
    if (!this.currentItems[index]) return;
    if (field === 'qty') {
      this.currentItems[index].qty = Math.max(1, Number(value) || 1);
    } else if (field === 'price') {
      this.currentItems[index].price = Math.max(0, Number(value) || 0);
    } else {
      this.currentItems[index][field] = value;
    }
    this.currentItems[index].total = this.currentItems[index].qty * this.currentItems[index].price;
    this.renderLineItems();
  },

  removeLineItem(index) {
    this.currentItems.splice(index, 1);
    this.renderLineItems();
  },

  calculateTotals() {
    const subtotal = this.currentItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const discEl = document.getElementById('doc-discount');
    const discount = discEl ? (Number(discEl.value) || 0) : 0;
    
    // Completely NO VAT (0%)
    const grandTotal = Math.max(0, subtotal - discount);

    const subEl = document.getElementById('doc-subtotal-disp');
    if (subEl) subEl.textContent = window.db.formatMoney(subtotal);
    const gtEl = document.getElementById('doc-grand-total-disp');
    if (gtEl) gtEl.textContent = window.db.formatMoney(grandTotal);

    return { subtotal, discount, taxRate: 0, taxAmount: 0, grandTotal };
  },

  async saveDocForm(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    
    try {
      const getVal = (id, fallback = '') => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : fallback;
      };

      const id = getVal('doc-id');
      const type = getVal('doc-type', 'Quotation');
      let custId = getVal('doc-customer');
      const projId = getVal('doc-project');
      
      let customer = window.db ? window.db.getCustomer(custId) : null;
      if (!customer && (!custId || custId === 'CUST-001')) {
        // Fallback to first customer or default customer
        const allCusts = window.db ? window.db.getCustomers() : [];
        if (allCusts.length > 0) {
          customer = allCusts[0];
          custId = customer.id;
        }
      }

      const project = window.db ? window.db.getProject(projId) : null;
      const totals = this.calculateTotals();

      const refQuotationId = getVal('doc-ref-quotation');
      let refQuotationNo = '';
      if (refQuotationId && window.db) {
        const refQ = window.db.getInvoice(refQuotationId);
        if (refQ) refQuotationNo = refQ.docNo;
      }

      const customerName = customer ? customer.name : (custId || 'ລູກຄ້າທົ່ວໄປ (General Customer)');
      const contactPerson = customer ? customer.contactPerson : '';
      const phone = customer ? customer.phone : '';
      const email = customer ? customer.email : '';
      const address = customer ? customer.address : '';

      const docNoVal = getVal('doc-no') || `${type === 'Invoice' ? 'INV' : 'QT'}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

      // Ensure at least one line item
      const validItems = (this.currentItems && this.currentItems.length > 0) ? this.currentItems : [
        { description: 'IT Equipment / Services', qty: 1, price: 0, total: 0 }
      ];

      const docData = {
        id: id || undefined,
        docNo: docNoVal,
        type: type,
        refQuotationId: refQuotationId || '',
        refQuotationNo: refQuotationNo || '',
        customerId: custId || 'CUST-001',
        customerName: customerName,
        contactPerson: contactPerson || '',
        phone: phone || '',
        email: email || '',
        address: address || '',
        projectId: projId || '',
        projectName: project ? project.name : '',
        issueDate: getVal('doc-issue-date', new Date().toISOString().slice(0, 10)),
        validUntil: type === 'Quotation' ? (getVal('doc-valid-until') || '') : '',
        dueDate: type !== 'Quotation' ? (getVal('doc-due-date') || '') : '',
        status: getVal('doc-status', type === 'Quotation' ? 'Sent' : 'Unpaid'),
        items: validItems,
        subtotal: totals.subtotal,
        discount: totals.discount,
        taxRate: 0,
        taxAmount: 0,
        grandTotal: totals.grandTotal,
        terms: getVal('doc-terms')
      };

      await window.db.saveInvoice(docData);
      window.App.closeModal('doc-modal');
      window.App.showToast(typeof t === 'function' ? t('toast_success_save') : 'ບັນທຶກເອກະສານສໍາເລັດແລ້ວ!', 'success');
      this.render();
      if (window.DashboardModule) window.DashboardModule.render();
    } catch (err) {
      console.error("Save document error:", err);
      window.App.showToast("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກເອກະສານ: " + (err.message || err), 'error');
    }
  },

  openEditModal(id) {
    const doc = window.db.getInvoice(id);
    if (!doc) return;

    const titleEl = document.getElementById('doc-modal-title');
    if (titleEl) titleEl.textContent = `${typeof t === 'function' ? t('modal_create_doc') : 'Edit Document'} - Edit`;
    
    const setVal = (fieldId, val) => {
      const el = document.getElementById(fieldId);
      if (el) el.value = val;
    };

    setVal('doc-id', doc.id);
    setVal('doc-no', doc.docNo || '');
    setVal('doc-type', doc.type || 'Quotation');
    
    this.populateCustomerDropdown(doc.customerId);
    this.populateProjectDropdown(doc.projectId);
    this.populateRefQuotationDropdown(doc.refQuotationId);

    this.handleTypeChange();

    setVal('doc-issue-date', doc.issueDate || '');
    setVal('doc-valid-until', doc.validUntil || '');
    setVal('doc-due-date', doc.dueDate || '');
    setVal('doc-status', doc.status || 'Draft');
    setVal('doc-discount', doc.discount || 0);
    setVal('doc-terms', doc.terms || '');

    this.currentItems = JSON.parse(JSON.stringify(doc.items || []));
    this.renderLineItems();

    window.App.openModal('doc-modal');
  },

  async deleteDoc(id) {
    const msg = typeof t === 'function' ? t('confirm_delete') : 'Are you sure?';
    if (confirm(msg)) {
      await window.db.deleteInvoice(id);
      window.App.showToast(typeof t === 'function' ? t('toast_success_delete') : 'Deleted from Cloudflare D1!', 'info');
      this.render();
      if (window.DashboardModule) window.DashboardModule.render();
    }
  },

  // 🖨️ A4 PRINT PREVIEW (NO STATUS DISPLAYED, NO VAT, ACCURATE DATES)
  previewPrint(id) {
    const doc = window.db.getInvoice(id);
    if (!doc) return;

    const settings = window.db.getSettings();
    const printContainer = document.getElementById('print-preview-content');
    if (!printContainer) return;

    const isQuotation = doc.type === 'Quotation';
    let docTitleLao = "ໃບສະເໜີລາຄາ";
    let docTitleEn = "QUOTATION";
    
    if (doc.type === 'Invoice') {
      docTitleLao = "ໃບເກັບເງິນ";
      docTitleEn = "INVOICE";
    } else if (doc.type === 'Receipt') {
      docTitleLao = "ໃບຮັບເງິນ";
      docTitleEn = "OFFICIAL RECEIPT";
    }

    printContainer.innerHTML = `
      <div class="print-page bg-white text-gray-900 p-8 max-w-[210mm] mx-auto shadow-lg rounded-xl border border-gray-200">
        <!-- Document Header with NETD Logo -->
        <div class="flex items-start justify-between border-b-2 border-blue-600 pb-5 mb-5">
          <div class="flex items-center gap-4">
            <img src="${settings.logoUrl || './Logo.png'}" alt="NETD IT SOLUTIONS Logo" class="h-16 w-auto object-contain">
            <div>
              <h1 class="text-2xl font-extrabold text-blue-900 tracking-tight">${settings.companyName}</h1>
              <p class="text-xs font-semibold text-blue-600">${settings.tagline}</p>
              <p class="text-[11px] text-gray-500 mt-1 max-w-md">${settings.address}</p>
              <div class="text-[11px] text-gray-600 flex gap-4 mt-0.5">
                <span><strong>Tel:</strong> ${settings.phone}</span>
                <span><strong>Email:</strong> ${settings.email}</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xl font-bold text-gray-800">${docTitleLao}</div>
            <div class="text-sm font-extrabold text-blue-600 tracking-wider">${docTitleEn}</div>
            <div class="mt-2 text-xs font-mono font-bold bg-gray-100 px-3 py-1.5 rounded-lg inline-block border border-gray-200">
              No: ${doc.docNo}
            </div>
          </div>
        </div>

        <!-- Customer & Document Dates Info (NO PAYMENT STATUS BADGE) -->
        <div class="grid grid-cols-2 gap-6 mb-5 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div>
            <div class="font-bold text-blue-900 uppercase text-[10px] tracking-wider mb-1">Customer / ລູກຄ້າ:</div>
            <div class="text-sm font-bold text-gray-900">${doc.customerName || '-'}</div>
            <div class="text-gray-700 mt-0.5"><strong>Attn (ຜູ້ຕິດຕໍ່):</strong> ${doc.contactPerson || '-'}</div>
            <div class="text-gray-600"><strong>Tel:</strong> ${doc.phone || '-'}</div>
            ${doc.address ? `<div class="text-gray-600"><strong>Address:</strong> ${doc.address}</div>` : ''}
          </div>
          <div class="space-y-1.5 text-right">
            <div><span class="text-gray-500">Issue Date (ວັນທີອອກ):</span> <strong>${window.db.formatDate(doc.issueDate)}</strong></div>
            ${isQuotation && doc.validUntil ? `
              <div class="text-purple-700 font-semibold">
                <span class="text-gray-500">Valid Until (ນຳໃຊ້ໄດ້ເຖີງວັນທີ່):</span> <strong>${window.db.formatDate(doc.validUntil)}</strong>
              </div>
            ` : ''}
            ${doc.refQuotationNo ? `<div><span class="text-gray-500">Ref Quotation (ອ້າງອີງ):</span> <strong class="text-blue-600 font-mono">${doc.refQuotationNo}</strong></div>` : ''}
            ${doc.dueDate && !isQuotation ? `<div><span class="text-gray-500">Due Date (ກຳນົດຊຳລະ):</span> <strong>${window.db.formatDate(doc.dueDate)}</strong></div>` : ''}
            ${doc.projectName ? `<div><span class="text-gray-500">Project:</span> <strong>${doc.projectName}</strong></div>` : ''}
          </div>
        </div>

        <!-- Itemized Table (NO VAT) -->
        <table class="w-full text-xs mt-4 mb-5 border-collapse border border-gray-200">
          <thead>
            <tr class="bg-blue-900 text-white font-bold">
              <th class="p-2.5 text-center w-10 border border-blue-900">#</th>
              <th class="p-2.5 text-left border border-blue-900">Description (ລາຍການສິນຄ້າ / ການບໍລິການ)</th>
              <th class="p-2.5 text-center w-16 border border-blue-900">Qty</th>
              <th class="p-2.5 text-right w-28 border border-blue-900">Unit Price</th>
              <th class="p-2.5 text-right w-32 border border-blue-900">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            ${(doc.items || []).map((it, idx) => `
              <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}">
                <td class="p-2.5 text-center font-mono text-gray-500 border border-gray-200">${idx + 1}</td>
                <td class="p-2.5 font-medium text-gray-900 border border-gray-200">${it.description}</td>
                <td class="p-2.5 text-center font-mono font-bold border border-gray-200">${it.qty}</td>
                <td class="p-2.5 text-right font-mono border border-gray-200">${window.db.formatMoney(it.price)}</td>
                <td class="p-2.5 text-right font-mono font-bold text-gray-900 border border-gray-200">${window.db.formatMoney(it.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals & Terms / Banking Details (NO VAT) -->
        <div class="grid grid-cols-2 gap-6 text-xs mb-6">
          <div class="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
            ${isQuotation ? `
              <div class="font-bold text-blue-900 text-xs mb-1.5 flex items-center gap-1.5">
                <span>📋 ເງື່ອນໄຂ ແລະ ການຮັບປະກັນ (Terms & Warranty):</span>
              </div>
              <p class="whitespace-pre-line text-[11px] text-gray-700 leading-relaxed">${doc.terms || '1. ຮັບປະກັນສິນຄ້າ ແລະ ອຸປະກອນຕາມມາດຕະຖານຜູ້ຜະລິດ (12-36 ເດືອນ).\n2. ໃບສະເໜີລາຄານີ້ນຳໃຊ້ໄດ້ຕາມກຳນົດວັນທີທີ່ລະບຸຂ້າງເທິງ.\n3. ລາຄານີ້ລວມຄ່າຕິດຕັ້ງ ແລະ ການຕັ້ງຄ່າລະບົບເບື້ອງຕົ້ນ.'}</p>
            ` : `
              <div class="font-bold text-blue-900 text-xs mb-1.5">Bank Payment Details (ຂໍ້ມູນການຊຳລະເງິນ):</div>
              <p class="whitespace-pre-line text-[11px] text-gray-700 font-mono">${settings.bankInfo}</p>
              ${doc.terms ? `<div class="mt-3 pt-2 border-t border-blue-100 text-[10px] text-gray-500 whitespace-pre-line"><strong>Terms:</strong>\n${doc.terms}</div>` : ''}
            `}
          </div>

          <div class="space-y-1.5 font-mono text-xs">
            <div class="flex justify-between py-1 border-b border-gray-100">
              <span class="text-gray-600">Subtotal:</span>
              <strong class="text-gray-900">${window.db.formatMoney(doc.subtotal)}</strong>
            </div>
            ${doc.discount > 0 ? `
              <div class="flex justify-between py-1 border-b border-gray-100 text-emerald-600">
                <span>Discount:</span>
                <strong>-${window.db.formatMoney(doc.discount)}</strong>
              </div>
            ` : ''}
            <div class="flex justify-between py-2 border-t-2 border-blue-600 text-sm font-bold text-blue-900">
              <span>Grand Total (ຍອດລວມທັງໝົດ):</span>
              <span>${window.db.formatMoney(doc.grandTotal)}</span>
            </div>
          </div>
        </div>

        <!-- Signatures Block -->
        <div class="grid grid-cols-2 gap-12 pt-6 text-xs text-center border-t border-gray-200">
          <div>
            <div class="h-14 flex items-end justify-center">
              <div class="border-b border-dashed border-gray-400 w-48"></div>
            </div>
            <div class="font-bold text-gray-800 mt-2">Prepared / Authorized By</div>
            <div class="text-[10px] text-gray-500 font-semibold">${settings.companyName}</div>
          </div>
          <div>
            <div class="h-14 flex items-end justify-center">
              <div class="border-b border-dashed border-gray-400 w-48"></div>
            </div>
            <div class="font-bold text-gray-800 mt-2">Customer Acceptance</div>
            <div class="text-[10px] text-gray-500">Sign & Stamp</div>
          </div>
        </div>
      </div>
    `;

    window.App.openModal('print-preview-modal');
  }
};

window.InvoicesModule = InvoicesModule;
