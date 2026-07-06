let employees = []
let payroll = []

Promise.all([
    fetch("data/employee_info.json").then(res => res.json()),
    fetch("data/payroll_data.json").then(res => res.json())
])
.then (([employeeData, payrollData])=> {

    employees = employeeData.employeeInformation;
    payroll = payrollData.payrollData;

    const select = document.getElementById("employeeList");

    employees.forEach(emp => {

        select.innerHTML  += `
        <option value="${emp.employeeId}">${emp.name}</option>
        `
    });

    select.value = employees[0].employeeId;
    showPayslip(employees[0]);

    select.addEventListener("change", () => {

    const employee = employees.find(e => e.employeeId == select.value);
    showPayslip(employee)
})

})

function showPayslip(emp){

    const pay = payroll.find(p => p.employeeId === emp.employeeId)

    const hourlyRate = (pay.finalSalary/(pay.hoursWorked - pay.leaveDeductions)).toFixed(2)

    document.getElementById("payslip").innerHTML = `
    <h2>Payslip</h2>

    <p><b>Name:</b>${emp.name}</p>
    <p><b>Position:</b>${emp.position}</p>

    <hr>
    <p><b>Hourly Rate:</b>R${hourlyRate}</p>
    <p><b>Hours Worked:</b>${pay.hoursWorked}</p>
    <p><b>Leave Deductions:</b>${pay.leaveDeductions} Hours</p>
    <p><b>Final Salary:</b>R${pay.finalSalary}</p>
    
    `
}

const mPay = document.getElementById("mPay");
const leave = document.getElementById("leave");
const annual = document.getElementById("annual");