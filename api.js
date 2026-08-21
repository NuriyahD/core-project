(function (window) {
  'use strict';

  const configuredUrl = localStorage.getItem('apiBaseUrl');
  const isLocalFrontend = ['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port !== '3000';
  const localApiHost = window.location.hostname === 'localhost' ? 'localhost' : '127.0.0.1';
  const productionApiUrl = 'https://passionate-integrity-production-55e8.up.railway.app/api';
  const defaultApiUrl = isLocalFrontend ? `http://${localApiHost}:3000/api` : productionApiUrl;
  const API_BASE_URL = (configuredUrl || defaultApiUrl).replace(/\/$/, '');
  let employeeCache;

  const currentPage = (window.location.pathname || '').split('/').pop() || 'index.html';
  const role = localStorage.getItem('last_user_role') || '';
  const isHrUser = role.toUpperCase().includes('HR');
  const employeePages = ['TimeOff.html', 'payslip.html', 'setting.html', 'index.html', 'signup.html'];

  if (localStorage.getItem('token') && role && !isHrUser && !employeePages.includes(currentPage)) {
    window.location.replace('TimeOff.html');
  }

  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('span').forEach((element) => {
      if (element.textContent.includes('Secure Session Gateway')) element.remove();
    });
    document.querySelectorAll('button[aria-label="User Profile"], button[aria-label="User Account"]').forEach((button) => {
      const wrapper = button.closest('.dropdown');
      if (wrapper && wrapper.children.length === 1) wrapper.remove();
      else button.remove();
    });

    if (!role) return;

    // All pages use different header markup, so shared session controls target
    // the first top-level navbar and fall back to the document header.
    const sharedNavbar = document.querySelector('.top-navbar, header');
    const clearSession = () => {
      ['token', 'last_user_role', 'last_user_name', 'last_employee_id', 'last_user_email'].forEach(key => localStorage.removeItem(key));
      window.location.href = 'index.html';
    };

    if (sharedNavbar && !['index.html', 'signup.html'].includes(currentPage)) {
      const sharedStyle = document.createElement('style');
      sharedStyle.textContent = '.sidebar-collapsed #sidebar,.sidebar-collapsed #appSidebar,.sidebar-collapsed aside.sidebar{display:none!important}.sidebar-collapsed #page-content-wrapper,.sidebar-collapsed .main-panel{margin-left:0!important;width:100%!important}.shared-nav-actions{display:flex;align-items:center;gap:8px;margin-left:auto}.shared-account-menu{display:none;position:fixed;right:18px;top:58px;z-index:2600;min-width:190px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:8px;box-shadow:0 12px 30px rgba(15,23,42,.18)}.shared-account-menu.open{display:block}';
      document.head.appendChild(sharedStyle);
      const actions = document.createElement('div');
      actions.className = 'shared-nav-actions';
      actions.innerHTML = '<button type="button" class="btn btn-light btn-sm" id="sharedSidebarToggle" title="Toggle sidebar"><i class="bi bi-layout-sidebar-inset"></i></button><button type="button" class="btn btn-light btn-sm" id="sharedAccountToggle"><i class="bi bi-person-circle"></i> Account</button>';
      sharedNavbar.appendChild(actions);
      const accountMenu = document.createElement('div');
      accountMenu.className = 'shared-account-menu';
      accountMenu.innerHTML = '<a class="d-block text-decoration-none text-dark px-3 py-2" href="setting.html">Account settings</a><button type="button" class="btn btn-link text-danger text-decoration-none text-start w-100 px-3 py-2">Log out</button>';
      document.body.appendChild(accountMenu);
      actions.querySelector('#sharedAccountToggle').addEventListener('click', () => accountMenu.classList.toggle('open'));
      accountMenu.querySelector('button').addEventListener('click', clearSession);

      const applySidebarState = collapsed => {
        document.body.classList.toggle('sidebar-collapsed', collapsed);
        localStorage.setItem('sidebarCollapsed', String(collapsed));
      };
      applySidebarState(localStorage.getItem('sidebarCollapsed') === 'true');
      actions.querySelector('#sharedSidebarToggle').addEventListener('click', () => applySidebarState(!document.body.classList.contains('sidebar-collapsed')));
    }
    if (!isHrUser) {
      document.querySelectorAll('a.menu-item').forEach((link) => {
        const target = (link.getAttribute('href') || '').split('/').pop();
        if (!['TimeOff.html', 'payslip.html', 'setting.html'].includes(target)) link.remove();
      });

      const profileButton = document.querySelector('button[aria-label="User Profile"]');
      if (profileButton) {
      const menu = document.createElement('div');
      menu.className = 'shadow border rounded bg-white p-2';
      menu.style.cssText = 'display:none;position:fixed;right:24px;top:58px;z-index:2000;min-width:170px';
      menu.innerHTML = '<a class="d-block text-decoration-none text-dark px-3 py-2" href="setting.html">Account settings</a><button type="button" class="btn btn-link text-danger text-decoration-none text-start w-100 px-3 py-2" id="accountLogoutBtn">Log out</button>';
      document.body.appendChild(menu);
      profileButton.addEventListener('click', () => {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      });
      menu.querySelector('#accountLogoutBtn').addEventListener('click', () => {
        ['token', 'last_user_role', 'last_user_name', 'last_employee_id', 'last_user_email'].forEach(key => localStorage.removeItem(key));
        window.location.href = 'index.html';
      });
      }

      const clockCard = document.createElement('div');
      clockCard.className = 'card border-0 p-2 mb-0';
      clockCard.style.cssText = 'min-width:230px;box-shadow:none';
      clockCard.innerHTML = '<div class="d-flex align-items-center justify-content-between gap-3"><div><small class="text-muted d-block">Today’s attendance</small><strong id="employeeClockStatus">Loading…</strong></div><button type="button" class="btn btn-success btn-sm" id="employeeClockButton" disabled>Clock in</button></div><small class="text-muted mt-2" id="employeeClockTimes"></small>';
      (sharedNavbar || document.body).appendChild(clockCard);
      const clockButton = clockCard.querySelector('#employeeClockButton');
      const clockStatus = clockCard.querySelector('#employeeClockStatus');
      const clockTimes = clockCard.querySelector('#employeeClockTimes');
      let clockAction = 'clock-in';

      const loadClockStatus = async () => {
        try {
          const attendance = await apiJson('/attendance');
          const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date());
          const record = attendance.find(item => item.date === today || String(item.attendance_date || '').slice(0, 10) === today);
          if (!record?.check_in) {
            clockStatus.textContent = 'Not clocked in';
            clockAction = 'clock-in';
            clockButton.textContent = 'Clock in';
            clockButton.className = 'btn btn-success btn-sm';
            clockButton.disabled = false;
            clockTimes.textContent = '';
          } else if (!record.check_out) {
            clockStatus.textContent = 'Currently working';
            clockAction = 'clock-out';
            clockButton.textContent = 'Clock out';
            clockButton.className = 'btn btn-outline-danger btn-sm';
            clockButton.disabled = false;
            clockTimes.textContent = `Clocked in at ${String(record.check_in).slice(0, 5)}`;
          } else {
            clockStatus.textContent = 'Shift completed';
            clockButton.textContent = 'Completed';
            clockButton.className = 'btn btn-secondary btn-sm';
            clockButton.disabled = true;
            clockTimes.textContent = `${String(record.check_in).slice(0, 5)} – ${String(record.check_out).slice(0, 5)}`;
          }
        } catch (error) {
          clockStatus.textContent = 'Attendance unavailable';
          clockTimes.textContent = error.message;
        }
      };
      clockButton.addEventListener('click', async () => {
        clockButton.disabled = true;
        try {
          await apiJson(`/attendance/${clockAction}`, { method: 'POST', body: JSON.stringify({}) });
          await loadClockStatus();
        } catch (error) {
          alert(error.message);
          clockButton.disabled = false;
        }
      });
      loadClockStatus();
    }

    if (isHrUser && !['index.html', 'signup.html'].includes(currentPage)) {
      const existingBell = document.getElementById('notificationBell');
      if (!existingBell) {
        const notificationButton = document.createElement('button');
        notificationButton.type = 'button';
        notificationButton.className = 'btn btn-primary rounded-circle position-relative';
        notificationButton.style.cssText = 'width:42px;height:42px';
        notificationButton.innerHTML = '<i class="bi bi-bell-fill"></i><span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none" id="hrPendingLeaveBadge">0</span>';
        notificationButton.title = 'Pending time-off requests';
        notificationButton.addEventListener('click', () => { window.location.href = 'TimeOff.html'; });
        (sharedNavbar || document.body).appendChild(notificationButton);
      }

      let previousPendingIds = null;
      const pollTimeOffRequests = async () => {
        try {
          const groups = await apiJson('/leave-requests');
          const pending = groups.flatMap(group => (group.leaveRequests || []).map(request => ({
            ...request,
            employeeName: group.name || group.employeeName || 'Employee',
          }))).filter(request => request.status === 'Pending');
          const badge = document.getElementById('hrPendingLeaveBadge');
          if (badge) {
            badge.textContent = pending.length;
            badge.classList.toggle('d-none', pending.length === 0);
          }
          const notificationList = document.getElementById('notificationList');
          if (notificationList) {
            notificationList.querySelectorAll('li:not(.dropdown-header)').forEach(item => item.remove());
            if (!pending.length) {
              notificationList.insertAdjacentHTML('beforeend', '<li><span class="dropdown-item-text p-3 text-muted small">No pending notifications.</span></li>');
            } else {
              pending.slice(0, 8).forEach(request => {
                const item = document.createElement('li');
                const link = document.createElement('a');
                link.className = 'dropdown-item p-3 border-bottom text-wrap';
                link.href = 'TimeOff.html';
                const title = document.createElement('p');
                title.className = 'mb-1 fw-semibold small';
                title.textContent = `${request.employeeName} requested time off`;
                const detail = document.createElement('span');
                detail.className = 'text-muted tiny-text';
                detail.textContent = `${request.reason || 'Leave request'} · ${request.date || ''}`;
                link.append(title, detail);
                item.appendChild(link);
                notificationList.appendChild(item);
              });
            }
          }
          const ids = new Set(pending.map(request => request.id));
          if (previousPendingIds && [...ids].some(id => !previousPendingIds.has(id))) {
            const notice = document.createElement('div');
            notice.className = 'alert alert-info shadow position-fixed';
            notice.style.cssText = 'right:24px;top:70px;z-index:1900;max-width:320px';
            notice.textContent = 'A new time-off request is awaiting HR approval.';
            document.body.appendChild(notice);
            setTimeout(() => notice.remove(), 6000);
          }
          previousPendingIds = ids;
        } catch (error) {
          console.error('Unable to refresh HR notifications:', error);
        }
      };
      pollTimeOffRequests();
      setInterval(pollTimeOffRequests, 10000);
    }
  });

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(date);
    const part = (type) => parts.find((item) => item.type === type)?.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  };

  // MySQL DATETIME values can arrive as ISO strings or SQL text. Extracting the
  // time explicitly avoids accidentally displaying the leading year ("2026-").
  const formatTime = (value) => {
    if (!value) return '';
    const match = String(value).match(/(?:T|\s)(\d{2}:\d{2})/);
    return match ? match[1] : String(value).slice(0, 5);
  };

  const employeeView = (employee) => ({
    ...employee,
    employeeId: employee.employee_id,
    id: employee.employee_id,
    name: employee.employee_name,
    position: employee.position_title,
    department: employee.department_name,
    salary: Number(employee.salary || 0),
    contact: employee.email,
    status: employee.employment_status,
  });

  async function getEmployees(headers) {
    if (!employeeCache) {
      employeeCache = fetch(`${API_BASE_URL}/employees`, { headers })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error(`Employees request failed (${response.status})`)))
        .then((employees) => employees.map(employeeView));
    }
    return employeeCache;
  }

  async function normalize(path, data, headers) {
    if (!Array.isArray(data)) return data;
    if (path === '/employees') return data.map(employeeView);
    if (path === '/payroll') return data.map((record) => ({ ...record, employeeId: record.employee_id, hoursWorked: Number(record.hours_worked || 0), finalSalary: Number(record.net_pay || 0), baseSalary: Number(record.base_salary || 0), grossPay: Number(record.gross_pay || 0) }));

    const joinedEndpoints = ['/attendance', '/shifts', '/timesheets', '/time-entries', '/leave-requests', '/performance-reviews'];
    if (!joinedEndpoints.includes(path)) return data;

    const employees = await getEmployees(headers);
    const byId = new Map(employees.map((employee) => [Number(employee.employeeId), employee]));
    const employeeFor = (id) => byId.get(Number(id)) || {};

    if (path === '/attendance') return data.map((record) => {
      const employee = employeeFor(record.employee_id);
      return { ...record, name: employee.name || `Employee ${record.employee_id}`, department: employee.department || 'Unassigned', date: formatDate(record.attendance_date), time: formatTime(record.check_in), status: record.status === 'Present' ? 'On Time' : record.status };
    });

    if (path === '/shifts') return data.map((record) => {
      const employee = employeeFor(record.employee_id);
      return { ...record, name: employee.name || `Employee ${record.employee_id}`, department: employee.department || 'Unassigned', title: employee.position || record.location || 'Shift', date: formatDate(record.shift_date), time: `${String(record.start_time).slice(0, 5)}–${String(record.end_time).slice(0, 5)}` };
    });

    if (path === '/timesheets' || path === '/time-entries') return data.map((record) => {
      const employee = employeeFor(record.employee_id);
      const sheet = path === '/timesheets';
      const displayStatus = record.status === 'Running' ? 'Active' : (record.status === 'Submitted' ? 'Pending' : record.status);
      return { ...record, employee: employee.name || `Employee ${record.employee_id}`, title: sheet ? (record.description || 'Work day') : (record.task_name || 'Time entry'), category: sheet ? 'Regular' : (record.project_name || 'General'), date: formatDate(sheet ? record.work_date : record.start_time), hours: sheet ? Number(record.hours_worked || 0) : Number(record.duration_minutes || 0) / 60, status: displayStatus };
    });

    if (path === '/leave-requests') {
      const grouped = new Map();
      data.forEach((record) => {
        const employee = employeeFor(record.employee_id);
        if (!grouped.has(record.employee_id)) grouped.set(record.employee_id, { employeeId: record.employee_id, name: employee.name || `Employee ${record.employee_id}`, leaveRequests: [] });
        grouped.get(record.employee_id).leaveRequests.push({ id: record.leave_request_id, date: formatDate(record.start_date), endDate: formatDate(record.end_date), reason: record.reason || 'Leave request', status: record.status || 'Pending' });
      });
      return [...grouped.values()];
    }

    return data.map((record) => {
      const employee = employeeFor(record.employee_id);
      const reviewer = employeeFor(record.reviewer_id);
      return { ...record, id: record.review_id, name: employee.name || `Employee ${record.employee_id}`, department: employee.department || 'Unassigned', manager: reviewer.name || `Reviewer ${record.reviewer_id}`, selfStatus: record.status === 'Completed' ? 'Submitted' : 'Not Started', managerStatus: record.status === 'Completed' ? 'Completed' : 'Waiting' };
    });
  }

  async function apiFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = localStorage.getItem('token');

    if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      ...options,
      headers,
    });

    if (response.ok && (options.method || 'GET').toUpperCase() === 'GET') {
      const data = await response.clone().json();
      const normalizedData = await normalize(normalizedPath, data, headers);
      return new Response(JSON.stringify(normalizedData), {
        status: response.status,
        statusText: response.statusText,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return response;
  }

  async function apiJson(path, options = {}) {
    const response = await apiFetch(path, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || data.message || `Request failed (${response.status})`);
    if ((options.method || 'GET').toUpperCase() !== 'GET') employeeCache = undefined;
    return data;
  }

  async function findEmployee(value) {
    const query = String(value || '').trim().toLowerCase();
    const employees = await apiJson('/employees');
    return employees.find((employee) => [employee.name, employee.contact, employee.employee_number]
      .some((field) => String(field || '').trim().toLowerCase() === query));
  }

  window.API_BASE_URL = API_BASE_URL;
  window.apiFetch = apiFetch;
  window.apiJson = apiJson;
  window.findEmployee = findEmployee;
})(window);
