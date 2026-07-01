document.addEventListener("DOMContentLoaded", () => {

    // ── Navigation: highlight active menu item on click ──────────────────
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            menuItems.forEach(i => i.classList.remove("active"));
            e.currentTarget.classList.add("active");
        });
    });

    // ── Leave Request page (index.html): fetch & populate table ───────────
    const historyTableBody = document.getElementById("historyTableBody");

    if (historyTableBody) {
        fetch(".vscode/leave.json")
            .then(response => {
                if (!response.ok) throw new Error("Could not load leave data.");
                return response.json();
            })
            .then(data => {
                // Clear the hardcoded placeholder rows
                historyTableBody.innerHTML = "";
                
                // We'll flatten all leave requests from all employees into one list
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
                    // Determine badge color based on status
                    let badgeClass = "pending";
                    if (req.status === "Approved") badgeClass = "approved";
                    else if (req.status === "Denied" || req.status === "Rejected") badgeClass = "rejected";

                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${req.reason}</td>
                        <td>${req.date}</td>
                        <td>${req.reason}</td>
                        <td>${req.date}</td>
                        <td><span class="status-badge ${badgeClass}">${req.status}</span></td>
                        <td>${req.employeeName}</td>
                    `;
                    historyTableBody.appendChild(row);
                });
            })
            .catch(err => {
                console.error("Leave data error:", err);
                historyTableBody.innerHTML = `<tr><td colspan="6">Failed to load leave data.</td></tr>`;
            });
            
        // Filter buttons on index.html
        const filterStatusBtn = document.getElementById("filterStatus");
        const filterTypeBtn   = document.getElementById("filterType");

        if (filterStatusBtn) filterStatusBtn.addEventListener("click", () => console.log("Filter by status requested."));
        if (filterTypeBtn) filterTypeBtn.addEventListener("click", () => console.log("Filter by type requested."));
    }

    // ── Employee Records page: fetch & populate table ─────────────────────
    const employeeTableBody = document.getElementById("employeeTableBody");

    if (employeeTableBody) {
        // Updated to use your new file name employee_info.json
        fetch(".vscode/employee_info.json")
            .then(response => {
                if (!response.ok) throw new Error("Could not load employee data.");
                return response.json();
            })
            .then(data => {
                employeeTableBody.innerHTML = ""; // Ensure table is empty before populating
                data.employeeInformation.forEach(emp => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${emp.employeeId}</td>
                        <td>${emp.name}</td>
                        <td>${emp.position}</td>
                        <td>${emp.department}</td>
                        <td>R${emp.salary.toLocaleString()}</td>
                        <td>${emp.contact}</td>
                    `;
                    employeeTableBody.appendChild(row);
                });
            })
            .catch(err => {
                console.error("Employee data error:", err);
                employeeTableBody.innerHTML = `<tr><td colspan="6">Failed to load employee data.</td></tr>`;
            });
            
        // Filter buttons on EmployeeRecords.html
        const filterDepartmentBtn = document.getElementById("filterDepartment");
        const filterPositionBtn   = document.getElementById("filterPosition");

        if (filterDepartmentBtn) filterDepartmentBtn.addEventListener("click", () => console.log("Filter by department requested."));
        if (filterPositionBtn) filterPositionBtn.addEventListener("click", () => console.log("Filter by position requested."));
    }

});