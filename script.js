document.addEventListener('DOMContentLoaded', () => {
    
    // SIDEBAR NAVIGATION & ROUTING

    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                navLinks.forEach(item => item.classList.remove('active'));
                link.classList.add('active');
                
                const targetViewId = link.getAttribute('href').substring(1);
                switchView(targetViewId);
            }
        });
    });

    function switchView(viewId) {
        const views = document.querySelectorAll('.view-panel-section');
        views.forEach(view => {
            view.style.display = view.id === viewId ? 'block' : 'none';
        });
    }

    // SEARCH FILTER INTERACTION

    const searchInput = document.querySelector('.search-container input');
    
    if (searchInput) {
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        });

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filterableRows = document.querySelectorAll('.timesheet-row, .review-row');
            
            filterableRows.forEach(row => {
                const textContent = row.textContent.toLowerCase();
                row.style.display = textContent.includes(query) ? 'grid' : 'none';
            });
        });
    }

    // COLLAPSIBLE DATA GROUPS (Timesheets Accordion)

    document.querySelectorAll('.accordion-arrow').forEach(arrow => {
        arrow.addEventListener('click', (e) => {
            const group = e.target.closest('.timesheet-group');
            if (!group) return;
            
            const rows = group.querySelectorAll('.timesheet-row');
            const isCurrentlyHidden = rows[0]?.style.display === 'none';
            
            rows.forEach(row => {
                row.style.display = isCurrentlyHidden ? 'grid' : 'none';
            });
            
            e.target.style.transform = isCurrentlyHidden ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    });

    // CHECKBOX ROW HIGHLIGHT SELECTION

    const bindCheckboxRowHighlighter = (selector) => {
        document.querySelectorAll(`${selector} input[type="checkbox"]`).forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const row = e.target.closest(selector);
                if (row) {
                    if (e.target.checked) {
                        row.classList.add('selected');
                    } else {
                        row.classList.remove('selected');
                    }
                }
            });
        });
    };
    
    bindCheckboxRowHighlighter('.timesheet-row');
    bindCheckboxRowHighlighter('.review-row');

    // CALENDAR GENERATION

    let currentDisplayDate = new Date(); 

    const mockShifts = [
        { day: 15, title: 'Dev Shift A', type: 'badge-approved' },
        { day: 15, title: 'UI Audit', type: 'badge-pending' },
        { day: 22, title: 'Sprint Sync', type: 'badge-approved' }
    ];

    function renderCuteCalendar(date) {
        const gridContainer = document.querySelector('.calendar-days-grid');
        const displayLabel = document.querySelector('.current-month');
        if (!gridContainer || !displayLabel) return;

        gridContainer.innerHTML = ''; 

        const year = date.getFullYear();
        const month = date.getMonth();
        displayLabel.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
        const totalDaysPreviousMonth = new Date(year, month, 0).getDate();

        for (let i = firstDayIndex; i > 0; i--) {
            const prevDayNum = totalDaysPreviousMonth - i + 1;
            createCell(gridContainer, prevDayNum, 'outside');
        }

        for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
            const today = new Date();
            let stateClass = '';
            
            if (dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                stateClass = 'today';
            } else {
                const currentWeekDayIndex = new Date(year, month, dayNum).getDay();
                if (currentWeekDayIndex === 0 || currentWeekDayIndex === 6) {
                    stateClass = 'weekend';
                }
            }

            const cell = createCell(gridContainer, dayNum, stateClass);

            mockShifts.forEach(shift => {
                if (shift.day === dayNum) {
                    const tag = document.createElement('div');
                    tag.className = `event-tag ${shift.type}`;
                    tag.textContent = shift.title;
                    cell.appendChild(tag);
                }
            });
        }
    }

    function createCell(container, dayNumber, modifierClass) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        if (modifierClass) cell.classList.add(modifierClass);

        const numberSpan = document.createElement('span');
        numberSpan.className = 'day-number';
        numberSpan.textContent = dayNumber;

        cell.appendChild(numberSpan);
        container.appendChild(cell);
        return cell;
    }

    // Connect Navigation Control Arrow triggers to Calendar

    const prevBtn = document.querySelector('.calendar-navigator .btn-nav-arrow:first-child');
    const nextBtn = document.querySelector('.calendar-navigator .btn-nav-arrow:last-child');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
            renderCuteCalendar(currentDisplayDate);
        });
        nextBtn.addEventListener('click', () => {
            currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
            renderCuteCalendar(currentDisplayDate);
        });
    }
    renderCuteCalendar(currentDisplayDate);

    //  DASHBOARD LEAVE HISTORY FETCHING (index.html)

    const historyTableBody = document.getElementById("historyTableBody");
    if (historyTableBody) {
        fetch(".vscode/leave.json")
            .then(response => {
                if (!response.ok) throw new Error("Could not load leave data.");
                return response.json();
            })
            .then(data => {
                historyTableBody.innerHTML = "";
                let allRequests = [];
                
                if (data.attendanceAndLeave) {
                    data.attendanceAndLeave.forEach(emp => {
                        if (emp.leaveRequests) {
                            emp.leaveRequests.forEach(req => {
                                allRequests.push({ employeeName: emp.name, ...req });
                            });
                        }
                    });
                }
                
                allRequests.forEach(req => {
                    let badgeClass = "badge-pending";
                    if (req.status === "Approved") badgeClass = "badge-approved";
                    else if (req.status === "Denied" || req.status === "Rejected") badgeClass = "badge-rejected";

                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td class="task-name">${req.type || req.reason}</td>
                        <td class="text-muted">${req.date}</td>
                        <td>${req.reason}</td>
                        <td class="text-muted">${req.date}</td>
                        <td><span class="badge ${badgeClass}">${req.status}</span></td>
                        <td class="employee-name">${req.employeeName}</td>
                    `;
                    historyTableBody.appendChild(row);
                });
            })
            .catch(err => {
                console.error("Leave data error:", err);
                historyTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1rem;">Failed to load leave data.</td></tr>`;
            });
    }

    const filterStatusBtn = document.getElementById("filterStatus");
    const filterTypeBtn = document.getElementById("filterType");
    if (filterStatusBtn) filterStatusBtn.addEventListener("click", () => console.log("Filter by status requested."));
    if (filterTypeBtn) filterTypeBtn.addEventListener("click", () => console.log("Filter by type requested."));
  
    // EMPLOYEE RECORDS FETCHING (EmployeeRecords.html)

    const employeeTableBody = document.getElementById("employeeTableBody");
    if (employeeTableBody) {
        fetch(".vscode/employee_info.json")
            .then(response => {
                if (!response.ok) throw new Error("Could not load employee data.");
                return response.json();
            })
            .then(data => {
                employeeTableBody.innerHTML = "";
                data.employeeInformation.forEach(emp => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td class="task-id">${emp.employeeId}</td>
                        <td class="employee-name">${emp.name}</td>
                        <td class="text-muted">${emp.position}</td>
                        <td>${emp.department}</td>
                        <td class="font-numeric" style="color: var(--brand-primary)">R${emp.salary.toLocaleString()}</td>
                        <td class="text-secondary">${emp.contact}</td>
                    `;
                    employeeTableBody.appendChild(row);
                });
            })
            .catch(err => {
                console.error("Employee data error:", err);
                employeeTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1rem;">Failed to load employee data.</td></tr>`;
            });
    }
});