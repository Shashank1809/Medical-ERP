async function renderSalary() {
    const el = document.getElementById('pageContent');
    el.innerHTML = `
    <div class="page-header">
      <h2>Salary & Wages</h2>
      <button class="btn-add" onclick="openSalaryForm()">&#43; Add Record</button>
    </div>
    <div class="filter-bar">
      <div class="filter-group"><label>Employee Search</label><input type="text" id="salSearch" placeholder="Employee name"/></div>
      <div class="filter-group"><label>Month</label>
        <select id="salMonth"><option value="">All</option>${['January','February','March','April','May','June','July','August','September','October','November','December'].map(m=>`<option>${m}</option>`).join('')}</select>
      </div>
      <div class="filter-group"><label>Year</label>
        <select id="salYear"><option value="">All</option>${[2024,2025,2026].map(y=>`<option>${y}</option>`).join('')}</select>
      </div>
      <button class="btn-filter" onclick="loadSalary()">Search</button>
      <button class="btn-reset" onclick="resetSalaryFilters()">Reset</button>
    </div>
    <div class="table-card"><div class="table-scroll">
      <table><thead><tr>
        <th>#</th><th>Employee</th><th>Code</th><th>Designation</th><th>Basic</th>
        <th>HRA</th><th>Allowances</th><th>Deductions</th><th>Net Salary</th><th>Month/Year</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody id="salTableBody"><tr><td colspan="12" class="table-empty">Loading...</td></tr></tbody>
      </table>
    </div></div>`;
    loadSalary();
}

async function loadSalary() {
    const search = document.getElementById('salSearch')?.value || '';
    const month = document.getElementById('salMonth')?.value || '';
    const year = document.getElementById('salYear')?.value || '';
    let ep = '/salary?';
    if (search) ep += `search=${encodeURIComponent(search)}&`;
    if (month && year) ep += `month=${month}&year=${year}`;
    try {
        const data = await api.get(ep);
        const tbody = document.getElementById('salTableBody');
        if (!data?.length) { tbody.innerHTML = '<tr><td colspan="12" class="table-empty">No records found</td></tr>'; return; }
        tbody.innerHTML = data.map((s, i) => `
      <tr>
        <td>${i+1}</td>
        <td><strong>${s.employeeName}</strong></td>
        <td>${s.employeeCode||'—'}</td>
        <td>${s.designation||'—'}</td>
        <td>&#8377;${s.basicSalary?.toLocaleString('en-IN')||0}</td>
        <td>&#8377;${s.hra?.toLocaleString('en-IN')||0}</td>
        <td>&#8377;${s.allowances?.toLocaleString('en-IN')||0}</td>
        <td style="color:#c62828">&#8377;${s.deductions?.toLocaleString('en-IN')||0}</td>
        <td><strong>&#8377;${s.netSalary?.toLocaleString('en-IN')||0}</strong></td>
        <td>${s.month||'—'} ${s.year||''}</td>
        <td><span class="badge badge-${s.status==='PAID'?'success':'warning'}">${s.status}</span></td>
        <td class="action-btns">
          <button class="btn-edit" onclick="openSalaryForm(${JSON.stringify(s).replace(/"/g,'&quot;')})">Edit</button>
          <button class="btn-delete" onclick="deleteSalary(${s.id})">Delete</button>
        </td>
      </tr>`).join('');
    } catch(e) { document.getElementById('salTableBody').innerHTML = `<tr><td colspan="12" class="table-empty">${e.message}</td></tr>`; }
}

