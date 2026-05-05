async function renderQuotations() {
    const el = document.getElementById('pageContent');
    el.innerHTML = `
    <div class="page-header">
      <h2>Quotation Master</h2>
      <button class="btn-add" onclick="openQuotationForm()">&#43; New Quotation</button>
    </div>
    <div class="filter-bar">
      <div class="filter-group"><label>Status</label>
        <select id="qtStatus"><option value="">All</option><option>DRAFT</option><option>SENT</option><option>APPROVED</option><option>REJECTED</option></select>
      </div>
      <button class="btn-filter" onclick="loadQuotations()">Filter</button>
      <button class="btn-reset" onclick="document.getElementById('qtStatus').value='';loadQuotations()">Reset</button>
    </div>
    <div class="table-card"><div class="table-scroll">
      <table><thead><tr>
        <th>#</th><th>Quotation No</th><th>Customer</th><th>Date</th>
        <th>Valid Until</th><th>Grand Total</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody id="qtTableBody"><tr><td colspan="8" class="table-empty">Loading...</td></tr></tbody>
      </table>
    </div></div>`;
    loadQuotations();
}

async function loadQuotations() {
    const status = document.getElementById('qtStatus')?.value || '';
    let ep = '/quotations?' + (status ? `status=${status}` : '');
    try {
        const data = await api.get(ep);
        const tbody = document.getElementById('qtTableBody');
        if (!data?.length) { tbody.innerHTML = '<tr><td colspan="8" class="table-empty">No quotations found</td></tr>'; return; }
        tbody.innerHTML = data.map((q, i) => `
      <tr>
        <td>${i+1}</td>
        <td><strong>${q.quotationNumber||'—'}</strong></td>
        <td>${q.customer?.name||'—'}</td>
        <td>${q.quotationDate||'—'}</td>
        <td>${q.validUntil||'—'}</td>
        <td><strong>&#8377;${q.grandTotal?.toLocaleString('en-IN')||0}</strong></td>
        <td><span class="badge badge-${q.status==='APPROVED'?'success':q.status==='DRAFT'?'secondary':q.status==='SENT'?'info':'danger'}">${q.status}</span></td>
        <td class="action-btns">
          <button class="btn-edit" onclick="openQuotationForm(${JSON.stringify(q).replace(/"/g,'&quot;')})">Edit</button>
          <button class="btn-delete" onclick="deleteQuotation(${q.id})">Delete</button>
        </td>
      </tr>`).join('');
    } catch(e) { document.getElementById('qtTableBody').innerHTML = `<tr><td colspan="8" class="table-empty">${e.message}</td></tr>`; }
}

async function openQuotationForm(q = null) {
    const customers = await api.get('/customers');
    const isEdit = !!q;
    openModal(isEdit ? 'Edit Quotation' : 'New Quotation', `
    <div class="form-group"><label>Customer *</label>
      <select id="qf_cust">
        <option value="">Select Customer</option>
        ${(customers||[]).map(c=>`<option value="${c.id}" ${q?.customer?.id==c.id?'selected':''}>${c.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Quotation Date</label><input type="date" id="qf_date" value="${q?.quotationDate||''}"/></div>
      <div class="form-group"><label>Valid Until</label><input type="date" id="qf_valid" value="${q?.validUntil||''}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Total Amount (&#8377;)</label><input type="number" id="qf_total" value="${q?.totalAmount||0}" oninput="calcQuotation()"/></div>
      <div class="form-group"><label>Discount (&#8377;)</label><input type="number" id="qf_disc" value="${q?.discount||0}" oninput="calcQuotation()"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>GST Amount (&#8377;)</label><input type="number" id="qf_gst" value="${q?.gstAmount||0}" oninput="calcQuotation()"/></div>
      <div class="form-group"><label>Grand Total (&#8377;)</label><input type="number" id="qf_grand" value="${q?.grandTotal||0}" readonly style="background:#f8fafc;font-weight:700"/></div>
    </div>
    <div class="form-group"><label>Status</label>
      <select id="qf_status">${['DRAFT','SENT','APPROVED','REJECTED'].map(st=>`<option ${q?.status===st?'selected':''}>${st}</option>`).join('')}</select>
    </div>
    <div class="form-group"><label>Terms & Conditions</label><textarea id="qf_terms">${q?.termsConditions||''}</textarea></div>
    <div class="form-group"><label>Notes</label><textarea id="qf_notes">${q?.notes||''}</textarea></div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveQuotation(${q?.id||'null'})">${isEdit?'Update':'Save'}</button>
    </div>`);
    calcQuotation();
}

function calcQuotation() {
    const total = parseFloat(document.getElementById('qf_total')?.value)||0;
    const disc = parseFloat(document.getElementById('qf_disc')?.value)||0;
    const gst = parseFloat(document.getElementById('qf_gst')?.value)||0;
    const grand = document.getElementById('qf_grand');
    if (grand) grand.value = (total - disc + gst).toFixed(2);
}

async function saveQuotation(id) {
    const custId = document.getElementById('qf_cust').value;
    if (!custId) { alert('Select a customer'); return; }
    const payload = {
        customer: { id: parseInt(custId) },
        quotationDate: document.getElementById('qf_date').value,
        validUntil: document.getElementById('qf_valid').value,
        totalAmount: parseFloat(document.getElementById('qf_total').value)||0,
        discount: parseFloat(document.getElementById('qf_disc').value)||0,
        gstAmount: parseFloat(document.getElementById('qf_gst').value)||0,
        grandTotal: parseFloat(document.getElementById('qf_grand').value)||0,
        status: document.getElementById('qf_status').value,
        termsConditions: document.getElementById('qf_terms').value,
        notes: document.getElementById('qf_notes').value
    };
    try {
        if (id) await api.put(`/quotations/${id}`, payload);
        else await api.post('/quotations', payload);
        closeModal(); loadQuotations();
    } catch(e) { alert('Error: ' + e.message); }
}

async function deleteQuotation(id) {
    if (!confirm('Delete this quotation?')) return;
    try { await api.delete(`/quotations/${id}`); loadQuotations(); }
    catch(e) { alert('Error: ' + e.message); }
}