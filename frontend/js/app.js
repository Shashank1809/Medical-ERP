// Import rendering functions from your modules
import { renderCustomers, loadCustomers, resetCustomerFilters, openCustomerForm, saveCustomer, deleteCustomer } from './modules/customers.js';
import { renderProducts, loadProducts, resetProductFilters, openProductForm, saveProduct, deleteProduct } from './modules/products.js';
import { renderCategories, loadCategories, openCategoryForm, saveCategory, deleteCategory } from './modules/categories.js';
import { renderQuotation, loadQuotations, openQuotationForm, saveQuotation, deleteQuotation } from './modules/quotation.js';
import { renderAMC, loadAMC, openAMCForm, saveAMC, deleteAMC } from './modules/amc.js';
import { renderSalary, loadSalary, openSalaryForm, saveSalary, deleteSalary, resetSalaryFilters } from './modules/salary.js';
import { renderServices, loadServices, openServiceForm, saveService, deleteService } from './modules/services.js';

// Expose functions globally for onclick handlers
window.renderCustomers = renderCustomers;
window.loadCustomers = loadCustomers;
window.resetCustomerFilters = resetCustomerFilters;
window.openCustomerForm = openCustomerForm;
window.saveCustomer = saveCustomer;
window.deleteCustomer = deleteCustomer;

window.renderProducts = renderProducts;
window.loadProducts = loadProducts;
window.resetProductFilters = resetProductFilters;
window.openProductForm = openProductForm;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;

window.renderCategories = renderCategories;
window.loadCategories = loadCategories;
window.openCategoryForm = openCategoryForm;
window.saveCategory = saveCategory;
window.deleteCategory = deleteCategory;

window.renderQuotation = renderQuotation;
window.loadQuotations = loadQuotations;
window.openQuotationForm = openQuotationForm;
window.saveQuotation = saveQuotation;
window.deleteQuotation = deleteQuotation;

window.renderAMC = renderAMC;
window.loadAMC = loadAMC;
window.openAMCForm = openAMCForm;
window.saveAMC = saveAMC;
window.deleteAMC = deleteAMC;

window.renderSalary = renderSalary;
window.loadSalary = loadSalary;
window.openSalaryForm = openSalaryForm;
window.saveSalary = saveSalary;
window.deleteSalary = deleteSalary;
window.resetSalaryFilters = resetSalaryFilters;

window.renderServices = renderServices;
window.loadServices = loadServices;
window.openServiceForm = openServiceForm;
window.saveService = saveService;
window.deleteService = deleteService;

// 1. Unified Auth Check with Path Normalization
function checkAuth() {
    const token = localStorage.getItem('token');
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('index') || window.location.pathname.endsWith('/');

    console.log("Checking Auth - Path:", path, "| Token Exists:", !!token);

    if (!token && !isLoginPage) {
        console.log("Redirecting to Login...");
        window.location.replace('index.html');
        return false; // STOP EXECUTION
    }

    if (token && isLoginPage) {
        console.log("Redirecting to Dashboard...");
        window.location.replace('dashboard.html');
        return false; // STOP EXECUTION
    }

    return true;
}

// 2. Expose module functions globally for onclick handlers
(async function init() {
    // RUN AUTH CHECK FIRST
    if (!checkAuth()) return;

    // Load User Data into UI
    const userData = localStorage.getItem('erp_user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (document.getElementById('adminName')) {
                document.getElementById('adminName').textContent = user.fullName || user.username || 'Admin';
            }
            if (document.getElementById('adminAvatar')) {
                document.getElementById('adminAvatar').textContent = (user.fullName || 'A')[0].toUpperCase();
            }
        } catch (e) {
            console.error("Error parsing user data", e);
        }
    }

    // 3. Define Global Navigation
    window.navigate = function (page) {
        // Update Sidebar Active State
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Update Page Titles
        const titles = {
            dashboard: 'Dashboard',
            customers: 'Customer Master',
            services: 'Customer Services',
            products: 'Product Stock',
            salary: 'Salary & Wages',
            categories: 'Product Category',
            quotations: 'Quotation Master',
            amc: 'AMC Records'
        };

        const titleEl = document.getElementById('pageTitle') || document.getElementById('page-title');
        if (titleEl) titleEl.textContent = titles[page] || page;

        // Set Loading State
        const contentArea = document.getElementById('pageContent') || document.getElementById('main-content');
        if (contentArea) {
            contentArea.innerHTML = '<div style="padding:2rem;text-align:center;color:#aaa">Loading...</div>';
        }

        // Routing Logic
        const pages = {
            dashboard: renderDashboard,
            customers: renderCustomers,
            services: renderServices,
            products: renderProducts,
            salary: renderSalary,
            categories: renderCategories,
            quotations: renderQuotation,
            amc: renderAMC
        };

        if (pages[page]) {
            pages[page]();
        }
    };

    // 4. Global UI Helpers
    window.toggleSidebar = () => document.getElementById('sidebar')?.classList.toggle('open');

    window.logout = () => {
        localStorage.removeItem('token'); // Only remove auth keys
        localStorage.removeItem('erp_user');
        window.location.replace('index.html');
    };

    window.openModal = (title, bodyHTML) => {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalBody').innerHTML = bodyHTML;
            overlay.classList.add('open');
        }
    };

    window.closeModal = (e) => {
        const overlay = document.getElementById('modalOverlay');
        if (!e || e.target === overlay) overlay?.classList.remove('open');
    };

    // 5. Run initial navigation ONLY if on dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        window.navigate('dashboard');
    }
})();

