async function renderAMC() {
    const el = document.getElementById('pageContent');
    el.innerHTML = `
    <div class="page-header">
      <h2>AMC Records</h2>
      <button class="btn-add" onclick="openAMCForm()">&#43; New AMC</button>
    </div>
    <div class="filter-bar">
      <div class="filter-group"><label>Status</label>
        <select id="amcStatus"><option value="">All</option><option>ACTIVE</option><option>EXPIRED</option><option>CANCELLED</option></select>
      </div>
      <button class="btn-filter" onclick="loadAMC()">Filter</button>
      <button class="btn-reset" onclick="document.getElementById('amcStatus').value='';loadAMC()">Reset</button>
    </div>
    <div class="table-card"><div class="table-scroll">
      <table><thead><tr>
        <th>#</th><th>AMC No</th><th>Customer</th><th>Product</th>
        <th>Start Date</th><th>End Date</th><th>Amount</th>
        <th>Visits</th><th>Technician</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody id="amcTableBody"><tr><td colspan="11" class="table-empty">Loading...</td></tr></tbody>
      </table>
    </div></div>`;
    loadAMC();
}

async function loadAMC() {
    const status = document.getElementById('amcStatus')?.value || '';
    let ep = '/amc?' + (status ? `status=${status}` : '');
    try {
        const data = await api.get(ep);
        const tbody = document.getElementById('amcTableBody');
        if (!data?.length) { tbody.innerHTML = '<tr><td colspan="11" class="table-empty">No AMC records found</td></tr>'; return; }
        tbody.innerHTML = data.map((a, i) => `
      <tr>
        <td>${i+1}</td>
        <td><strong>${a.amcNumber||'—'}</strong></td>
        <td>${a.customer?.name||'—'}</td>
        <td>${a.product?.name||'—'}</td>
        <td>${a.startDate||'—'}</td>
        <td>${a.endDate||'—'}</td>
        <td>&#8377;${a.amcAmount?.toLocaleString('en-IN')||0}</td>
        <td>${a.visitsCompleted||0}/${a.totalVisits||0}</td>
        <td>${a.technicianName||'—'}</td>
        <td><span class="badge badge-${a.status==='ACTIVE'?'success':a.status==='EXPIRED'?'warning':'danger'}">${a.status}</span></td>
        <td class="action-btns">
          <button class="btn-edit" onclick="openAMCForm(${JSON.stringify(a).replace(/"/g,'&quot;')})">Edit</button>
          <button class="btn-delete" onclick="deleteAMC(${a.id})">Delete</button>
        </td>
      </tr>`).join('');
    } catch(e) { document.getElementById('amcTableBody').innerHTML = `<tr><td colspan="11" class="table-empty">${e.message}</td></tr>`; }
}

async function openAMCForm(a = null) {
    const [customers, products] = await Promise.all([api.get('/customers'), api.get('/products')]);
    openModal(a ? 'Edit AMC Record' : 'New AMC Contract', `
    <div class="form-row">
      <div class="form-group"><label>Customer *</label>
        <select id="af_cust">
          <option value="">Select Customer</option>
          ${(customers||[]).map(c=>`<option value="${c.id}" ${a?.customer?.id==c.id?'selected':''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Product/Equipment</label>
        <select id="af_prod">
          <option value="">Select Product</option>
          ${(products||[]).map(p=>`<option value="${p.id}" ${a?.product?.id==p.id?'selected':''}>${p.name}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Start Date</label><input type="date" id="af_start" value="${a?.startDate||''}"/></div>
      <div class="form-group"><label>End Date</label><input type="date" id="af_end" value="${a?.endDate||''}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>AMC Amount (&#8377;)</label><input type="number" id="af_amt" value="${a?.amcAmount||''}"/></div>
      <div class="form-group"><label>Visit Frequency</label>
        <select id="af_freq">${['Monthly','Quarterly','Half-Yearly','Yearly'].map(f=>`<option ${a?.visitFrequency===f?'selected':''}>${f}</option>`).join('')}</select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Total Visits</label><input type="number" id="af_tviz" value="${a?.totalVisits||0}"/></div>
      <div class="form-group"><label>Visits Completed</label><input type="number" id="af_cviz" value="${a?.visitsCompleted||0}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Technician</label><input id="af_tech" value="${a?.technicianName||''}"/></div>
      <div class="form-group"><label>Status</label>
        <select id="af_status">${['ACTIVE','EXPIRED','CANCELLED'].map(st=>`<option ${a?.status===st?'selected':''}>${st}</option>`).join('')}</select>
      </div>
    </div>
    <div class="form-group"><label>Notes</label><textarea id="af_notes">${a?.notes||''}</textarea></div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveAMC(${a?.id||'null'})">${a?'Update':'Save'}</button>
    </div>`);
}

async function saveAMC(id) {
    const custId = document.getElementById('af_cust').value;
    const prodId = document.getElementById('af_prod').value;
    if (!custId) { alert('Select a customer'); return; }
    const payload = {
        customer: { id: parseInt(custId) },
        product: prodId ? { id: parseInt(prodId) } : null,
        startDate: document.getElementById('af_start').value,
        endDate: document.getElementById('af_end').value,
        amcAmount: parseFloat(document.getElementById('af_amt').value)||0,
        visitFrequency: document.getElementById('af_freq').value,
        totalVisits: parseInt(document.getElementById('af_tviz').value)||0,
        visitsCompleted: parseInt(document.getElementById('af_cviz').value)||0,
        technicianName: document.getElementById('af_tech').value,
        status: document.getElementById('af_status').value,
        notes: document.getElementById('af_notes').value
    };
    try {
        if (id) await api.put(`/amc/${id}`, payload);
        else await api.post('/amc', payload);
        closeModal(); loadAMC();
    } catch(e) { alert('Error: ' + e.message); }
}

async function deleteAMC(id) {
    if (!confirm('Delete this AMC record?')) return;
    try { await api.delete(`/amc/${id}`); loadAMC(); }
    catch(e) { alert('Error: ' + e.message); }
}