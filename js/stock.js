/**
 * NETD IT SOLUTIONS - Stock & Inventory Management Module
 * Supports SN & MAC Address Tracking, Stock In/Out, Disbursed Registry,
 * Dynamic Category Management & Detailed Unit-by-Unit Category Drill-Down.
 */

const StockModule = {
  currentTab: 'inventory', // 'inventory' or 'disbursed'
  selectedCategory: 'all',
  searchQuery: '',
  stockFilter: 'all', // 'all', 'low', 'out'

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    const searchInput = document.getElementById('stock-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        if (this.currentTab === 'inventory') {
          this.renderTable();
        } else {
          this.renderDisbursedTable();
        }
      });
    }

    const catFilter = document.getElementById('stock-category-filter');
    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        this.selectedCategory = e.target.value;
        this.renderTable();
      });
    }
  },

  setStockTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.stock-main-tab-btn').forEach(btn => {
      btn.classList.remove('border-blue-600', 'text-blue-600', 'dark:text-blue-400');
      btn.classList.add('border-transparent', 'text-gray-500');
    });

    const activeBtn = document.getElementById(`stock-tab-btn-${tab}`);
    if (activeBtn) {
      activeBtn.classList.remove('border-transparent', 'text-gray-500');
      activeBtn.classList.add('border-blue-600', 'text-blue-600', 'dark:text-blue-400');
    }

    const invSection = document.getElementById('stock-inventory-section');
    const disbSection = document.getElementById('stock-disbursed-section');

    if (tab === 'inventory') {
      if (invSection) invSection.classList.remove('hidden');
      if (disbSection) disbSection.classList.add('hidden');
      this.renderTable();
    } else {
      if (invSection) invSection.classList.add('hidden');
      if (disbSection) disbSection.classList.remove('hidden');
      this.renderDisbursedTable();
    }
  },

  render() {
    this.renderCategorySummaryCards();
    this.renderCategoriesDropdown();
    if (this.currentTab === 'inventory') {
      this.renderTable();
    } else {
      this.renderDisbursedTable();
    }
  },

  // Category Summary Cards with Clickable Drill-Down
  renderCategorySummaryCards() {
    const container = document.getElementById('stock-category-cards-container');
    if (!container || !window.db) return;

    const categories = window.db.getCategories();
    const products = window.db.getProducts();

    const catStats = {};
    categories.forEach(c => {
      catStats[c] = { count: 0, totalQty: 0, totalValue: 0 };
    });

    products.forEach(p => {
      const c = p.category || 'General';
      if (!catStats[c]) catStats[c] = { count: 0, totalQty: 0, totalValue: 0 };
      catStats[c].count += 1;
      catStats[c].totalQty += (Number(p.stockQty) || 0);
      catStats[c].totalValue += ((Number(p.costPrice) || 0) * (Number(p.stockQty) || 0));
    });

    container.innerHTML = categories.map(cat => {
      const stats = catStats[cat] || { count: 0, totalQty: 0, totalValue: 0 };
      return `
        <div onclick="StockModule.openCategoryDetailModal('${cat.replace(/'/g, "\\'")}')" class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition group">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition flex items-center gap-1.5">
              <i data-lucide="folder" class="w-3.5 h-3.5 text-blue-500"></i> ${cat}
            </span>
            <span class="text-[10px] bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full font-mono">
              ${stats.count} SKUs
            </span>
          </div>
          <div class="flex items-baseline justify-between text-xs">
            <span class="text-slate-500 text-[11px]">ຈຳນວນໃນສາງ:</span>
            <strong class="font-mono text-slate-900 dark:text-white">${stats.totalQty} Units</strong>
          </div>
          <div class="flex items-baseline justify-between text-xs mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span class="text-slate-400 text-[10px]">ມູນຄ່າລວມ:</span>
            <span class="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">${window.db.formatMoney(stats.totalValue)}</span>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  // 🌟 Category Drill-Down: Shows Item-by-Item breakdown from 1 to N
  openCategoryDetailModal(catName) {
    if (!window.db) return;
    const products = window.db.getProducts().filter(p => (p.category || 'General') === catName);
    const modalTitle = document.getElementById('category-detail-title');
    const modalBody = document.getElementById('category-detail-list-body');

    const totalQty = products.reduce((sum, p) => sum + (Number(p.stockQty) || 0), 0);
    const totalVal = products.reduce((sum, p) => sum + ((Number(p.costPrice) || 0) * (Number(p.stockQty) || 0)), 0);

    if (modalTitle) {
      modalTitle.innerHTML = `
        <div class="flex items-center gap-2">
          <i data-lucide="folder-open" class="w-5 h-5 text-blue-600"></i>
          <span>ໝວດໝູ່: <span class="text-blue-600 font-bold">${catName}</span></span>
        </div>
        <div class="text-[11px] font-normal text-gray-500 mt-0.5 flex items-center gap-3">
          <span>ຈຳນວນທັງໝົດ: <strong class="text-gray-900 dark:text-white font-mono font-bold">${totalQty} Units</strong> (${products.length} SKUs)</span>
          <span>• ມູນຄ່າສາງ: <strong class="text-emerald-600 font-mono font-bold">${window.db.formatMoney(totalVal)}</strong></span>
        </div>
      `;
    }

    if (modalBody) {
      if (products.length === 0) {
        modalBody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-gray-400">ບໍ່ມີສິນຄ້າໃນໝວດໝູ່ນີ້</td></tr>';
      } else {
        // Expand products into individual item units (1 to N)
        let rowsHtml = '';
        let itemIndex = 1;

        products.forEach(p => {
          const qty = Number(p.stockQty) || 0;
          const serials = Array.isArray(p.serials) ? p.serials : [];
          const regDate = window.db && typeof window.db.formatDate === 'function' 
            ? window.db.formatDate(p.createdAt) 
            : (p.createdAt ? p.createdAt.slice(0, 10) : '-');
          
          if (serials.length > 0) {
            // Render each tracked serial/MAC as individual item unit
            serials.forEach((s, sIdx) => {
              const isInStock = s.status === 'In Stock';
              rowsHtml += `
                <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs">
                  <td class="p-3 text-center font-mono font-bold text-gray-500 w-12">${itemIndex++}</td>
                  <td class="p-3">
                    <div class="font-bold text-gray-900 dark:text-white">${p.name}</div>
                    <div class="text-[11px] text-gray-400">${p.brand || ''} ${p.model || ''} • (ເຄື່ອງທີ ${sIdx + 1}/${serials.length})</div>
                  </td>
                  <td class="p-3 font-mono font-semibold text-blue-600">${p.sku}</td>
                  <td class="p-3 font-mono">
                    <div class="font-bold text-purple-700 dark:text-purple-300">${s.sn || '-'}</div>
                    ${s.mac ? `<div class="text-[10px] text-gray-400">MAC: ${s.mac}</div>` : ''}
                  </td>
                  <td class="p-3 text-center">
                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${isInStock ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}">
                      ${isInStock ? '🟢 In Stock (ພ້ອມໃຊ້)' : '⚪ Disbursed (ເບີກແລ້ວ)'}
                    </span>
                  </td>
                  <td class="p-3 text-center font-mono text-gray-600 dark:text-gray-300">
                    ${regDate}
                  </td>
                  <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                    ${window.db.formatMoney(p.salePrice)}
                  </td>
                  <td class="p-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button onclick="window.App.closeModal('category-detail-modal'); StockModule.openEditModal('${p.id}')" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="ແກ້ໄຂສິນຄ້າ">
                        <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                      </button>
                      <button onclick="StockModule.deleteSerialUnit('${p.id}', '${(s.sn || '').replace(/'/g, "\\'")}', '${catName.replace(/'/g, "\\'")}')" class="p-1.5 text-red-600 hover:bg-red-50 rounded transition" title="ລຶບອຸປະກອນຕົວນີ້ (SN)">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            });
          } else {
            // Render untracked units as unit rows from 1 to qty
            const countToRender = Math.max(1, qty);
            const snTokens = p.serial ? p.serial.split(',').map(x => x.trim()).filter(Boolean) : [];
            for (let i = 1; i <= countToRender; i++) {
              const currentSn = snTokens.length >= i ? snTokens[i - 1] : (p.serial ? `${p.serial} #${i}` : `Unit #${i} of ${qty}`);
              rowsHtml += `
                <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs">
                  <td class="p-3 text-center font-mono font-bold text-gray-500 w-12">${itemIndex++}</td>
                  <td class="p-3">
                    <div class="font-bold text-gray-900 dark:text-white">${p.name}</div>
                    <div class="text-[11px] text-gray-400">${p.brand || ''} ${p.model || ''} • (ລາຍການທີ ${i}/${qty})</div>
                  </td>
                  <td class="p-3 font-mono font-semibold text-blue-600">${p.sku}</td>
                  <td class="p-3 font-mono text-gray-700 dark:text-gray-300 font-semibold text-[11px]">
                    ${currentSn}
                  </td>
                  <td class="p-3 text-center">
                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${qty > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-800'}">
                      ${qty > 0 ? '🟢 In Stock (ພ້ອມໃຊ້)' : '🔴 Out of Stock'}
                    </span>
                  </td>
                  <td class="p-3 text-center font-mono text-gray-600 dark:text-gray-300">
                    ${regDate}
                  </td>
                  <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                    ${window.db.formatMoney(p.salePrice)}
                  </td>
                  <td class="p-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button onclick="window.App.closeModal('category-detail-modal'); StockModule.openEditModal('${p.id}')" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="ແກ້ໄຂສິນຄ້າ">
                        <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                      </button>
                      <button onclick="StockModule.deleteUnitOrProduct('${p.id}', ${i}, ${qty}, '${catName.replace(/'/g, "\\'")}')" class="p-1.5 text-red-600 hover:bg-red-50 rounded transition" title="ລຶບລາຍການນີ້">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }
          }
        });

        modalBody.innerHTML = rowsHtml;
      }
    }

    window.App.openModal('category-detail-modal');
    if (window.lucide) window.lucide.createIcons();
  },

  // Delete individual serial unit from category modal
  async deleteSerialUnit(productId, sn, catName) {
    const product = window.db.getProduct(productId);
    if (!product || !Array.isArray(product.serials)) return;

    if (confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບອຸປະກອນໝາຍເລກ SN: "${sn}" ນີ້ອອກຈາກສາງ?`)) {
      product.serials = product.serials.filter(s => s.sn !== sn);
      product.stockQty = Math.max(0, (Number(product.stockQty) || 0) - 1);
      await window.db.saveProduct(product);
      window.App.showToast(`ລຶບອຸປະກອນ SN: ${sn} ສຳເລັດແລ້ວ!`, 'info');
      this.openCategoryDetailModal(catName);
      this.render();
      if (window.DashboardModule) window.DashboardModule.render();
    }
  },

  // Delete individual unit or product from category modal
  async deleteUnitOrProduct(productId, unitIndex, totalQty, catName) {
    const product = window.db.getProduct(productId);
    if (!product) return;

    if (totalQty > 1) {
      if (confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການທີ ${unitIndex} ຂອງ "${product.name}"? (ຈຳນວນໃນສາງຈະຫຼຸດລົງ 1 ຫົວໜ່ວຍ)`)) {
        product.stockQty = Math.max(0, (Number(product.stockQty) || 0) - 1);
        await window.db.saveProduct(product);
        window.App.showToast(`ລຶບ 1 ຫົວໜ່ວຍສຳເລັດແລ້ວ!`, 'info');
        this.openCategoryDetailModal(catName);
        this.render();
        if (window.DashboardModule) window.DashboardModule.render();
      }
    } else {
      if (confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບສິນຄ້າ "${product.name}" ອອກຈາກສາງ?`)) {
        await window.db.deleteProduct(productId);
        window.App.showToast(`ລຶບສິນຄ້າສຳເລັດແລ້ວ!`, 'info');
        this.openCategoryDetailModal(catName);
        this.render();
        if (window.DashboardModule) window.DashboardModule.render();
      }
    }
  },

  renderCategoriesDropdown() {
    const filterSelect = document.getElementById('stock-category-filter');
    const modalSelect = document.getElementById('prod-category');
    if (!window.db) return;

    const categories = window.db.getCategories();
    
    if (filterSelect) {
      const currentVal = filterSelect.value || 'all';
      filterSelect.innerHTML = `<option value="all">${typeof t === 'function' ? t('all_categories') : 'ທຸກໝວດໝູ່'}</option>` +
        categories.map(c => `<option value="${c}" ${c === currentVal ? 'selected' : ''}>${c}</option>`).join('');
    }

    if (modalSelect) {
      modalSelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('') +
        `<option value="__custom__" class="font-bold text-blue-600">+ ➕ ພິມໝວດໝູ່ໃໝ່ເອງ (Type New Category)...</option>`;
      
      modalSelect.onchange = (e) => {
        const customContainer = document.getElementById('prod-category-custom-container');
        const customInput = document.getElementById('prod-category-custom');
        if (e.target.value === '__custom__') {
          if (customContainer) customContainer.classList.remove('hidden');
          if (customInput) customInput.focus();
        } else {
          if (customContainer) customContainer.classList.add('hidden');
        }
      };
    }
  },

  renderTable() {
    if (!window.db) return;
    let products = window.db.getProducts();

    if (this.selectedCategory && this.selectedCategory !== 'all') {
      products = products.filter(p => (p.category || 'General') === this.selectedCategory);
    }

    if (this.stockFilter === 'low') {
      products = products.filter(p => Number(p.stockQty) <= Number(p.minAlert) && Number(p.stockQty) > 0);
    } else if (this.stockFilter === 'out') {
      products = products.filter(p => Number(p.stockQty) <= 0);
    }

    if (this.searchQuery) {
      products = products.filter(p => 
        (p.name && p.name.toLowerCase().includes(this.searchQuery)) ||
        (p.sku && p.sku.toLowerCase().includes(this.searchQuery)) ||
        (p.brand && p.brand.toLowerCase().includes(this.searchQuery)) ||
        (p.serial && p.serial.toLowerCase().includes(this.searchQuery))
      );
    }

    const tableBody = document.getElementById('stock-table-body');
    if (!tableBody) return;

    if (products.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-12 text-gray-500 dark:text-gray-400">
            <i data-lucide="package-x" class="w-12 h-12 mx-auto mb-3 opacity-40"></i>
            <p class="text-base font-medium">${typeof t === 'function' ? t('all_caught_up') : 'No products found'}</p>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const isAdmin = window.AuthModule ? window.AuthModule.isAdmin() : true;

    tableBody.innerHTML = products.map(product => {
      const stock = Number(product.stockQty) || 0;
      const minAlert = Number(product.minAlert) || 0;
      
      let stockBadgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      let stockStatusText = `${stock} ${product.unit || 'Unit'}`;

      if (stock <= 0) {
        stockBadgeClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 animate-pulse';
        stockStatusText = `0 (Out of stock)`;
      } else if (stock <= minAlert) {
        stockBadgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        stockStatusText = `${stock} (Low Stock)`;
      }

      const availableSerialsCount = (product.serials || []).filter(s => s.status === 'In Stock').length;

      return `
        <tr class="border-b border-gray-100 dark:border-gray-800/60 hover:bg-blue-50/40 dark:hover:bg-gray-800/40 transition">
          <td class="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
            ${product.sku || '-'}
          </td>
          <td>
            <div class="font-bold text-slate-900 dark:text-white text-sm leading-snug">${product.name}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-1">
              ${product.brand ? `<span class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium text-[11px]">${product.brand}</span>` : ''}
              ${product.model ? `<span class="font-mono text-[11px] text-slate-400">${product.model}</span>` : ''}
              ${availableSerialsCount > 0 ? `<span class="font-mono text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 px-2 py-0.5 rounded-md text-[11px]">${availableSerialsCount} SN/MAC</span>` : ''}
            </div>
          </td>
          <td>
            <span class="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-3 py-1 rounded-full font-semibold cursor-pointer hover:bg-blue-100 transition whitespace-nowrap" onclick="StockModule.filterByCategory('${product.category || 'General'}')" title="Filter by this category">
              ${product.category || 'General'}
            </span>
          </td>
          <td>
            <span class="badge ${stockBadgeClass} whitespace-nowrap">
              <span class="badge-dot ${stock <= 0 ? 'bg-red-500' : stock <= minAlert ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
              ${stockStatusText}
            </span>
          </td>
          <td class="font-mono text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
            ${window.db.formatMoney(product.costPrice)}
          </td>
          <td class="font-mono text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
            ${window.db.formatMoney(product.salePrice)}
          </td>
          <td class="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            ${product.warrantyMonths ? `${product.warrantyMonths} Months` : '-'}
          </td>
          <td>
            <div class="flex items-center gap-1.5 whitespace-nowrap">
              <button onclick="StockModule.printBarcodeModal('${product.id}')" title="${typeof t === 'function' ? t('btn_print_barcode') : 'Print Barcode'}" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl dark:hover:bg-indigo-900/40 transition">
                <i data-lucide="qr-code" class="w-4 h-4"></i>
              </button>
              ${isAdmin ? `
                <button onclick="StockModule.openQuickStockModal('${product.id}')" title="${typeof t === 'function' ? t('stock_in_out') : 'Stock In/Out'}" class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl dark:hover:bg-blue-900/40 transition">
                  <i data-lucide="arrow-left-right" class="w-4 h-4"></i>
                </button>
                <button onclick="StockModule.openEditModal('${product.id}')" title="${typeof t === 'function' ? t('btn_edit') : 'Edit'}" class="p-2 text-slate-600 hover:bg-slate-100 rounded-xl dark:text-slate-300 dark:hover:bg-slate-800 transition">
                  <i data-lucide="edit-2" class="w-4 h-4"></i>
                </button>
                <button onclick="StockModule.deleteProduct('${product.id}')" title="${typeof t === 'function' ? t('btn_delete') : 'Delete'}" class="p-2 text-red-600 hover:bg-red-50 rounded-xl dark:hover:bg-red-900/40 transition">
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

  // Disbursed Equipment Log Table
  renderDisbursedTable() {
    const container = document.getElementById('stock-disbursed-tbody');
    if (!container || !window.db) return;

    let logs = window.db.getDisbursedLogs();
    if (this.searchQuery) {
      logs = logs.filter(l => 
        (l.productName && l.productName.toLowerCase().includes(this.searchQuery)) ||
        (l.sku && l.sku.toLowerCase().includes(this.searchQuery)) ||
        (l.recipient && l.recipient.toLowerCase().includes(this.searchQuery)) ||
        (l.projectName && l.projectName.toLowerCase().includes(this.searchQuery)) ||
        (Array.isArray(l.serials) && l.serials.some(s => s.toLowerCase().includes(this.searchQuery)))
      );
    }

    if (logs.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-10 text-gray-400">
            <i data-lucide="clipboard-list" class="w-10 h-10 mx-auto mb-2 opacity-40"></i>
            ບໍ່ມີລາຍການອຸປະກອນທີ່ເບີກຈ່າຍ
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = logs.map(log => `
      <tr class="border-b border-gray-100 dark:border-gray-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs transition">
        <td class="p-3 font-mono text-gray-500">${window.db.formatDate(log.date)}</td>
        <td class="p-3">
          <div class="font-bold text-gray-900 dark:text-white">${log.productName}</div>
          <div class="font-mono text-[11px] text-gray-400">SKU: ${log.sku}</div>
        </td>
        <td class="p-3 font-mono text-center font-bold text-amber-600">${log.quantity}</td>
        <td class="p-3">
          ${(log.serials || []).map(s => `<span class="inline-block bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-mono text-[10px] px-2 py-0.5 rounded m-0.5 font-bold">${s}</span>`).join('') || '<span class="text-gray-400">-</span>'}
        </td>
        <td class="p-3">
          <div class="font-semibold text-gray-900 dark:text-white">${log.recipient || '-'}</div>
          ${log.projectName ? `<div class="text-[11px] text-blue-600">${log.projectName}</div>` : ''}
        </td>
        <td class="p-3 text-gray-600 dark:text-gray-400">${log.technician || '-'}</td>
        <td class="p-3 text-[11px] text-gray-500">${log.note || '-'}</td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  filterByCategory(category) {
    this.selectedCategory = category;
    const select = document.getElementById('stock-category-filter');
    if (select) select.value = category;
    this.renderTable();
  },

  openAddModal() {
    const form = document.getElementById('product-form');
    if (form) form.reset();
    const idEl = document.getElementById('product-id');
    if (idEl) idEl.value = '';
    
    const nextNum = (window.db ? window.db.getProducts().length : 0) + 1;
    const skuEl = document.getElementById('prod-sku');
    if (skuEl) skuEl.value = `NET-IT-${nextNum.toString().padStart(4, '0')}`;

    this.renderCategoriesDropdown();
    
    const catSelect = document.getElementById('prod-category');
    if (catSelect) catSelect.value = 'Network & Routers';
    const customContainer = document.getElementById('prod-category-custom-container');
    if (customContainer) customContainer.classList.add('hidden');

    window.App.openModal('product-modal');
  },

  openEditModal(id) {
    const product = window.db.getProduct(id);
    if (!product) return;

    const setVal = (fieldId, val) => {
      const el = document.getElementById(fieldId);
      if (el) el.value = val;
    };

    setVal('product-id', product.id);
    setVal('prod-sku', product.sku || '');
    setVal('prod-name', product.name || '');
    setVal('prod-brand', product.brand || '');
    setVal('prod-model', product.model || '');
    setVal('prod-serial', product.serial || '');
    setVal('prod-unit', product.unit || 'Unit');
    setVal('prod-cost', product.costPrice || 0);
    setVal('prod-sale', product.salePrice || 0);
    setVal('prod-qty', product.stockQty || 0);
    setVal('prod-min-alert', product.minAlert || 3);
    setVal('prod-location', product.location || '');
    setVal('prod-warranty', product.warrantyMonths || 12);
    setVal('prod-supplier', product.supplier || '');
    setVal('prod-notes', product.notes || '');

    this.renderCategoriesDropdown();

    const cat = product.category || 'General';
    const categories = window.db.getCategories();
    const select = document.getElementById('prod-category');
    const customContainer = document.getElementById('prod-category-custom-container');
    const customInput = document.getElementById('prod-category-custom');

    if (categories.includes(cat)) {
      if (select) select.value = cat;
      if (customContainer) customContainer.classList.add('hidden');
      if (customInput) customInput.value = '';
    } else {
      if (select) select.value = '__custom__';
      if (customContainer) customContainer.classList.remove('hidden');
      if (customInput) customInput.value = cat;
    }

    window.App.openModal('product-modal');
  },

  // 🌟 Safe Product Form Saver with direct Cloudflare D1 persistence
  async saveProductForm(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    
    const getVal = (id, fallback = '') => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : fallback;
    };
    const getNum = (id, fallback = 0) => {
      const el = document.getElementById(id);
      return el ? (Number(el.value) || fallback) : fallback;
    };

    const id = getVal('product-id');
    const isNew = !id;

    const catSelect = document.getElementById('prod-category');
    let categoryVal = catSelect ? catSelect.value : 'General';
    if (categoryVal === '__custom__') {
      const customInput = document.getElementById('prod-category-custom');
      categoryVal = customInput ? customInput.value.trim() : 'General';
    }
    if (!categoryVal) categoryVal = 'General';

    const existingProduct = id ? window.db.getProduct(id) : null;
    const serialsInput = getVal('prod-serial');
    let serialList = [];
    if (serialsInput) {
      serialList = serialsInput.split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(sn => ({ sn: sn, mac: '', status: 'In Stock' }));
    }

    const enteredQty = getNum('prod-qty', 1);
    const finalQty = serialList.length > 0 ? Math.max(enteredQty, serialList.length) : enteredQty;

    const productData = {
      id: id || undefined,
      sku: getVal('prod-sku', `NET-IT-${Date.now().toString().slice(-4)}`),
      name: getVal('prod-name', 'New Product'),
      category: categoryVal,
      brand: getVal('prod-brand'),
      model: getVal('prod-model'),
      serial: serialsInput,
      serials: serialList.length > 0 ? serialList : (existingProduct && Array.isArray(existingProduct.serials) ? existingProduct.serials : []),
      unit: getVal('prod-unit', 'Unit'),
      costPrice: getNum('prod-cost', 0),
      salePrice: getNum('prod-sale', 0),
      stockQty: finalQty,
      minAlert: getNum('prod-min-alert', 3),
      location: getVal('prod-location'),
      warrantyMonths: getNum('prod-warranty', 12),
      supplier: getVal('prod-supplier'),
      notes: getVal('prod-notes')
    };

    const saved = await window.db.saveProduct(productData);
    if (isNew && saved) {
      // Record initial audit log without doubling stockQty
      const currentUser = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
      const log = {
        id: 'LOG-' + Date.now().toString().slice(-6),
        date: new Date().toISOString().slice(0, 10),
        productId: saved.id,
        productName: saved.name,
        sku: saved.sku,
        type: 'In',
        quantity: saved.stockQty,
        previousStock: 0,
        newStock: saved.stockQty,
        serials: saved.serials ? saved.serials.map(s => s.sn || s).join(', ') : '',
        recipient: '',
        projectName: '',
        referenceDoc: 'Initial Entry',
        note: 'New Product Registered',
        operator: currentUser ? currentUser.name : 'Admin',
        createdAt: new Date().toISOString()
      };
      if (window.db && window.db.data && Array.isArray(window.db.data.stockLogs)) {
        window.db.data.stockLogs.unshift(log);
        window.db.saveLocalCache();
      }
      try {
        fetch(window.db.getApiUrl('/api/stock-logs'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log)
        }).catch(() => {});
      } catch (e) {}
    }

    window.App.closeModal('product-modal');
    window.App.showToast(typeof t === 'function' ? t('toast_success_save') : 'ບັນທຶກສິນຄ້າສໍາເລັດແລ້ວ!', 'success');
    this.render();
    if (window.DashboardModule) window.DashboardModule.render();
  },

  async deleteProduct(id) {
    const msg = typeof t === 'function' ? t('confirm_delete') : 'Are you sure you want to delete?';
    if (confirm(msg)) {
      await window.db.deleteProduct(id);
      window.App.showToast(typeof t === 'function' ? t('toast_success_delete') : 'Deleted from Cloudflare D1!', 'info');
      this.render();
      if (window.DashboardModule) window.DashboardModule.render();
    }
  },

  // ================= CATEGORY MANAGEMENT =================
  openCategoryModal() {
    this.renderCategoryModalList();
    const input = document.getElementById('new-category-input');
    if (input) input.value = '';
    window.App.openModal('category-modal');
  },

  renderCategoryModalList() {
    const container = document.getElementById('category-modal-list');
    if (!container || !window.db) return;

    const categories = window.db.getCategories();
    const products = window.db.getProducts();

    const counts = {};
    products.forEach(p => {
      const cat = p.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    container.innerHTML = categories.map((cat, idx) => {
      const count = counts[cat] || 0;
      return `
        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-750 transition">
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center font-mono">
              ${idx + 1}
            </span>
            <div>
              <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <span>${cat}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold font-mono">
                  ${count} ${count === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="StockModule.editCategoryPrompt('${cat.replace(/'/g, "\\'")}')" class="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition" title="ແກ້ໄຂ / ປ່ຽນຊື່">
              <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="StockModule.deleteCategoryConfirm('${cat.replace(/'/g, "\\'")}')" class="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition" title="ລຶບໝວດໝູ່">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  async addCategoryFromModal(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('new-category-input');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;

    await window.db.addCategory(val);
    input.value = '';
    window.App.showToast(typeof t === 'function' ? t('toast_category_added') : 'Category added to Cloudflare D1!', 'success');
    this.renderCategoryModalList();
    this.render();
    if (window.DashboardModule) window.DashboardModule.render();
  },

  async editCategoryPrompt(oldName) {
    const promptMsg = typeof t === 'function' ? t('prompt_rename_category') : 'Enter new category name:';
    const newName = prompt(promptMsg, oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;

    await window.db.renameCategory(oldName, newName.trim());
    window.App.showToast(typeof t === 'function' ? t('toast_category_updated') : 'Category renamed in Cloudflare D1!', 'success');
    this.renderCategoryModalList();
    this.render();
    if (window.DashboardModule) window.DashboardModule.render();
  },

  async deleteCategoryConfirm(catName) {
    const confirmMsg = typeof t === 'function' ? t('confirm_delete_category') : `Are you sure you want to delete category "${catName}"? Products will be moved to General.`;
    if (confirm(confirmMsg)) {
      await window.db.deleteCategory(catName);
      window.App.showToast(typeof t === 'function' ? t('toast_category_deleted') : 'Category deleted from Cloudflare D1!', 'info');
      this.renderCategoryModalList();
      this.render();
      if (window.DashboardModule) window.DashboardModule.render();
    }
  },

  // ================= STOCK IN / OUT WITH SN & MAC =================
  openQuickStockModal(productId = null, defaultType = 'In') {
    const modal = document.getElementById('stock-trans-modal');
    if (!modal) return;

    const select = document.getElementById('stock-trans-product');
    const products = window.db.getProducts();
    select.innerHTML = products.map(p => `
      <option value="${p.id}" ${p.id === productId ? 'selected' : ''}>
        ${p.sku} - ${p.name} (Stock: ${p.stockQty})
      </option>
    `).join('');

    document.getElementById('stock-trans-type').value = defaultType;
    document.getElementById('stock-trans-qty').value = 1;
    document.getElementById('stock-trans-ref').value = '';
    document.getElementById('stock-trans-note').value = '';
    
    // Fill Project options
    const projectSelect = document.getElementById('stock-trans-project');
    if (projectSelect) {
      const projects = window.db.getProjects();
      projectSelect.innerHTML = '<option value="">-- None / General --</option>' + projects.map(prj => `
        <option value="${prj.id}">${prj.code} - ${prj.name}</option>
      `).join('');
    }

    // Fill Customer options
    const custSelect = document.getElementById('stock-trans-recipient');
    if (custSelect) {
      const customers = window.db.getCustomers();
      custSelect.innerHTML = '<option value="">-- ເລືອກລູກຄ້າ / ຜູ້ຮັບ --</option>' + customers.map(c => `
        <option value="${c.name}">${c.name}</option>
      `).join('');
    }

    this.handleStockTransTypeChange();
    window.App.openModal('stock-trans-modal');
  },

  handleStockTransTypeChange() {
    const type = document.getElementById('stock-trans-type').value;
    const inSection = document.getElementById('stock-trans-in-sn-section');
    const outSection = document.getElementById('stock-trans-out-sn-section');

    if (type === 'In') {
      if (inSection) inSection.classList.remove('hidden');
      if (outSection) outSection.classList.add('hidden');
    } else {
      if (inSection) inSection.classList.add('hidden');
      if (outSection) outSection.classList.remove('hidden');
      this.populateAvailableSerialsForStockOut();
    }
  },

  populateAvailableSerialsForStockOut() {
    const select = document.getElementById('stock-trans-product');
    const container = document.getElementById('stock-trans-available-serials');
    if (!select || !container || !window.db) return;

    const product = window.db.getProduct(select.value);
    if (!product || !Array.isArray(product.serials) || product.serials.length === 0) {
      container.innerHTML = '<p class="text-[11px] text-gray-400 py-1">ບໍ່ມີໝາຍເລກ SN/MAC ໃນລະບົບສຳລັບສິນຄ້ານີ້ (No SNs logged)</p>';
      return;
    }

    const availableSerials = product.serials.filter(s => s.status === 'In Stock');
    if (availableSerials.length === 0) {
      container.innerHTML = '<p class="text-[11px] text-amber-600 py-1">⚠️ ໝາຍເລກ SN ທັງໝົດຖືກເບີກຈ່າຍໄປແລ້ວ (All serials disbursed)</p>';
      return;
    }

    container.innerHTML = availableSerials.map((s, idx) => `
      <label class="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer text-xs">
        <input type="checkbox" name="stock_out_serials" value="${s.sn}" onchange="StockModule.updateStockOutQtyFromChecked()" class="rounded text-blue-600">
        <div class="font-mono">
          <span class="font-bold text-gray-900 dark:text-white">${s.sn}</span>
          ${s.mac ? `<span class="text-gray-400 text-[10px]"> (MAC: ${s.mac})</span>` : ''}
        </div>
      </label>
    `).join('');
  },

  updateStockOutQtyFromChecked() {
    const checked = document.querySelectorAll('input[name="stock_out_serials"]:checked');
    if (checked.length > 0) {
      const qtyEl = document.getElementById('stock-trans-qty');
      if (qtyEl) qtyEl.value = checked.length;
    }
  },

  async saveStockTransaction(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const productId = document.getElementById('stock-trans-product').value;
    const type = document.getElementById('stock-trans-type').value;
    const qty = Number(document.getElementById('stock-trans-qty').value) || 1;
    const ref = document.getElementById('stock-trans-ref') ? document.getElementById('stock-trans-ref').value : '';
    const note = document.getElementById('stock-trans-note') ? document.getElementById('stock-trans-note').value : '';
    const operator = document.getElementById('stock-trans-operator') ? document.getElementById('stock-trans-operator').value : 'Admin';
    const recipient = document.getElementById('stock-trans-recipient') ? document.getElementById('stock-trans-recipient').value : '';
    const projSelect = document.getElementById('stock-trans-project');
    const projectName = projSelect && projSelect.selectedIndex > 0 ? projSelect.options[projSelect.selectedIndex].text : '';

    let serials = [];
    if (type === 'In') {
      const snInput = document.getElementById('stock-trans-in-sn');
      const macInput = document.getElementById('stock-trans-in-mac');
      const rawSns = snInput ? snInput.value.trim() : '';
      const rawMacs = macInput ? macInput.value.trim() : '';

      if (rawSns) {
        const snList = rawSns.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        const macList = rawMacs ? rawMacs.split(/[\n,]+/).map(m => m.trim()).filter(Boolean) : [];
        snList.forEach((sn, i) => {
          serials.push({ sn: sn, mac: macList[i] || '', status: 'In Stock' });
        });
      }
    } else if (type === 'Out') {
      const checked = document.querySelectorAll('input[name="stock_out_serials"]:checked');
      checked.forEach(cb => {
        serials.push(cb.value);
      });
    }

    const res = await window.db.recordStockMovement({
      productId,
      type,
      quantity: qty,
      referenceDoc: ref,
      note,
      operator,
      serials,
      recipient,
      projectName
    });

    if (res) {
      window.App.closeModal('stock-trans-modal');
      window.App.showToast(typeof t === 'function' ? t('toast_stock_deducted') : 'Stock Updated in Cloudflare D1!', 'success');
      this.render();
      if (window.DashboardModule) window.DashboardModule.render();
    }
  },

  // Barcode / Tag print modal
  printBarcodeModal(id) {
    const product = window.db.getProduct(id);
    if (!product) return;

    const container = document.getElementById('barcode-modal-content');
    if (container) {
      container.innerHTML = `
        <div class="p-6 text-center">
          <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white max-w-sm mx-auto shadow-sm">
            <div class="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">NETD IT SOLUTIONS</div>
            <div class="text-base font-bold truncate">${product.name}</div>
            <div class="text-xs text-gray-500 font-mono mt-1">SKU: ${product.sku}</div>
            <div class="my-4 flex justify-center">
              <svg id="barcode-svg" class="w-48 h-16"></svg>
            </div>
            ${product.serial ? `<div class="text-xs font-mono text-gray-600 dark:text-gray-400">S/N: ${product.serial}</div>` : ''}
            <div class="text-lg font-bold text-gray-900 dark:text-white mt-2 font-mono">
              ${window.db.formatMoney(product.salePrice)}
            </div>
            <div class="text-[10px] text-gray-400 mt-2">Warranty: ${product.warrantyMonths || 12} Months</div>
          </div>
          <div class="mt-6 flex justify-center gap-3">
            <button onclick="window.print()" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center gap-2 shadow">
              <i data-lucide="printer" class="w-4 h-4"></i> ${typeof t === 'function' ? t('btn_print') : 'Print'}
            </button>
            <button onclick="window.App.closeModal('barcode-modal')" class="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200">
              ${typeof t === 'function' ? t('btn_close') : 'Close'}
            </button>
          </div>
        </div>
      `;
      window.App.openModal('barcode-modal');
      if (window.JsBarcode) {
        window.JsBarcode('#barcode-svg', product.sku, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 50,
          displayValue: true
        });
      }
      if (window.lucide) window.lucide.createIcons();
    }
  },

  exportCSV() {
    const products = window.db.getProducts();
    const headers = ["SKU", "Name", "Category", "Brand", "Model", "StockQty", "Unit", "CostPrice", "SalePrice", "WarrantyMonths"];
    const rows = products.map(p => [
      p.sku,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.category || ''}"`,
      `"${p.brand || ''}"`,
      `"${p.model || ''}"`,
      p.stockQty,
      p.unit || 'Unit',
      p.costPrice,
      p.salePrice,
      p.warrantyMonths || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NETD_Stock_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

window.StockModule = StockModule;