// ==================== DASHBOARD RENDERER ====================
async function renderDashboard() {
    const el = document.getElementById('pageContent') || document.getElementById('main-content');
    if (!el) return;

    try {
        const [customers, products, services, amc] = await Promise.all([
            api.get('/customers'), api.get('/products'),
            api.get('/customer-services'), api.get('/amc')
        ]);

        const lowStock = (products || []).filter(p => p.stockQuantity <= p.minStock).length;
        const activeAMC = (amc || []).filter(a => a.status === 'ACTIVE').length;
        const pendingSvc = (services || []).filter(s => s.status === 'PENDING').length;

        el.innerHTML = `
            <div class="row">
                <div class="col-md-3"><div class="card bg-primary text-white p-3">Customers: ${(customers || []).length}</div></div>
                <div class="col-md-3"><div class="card bg-danger text-white p-3">Low Stock: ${lowStock}</div></div>
                <div class="col-md-3"><div class="card bg-warning text-dark p-3">Pending Service: ${pendingSvc}</div></div>
                <div class="col-md-3"><div class="card bg-success text-white p-3">Active AMCs: ${activeAMC}</div></div>
            </div>`;
    } catch (err) {
        el.innerHTML = `<div class="alert alert-danger">Dashboard Error: ${err.message}</div>`;
    }
}










