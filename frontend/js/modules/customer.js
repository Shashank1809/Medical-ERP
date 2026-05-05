async function renderCustomers() {
    const el = document.getElementById('pageContent');
    el.innerHTML = `
    <div class="page-header">
      <h2>Customer Master</h2>
      <button class="btn-add" onclick="openCustomerForm()">&#43; Add Customer</button>
    </div>
    <div class="filter-bar">
      <div class="filter-group"><label>Search</label><input type="text" id="custSearch" placeholder="Name or City"/></div>
      <div class="filter-group"><label>Status</label>
        <select id="custStatus"><option value="">All</option><option>ACTIVE</option><option>INACTIVE</option></select>
      </div>
      <button class="btn-filter" onclick="loadCustomers()">Search</button>
      <button class="btn-reset" onclick="resetCustomerFilters()">Reset</button>
    </div>
    <div class="table-card"><div class="table-scroll">
      <table><thead><tr>
        <th>#</th><th>Code</th><th>Name</th><th>Contact Person</th>
        <th>Phone</th><th>City</th><th>GST No</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody id="customerTableBody"><tr><td colspan="9" class="table-empty">Loading...</td></tr></tbody>
      </table>
    </div></div>`;
    loadCustomers();
}

async function loadCustomers() {
    const search = document.getElementById('custSearch')?.value || '';
    const status = document.getElementById('custStatus')?.value || '';
    let ep = '/customers?';
    if (search) ep += `search=${encodeURIComponent(search)}&`;
    if (status) ep += `status=${status}`;
    try {
        const data = await api.get(ep);
        const tbody = document.getElementById('customerTableBody');
        if (!data || !data.length) { tbody.innerHTML = '<tr><td colspan="9" class="table-empty">No customers found</td></tr>'; return; }
        tbody.innerHTML = data.map((c, i) => `
      <tr>
        <td>${i+1}</td>
        <td><strong>${c.customerCode || '—'}</strong></td>
        <td>${c.name}</td>
        <td>${c.contactPerson || '—'}</td>
        <td>${c.phone || '—'}</td>
        <td>${c.city || '—'}</td>
        <td>${c.gstNumber || '—'}</td>
        <td><span class="badge badge-${c.status === 'ACTIVE' ? 'success' : 'secondary'}">${c.status}</span></td>
        <td class="action-btns">
          <button class="btn-edit" onclick="openCustomerForm(${JSON.stringify(c).replace(/"/g,'&quot;')})">Edit</button>
          <button class="btn-delete" onclick="deleteCustomer(${c.id})">Delete</button>
        </td>
      </tr>`).join('');
    } catch (e) { document.getElementById('customerTableBody').innerHTML = `<tr><td colspan="9" class="table-empty">${e.message}</td></tr>`; }
}

function resetCustomerFilters() {
    document.getElementById('custSearch').value = '';
    document.getElementById('custStatus').value = '';
    loadCustomers();
}

function openCustomerForm(c = null) {
    const isEdit = !!c;
    openModal(isEdit ? 'Edit Customer' : 'Add Customer', `
    <div class="form-row">
      <div class="form-group"><label>Name *</label><input id="cf_name" value="${c?.name || ''}" required/></div>
      <div class="form-group"><label>Contact Person</label><input id="cf_contact" value="${c?.contactPerson || ''}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Phone</label><input id="cf_phone" value="${c?.phone || ''}"/></div>
      <div class="form-group"><label>Email</label><input id="cf_email" type="email" value="${c?.email || ''}"/></div>
    </div>
    <div class="form-group"><label>Address</label><textarea id="cf_address">${c?.address || ''}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label>City</label><input id="cf_city" value="${c?.city || ''}"/></div>
      <div class="form-group"><label>State</label><input id="cf_state" value="${c?.state || ''}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Pincode</label><input id="cf_pin" value="${c?.pincode || ''}"/></div>
      <div class="form-group"><label>GST Number</label><input id="cf_gst" value="${c?.gstNumber || ''}"/></div>
    </div>
    <div class="form-group"><label>Status</label>
      <select id="cf_status"><option ${c?.status==='ACTIVE'?'selected':''}>ACTIVE</option><option ${c?.status==='INACTIVE'?'selected':''}>INACTIVE</option></select>
    </div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveCustomer(${c?.id || 'null'})">${isEdit ? 'Update' : 'Save'}</button>
    </div>`);
}

async function saveCustomer(id) {
    const payload = {
        name: document.getElementById('cf_name').value,
        contactPerson: document.getElementById('cf_contact').value,
        phone: document.getElementById('cf_phone').value,
        email: document.getElementById('cf_email').value,
        address: document.getElementById('cf_address').value,
        city: document.getElementById('cf_city').value,
        state: document.getElementById('cf_state').value,
        pincode: document.getElementById('cf_pin').value,
        gstNumber: document.getElementById('cf_gst').value,
        status: document.getElementById('cf_status').value
    };
    if (!payload.name) { alert('Name is required'); return; }
    try {
        if (id) await api.put(`/customers/${id}`, payload);
        else await api.post('/customers', payload);
        closeModal(); loadCustomers();
    } catch (e) { alert('Error: ' + e.message); }
}

async function deleteCustomer(id) {
    if (!confirm('Delete this customer?')) return;
    try { await api.delete(`/customers/${id}`); loadCustomers(); }
    catch (e) { alert('Error: ' + e.message); }
}