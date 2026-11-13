const API_BASE_URL = 'http://localhost:5000/api';

let adminToken = localStorage.getItem('adminToken') || '';
let adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const adminNameDisplay = document.getElementById('adminNameDisplay');
const btnLogout = document.getElementById('btnLogout');
const btnRefreshReports = document.getElementById('btnRefreshReports');

// KPI elements
const statTotalUsers = document.getElementById('statTotalUsers');
const statTotalNotes = document.getElementById('statTotalNotes');
const statTotalDoubts = document.getElementById('statTotalDoubts');
const statTotalListings = document.getElementById('statTotalListings');
const statPendingReports = document.getElementById('statPendingReports');
const reportsList = document.getElementById('reportsList');
const topNotesList = document.getElementById('topNotesList');
const popularSubjectsList = document.getElementById('popularSubjectsList');

// Initialize view
window.addEventListener('DOMContentLoaded', () => {
  if (adminToken && adminUser && adminUser.role === 'admin') {
    showDashboard();
  } else {
    showLogin();
  }
});

function showLogin() {
  loginSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
}

function showDashboard() {
  loginSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  if (adminUser) {
    adminNameDisplay.textContent = adminUser.name || 'Admin User';
  }
  loadAnalytics();
  loadReports();
}

// Login Handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');

  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.data.user.role !== 'admin') {
      throw new Error('Access denied. Admin account required.');
    }

    adminToken = data.data.token;
    adminUser = data.data.user;

    localStorage.setItem('adminToken', adminToken);
    localStorage.setItem('adminUser', JSON.stringify(adminUser));

    showDashboard();
  } catch (err) {
    loginError.textContent = err.message;
    loginError.classList.remove('hidden');
  }
});

// Logout Handler
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  adminToken = '';
  adminUser = null;
  showLogin();
});

btnRefreshReports.addEventListener('click', () => {
  loadReports();
  loadAnalytics();
});

// Load Aggregated Analytics
async function loadAnalytics() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success && data.data) {
      const { counts, topDownloadedNotes, popularSubjects } = data.data;

      statTotalUsers.textContent = counts.totalUsers || 0;
      statTotalNotes.textContent = counts.totalNotes || 0;
      statTotalDoubts.textContent = counts.totalDoubts || 0;
      statTotalListings.textContent = counts.totalListings || 0;
      statPendingReports.textContent = counts.pendingReports || 0;

      // Render top notes
      if (topDownloadedNotes && topDownloadedNotes.length > 0) {
        topNotesList.innerHTML = topDownloadedNotes.map(n => `
          <div class="analytics-item">
            <span><strong>${escapeHtml(n.title)}</strong> — ${escapeHtml(n.subject)}</span>
            <span class="stat-green">${n.downloadCount} dl</span>
          </div>
        `).join('');
      } else {
        topNotesList.innerHTML = '<div class="analytics-item">No downloads recorded yet.</div>';
      }

      // Render popular subjects
      if (popularSubjects && popularSubjects.length > 0) {
        popularSubjectsList.innerHTML = popularSubjects.map(s => `
          <div class="analytics-item">
            <span><strong>${escapeHtml(s._id || 'General')}</strong></span>
            <span>${s.noteCount} notes</span>
          </div>
        `).join('');
      } else {
        popularSubjectsList.innerHTML = '<div class="analytics-item">No subject statistics yet.</div>';
      }
    }
  } catch (err) {
    console.error('Analytics load error:', err);
  }
}

// Load Moderation Reports
async function loadReports() {
  try {
    reportsList.innerHTML = '<div class="loading-spinner">Loading reports…</div>';
    const res = await fetch(`${API_BASE_URL}/admin/reports?status=pending`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success && data.data.reports) {
      const reports = data.data.reports;
      if (reports.length === 0) {
        reportsList.innerHTML = '<div class="empty-state">Queue is clean — no pending reports.</div>';
        return;
      }

      reportsList.innerHTML = reports.map(r => `
        <div class="report-card">
          <div class="report-header">
            <span>Reporter: <strong>${escapeHtml(r.reporter?.name || 'User')}</strong></span>
            <span class="badge badge-pending">Pending</span>
          </div>
          <p class="report-reason">Type: <strong>${r.targetType.toUpperCase()}</strong> &mdash; ${escapeHtml(r.reason)}</p>
          <div class="report-actions">
            <button onclick="updateReport('${r._id}', 'reviewed')" class="btn btn-success btn-sm">Mark Reviewed</button>
            <button onclick="updateReport('${r._id}', 'dismissed')" class="btn btn-outline btn-sm">Dismiss</button>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    reportsList.innerHTML = '<div class="empty-state" style="color:var(--red)">Failed to load reports.</div>';
  }
}

// Update Report Action
async function updateReport(reportId, status) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      loadReports();
      loadAnalytics();
    }
  } catch (err) {
    alert('Failed to update report status: ' + err.message);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}
