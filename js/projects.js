/**
 * NETD IT SOLUTIONS - Projects & IT Services Module
 * Supports Custom Project Types, Quotation Browse/Import,
 * Comprehensive Project Task Management (Add, Edit, Status Toggle, Delete),
 * Full Project Edit & Delete CRUD, and Profitability Analysis.
 */

const ProjectsModule = {
  viewMode: 'cards', // 'cards' or 'table'
  activeTab: 'all',
  searchQuery: '',
  currentMaterials: [],
  currentFormTasks: [],

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    const searchInput = document.getElementById('project-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.render();
      });
    }
  },

  setViewMode(mode) {
    this.viewMode = mode;
    const cardsBtn = document.getElementById('view-cards-btn');
    const tableBtn = document.getElementById('view-table-btn');
    if (cardsBtn) {
      cardsBtn.classList.toggle('bg-blue-600', mode === 'cards');
      cardsBtn.classList.toggle('text-white', mode === 'cards');
    }
    if (tableBtn) {
      tableBtn.classList.toggle('bg-blue-600', mode === 'table');
      tableBtn.classList.toggle('text-white', mode === 'table');
    }
    this.render();
  },

  setTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.project-tab-btn').forEach(btn => {
      btn.classList.remove('border-blue-600', 'text-blue-600', 'dark:text-blue-400');
      btn.classList.add('border-transparent', 'text-gray-500');
    });
    const activeBtn = document.getElementById(`prj-tab-${tab}`);
    if (activeBtn) {
      activeBtn.classList.remove('border-transparent', 'text-gray-500');
      activeBtn.classList.add('border-blue-600', 'text-blue-600', 'dark:text-blue-400');
    }
    this.render();
  },

  render() {
    if (!window.db) return;
    let projects = window.db.getProjects();

    if (this.searchQuery) {
      projects = projects.filter(p => 
        (p.name && p.name.toLowerCase().includes(this.searchQuery)) ||
        (p.code && p.code.toLowerCase().includes(this.searchQuery)) ||
        (p.customerName && p.customerName.toLowerCase().includes(this.searchQuery)) ||
        (p.teamLead && p.teamLead.toLowerCase().includes(this.searchQuery))
      );
    }

    if (this.activeTab !== 'all') {
      if (this.activeTab === 'in_progress') {
        projects = projects.filter(p => p.status === 'In Progress');
      } else if (this.activeTab === 'completed') {
        projects = projects.filter(p => p.status === 'Completed');
      } else if (this.activeTab === 'quotation') {
        projects = projects.filter(p => p.status === 'Quotation' || p.status === 'Draft');
      }
    }

    const container = document.getElementById('projects-container');
    if (!container) return;

    if (projects.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <i data-lucide="briefcase" class="w-12 h-12 mx-auto mb-3 text-gray-400"></i>
          <p class="text-base font-semibold text-gray-700 dark:text-gray-200">${typeof t === 'function' ? t('all_caught_up') : 'No projects found'}</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    if (this.viewMode === 'cards') {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${projects.map(p => this.renderProjectCard(p)).join('')}
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            ${this.renderProjectTable(projects)}
          </div>
        </div>
      `;
    }

    if (window.lucide) window.lucide.createIcons();
  },

  // Render Project Card
  renderProjectCard(p) {
    const tasks = p.tasks || [];
    const doneTasks = tasks.filter(t => t.status === 'Done').length;
    const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : (p.status === 'Completed' ? 100 : 0);

    let statusBadge = 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    if (p.status === 'Completed') statusBadge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    if (p.status === 'On Hold') statusBadge = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';

    const profit = Math.max(0, (Number(p.contractValue) || 0) - (Number(p.estimatedCost) || 0));
    const isAdmin = window.AuthModule ? window.AuthModule.isAdmin() : true;

    return `
      <div class="card p-5 flex flex-col justify-between hover:shadow-md transition">
        <div>
          <!-- Header -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div>
              <span class="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                ${p.code || p.id}
              </span>
              <h3 class="font-bold text-base text-gray-900 dark:text-white mt-1.5 leading-snug cursor-pointer hover:text-blue-600 transition" onclick="ProjectsModule.openDetailModal('${p.id}')">
                ${p.name}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <i data-lucide="building-2" class="w-3.5 h-3.5"></i> ${p.customerName || 'General Client'}
              </p>
            </div>
            <span class="badge ${statusBadge} shrink-0 text-xs">
              ${p.status}
            </span>
          </div>

          <!-- Description -->
          <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed">
            ${p.description || 'No detailed scope of work entered.'}
          </p>

          <!-- Metrics Box -->
          <div class="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 space-y-2 mb-4">
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500">Contract Value:</span>
              <strong class="font-mono font-bold text-gray-900 dark:text-white">${window.db.formatMoney(p.contractValue)}</strong>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-500">Est. Profit:</span>
              <strong class="font-mono font-bold text-emerald-600 dark:text-emerald-400">+${window.db.formatMoney(profit)}</strong>
            </div>
            <!-- Progress Bar / Tasks link -->
            <div class="pt-1 cursor-pointer" onclick="ProjectsModule.openDetailModal('${p.id}')" title="Click to view/manage tasks">
              <div class="flex justify-between text-[11px] text-gray-500 mb-1">
                <span class="flex items-center gap-1"><i data-lucide="check-square" class="w-3 h-3 text-blue-500"></i> Tasks (${tasks.length})</span>
                <span class="font-mono font-semibold text-blue-600">${doneTasks}/${tasks.length} (${progress}%)</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Action Buttons (View, Edit, Delete) -->
        <div class="border-t border-gray-100 dark:border-gray-700/60 pt-3 flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center gap-1">
            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
            <span>Due: ${window.db.formatDate(p.endDate)}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="ProjectsModule.openDetailModal('${p.id}')" class="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-100 transition" title="ເບິ່ງລາຍລະອຽດ & Tasks">
              ${typeof t === 'function' ? t('btn_view') : 'View'}
            </button>
            ${isAdmin ? `
              <button onclick="ProjectsModule.openEditModal('${p.id}')" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition flex items-center gap-1" title="ແກ້ໄຂໂຄງການ">
                <i data-lucide="edit-2" class="w-3.5 h-3.5 text-blue-600"></i>
                <span>ແກ້ໄຂ</span>
              </button>
              <button onclick="ProjectsModule.deleteProject('${p.id}')" class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition" title="ລຶບໂຄງການ">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  // Render Project Table
  renderProjectTable(projects) {
    const isAdmin = window.AuthModule ? window.AuthModule.isAdmin() : true;
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Project & Client</th>
            <th>Type</th>
            <th>Tasks Progress</th>
            <th>Contract Value</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${projects.map(p => {
            const tasks = p.tasks || [];
            const doneTasks = tasks.filter(t => t.status === 'Done').length;
            const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : (p.status === 'Completed' ? 100 : 0);

            return `
              <tr>
                <td class="font-mono text-xs font-bold text-blue-600">${p.code || p.id}</td>
                <td>
                  <div class="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600" onclick="ProjectsModule.openDetailModal('${p.id}')">
                    ${p.name}
                  </div>
                  <div class="text-xs text-gray-500">${p.customerName || '-'}</div>
                </td>
                <td class="text-xs text-gray-600 dark:text-gray-400">${p.type || '-'}</td>
                <td>
                  <div class="flex items-center gap-2 cursor-pointer" onclick="ProjectsModule.openDetailModal('${p.id}')" title="View tasks">
                    <div class="w-20 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div class="bg-blue-600 h-2 rounded-full" style="width: ${progress}%"></div>
                    </div>
                    <span class="text-xs font-mono font-medium">${doneTasks}/${tasks.length} (${progress}%)</span>
                  </div>
                </td>
                <td class="font-mono font-semibold text-sm">${window.db.formatMoney(p.contractValue)}</td>
                <td class="text-xs text-gray-500">${window.db.formatDate(p.endDate)}</td>
                <td>
                  <span class="badge ${p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'} text-xs">
                    ${p.status}
                  </span>
                </td>
                <td>
                  <div class="flex items-center gap-1.5">
                    <button onclick="ProjectsModule.openDetailModal('${p.id}')" class="p-1 text-blue-600 hover:bg-blue-50 rounded" title="ເບິ່ງລາຍລະອຽດ & Tasks">
                      <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                    ${isAdmin ? `
                      <button onclick="ProjectsModule.openEditModal('${p.id}')" class="p-1 text-gray-600 hover:bg-gray-100 rounded" title="ແກ້ໄຂ">
                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                      </button>
                      <button onclick="ProjectsModule.deleteProject('${p.id}')" class="p-1 text-red-600 hover:bg-red-50 rounded" title="ລຶບ">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  },

  renderProjectTypesDropdown(selectedType = '') {
    const select = document.getElementById('prj-type');
    if (!select || !window.db) return;

    const types = window.db.getProjectTypes();
    select.innerHTML = types.map(t => `
      <option value="${t}" ${t === selectedType ? 'selected' : ''}>${t}</option>
    `).join('') + `<option value="__custom__" class="font-bold text-blue-600">+ ➕ ພິມປະເພດວຽກໄອທີໃໝ່ເອງ (Add Custom Type)...</option>`;

    select.onchange = (e) => {
      const customContainer = document.getElementById('prj-type-custom-container');
      const customInput = document.getElementById('prj-type-custom');
      if (e.target.value === '__custom__') {
        if (customContainer) customContainer.classList.remove('hidden');
        if (customInput) customInput.focus();
      } else {
        if (customContainer) customContainer.classList.add('hidden');
      }
    };
  },

  openAddModal() {
    const titleEl = document.getElementById('project-modal-title');
    if (titleEl && typeof t === 'function') titleEl.textContent = t('modal_add_project');
    const form = document.getElementById('project-form');
    if (form) form.reset();
    const idEl = document.getElementById('project-id');
    if (idEl) idEl.value = '';
    
    const yr = new Date().getFullYear();
    const count = (window.db ? window.db.getProjects().length : 0) + 1;
    const codeEl = document.getElementById('prj-code');
    if (codeEl) codeEl.value = `PRJ-${yr}-${count.toString().padStart(3, '0')}`;
    
    this.populateCustomerDropdown();
    this.renderProjectTypesDropdown('Network Infrastructure');

    const customContainer = document.getElementById('prj-type-custom-container');
    if (customContainer) customContainer.classList.add('hidden');
    
    const startEl = document.getElementById('prj-start-date');
    if (startEl) startEl.value = new Date().toISOString().slice(0, 10);

    this.currentMaterials = [];
    this.currentFormTasks = [
      { id: 'T-1', title: 'Site Inspection & Deployment Planning', status: 'Pending', dueDate: '', priority: 'Medium' }
    ];
    this.renderFormTasksList();

    window.App.openModal('project-modal');
  },

  populateCustomerDropdown(selectedId = '') {
    const select = document.getElementById('prj-customer');
    if (!select || !window.db) return;
    const customers = window.db.getCustomers();
    select.innerHTML = '<option value="">-- ເລືອກລູກຄ້າ (Select Client) --</option>' + customers.map(c => `
      <option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.name} (${c.contactPerson || '-'})</option>
    `).join('');
  },

  // Tasks in Project Create/Edit Form
  renderFormTasksList() {
    const container = document.getElementById('prj-form-tasks-container');
    if (!container) return;

    if (!Array.isArray(this.currentFormTasks) || this.currentFormTasks.length === 0) {
      container.innerHTML = '<p class="text-[11px] text-gray-400 py-2">ຍັງບໍ່ມີ Task ໃນໂຄງການນີ້ (ກົດ "+ ເພີ່ມ Task" ດ້ານເທິງເພື່ອເພີ່ມ)</p>';
      return;
    }

    container.innerHTML = this.currentFormTasks.map((t, idx) => `
      <div class="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
        <span class="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center font-mono">
          ${idx + 1}
        </span>
        <input type="text" value="${(t.title || '').replace(/"/g, '&quot;')}" placeholder="ຊື່ໜ້າວຽກ..." onchange="ProjectsModule.updateFormTaskField(${idx}, 'title', this.value)" class="flex-1 p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium">
        <input type="date" value="${t.dueDate || ''}" onchange="ProjectsModule.updateFormTaskField(${idx}, 'dueDate', this.value)" class="w-28 p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-[11px]">
        <select onchange="ProjectsModule.updateFormTaskField(${idx}, 'status', this.value)" class="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-[11px] font-semibold">
          <option value="Pending" ${t.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Done" ${t.status === 'Done' ? 'selected' : ''}>Done</option>
        </select>
        <button type="button" onclick="ProjectsModule.removeInlineTaskFromForm(${idx})" class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  addInlineTaskToForm() {
    this.currentFormTasks.push({
      id: 'T-' + Date.now().toString().slice(-4),
      title: '',
      status: 'Pending',
      dueDate: '',
      priority: 'Medium'
    });
    this.renderFormTasksList();
  },

  updateFormTaskField(idx, field, value) {
    if (this.currentFormTasks[idx]) {
      this.currentFormTasks[idx][field] = value;
    }
  },

  removeInlineTaskFromForm(idx) {
    this.currentFormTasks.splice(idx, 1);
    this.renderFormTasksList();
  },

  // Browse & Import Quotation Modal
  openBrowseQuotationModal() {
    if (!window.db) return;
    const quotations = window.db.getInvoices().filter(d => d.type === 'Quotation');
    const container = document.getElementById('browse-quotations-list');
    if (!container) return;

    if (quotations.length === 0) {
      container.innerHTML = '<p class="text-center text-xs text-gray-400 py-6">ບໍ່ພົບໃບສະເໜີລາຄາໃນລະບົບ (No Quotations available)</p>';
    } else {
      container.innerHTML = quotations.map(q => `
        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition cursor-pointer" onclick="ProjectsModule.pickQuotationToProject('${q.id}')">
          <div>
            <div class="font-bold text-xs text-blue-600 font-mono">${q.docNo}</div>
            <div class="font-bold text-xs text-gray-900 dark:text-white mt-0.5">${q.customerName}</div>
            <div class="text-[11px] text-gray-400">${(q.items || []).length} ລາຍການອຸປະກອນ</div>
          </div>
          <div class="text-right">
            <div class="font-mono font-bold text-xs text-gray-900 dark:text-white">${window.db.formatMoney(q.grandTotal)}</div>
            <button type="button" class="mt-1 px-2.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-semibold">
              ເລືອກດຶງຂໍ້ມູນ (Select)
            </button>
          </div>
        </div>
      `).join('');
    }

    window.App.openModal('browse-quotation-modal');
    if (window.lucide) window.lucide.createIcons();
  },

  pickQuotationToProject(quotationId) {
    if (!window.db) return;
    const q = window.db.getInvoice(quotationId);
    if (!q) return;

    if (q.customerId) {
      this.populateCustomerDropdown(q.customerId);
      const custSelect = document.getElementById('prj-customer');
      if (custSelect) custSelect.value = q.customerId;
    }

    const nameEl = document.getElementById('prj-name');
    if (nameEl && !nameEl.value) {
      nameEl.value = q.projectName || `Project for ${q.customerName}`;
    }

    const valEl = document.getElementById('prj-contract-val');
    if (valEl) valEl.value = q.grandTotal || 0;

    const materials = (q.items || []).map(item => ({
      name: item.description,
      qty: item.qty || 1,
      unitPrice: item.price || 0,
      total: item.total || 0
    }));

    const estCost = materials.reduce((sum, m) => sum + (m.total * 0.7), 0);
    const costEl = document.getElementById('prj-est-cost');
    if (costEl) costEl.value = estCost;

    this.currentMaterials = materials;

    window.App.closeModal('browse-quotation-modal');
    window.App.showToast(`ດຶງຂໍ້ມູນຈາກໃບສະເໜີລາຄາ ${q.docNo} ສຳເລັດແລ້ວ!`, 'success');
  },

  openQuickAddCustomerModal() {
    const form = document.getElementById('quick-customer-form');
    if (form) form.reset();
    const sourceEl = document.getElementById('quick-cust-source');
    if (sourceEl) sourceEl.value = 'project';
    window.App.openModal('quick-customer-modal');
  },

  handleQuickCustomerSaved(newCustomer) {
    if (!newCustomer) return;
    this.populateCustomerDropdown(newCustomer.id);
    const select = document.getElementById('prj-customer');
    if (select) select.value = newCustomer.id;
  },

  openEditModal(id) {
    const p = window.db.getProject(id);
    if (!p) return;

    const titleEl = document.getElementById('project-modal-title');
    if (titleEl && typeof t === 'function') titleEl.textContent = t('modal_edit_project');
    
    const setVal = (fieldId, val) => {
      const el = document.getElementById(fieldId);
      if (el) el.value = val;
    };

    setVal('project-id', p.id);
    setVal('prj-code', p.code || p.id);
    setVal('prj-name', p.name || '');
    
    this.populateCustomerDropdown(p.customerId);
    this.renderProjectTypesDropdown(p.type || 'Network Infrastructure');
    
    setVal('prj-contract-val', p.contractValue || 0);
    setVal('prj-est-cost', p.estimatedCost || 0);
    setVal('prj-start-date', p.startDate || '');
    setVal('prj-end-date', p.endDate || '');
    setVal('prj-priority', p.priority || 'Medium');
    setVal('prj-status', p.status || 'In Progress');
    setVal('prj-team-lead', p.teamLead || '');
    setVal('prj-desc', p.description || '');

    this.currentMaterials = p.materials || [];
    this.currentFormTasks = Array.isArray(p.tasks) ? JSON.parse(JSON.stringify(p.tasks)) : [];
    this.renderFormTasksList();

    window.App.openModal('project-modal');
  },

  // Safe Project Form Saver
  async saveProjectForm(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const getVal = (id, fallback = '') => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : fallback;
    };
    const getNum = (id, fallback = 0) => {
      const el = document.getElementById(id);
      return el ? (Number(el.value) || fallback) : fallback;
    };

    const id = getVal('project-id');
    const customerId = getVal('prj-customer');
    const customer = window.db ? window.db.getCustomer(customerId) : null;

    const typeSelect = document.getElementById('prj-type');
    let typeVal = typeSelect ? typeSelect.value : 'General';
    if (typeVal === '__custom__') {
      const customInput = document.getElementById('prj-type-custom');
      typeVal = customInput ? customInput.value.trim() : 'General';
    }

    const existing = id ? window.db.getProject(id) : null;

    // Filter out blank tasks
    const validTasks = (this.currentFormTasks || []).filter(t => t.title && t.title.trim());

    const projectData = {
      id: id || undefined,
      code: getVal('prj-code', `PRJ-${Date.now().toString().slice(-4)}`),
      name: getVal('prj-name', 'New Project'),
      customerId: customerId,
      customerName: customer ? customer.name : '',
      type: typeVal,
      contractValue: getNum('prj-contract-val', 0),
      estimatedCost: getNum('prj-est-cost', 0),
      startDate: getVal('prj-start-date', new Date().toISOString().slice(0, 10)),
      endDate: getVal('prj-end-date'),
      priority: getVal('prj-priority', 'Medium'),
      status: getVal('prj-status', 'In Progress'),
      teamLead: getVal('prj-team-lead'),
      description: getVal('prj-desc'),
      materials: existing && (!this.currentMaterials || this.currentMaterials.length === 0) ? existing.materials : (this.currentMaterials || []),
      tasks: validTasks.length > 0 ? validTasks : (existing ? existing.tasks : [
        { id: 'T-1', title: 'Site Inspection & Deployment', status: 'In Progress', dueDate: getVal('prj-end-date'), priority: 'Medium' }
      ])
    };

    await window.db.saveProject(projectData);
    window.App.closeModal('project-modal');
    window.App.showToast(typeof t === 'function' ? t('toast_success_save') : 'ບັນທຶກໂຄງການສໍາເລັດແລ້ວ!', 'success');
    this.render();
    if (window.DashboardModule) window.DashboardModule.render();
  },

  // Delete Project Function
  async deleteProject(id) {
    const p = window.db.getProject(id);
    const projectName = p ? p.name : 'ໂຄງການນີ້';
    const msg = typeof t === 'function' ? t('confirm_delete') : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບໂຄງການ "${projectName}"?`;
    
    if (confirm(msg)) {
      await window.db.deleteProject(id);
      window.App.closeModal('project-detail-modal');
      window.App.showToast('ລຶບໂຄງການສໍາເລັດແລ້ວ!', 'info');
      this.render();
      if (window.DashboardModule) window.DashboardModule.render();
    }
  },

  // ================= TASK MANAGEMENT (ADD, EDIT, STATUS, DELETE) =================
  openTaskModal(projectId, taskId = null) {
    const project = window.db.getProject(projectId);
    if (!project) return;

    const modalTitle = document.getElementById('task-modal-title');
    const form = document.getElementById('task-modal-form');
    if (form) form.reset();

    document.getElementById('task-project-id').value = projectId;
    document.getElementById('task-id').value = taskId || '';

    if (taskId && Array.isArray(project.tasks)) {
      const task = project.tasks.find(t => t.id === taskId);
      if (task) {
        if (modalTitle) modalTitle.innerHTML = `<i data-lucide="edit-3" class="w-5 h-5 text-blue-600"></i><span>ແກ້ໄຂໜ້າວຽກ (Edit Task)</span>`;
        document.getElementById('task-title').value = task.title || '';
        document.getElementById('task-assignee').value = task.assignee || '';
        document.getElementById('task-due-date').value = task.dueDate || '';
        document.getElementById('task-priority').value = task.priority || 'Medium';
        document.getElementById('task-status').value = task.status || 'Pending';
        document.getElementById('task-notes').value = task.notes || '';
      }
    } else {
      if (modalTitle) modalTitle.innerHTML = `<i data-lucide="plus-circle" class="w-5 h-5 text-blue-600"></i><span>ເພີ່ມໜ້າວຽກໃໝ່ (Add Task)</span>`;
      document.getElementById('task-status').value = 'Pending';
      document.getElementById('task-priority').value = 'Medium';
      document.getElementById('task-due-date').value = project.endDate || '';
      document.getElementById('task-assignee').value = project.teamLead || '';
    }

    window.App.openModal('task-modal');
    if (window.lucide) window.lucide.createIcons();
  },

  async saveTaskModalForm(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const getVal = (id, fallback = '') => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : fallback;
    };

    const projectId = getVal('task-project-id');
    const taskId = getVal('task-id');
    const project = window.db.getProject(projectId);

    if (!project) {
      window.App.showToast('ບໍ່ພົບຂໍ້ມູນໂຄງການ', 'error');
      return;
    }

    if (!Array.isArray(project.tasks)) project.tasks = [];

    const taskData = {
      id: taskId || ('T-' + Date.now().toString().slice(-5)),
      title: getVal('task-title', 'Untitled Task'),
      assignee: getVal('task-assignee'),
      dueDate: getVal('task-due-date'),
      priority: getVal('task-priority', 'Medium'),
      status: getVal('task-status', 'Pending'),
      notes: getVal('task-notes')
    };

    if (taskId) {
      const idx = project.tasks.findIndex(t => t.id === taskId);
      if (idx >= 0) {
        project.tasks[idx] = { ...project.tasks[idx], ...taskData };
      } else {
        project.tasks.push(taskData);
      }
    } else {
      project.tasks.push(taskData);
    }

    await window.db.saveProject(project);
    window.App.closeModal('task-modal');
    window.App.showToast(taskId ? 'ແກ້ໄຂ Task ສຳເລັດແລ້ວ!' : 'ເພີ່ມ Task ໃໝ່ສຳເລັດແລ້ວ!', 'success');

    // Refresh detail modal and project cards
    this.openDetailModal(projectId);
    this.render();
  },

  async toggleTaskStatus(projectId, taskId) {
    const project = window.db.getProject(projectId);
    if (!project || !Array.isArray(project.tasks)) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Cycle: Pending -> In Progress -> Done -> Pending
    if (task.status === 'Pending') task.status = 'In Progress';
    else if (task.status === 'In Progress') task.status = 'Done';
    else task.status = 'Pending';

    await window.db.saveProject(project);
    window.App.showToast(`ປ່ຽນສະຖານະ Task ເປັນ: ${task.status}`, 'info');

    // Refresh UI
    this.openDetailModal(projectId);
    this.render();
  },

  async deleteTask(projectId, taskId) {
    const project = window.db.getProject(projectId);
    if (!project || !Array.isArray(project.tasks)) return;

    if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ Task ນີ້?')) {
      project.tasks = project.tasks.filter(t => t.id !== taskId);
      await window.db.saveProject(project);
      window.App.showToast('ລຶບ Task ສຳເລັດແລ້ວ!', 'info');

      // Refresh UI
      this.openDetailModal(projectId);
      this.render();
    }
  },

  // 🌟 Interactive Project Detail 360 Modal with full Task controls
  openDetailModal(id) {
    const p = window.db.getProject(id);
    if (!p) return;

    const container = document.getElementById('project-detail-content');
    if (!container) return;

    const tasks = p.tasks || [];
    const doneTasks = tasks.filter(t => t.status === 'Done').length;
    const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : (p.status === 'Completed' ? 100 : 0);

    const materials = p.materials || [];
    const profit = Math.max(0, (Number(p.contractValue) || 0) - (Number(p.estimatedCost) || 0));
    const isAdmin = window.AuthModule ? window.AuthModule.isAdmin() : true;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-lg">${p.code || p.id}</span>
              <span class="badge ${p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'} text-xs">${p.status}</span>
              <span class="text-xs text-gray-500 font-semibold">• ${p.type}</span>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mt-2">${p.name}</h2>
            <p class="text-xs text-gray-500 mt-0.5">Client: <strong>${p.customerName || 'None'}</strong> • Team Lead: <strong>${p.teamLead || 'Not Assigned'}</strong></p>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-400">Contract Value</div>
            <div class="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">${window.db.formatMoney(p.contractValue)}</div>
            <div class="text-xs text-emerald-600 font-mono font-semibold">Profit: +${window.db.formatMoney(profit)}</div>
          </div>
        </div>

        <!-- Description -->
        <div>
          <h4 class="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Scope & Description</h4>
          <p class="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl leading-relaxed whitespace-pre-line">${p.description || 'No description provided.'}</p>
        </div>

        <!-- 🌟 Dynamic Tasks Section with Add, Edit, Status Toggle, and Delete -->
        <div class="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <div>
              <h4 class="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="check-square" class="w-4 h-4 text-blue-600"></i>
                <span>Project Tasks (${tasks.length})</span>
              </h4>
              <div class="text-[11px] text-slate-500 mt-0.5 font-mono">
                ສຳເລັດແລ້ວ: <strong class="text-blue-600">${doneTasks}</strong> ຈາກ ${tasks.length} tasks (${progress}%)
              </div>
            </div>

            <!-- Task Progress Bar & Add Task Button -->
            <div class="flex items-center gap-3">
              <div class="w-28 bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden hidden sm:block">
                <div class="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
              </div>
              ${isAdmin ? `
                <button onclick="ProjectsModule.openTaskModal('${p.id}')" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                  <span>+ ເພີ່ມ Task ໃໝ່</span>
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Tasks List -->
          <div class="space-y-2">
            ${tasks.length === 0 ? `
              <div class="text-center py-6 text-gray-400 text-xs">
                <i data-lucide="list-todo" class="w-8 h-8 mx-auto mb-1.5 opacity-40"></i>
                ຍັງບໍ່ມີໜ້າວຽກໃນໂຄງການນີ້. ກົດປຸ່ມ "+ ເພີ່ມ Task ໃໝ່" ດ້ານເທິງເພື່ອສ້າງໜ້າວຽກ
              </div>
            ` : tasks.map((t, idx) => {
              const isDone = t.status === 'Done';
              const isInProgress = t.status === 'In Progress';
              
              let statusClass = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
              if (isDone) statusClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
              if (isInProgress) statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';

              return `
                <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-300 transition gap-3">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <!-- Checkbox Status Toggle Button -->
                    <button onclick="ProjectsModule.toggleTaskStatus('${p.id}', '${t.id}')" title="Click to change status (Pending ➔ In Progress ➔ Done)" class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition shrink-0">
                      ${isDone ? `
                        <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500"></i>
                      ` : isInProgress ? `
                        <i data-lucide="clock" class="w-5 h-5 text-blue-500 animate-pulse"></i>
                      ` : `
                        <i data-lucide="circle" class="w-5 h-5 text-gray-400"></i>
                      `}
                    </button>

                    <div class="min-w-0 flex-1">
                      <div class="text-xs font-semibold text-gray-900 dark:text-white ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : ''}">
                        ${t.title}
                      </div>
                      <div class="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-500">
                        ${t.assignee ? `<span class="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded flex items-center gap-1"><i data-lucide="user" class="w-3 h-3"></i> ${t.assignee}</span>` : ''}
                        ${t.dueDate ? `<span class="font-mono text-gray-400 flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> Due: ${window.db.formatDate(t.dueDate)}</span>` : ''}
                        ${t.priority && t.priority !== 'Normal' ? `<span class="font-bold text-[10px] ${t.priority === 'Urgent' ? 'text-red-500' : 'text-amber-500'}">[${t.priority}]</span>` : ''}
                        ${t.notes ? `<span class="text-gray-400 truncate max-w-xs">• ${t.notes}</span>` : ''}
                      </div>
                    </div>
                  </div>

                  <!-- Status Badge & Action Buttons -->
                  <div class="flex items-center gap-2 shrink-0">
                    <span onclick="ProjectsModule.toggleTaskStatus('${p.id}', '${t.id}')" class="badge ${statusClass} text-[10px] cursor-pointer hover:opacity-80 transition" title="Click to toggle status">
                      ${t.status || 'Pending'}
                    </span>
                    ${isAdmin ? `
                      <button onclick="ProjectsModule.openTaskModal('${p.id}', '${t.id}')" class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="ແກ້ໄຂ Task">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                      </button>
                      <button onclick="ProjectsModule.deleteTask('${p.id}', '${t.id}')" class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="ລຶບ Task">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Materials List -->
        <div>
          <h4 class="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Materials & Hardware (${materials.length})</h4>
          <div class="space-y-1.5">
            ${materials.length === 0 ? '<p class="text-xs text-gray-400">No materials attached.</p>' : materials.map(m => `
              <div class="flex justify-between items-center text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span class="font-medium text-gray-900 dark:text-white">${m.name} <span class="text-gray-400">(x${m.qty})</span></span>
                <span class="font-mono font-bold">${window.db.formatMoney(m.total)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Action Buttons inside 360 view -->
        ${isAdmin ? `
          <div class="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button onclick="window.App.closeModal('project-detail-modal'); ProjectsModule.openEditModal('${p.id}')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow">
              <i data-lucide="edit-2" class="w-4 h-4"></i>
              <span>ແກ້ໄຂໂຄງການ</span>
            </button>
            <button onclick="ProjectsModule.deleteProject('${p.id}')" class="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
              <span>ລຶບໂຄງການ</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    window.App.openModal('project-detail-modal');
    if (window.lucide) window.lucide.createIcons();
  }
};

window.ProjectsModule = ProjectsModule;
