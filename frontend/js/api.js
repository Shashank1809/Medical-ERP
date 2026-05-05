const API_BASE = 'http://localhost:8080/api';

function getToken() { return localStorage.getItem('erp_token'); }

async function apiCall(endpoint, method = 'GET', body = null) {
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + endpoint, opts);
    if (res.status === 401) { logout(); return; }
    if (!res.ok) throw new Error(await res.text());
    if (res.status === 200 && method !== 'DELETE') return res.json();
    return null;
}

const api = {
    get: (ep) => apiCall(ep),
    post: (ep, data) => apiCall(ep, 'POST', data),
    put: (ep, data) => apiCall(ep, 'PUT', data),
    delete: (ep) => apiCall(ep, 'DELETE')
};