// import { renderCustomers } from './modules/customers.js';
// import { renderProducts } from './modules/products.js';
// import { renderCategories } from './modules/categories.js';
// import { renderAMC } from './modules/amc.js';
// import { renderSalary } from './modules/salary.js';
// import { renderServices } from './modules/services.js';
// import { renderQuotation } from './modules/quotation.js';
//
// (function () {
//     // 1. Unified Auth Check
//     const token = localStorage.getItem('token');
//     if (!token && !window.location.pathname.endsWith('index.html')) {
//         window.location.href = 'index.html';
//         return;
//     }
//
//     // 2. Set User UI Info
//     const user = JSON.parse(localStorage.getItem('erp_user') || '{}');
//     if (document.getElementById('adminName')) {
//         document.getElementById('adminName').textContent = user.fullName || user.username || 'Admin';
//         document.getElementById('adminAvatar').textContent = (user.fullName || 'A')[0].toUpperCase();
//     }
//
//     // 3. Define the Navigation Logic
//     window.navigate = function (page) {
//         // Update active class in sidebar
//         document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
//         const activeLink = document.querySelector(`[data-page="${page}"]`);
//         if (activeLink) activeLink.classList.add('active');
//
//         // Update Title
//         const titles = {
//             dashboard: 'Dashboard',
//             customers: 'Customer Master',
//             services: 'Customer Services',
//             products: 'Product Stock',
//             salary: 'Salary & Wages',
//             categories: 'Product Category',
//             quotations: 'Quotation Master',
//             amc: 'AMC Records'
//         };
//         const titleEl = document.getElementById('pageTitle') || document.getElementById('page-title');
//         if (titleEl) titleEl.textContent = titles[page] || page;
//
//         // Set Loading State
//         const contentArea = document.getElementById('pageContent') || document.getElementById('main-content');
//         contentArea.innerHTML = '<div style="padding:2rem;text-align:center;color:#aaa">Loading...</div>';
//
//         // Route to specific module
//         const pages = {
//             dashboard: renderDashboard,
//             customers: renderCustomers,
//             services: renderServices,
//             products: renderProducts,
//             salary: renderSalary,
//             categories: renderCategories,
//             quotations: renderQuotation,
//             amc: renderAMC
//         };
//
//         if (pages[page]) {
//             pages[page]();
//         } else {
//             contentArea.innerHTML = '<h3>Page Not Found</h3>';
//         }
//     };
//
//     window.toggleSidebar = function () {
//         const sidebar = document.getElementById('sidebar');
//         if (sidebar) sidebar.classList.toggle('open');
//     };
//
//     window.logout = function () {
//         localStorage.clear();
//         window.location.href = 'index.html';
//     };
//
//     // ==================== DASHBOARD RENDERER ====================
//     async function renderDashboard() {
//         const el = document.getElementById('pageContent') || document.getElementById('main-content');
//         try {
//             // api is assumed to be defined in api.js loaded in dashboard.html
//             const [customers, products, services, amc] = await Promise.all([
//                 api.get('/customers'), api.get('/products'),
//                 api.get('/customer-services'), api.get('/amc')
//             ]);
//
//             const lowStock = (products || []).filter(p => p.stockQuantity <= p.minStock).length;
//             const activeAMC = (amc || []).filter(a => a.status === 'ACTIVE').length;
//             const pendingSvc = (services || []).filter(s => s.status === 'PENDING').length;
//
//             el.innerHTML = `
//                 <div class="row">
//                     <div class="col-md-3">
//                         <div class="card bg-primary text-white mb-4">
//                             <div class="card-body">Customers: ${(customers || []).length}</div>
//                         </div>
//                     </div>
//                     <div class="col-md-3">
//                         <div class="card bg-danger text-white mb-4">
//                             <div class="card-body">Low Stock: ${lowStock}</div>
//                         </div>
//                     </div>
//                     <div class="col-md-3">
//                         <div class="card bg-warning text-dark mb-4">
//                             <div class="card-body">Pending Services: ${pendingSvc}</div>
//                         </div>
//                     </div>
//                     <div class="col-md-3">
//                         <div class="card bg-success text-white mb-4">
//                             <div class="card-body">Active AMCs: ${activeAMC}</div>
//                         </div>
//                     </div>
//                 </div>
//             `;
//         } catch (err) {
//             el.innerHTML = `<div class="alert alert-danger">Failed to load dashboard: ${err.message}</div>`;
//         }
//     }
//
//     // Start on Dashboard
//     window.navigate('dashboard');
// })();