function resetSalaryFilters() {
    ['salSearch','salMonth','salYear'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
    loadSalary();
}

function openSalaryForm(s = null) {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    openModal(s ? 'Edit Salary Record' : 'Add Salary Record', `
    <div class="form-row">
      <div class="form-group"><label>Employee Name *</label><input id="salf_name" value="${s?.employeeName||''}"/></div>
      <div class="form-group"><label>Employee Code</label><input id="salf_code" value="${s?.employeeCode||''}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Designation</label><input id="salf_desig" value="${s?.designation||''}"/></div>
      <div class="form-group"><label>Department</label><input id="salf_dept" value="${s?.department||''}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Basic Salary (&#8377;)</label><input type="number" id="salf_basic" value="${s?.basicSalary||''}" oninput="calcNet()"/></div>
      <div class="form-group"><label>HRA (&#8377;)</label><input type="number" id="salf_hra" value="${s?.hra||0}" oninput="calcNet()"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Allowances (&#8377;)</label><input type="number" id="salf_allow" value="${s?.allowances||0}" oninput="calcNet()"/></div>
      <div class="form-group"><label>Deductions (&#8377;)</label><input type="number" id="salf_deduct" value="${s?.deductions||0}" oninput="calcNet()"/></div>
    </div>
    <div class="form-group"><label>Net Salary (&#8377;) — auto calculated</label>
      <input type="number" id="salf_net" value="${s?.netSalary||0}" readonly style="background:#f8fafc"/>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Month</label>
        <select id="salf_month">${months.map(m=>`<option ${s?.month===m?'selected':''}>${m}</option>`).join('')}</select>
      </div>
      <div class="form-group"><label>Year</label>
        <select id="salf_year">${[2024,2025,2026].map(y=>`<option ${s?.year==y?'selected':''}>${y}</option>`).join('')}</select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Payment Date</label><input type="date" id="salf_pdate" value="${s?.paymentDate||''}"/></div>
      <div class="form-group"><label>Payment Mode</label>
        <select id="salf_pmode">${['Bank Transfer','Cash','Cheque','UPI'].map(m=>`<option ${s?.paymentMode===m?'selected':''}>${m}</option>`).join('')}</select>
      </div>
    </div>
    <div class="form-group"><label>Status</label>
      <select id="salf_status"><option ${s?.status==='PENDING'?'selected':''}>PENDING</option><option ${s?.status==='PAID'?'selected':''}>PAID</option></select>
    </div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveSalary(${s?.id||'null'})">${s?'Update':'Save'}</button>
    </div>`);
    calcNet();
}

function calcNet() {
    const basic = parseFloat(document.getElementById('salf_basic')?.value)||0;
    const hra = parseFloat(document.getElementById('salf_hra')?.value)||0;
    const allow = parseFloat(document.getElementById('salf_allow')?.value)||0;
    const deduct = parseFloat(document.getElementById('salf_deduct')?.value)||0;
    const net = document.getElementById('salf_net');
    if (net) net.value = (basic + hra + allow - deduct).toFixed(2);
}

async function saveSalary(id) {
    const payload = {
        employeeName: document.getElementById('salf_name').value,
        employeeCode: document.getElementById('salf_code').value,
        designation: document.getElementById('salf_desig').value,
        department: document.getElementById('salf_dept').value,
        basicSalary: parseFloat(document.getElementById('salf_basic').value)||0,
        hra: parseFloat(document.getElementById('salf_hra').value)||0,
        allowances: parseFloat(document.getElementById('salf_allow').value)||0,
        deductions: parseFloat(document.getElementById('salf_deduct').value)||0,
        netSalary: parseFloat(document.getElementById('salf_net').value)||0,
        month: document.getElementById('salf_month').value,
        year: parseInt(document.getElementById('salf_year').value),
        paymentDate: document.getElementById('salf_pdate').value,
        paymentMode: document.getElementById('salf_pmode').value,
        status: document.getElementById('salf_status').value
    };
    if (!payload.employeeName) { alert('Employee name required'); return; }
    try {
        if (id) await api.put(`/salary/${id}`, payload);
        else await api.post('/salary', payload);
        closeModal(); loadSalary();
    } catch(e) { alert('Error: ' + e.message); }
}

async function deleteSalary(id) {
    if (!confirm('Delete this salary record?')) return;
    try { await api.delete(`/salary/${id}`); loadSalary(); }
    catch(e) { alert('Error: ' + e.message); }
}