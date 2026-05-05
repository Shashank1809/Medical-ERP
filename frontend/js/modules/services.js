export async function renderServices() {
    const el = document.getElementById('pageContent');
    el.innerHTML = `
    <div class="page-header">
      <h2>Customer Services</h2>
      <button class="btn-add" onclick="openServiceForm()">&#43; Add Service</button>
    </div>
    <div class="filter-bar">
      <div class="filter-group"><label>Status</label>
        <select id="svcStatus"><option value="">All</option><option>PENDING</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option></select>
      </div>
      <button class="btn-filter" onclick="loadServices()">Filter</button>
      <button class="btn-reset" onclick="document.getElementById('svcStatus').value='';loadServices()">Reset</button>
    </div>
    <div class="table-card"><div class="table-scroll">
      <table><thead><tr>
        <th>#</th><th>Customer</th><th>Service Date</th><th>Type</th>
        <th>Technician</th><th>Amount</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody id="serviceTableBody"><tr><td colspan="8" class="table-empty">Loading...</td></tr></tbody>
      </table>
    </div></div>`;
    loadServices();
}

export async function loadServices() {
    const status = document.getElementById('svcStatus')?.value || '';
    let ep = '/customer-services?' + (status ? `status=${status}` : '');
    try {
        const data = await api.get(ep);
        const tbody = document.getElementById('serviceTableBody');
        if (!data?.length) { tbody.innerHTML = '<tr><td colspan="8" class="table-empty">No services found</td></tr>'; return; }
        tbody.innerHTML = data.map((s, i) => `
      <tr>
        <td>${i+1}</td>
        <td>${s.customer?.name || '—'}</td>
        <td>${s.serviceDate || '—'}</td>
        <td>${s.serviceType || '—'}</td>
        <td>${s.technicianName || '—'}</td>
        <td>&#8377; ${s.amount?.toLocaleString('en-IN') || '0'}</td>
        <td><span class="badge badge-${s.status==='COMPLETED'?'success':s.status==='PENDING'?'warning':s.status==='CANCELLED'?'danger':'info'}">${s.status}</span></td>
        <td class="action-btns">
          <button class="btn-edit" onclick="openServiceForm(${JSON.stringify(s).replace(/"/g,'&quot;')})">Edit</button>
          <button class="btn-delete" onclick="deleteService(${s.id})">Delete</button>
        </td>
      </tr>`).join('');
    } catch (e) { document.getElementById('serviceTableBody').innerHTML = `<tr><td colspan="8" class="table-empty">${e.message}</td></tr>`; }
}

export async function openServiceForm(s = null) {
    const customers = await api.get('/customers');
    const isEdit = !!s;
    openModal(isEdit ? 'Edit Service' : 'Add Service Call', `
    <div class="form-group"><label>Customer *</label>
      <select id="sf_cust">
        <option value="">Select Customer</option>
        ${(customers||[]).map(c => `<option value="${c.id}" ${s?.customer?.id==c.id?'selected':''}>${c.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Service Date</label><input type="date" id="sf_date" value="${s?.serviceDate||''}"/></div>
      <div class="form-group"><label>Service Type</label><input id="sf_type" value="${s?.serviceType||''}"/></div>
    </div>
    <div class="form-group"><label>Description</label><textarea id="sf_desc">${s?.description||''}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label>Technician</label><input id="sf_tech" value="${s?.technicianName||''}"/></div>
      <div class="form-group"><label>Amount (&#8377;)</label><input type="number" id="sf_amt" value="${s?.amount||''}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Status</label>
        <select id="sf_status">
          ${['PENDING','IN_PROGRESS','COMPLETED','CANCELLED'].map(st => `<option ${s?.status===st?'selected':''}>${st}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Remarks</label><input id="sf_remarks" value="${s?.remarks||''}"/></div>
    </div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveService(${s?.id||'null'})">${isEdit?'Update':'Save'}</button>
    </div>`);
}

export async function saveService(id) {
    const custId = document.getElementById('sf_cust').value;
    if (!custId) { alert('Please select a customer'); return; }
    const payload = {
        customer: { id: parseInt(custId) },
        serviceDate: document.getElementById('sf_date').value,
        serviceType: document.getElementById('sf_type').value,
        description: document.getElementById('sf_desc').value,
        technicianName: document.getElementById('sf_tech').value,
        amount: parseFloat(document.getElementById('sf_amt').value) || 0,
        status: document.getElementById('sf_status').value,
        remarks: document.getElementById('sf_remarks').value
    };
    try {
        if (id) await api.put(`/customer-services/${id}`, payload);
        else await api.post('/customer-services', payload);
        closeModal(); loadServices();
    } catch (e) { alert('Error: ' + e.message); }
}

export async function deleteService(id) {
    if (!confirm('Delete this service record?')) return;
    try { await api.delete(`/customer-services/${id}`); loadServices(); }
    catch (e) { alert('Error: ' + e.message); }
}