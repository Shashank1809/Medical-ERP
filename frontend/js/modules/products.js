async function renderProducts() {
    const el = document.getElementById('pageContent');
    const cats = await api.get('/product-categories');
    el.innerHTML = `
    <div class="page-header">
      <h2>Product Stock</h2>
      <button class="btn-add" onclick="openProductForm()">&#43; Add Product</button>
    </div>
    <div class="filter-bar">
      <div class="filter-group"><label>Search</label><input type="text" id="prodSearch" placeholder="Product name"/></div>
      <div class="filter-group"><label>Category</label>
        <select id="prodCat"><option value="">All Categories</option>
        ${(cats||[]).map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select>
      </div>
      <div class="filter-group"><label>Status</label>
        <select id="prodStatus"><option value="">All</option><option>ACTIVE</option><option>INACTIVE</option></select>
      </div>
      <button class="btn-filter" onclick="loadProducts()">Search</button>
      <button class="btn-reset" onclick="resetProductFilters()">Reset</button>
    </div>
    <div class="table-card"><div class="table-scroll">
      <table><thead><tr>
        <th>#</th><th>Code</th><th>Name</th><th>Category</th><th>Unit</th>
        <th>Purchase &#8377;</th><th>Selling &#8377;</th><th>Stock</th><th>GST %</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody id="prodTableBody"><tr><td colspan="11" class="table-empty">Loading...</td></tr></tbody>
      </table>
    </div></div>`;
    window._prodCats = cats;
    loadProducts();
}

async function loadProducts() {
    const search = document.getElementById('prodSearch')?.value || '';
    const cat = document.getElementById('prodCat')?.value || '';
    const status = document.getElementById('prodStatus')?.value || '';
    let ep = '/products?';
    if (search) ep += `search=${encodeURIComponent(search)}&`;
    if (cat) ep += `categoryId=${cat}&`;
    if (status) ep += `status=${status}`;
    try {
        const data = await api.get(ep);
        const tbody = document.getElementById('prodTableBody');
        if (!data?.length) { tbody.innerHTML = '<tr><td colspan="11" class="table-empty">No products found</td></tr>'; return; }
        tbody.innerHTML = data.map((p, i) => `
      <tr>
        <td>${i+1}</td>
        <td><strong>${p.productCode||'—'}</strong></td>
        <td>${p.name}</td>
        <td>${p.category?.name||'—'}</td>
        <td>${p.unit||'—'}</td>
        <td>&#8377;${p.purchasePrice?.toLocaleString('en-IN')||0}</td>
        <td>&#8377;${p.sellingPrice?.toLocaleString('en-IN')||0}</td>
        <td><span class="badge badge-${p.stockQuantity<=p.minStock?'danger':'success'}">${p.stockQuantity}</span></td>
        <td>${p.gstRate||0}%</td>
        <td><span class="badge badge-${p.status==='ACTIVE'?'success':'secondary'}">${p.status}</span></td>
        <td class="action-btns">
          <button class="btn-edit" onclick="openProductForm(${JSON.stringify(p).replace(/"/g,'&quot;')})">Edit</button>
          <button class="btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>`).join('');
    } catch(e) { document.getElementById('prodTableBody').innerHTML = `<tr><td colspan="11" class="table-empty">${e.message}</td></tr>`; }
}

function resetProductFilters() {
    ['prodSearch','prodCat','prodStatus'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
    loadProducts();
}

async function openProductForm(p = null) {
    const cats = window._prodCats || await api.get('/product-categories');
    openModal(p ? 'Edit Product' : 'Add Product', `
    <div class="form-row">
      <div class="form-group"><label>Name *</label><input id="pf_name" value="${p?.name||''}"/></div>
      <div class="form-group"><label>Category</label>
        <select id="pf_cat">
          <option value="">Select Category</option>
          ${cats.map(c=>`<option value="${c.id}" ${p?.category?.id==c.id?'selected':''}>${c.name}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Unit</label><input id="pf_unit" value="${p?.unit||''}"/></div>
      <div class="form-group"><label>HSN Code</label><input id="pf_hsn" value="${p?.hsnCode||''}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Purchase Price (&#8377;)</label><input type="number" id="pf_pp" value="${p?.purchasePrice||''}"/></div>
      <div class="form-group"><label>Selling Price (&#8377;)</label><input type="number" id="pf_sp" value="${p?.sellingPrice||''}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Stock Quantity</label><input type="number" id="pf_stock" value="${p?.stockQuantity||0}"/></div>
      <div class="form-group"><label>Min Stock Alert</label><input type="number" id="pf_minstock" value="${p?.minStock||0}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>GST Rate (%)</label><input type="number" id="pf_gst" value="${p?.gstRate||0}"/></div>
      <div class="form-group"><label>Status</label>
        <select id="pf_status"><option ${p?.status==='ACTIVE'?'selected':''}>ACTIVE</option><option ${p?.status==='INACTIVE'?'selected':''}>INACTIVE</option></select>
      </div>
    </div>
    <div class="form-group"><label>Description</label><textarea id="pf_desc">${p?.description||''}</textarea></div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveProduct(${p?.id||'null'})">${p?'Update':'Save'}</button>
    </div>`);
}

async function saveProduct(id) {
    const catId = document.getElementById('pf_cat').value;
    const payload = {
        name: document.getElementById('pf_name').value,
        category: catId ? { id: parseInt(catId) } : null,
        unit: document.getElementById('pf_unit').value,
        hsnCode: document.getElementById('pf_hsn').value,
        purchasePrice: parseFloat(document.getElementById('pf_pp').value)||0,
        sellingPrice: parseFloat(document.getElementById('pf_sp').value)||0,
        stockQuantity: parseInt(document.getElementById('pf_stock').value)||0,
        minStock: parseInt(document.getElementById('pf_minstock').value)||0,
        gstRate: parseFloat(document.getElementById('pf_gst').value)||0,
        status: document.getElementById('pf_status').value,
        description: document.getElementById('pf_desc').value
    };
    if (!payload.name) { alert('Name is required'); return; }
    try {
        if (id) await api.put(`/products/${id}`, payload);
        else await api.post('/products', payload);
        closeModal(); loadProducts();
    } catch(e) { alert('Error: ' + e.message); }
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); loadProducts(); }
    catch(e) { alert('Error: ' + e.message); }
}