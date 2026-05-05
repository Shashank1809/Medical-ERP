(function () {
    // Auth check
    if (!localStorage.getItem('erp_token')) {
        window.location.href = 'index.html'; return;
    }

    const user = JSON.parse(localStorage.getItem('erp_user') || '{}');
    document.getElementById('adminName').textContent = user.fullName || user.username || 'Admin';
    document.getElementById('adminAvatar').textContent = (user.fullName || 'A')[0].toUpperCase();
    document.getElementById('topbarUser').textContent = user.fullName || '';

    window.navigate = function (page) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
        const titles = {
            dashboard: 'Dashboard', customers: 'Customer Master',
            services: 'Customer Services', products: 'Product Stock',
            salary: 'Salary & Wages', categories: 'Product Category',
            quotations: 'Quotation Master', amc: 'AMC Records'
        };
        document.getElementById('pageTitle').textContent = titles[page] || page;
        document.getElementById('pageContent').innerHTML = '<div style="padding:2rem;text-align:center;color:#aaa">Loading...</div>';

        const pages = { dashboard: renderDashboard, customers: renderCustomers, services: renderServices,
            products: renderProducts, salary: renderSalary, categories: renderCategories,
            quotations: renderQuotations, amc: renderAMC };
        if (pages[page]) pages[page]();
    };

    window.logout = function () {
        localStorage.clear();
        window.location.href = 'index.html';
    };

    window.toggleSidebar = function () {
        document.getElementById('sidebar').classList.toggle('open');
    };

    window.openModal = function (title, bodyHTML) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = bodyHTML;
        document.getElementById('modalOverlay').classList.add('open');
    };

    window.closeModal = function (e) {
        if (!e || e.target === document.getElementById('modalOverlay'))
            document.getElementById('modalOverlay').classList.remove('open');
    };

    // ==================== DASHBOARD ====================
    async function renderDashboard() {
        const el = document.getElementById('pageContent');
        try {
            const [customers, products, services, amc] = await Promise.all([
                api.get('/customers'), api.get('/products'),
                api.get('/customer-services'), api.get('/amc')
            ]);
            const lowStock = (products || []).filter(p => p.stockQuantity <= p.minStock).length;
            const activeAMC = (amc || []).filter(a => a.status === 'ACTIVE').length;
            const pendingSvc = (services || []).filter(s => s.status === 'PENDING').length;

            el.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">&#128100;</div>
            <div class="stat-label">Total Customers</div>
            <div class="stat-value">${(customers || []).length}</div>
            <div class="stat-sub">Registered customers</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">&#128230;</div>
            <div class="stat-label">Products</div>
            <div class="stat-value">${(products || []).length}</div>
            <div class="stat-sub" style="color:${lowStock > 0 ? '#e63946' : '#0f3460'}">${lowStock} low stock</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">&#128295;</div>
            <div class="stat-label">Service Calls</div>
            <div class="stat-value">${(services || []).length}</div>
            <div class="stat-sub" style="color:#f57f17">${pendingSvc} pending</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">&#128337;</div>
            <div class="stat-label">AMC Contracts</div>
            <div class="stat-value">${(amc || []).length}</div>
            <div class="stat-sub" style="color:#2e7d32">${activeAMC} active</div>
          </div>
        </div>
        <div class="dashboard-grid">
          <div class="widget-card">
            <div class="widget-title">Recent Customers</div>
            ${(customers || []).slice(-5).reverse().map(c => `
              <div class="recent-item">
                <span class="recent-name">${c.name}</span>
                <span class="recent-date">${c.city || '—'}</span>
              </div>`).join('') || '<div class="table-empty">No data</div>'}
          </div>
          <div class="widget-card">
            <div class="widget-title">Recent Service Calls</div>
            ${(services || []).slice(-5).reverse().map(s => `
              <div class="recent-item">
                <span class="recent-name">${s.customer?.name || '—'}</span>
                <span class="badge badge-${s.status === 'COMPLETED' ? 'success' : s.status === 'PENDING' ? 'warning' : 'info'}">${s.status}</span>
              </div>`).join('') || '<div class="table-empty">No data</div>'}
          </div>
          <div class="widget-card">
            <div class="widget-title">Low Stock Alerts</div>
            ${(products || []).filter(p => p.stockQuantity <= p.minStock).slice(0, 5).map(p => `
              <div class="recent-item">
                <span class="recent-name">${p.name}</span>
                <span class="badge badge-danger">Qty: ${p.stockQuantity}</span>
              </div>`).join('') || '<div class="table-empty">No low stock items</div>'}
          </div>
          <div class="widget-card">
            <div class="widget-title">AMC Expiring Soon</div>
            ${(amc || []).filter(a => a.status === 'ACTIVE').slice(0, 5).map(a => `
              <div class="recent-item">
                <span class="recent-name">${a.customer?.name || '—'}</span>
                <span class="recent-date">${a.endDate || '—'}</span>
              </div>`).join('') || '<div class="table-empty">No data</div>'}
          </div>
        </div>`;
        } catch (err) {
            el.innerHTML = `<div class="error-msg">Failed to load dashboard: ${err.message}</div>`;
        }
    }

    navigate('dashboard');
})();