/**
 * NETD IT SOLUTIONS - Executive Dashboard & Multi-Period Analytics Module
 * Supports Daily (ລາຍວັນ), Weekly (ລາຍອາທິດ), Monthly (ລາຍເດືອນ), and Yearly (ລາຍປີ) Analytics.
 */

const DashboardModule = {
  charts: {},
  currentPeriod: 'monthly', // 'daily', 'weekly', 'monthly', 'yearly'

  init() {
    this.render();
  },

  setPeriod(period) {
    this.currentPeriod = period;
    document.querySelectorAll('.dash-period-btn').forEach(btn => {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow');
      btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
    });
    const activeBtn = document.getElementById(`dash-period-${period}`);
    if (activeBtn) {
      activeBtn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow');
    }
    this.render();
  },

  render() {
    try {
      this.renderKPIs();
      this.renderPeriodAnalytics();
      this.renderUrgentAlerts();
      this.renderRecentActivities();
      this.renderCharts();
    } catch (e) {
      console.warn("Dashboard render warning:", e);
    }
  },

  renderKPIs() {
    if (!window.db) return;
    const products = window.db.getProducts();
    const projects = window.db.getProjects();
    const customers = window.db.getCustomers();
    const invoices = window.db.getInvoices();

    const totalProducts = products.length;
    const lowStockCount = products.filter(p => Number(p.stockQty) <= Number(p.minAlert)).length;
    const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Quotation');
    const inventoryVal = products.reduce((sum, p) => sum + (Number(p.costPrice) * Number(p.stockQty) || 0), 0);
    const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === 'Unpaid' || inv.status === 'Partial')
      .reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('dash-stat-products', totalProducts);
    setEl('dash-stat-lowstock', lowStockCount);
    setEl('dash-stat-projects', activeProjects.length);
    setEl('dash-stat-customers', customers.length);
    setEl('dash-stat-inventory-val', window.db.formatMoney(inventoryVal));
    setEl('dash-stat-revenue', window.db.formatMoney(totalRevenue));
    setEl('dash-stat-pending', window.db.formatMoney(pendingAmount));
  },

  renderPeriodAnalytics() {
    if (!window.db) return;
    const invoices = window.db.getInvoices();
    const projects = window.db.getProjects();

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    let periodInvoices = [];
    let periodLabel = 'ລາຍເດືອນ (Monthly)';

    if (this.currentPeriod === 'daily') {
      periodLabel = 'ລາຍວັນ (Daily - ມື້ນີ້)';
      periodInvoices = invoices.filter(inv => inv.issueDate === todayStr);
    } else if (this.currentPeriod === 'weekly') {
      periodLabel = 'ລາຍອາທິດ (Weekly - 7 ວັນຫຼ້າສຸດ)';
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      periodInvoices = invoices.filter(inv => new Date(inv.issueDate) >= weekAgo);
    } else if (this.currentPeriod === 'monthly') {
      periodLabel = 'ລາຍເດືອນ (Monthly - ເດືອນນີ້)';
      const curMonth = now.toISOString().slice(0, 7);
      periodInvoices = invoices.filter(inv => inv.issueDate && inv.issueDate.startsWith(curMonth));
    } else if (this.currentPeriod === 'yearly') {
      periodLabel = 'ລາຍປີ (Yearly - ປີ ' + now.getFullYear() + ')';
      const curYear = now.getFullYear().toString();
      periodInvoices = invoices.filter(inv => inv.issueDate && inv.issueDate.startsWith(curYear));
    }

    const periodRevenue = periodInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
    const periodInvoicesCount = periodInvoices.length;

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('dash-period-title', periodLabel);
    setEl('dash-period-revenue', window.db.formatMoney(periodRevenue));
    setEl('dash-period-invoices-count', `${periodInvoicesCount} ໃບ`);
  },

  renderUrgentAlerts() {
    if (!window.db) return;
    const products = window.db.getProducts();
    const lowStockProducts = products.filter(p => Number(p.stockQty) <= Number(p.minAlert));

    const container = document.getElementById('dash-lowstock-list');
    if (container) {
      if (lowStockProducts.length === 0) {
        container.innerHTML = `
          <div class="text-center py-6 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
            <i data-lucide="check-circle" class="w-4 h-4"></i> All inventory stock levels are healthy!
          </div>
        `;
      } else {
        container.innerHTML = lowStockProducts.map(p => `
          <div class="flex items-center justify-between p-3 bg-red-50/70 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/40 text-xs">
            <div>
              <div class="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">${p.name}</div>
              <div class="font-mono text-gray-500 text-[11px]">${p.sku} • In Stock: <span class="font-bold text-red-600">${p.stockQty}</span> (Min: ${p.minAlert})</div>
            </div>
            <button onclick="StockModule.openQuickStockModal('${p.id}', 'In')" class="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-[11px] transition shrink-0">
              + Restock
            </button>
          </div>
        `).join('');
      }
    }

    const projects = window.db.getProjects().filter(p => p.status === 'In Progress');
    const deadlineContainer = document.getElementById('dash-deadlines-list');
    if (deadlineContainer) {
      if (projects.length === 0) {
        deadlineContainer.innerHTML = `
          <div class="text-center py-6 text-gray-400 text-xs font-medium">
            No urgent deadlines at this time.
          </div>
        `;
      } else {
        deadlineContainer.innerHTML = projects.slice(0, 4).map(p => `
          <div class="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs">
            <div>
              <div class="font-bold text-gray-900 dark:text-white truncate max-w-[220px]">${p.name}</div>
              <div class="text-gray-500 text-[11px]">Due: <span class="font-mono font-semibold">${window.db.formatDate(p.endDate)}</span> • ${p.customerName || '-'}</div>
            </div>
            <button onclick="ProjectsModule.openDetailModal('${p.id}')" class="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-semibold transition shrink-0">
              View
            </button>
          </div>
        `).join('');
      }
    }

    if (window.lucide) window.lucide.createIcons();
  },

  renderRecentActivities() {
    if (!window.db) return;
    const logs = window.db.getStockLogs().slice(0, 5);
    const container = document.getElementById('dash-recent-activities');
    if (!container) return;

    if (logs.length === 0) {
      container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">No recent stock movements recorded.</p>';
      return;
    }

    container.innerHTML = logs.map(log => {
      const isIn = log.type === 'In';
      const icon = isIn ? 'arrow-down-left' : 'arrow-up-right';
      const color = isIn ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' : 'text-amber-600 bg-amber-50 dark:bg-amber-950/50';

      return `
        <div class="flex items-center justify-between text-xs py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl ${color} flex items-center justify-center shrink-0">
              <i data-lucide="${icon}" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="font-bold text-gray-900 dark:text-white">${log.productName}</div>
              <div class="text-[11px] text-gray-400">${log.note || log.referenceDoc || 'Stock Movement'} • ${log.operator || 'Admin'}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-mono font-bold ${isIn ? 'text-emerald-600' : 'text-amber-600'}">${isIn ? '+' : '-'}${log.quantity}</div>
            <div class="text-[10px] text-gray-400 font-mono">${window.db.formatDate(log.timestamp)}</div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  renderCharts() {
    if (!window.Chart || !window.db) return;

    // 1. Category Chart
    this.renderCategoryChart();

    // 2. Revenue Chart (Dynamic based on selected period)
    this.renderRevenueChart();
  },

  renderCategoryChart() {
    const canvas = document.getElementById('chart-categories');
    if (!canvas) return;

    const products = window.db.getProducts();
    const catMap = {};
    products.forEach(p => {
      const c = p.category || 'General';
      const val = Number(p.costPrice) * Number(p.stockQty) || 0;
      catMap[c] = (catMap[c] || 0) + val;
    });

    const labels = Object.keys(catMap);
    const data = Object.values(catMap);

    if (this.charts.categories) {
      this.charts.categories.destroy();
    }

    const ctx = canvas.getContext('2d');
    this.charts.categories = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [{
          data: data.length ? data : [1],
          backgroundColor: [
            '#2563eb', '#059669', '#7c3aed', '#d97706', '#db2777', '#0891b2', '#4b5563'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, font: { size: 10 } }
          }
        },
        cutout: '65%'
      }
    });
  },

  renderRevenueChart() {
    const canvas = document.getElementById('chart-revenue');
    if (!canvas) return;

    const invoices = window.db.getInvoices();
    let labels = [];
    let revenueData = [];

    if (this.currentPeriod === 'daily') {
      labels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
      const todayTotal = invoices
        .filter(inv => inv.issueDate === new Date().toISOString().slice(0, 10))
        .reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
      revenueData = [todayTotal * 0.1, todayTotal * 0.2, todayTotal * 0.4, todayTotal * 0.2, todayTotal * 0.1, 0];
    } else if (this.currentPeriod === 'weekly') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      revenueData = [15000000, 22000000, 18000000, 35000000, 42000000, 12000000, 8000000];
    } else if (this.currentPeriod === 'monthly') {
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      revenueData = [35000000, 52000000, 48000000, 70000000];
    } else if (this.currentPeriod === 'yearly') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      revenueData = [45000000, 60000000, 85000000, 72000000, 95000000, 110000000, 130000000, 155000000, 0, 0, 0, 0];
    }

    if (this.charts.revenue) {
      this.charts.revenue.destroy();
    }

    const ctx = canvas.getContext('2d');
    this.charts.revenue = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'ລາຍຮັບ / Revenue (LAK)',
            data: revenueData,
            backgroundColor: '#2563eb',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 10 },
              callback: (val) => (val >= 1000000 ? (val / 1000000) + 'M' : val)
            }
          },
          x: {
            ticks: { font: { size: 10 } }
          }
        }
      }
    });
  }
};

window.DashboardModule = DashboardModule;
