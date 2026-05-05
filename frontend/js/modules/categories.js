async function renderCategories() {
    const el = document.getElementById('pageContent');
    el.innerHTML = `
    <div class="page-header">
      <h2>Product Categories</h2>
      <button class="btn-add" onclick="openCategoryForm()">&#43; Add Category</button>
    </div>
    <div class="table-card"><div class="table-scroll">
      <table><thead><tr><th>#</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
      <tbody id="catTableBody"><tr><td colspan="4" class="table-empty">Loading...</td></tr></tbody>
      </table>
    </div></div>`;
    loadCategories();
}

async function loadCategories() {
    try {
        const data = await api.get('/product-categories');
        const tbody = document.getElementById('catTableBody');
        if (!data?.length) { tbody.innerHTML = '<tr><td colspan="4" class="table-empty">No categories found</td></tr>'; return; }
        tbody.innerHTML = data.map((c, i) => `
      <tr>
        <td>${i+1}</td><td><strong>${c.name}</strong></td><td>${c.description||'—'}</td>
        <td class="action-btns">
          <button class="btn-edit" onclick="openCategoryForm(${JSON.stringify(c).replace(/"/g,'&quot;')})">Edit</button>
          <button class="btn-delete" onclick="deleteCategory(${c.id})">Delete</button>
        </td>
      </tr>`).join('');
    } catch(e) { document.getElementById('catTableBody').innerHTML = `<tr><td colspan="4" class="table-empty">${e.message}</td></tr>`; }
}

function openCategoryForm(c = null) {
    openModal(c ? 'Edit Category' : 'Add Category', `
    <div class="form-group"><label>Name *</label><input id="catf_name" value="${c?.name||''}"/></div>
    <div class="form-group"><label>Description</label><textarea id="catf_desc">${c?.description||''}</textarea></div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveCategory(${c?.id||'null'})">${c?'Update':'Save'}</button>
    </div>`);
}

async function saveCategory(id) {
    const name = document.getElementById('catf_name').value;
    if (!name) { alert('Name required'); return; }
    const payload = { name, description: document.getElementById('catf_desc').value };
    try {
        if (id) await api.put(`/product-categories/${id}`, payload);
        else await api.post('/product-categories', payload);
        closeModal(); loadCategories();
    } catch(e) { alert('Error: ' + e.message); }
}

async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    try { await api.delete(`/product-categories/${id}`); loadCategories(); }
    catch(e) { alert('Error: ' + e.message); }
}