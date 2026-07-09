let employees = [];
let payroll = [];

const currency = (amount) =>
  "R" + amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const payPeriodLabel = () =>
  new Date().toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

const generatedOn = () =>
  new Date().toLocaleString("en-ZA", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * The only figures we're given per employee are hoursWorked, leaveDeductions (in hours)
 * and finalSalary (net pay already after leave has been deducted). Everything else --
 * hourly rate, gross pay, and the rand value of the leave taken -- is derived from those,
 * so the three numbers always reconcile exactly:
 *   grossPay - leaveDeductionAmount === netPay
 */
function calculatePayroll(pay) {
  const paidHours = pay.hoursWorked - pay.leaveDeductions;
  const hourlyRate = paidHours > 0 ? pay.finalSalary / paidHours : 0;
  const grossPay = hourlyRate * pay.hoursWorked;
  const leaveDeductionAmount = hourlyRate * pay.leaveDeductions;
  const netPay = pay.finalSalary;
  return { hourlyRate, grossPay, leaveDeductionAmount, netPay };
}

Promise.all([
  fetch("data/employee_info.json").then((res) => {
    if (!res.ok) throw new Error("employee_info.json failed to load");
    return res.json();
  }),
  fetch("data/payroll_data.json").then((res) => {
    if (!res.ok) throw new Error("payroll_data.json failed to load");
    return res.json();
  }),
])
  .then(([employeeData, payrollData]) => {
    employees = employeeData.employeeInformation;
    payroll = payrollData.payrollData;

    const select = document.getElementById("employeeList");
    select.innerHTML = employees
      .map((emp) => `<option value="${emp.employeeId}">${emp.name}</option>`)
      .join("");

    select.value = employees[0].employeeId;
    showPayslip(employees[0]);
    updateCompanyTotals();

    select.addEventListener("change", () => {
      const employee = employees.find((e) => String(e.employeeId) === select.value);
      showPayslip(employee);
    });
  })
  .catch((err) => {
    console.error("Payroll data could not be loaded:", err);
    document.getElementById("payslip").innerHTML = `
      <div class="payslip-error">
        <i class="bi bi-exclamation-triangle"></i>
        Couldn't load payroll data. Check that <code>data/employee_info.json</code> and
        <code>data/payroll_data.json</code> exist and reload the page.
      </div>`;
  });

function showPayslip(emp) {
  const pay = payroll.find((p) => p.employeeId === emp.employeeId);
  const payslipEl = document.getElementById("payslip");

  if (!pay) {
    payslipEl.innerHTML = `<div class="payslip-error"><i class="bi bi-exclamation-triangle"></i> No payroll record found for ${emp.name}.</div>`;
    return;
  }

  const { hourlyRate, grossPay, leaveDeductionAmount, netPay } = calculatePayroll(pay);
  const payslipNumber = `PS-${String(emp.employeeId).padStart(4, "0")}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  payslipEl.innerHTML = `
    <div class="payslip-header">
      <div class="payslip-brand">
        <img src="logo.png" alt="ModernTech Solutions logo">
        <div>
          <p class="payslip-brand-name">ModernTech Solutions</p>
          <p class="payslip-brand-sub">Payroll Department</p>
        </div>
      </div>
      <div class="payslip-meta">
        <p class="payslip-meta-title">PAYSLIP</p>
        <p class="payslip-meta-line">${payslipNumber}</p>
        <p class="payslip-meta-line">Generated ${generatedOn()}</p>
      </div>
    </div>

    <div class="payslip-employee-grid">
      <div><span class="field-label">Employee</span><span class="field-value">${emp.name}</span></div>
      <div><span class="field-label">Employee ID</span><span class="field-value">${String(emp.employeeId).padStart(4, "0")}</span></div>
      <div><span class="field-label">Position</span><span class="field-value">${emp.position}</span></div>
      <div><span class="field-label">Department</span><span class="field-value">${emp.department}</span></div>
      <div><span class="field-label">Pay Period</span><span class="field-value">${payPeriodLabel()}</span></div>
      <div><span class="field-label">Contact</span><span class="field-value">${emp.contact}</span></div>
    </div>

    <div class="payslip-lines">
      <div class="payslip-line">
        <span>Hours Worked <span class="line-sub">(${pay.hoursWorked} hrs &times; ${currency(hourlyRate)}/hr)</span></span>
        <span>${currency(grossPay)}</span>
      </div>
      <div class="payslip-line deduction">
        <span>Leave Deduction <span class="line-sub">(${pay.leaveDeductions} hrs)</span></span>
        <span>&minus; ${currency(leaveDeductionAmount)}</span>
      </div>
      <div class="payslip-line total">
        <span>Net Pay</span>
        <span>${currency(netPay)}</span>
      </div>
    </div>

    <p class="payslip-footnote">This is a system-generated payslip and requires no signature.</p>
  `;
}

function updateCompanyTotals() {
  const totalNet = payroll.reduce((sum, pay) => sum + pay.finalSalary, 0);
  const totalDeductions = payroll.reduce((sum, pay) => sum + calculatePayroll(pay).leaveDeductionAmount, 0);

  document.getElementById("mPay").textContent = currency(totalNet);
  document.getElementById("leave").textContent = currency(totalDeductions);
  document.getElementById("annual").textContent = currency(totalNet * 12);
}

document.getElementById("print").addEventListener("click", () => window.print());
