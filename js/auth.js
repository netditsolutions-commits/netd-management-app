/**
 * NETD IT SOLUTIONS - Authentication & User Management (RBAC) Module
 * Supports Gmail + Password Authentication, Role Permissions (Admin vs Viewer),
 * and Full User Account CRUD (Add, Edit, Delete Users).
 */

const AuthModule = {
  currentUser: null,

  init() {
    this.loadSession();
    this.renderUserBadge();
    this.applyPermissions();
    if (!this.currentUser) {
      this.openMandatoryLoginModal();
    } else {
      this.hideLoginModal();
    }
  },

  loadSession() {
    try {
      // Purge legacy permanent auto-login key from localStorage so fresh browser visits MUST authenticate
      localStorage.removeItem('netd_auth_user');

      const stored = sessionStorage.getItem('netd_auth_session');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        this.currentUser = null;
      }
    } catch (e) {
      this.currentUser = null;
    }
  },

  saveSession() {
    if (this.currentUser) {
      sessionStorage.setItem('netd_auth_session', JSON.stringify(this.currentUser));
    } else {
      sessionStorage.removeItem('netd_auth_session');
      localStorage.removeItem('netd_auth_user');
    }
  },

  getCurrentUser() {
    return this.currentUser;
  },

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  },

  isViewer() {
    return this.currentUser && this.currentUser.role === 'viewer';
  },

  loginWithPassword(email, password) {
    if (!email || !email.includes('@')) {
      alert("ກະລຸນາໃສ່ Gmail ທີ່ຖືກຕ້ອງ / Please enter a valid Gmail address");
      return false;
    }

    if (!password) {
      alert("ກະລຸນາໃສ່ລະຫັດຜ່ານ / Please enter your password");
      return false;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const user = window.db ? window.db.authenticateUser(cleanEmail, cleanPass) : null;

    if (!user) {
      alert("⚠️ ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ! ກະລຸນາກວດສອບຄືນໃໝ່ (Invalid Email or Password)");
      return false;
    }

    this.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      loginTime: new Date().toISOString()
    };

    this.saveSession();
    this.renderUserBadge();
    this.applyPermissions();
    this.hideLoginModal();

    const roleLabel = user.role === 'admin' ? '👑 Admin (ສິດທິຈັດການ)' : '👁️ Viewer (ສິດທິເບິ່ງຢ່າງດຽວ)';
    window.App.showToast(`Login ສຳເລັດ: ${user.name} (${roleLabel})`, 'success');

    if (window.App && typeof window.App.refreshCurrentView === 'function') {
      window.App.refreshCurrentView();
    }
    return true;
  },

  logout() {
    if (confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການປ່ຽນບັນຊີ ຫຼື ອອກຈາກລະບົບ?")) {
      this.currentUser = null;
      this.saveSession();
      this.renderUserBadge();
      this.applyPermissions();
      this.openMandatoryLoginModal();
    }
  },

  openMandatoryLoginModal() {
    const modal = document.getElementById('login-modal');
    const closeBtn = document.getElementById('login-modal-close-btn');
    if (closeBtn) closeBtn.classList.add('hidden');
    const emailInput = document.getElementById('login-gmail-input');
    const pwdInput = document.getElementById('login-pwd-input');
    if (emailInput) emailInput.value = '';
    if (pwdInput) pwdInput.value = '';
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    if (window.lucide) window.lucide.createIcons();
  },

  hideLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  openLoginModal() {
    const closeBtn = document.getElementById('login-modal-close-btn');
    if (closeBtn) {
      if (!this.currentUser) {
        closeBtn.classList.add('hidden');
      } else {
        closeBtn.classList.remove('hidden');
      }
    }
    const emailInput = document.getElementById('login-gmail-input');
    const pwdInput = document.getElementById('login-pwd-input');
    if (emailInput) emailInput.value = '';
    if (pwdInput) pwdInput.value = '';
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    if (window.lucide) window.lucide.createIcons();
  },

  renderUserBadge() {
    const userContainer = document.getElementById('auth-user-badge');
    if (!userContainer) return;

    if (!this.currentUser) {
      userContainer.innerHTML = `
        <button onclick="AuthModule.openLoginModal()" class="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition">
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Login</span>
        </button>
      `;
      return;
    }

    const isAdmin = this.isAdmin();
    const roleBadge = isAdmin
      ? `<span class="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-0.5 rounded-md font-extrabold text-[10px] tracking-wide uppercase">👑 Admin</span>`
      : `<span class="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide uppercase">👁️ Viewer (ເບິ່ງຢ່າງດຽວ)</span>`;

    userContainer.innerHTML = `
      <div class="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 p-1.5 pr-3 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition" onclick="AuthModule.openLoginModal()" title="ຄລິກເພື່ອປ່ຽນບັນຊີ ຫຼື ເບິ່ງສິດທິ">
        <img src="${this.currentUser.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=NETD'}" alt="Avatar" class="w-8 h-8 rounded-xl bg-white p-0.5 border border-slate-300 dark:border-slate-600 shadow-sm">
        <div class="text-left leading-tight hidden sm:block">
          <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
            <span class="truncate max-w-[120px]">${this.currentUser.name}</span>
            ${roleBadge}
          </div>
          <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[140px]">${this.currentUser.email}</div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  applyPermissions() {
    const isAdmin = this.isAdmin();

    document.querySelectorAll('.admin-only').forEach(el => {
      if (isAdmin) {
        el.classList.remove('hidden');
        if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') el.removeAttribute('disabled');
      } else {
        el.classList.add('hidden');
        if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') el.setAttribute('disabled', 'true');
      }
    });

    const viewerNotice = document.getElementById('viewer-permission-banner');
    if (viewerNotice) {
      viewerNotice.classList.toggle('hidden', isAdmin);
    }
  },

  // ================= USER MANAGEMENT (CRUD) =================
  openUserManagementModal() {
    if (!this.isAdmin()) {
      alert("ສິດທິ Admin ເທົ່ານັ້ນທີ່ສາມາດຈັດການ User ໄດ້ / Admin permission required");
      return;
    }
    this.renderUsersList();
    this.resetUserForm();
    window.App.openModal('user-mgmt-modal');
  },

  renderUsersList() {
    const container = document.getElementById('user-mgmt-list-body');
    if (!container || !window.db) return;

    const users = window.db.getUsers();
    container.innerHTML = users.map(u => {
      const isCurrent = this.currentUser && this.currentUser.email.toLowerCase() === u.email.toLowerCase();
      const roleBadge = u.role === 'admin'
        ? '<span class="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-0.5 rounded text-[11px] font-bold">👑 Admin (ຈັດການ)</span>'
        : '<span class="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold">👁️ Viewer (ເບິ່ງຢ່າງດຽວ)</span>';

      return `
        <tr class="border-b border-gray-100 dark:border-gray-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
          <td class="p-3 flex items-center gap-2.5">
            <img src="${u.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.email}" class="w-8 h-8 rounded-lg bg-white border p-0.5">
            <div>
              <div class="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                ${u.name}
                ${isCurrent ? '<span class="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">YOU</span>' : ''}
              </div>
              <div class="text-[11px] text-gray-500 font-mono">${u.email}</div>
            </div>
          </td>
          <td class="p-3 font-mono text-xs text-gray-600 dark:text-gray-400">
            ••••••••
          </td>
          <td class="p-3">
            ${roleBadge}
          </td>
          <td class="p-3 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="AuthModule.editUser('${u.id}')" class="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition" title="ແກ້ໄຂ User">
                <i data-lucide="edit-2" class="w-4 h-4"></i>
              </button>
              ${!isCurrent ? `
                <button onclick="AuthModule.deleteUserConfirm('${u.id}')" class="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" title="ລຶບ User">
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

  resetUserForm() {
    const idEl = document.getElementById('user-form-id');
    const emailEl = document.getElementById('user-form-email');
    const nameEl = document.getElementById('user-form-name');
    const pwdEl = document.getElementById('user-form-password');
    const roleEl = document.getElementById('user-form-role');
    const titleEl = document.getElementById('user-form-title');

    if (idEl) idEl.value = '';
    if (emailEl) emailEl.value = '';
    if (nameEl) nameEl.value = '';
    if (pwdEl) pwdEl.value = '';
    if (roleEl) roleEl.value = 'admin';
    if (titleEl) titleEl.textContent = '+ ເພີ່ມຜູ້ໃຊ້ງານໃໝ່ (Add User)';
  },

  editUser(id) {
    const user = window.db.getUser(id);
    if (!user) return;

    document.getElementById('user-form-id').value = user.id;
    document.getElementById('user-form-email').value = user.email;
    document.getElementById('user-form-name').value = user.name;
    document.getElementById('user-form-password').value = user.password;
    document.getElementById('user-form-role').value = user.role;
    document.getElementById('user-form-title').textContent = 'ແກ້ໄຂຜູ້ໃຊ້ງານ (Edit User): ' + user.name;
  },

  async saveUserForm(e) {
    e.preventDefault();
    const id = document.getElementById('user-form-id').value;
    const email = document.getElementById('user-form-email').value.trim().toLowerCase();
    const name = document.getElementById('user-form-name').value.trim();
    const password = document.getElementById('user-form-password').value.trim();
    const role = document.getElementById('user-form-role').value;

    if (!email || !password) {
      alert("ກະລຸນາໃສ່ Gmail ແລະ ລະຫັດຜ່ານໃຫ້ຄົບຖ້ວນ");
      return;
    }

    const userData = {
      id: id || undefined,
      email: email,
      name: name || email.split('@')[0],
      password: password,
      role: role
    };

    await window.db.saveUser(userData);
    window.App.showToast("ບັນທຶກຂໍ້ມູນ User ສຳເລັດແລ້ວ!", "success");
    this.renderUsersList();
    this.resetUserForm();

    // If current user updated their own info, update current session
    if (this.currentUser && this.currentUser.email.toLowerCase() === email) {
      this.currentUser.name = userData.name;
      this.currentUser.role = userData.role;
      this.saveSession();
      this.renderUserBadge();
      this.applyPermissions();
    }
  },

  async deleteUserConfirm(id) {
    const user = window.db.getUser(id);
    if (!user) return;

    if (confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ User: "${user.name} (${user.email})"?`)) {
      const ok = await window.db.deleteUser(id);
      if (ok) {
        window.App.showToast("ລຶບ User ສຳເລັດແລ້ວ!", "info");
      } else {
        window.App.showToast("ບໍ່ສາມາດລຶບ Admin ຄົນສຸດທ້າຍໄດ້", "error");
      }
      this.renderUsersList();
    }
  }
};

window.AuthModule = AuthModule;