// import { renderCustomers } from './modules/customers.js';
// import { renderProducts } from './modules/products.js';
// import { navigate, toggleSidebar } from './app.js';
//
// (function () {
//     // Auth check
//     if (!localStorage.getItem('erp_token')) {
//         window.location.href = 'index.html'; return;
//     }
//
//     const user = JSON.parse(localStorage.getItem('erp_user') || '{}');
//     document.getElementById('adminName').textContent = user.fullName || user.username || 'Admin';
//     document.getElementById('adminAvatar').textContent = (user.fullName || 'A')[0].toUpperCase();
//     document.getElementById('topbarUser').textContent = user.fullName || '';
//
//     window.navigate = function (page) {
//         document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
//         document.querySelector(`[data-page="${page}"]`).classList.add('active');
//         const titles = {
//             dashboard: 'Dashboard', customers: 'Customer Master',
//             services: 'Customer Services', products: 'Product Stock',
//             salary: 'Salary & Wages', categories: 'Product Category',
//             quotations: 'Quotation Master', amc: 'AMC Records'
//         };
//         document.getElementById('pageTitle').textContent = titles[page] || page;
//         document.getElementById('pageContent').innerHTML = '<div style="padding:2rem;text-align:center;color:#aaa">Loading...</div>';
//
//         const pages = { dashboard: renderDashboard, customers: renderCustomers, services: renderServices,
//             products: renderProducts, salary: renderSalary, categories: renderCategories,
//             quotations: renderQuotations, amc: renderAMC };
//         if (pages[page]) pages[page]();
//     };
//
//     window.logout = function () {
//         localStorage.clear();
//         window.location.href = 'index.html';
//     };
//
//     window.toggleSidebar = function () {
//         document.getElementById('sidebar').classList.toggle('open');
//     };
//
//     window.openModal = function (title, bodyHTML) {
//         document.getElementById('modalTitle').textContent = title;
//         document.getElementById('modalBody').innerHTML = bodyHTML;
//         document.getElementById('modalOverlay').classList.add('open');
//     };
//
//     window.closeModal = function (e) {
//         if (!e || e.target === document.getElementById('modalOverlay'))
//             document.getElementById('modalOverlay').classList.remove('open');
//     };
//
//     // ==================== DASHBOARD ====================
//     async function renderDashboard() {
//         const el = document.getElementById('pageContent');
//         try {
//             const [customers, products, services, amc] = await Promise.all([
//                 api.get('/customers'), api.get('/products'),
//                 api.get('/customer-services'), api.get('/amc')
//             ]);
//             const lowStock = (products || []).filter(p => p.stockQuantity <= p.minStock).length;
//             const activeAMC = (amc || []).filter(a => a.status === 'ACTIVE').length;
//             const pendingSvc = (services || []).filter(s => s.status === 'PENDING').length;
//
//             el.innerHTML = `
//         <div class="stats-grid">
//           <div class="stat-card">
//             <div class="stat-icon">&#128100;</div>
//             <div class="stat-label">Total Customers</div>
//             <div class="stat-value">${(customers || []).length}</div>
//             <div class="stat-sub">Registered customers</div>
//           </div>
//           <div class="stat-card">
//             <div class="stat-icon">&#128230;</div>
//             <div class="stat-label">Products</div>
//             <div class="stat-value">${(products || []).length}</div>
//             <div class="stat-sub" style="color:${lowStock > 0 ? '#e63946' : '#0f3460'}">${lowStock} low stock</div>
//           </div>
//           <div class="stat-card">
//             <div class="stat-icon">&#128295;</div>
//             <div class="stat-label">Service Calls</div>
//             <div class="stat-value">${(services || []).length}</div>
//             <div class="stat-sub" style="color:#f57f17">${pendingSvc} pending</div>
//           </div>
//           <div class="stat-card">
//             <div class="stat-icon">&#128337;</div>
//             <div class="stat-label">AMC Contracts</div>
//             <div class="stat-value">${(amc || []).length}</div>
//             <div class="stat-sub" style="color:#2e7d32">${activeAMC} active</div>
//           </div>
//         </div>
//         <div class="dashboard-grid">
//           <div class="widget-card">
//             <div class="widget-title">Recent Customers</div>
//             ${(customers || []).slice(-5).reverse().map(c => `
//               <div class="recent-item">
//                 <span class="recent-name">${c.name}</span>
//                 <span class="recent-date">${c.city || '—'}</span>
//               </div>`).join('') || '<div class="table-empty">No data</div>'}
//           </div>
//           <div class="widget-card">
//             <div class="widget-title">Recent Service Calls</div>
//             ${(services || []).slice(-5).reverse().map(s => `
//               <div class="recent-item">
//                 <span class="recent-name">${s.customer?.name || '—'}</span>
//                 <span class="badge badge-${s.status === 'COMPLETED' ? 'success' : s.status === 'PENDING' ? 'warning' : 'info'}">${s.status}</span>
//               </div>`).join('') || '<div class="table-empty">No data</div>'}
//           </div>
//           <div class="widget-card">
//             <div class="widget-title">Low Stock Alerts</div>
//             ${(products || []).filter(p => p.stockQuantity <= p.minStock).slice(0, 5).map(p => `
//               <div class="recent-item">
//                 <span class="recent-name">${p.name}</span>
//                 <span class="badge badge-danger">Qty: ${p.stockQuantity}</span>
//               </div>`).join('') || '<div class="table-empty">No low stock items</div>'}
//           </div>
//           <div class="widget-card">
//             <div class="widget-title">AMC Expiring Soon</div>
//             ${(amc || []).filter(a => a.status === 'ACTIVE').slice(0, 5).map(a => `
//               <div class="recent-item">
//                 <span class="recent-name">${a.customer?.name || '—'}</span>
//                 <span class="recent-date">${a.endDate || '—'}</span>
//               </div>`).join('') || '<div class="table-empty">No data</div>'}
//           </div>
//         </div>`;
//         } catch (err) {
//             el.innerHTML = `<div class="error-msg">Failed to load dashboard: ${err.message}</div>`;
//         }
//     }
//
//     navigate('dashboard');
// })();