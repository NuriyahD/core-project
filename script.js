// Dummy data: employee info
const employees = [
  {
      employeeId: 1,
      name: "Sibongile Nkosi",
      position: "Software Engineer",
      department: "Development",
      salary: 70000,
      employmentHistory: "Joined in 2015, promoted to Senior in 2018",
      contact: "sibongile.nkosi@moderntech.com"
  },
  {
      employeeId: 2,
      name: "Lungile Moyo",
      position: "HR Manager",
      department: "HR",
      salary: 80000,
      employmentHistory: "Joined in 2013, promoted to Manager in 2017",
      contact: "lungile.moyo@moderntech.com"
  },
  {
      employeeId: 3,
      name: "Thabo Molefe",
      position: "Quality Analyst",
      department: "QA",
      salary: 55000,
      employmentHistory: "Joined in 2018",
      contact: "thabo.molefe@moderntech.com"
  },
  {
      employeeId: 4,
      name: "Keshav Naidoo",
      position: "Sales Representative",
      department: "Sales",
      salary: 60000,
      employmentHistory: "Joined in 2020",
      contact: "keshav.naidoo@moderntech.com"
  },
  {
      employeeId: 5,
      name: "Zanele Khumalo",
      position: "Marketing Specialist",
      department: "Marketing",
      salary: 58000,
      employmentHistory: "Joined in 2019",
      contact: "zanele.khumalo@moderntech.com"
  },
  {
      employeeId: 6,
      name: "Sipho Zulu",
      position: "UI/UX Designer",
      department: "Design",
      salary: 65000,
      employmentHistory: "Joined in 2016",
      contact: "sipho.zulu@moderntech.com"
  },
  {
      employeeId: 7,
      name: "Naledi Moeketsi",
      position: "DevOps Engineer",
      department: "IT",
      salary: 72000,
      employmentHistory: "Joined in 2017",
      contact: "naledi.moeketsi@moderntech.com"
  },
  {
      employeeId: 8,
      name: "Farai Gumbo",
      position: "Content Strategist",
      department: "Marketing",
      salary: 56000,
      employmentHistory: "Joined in 2021",
      contact: "farai.gumbo@moderntech.com"
  },
  {
      employeeId: 9,
      name: "Karabo Dlamini",
      position: "Accountant",
      department: "Finance",
      salary: 62000,
      employmentHistory: "Joined in 2018",
      contact: "karabo.dlamini@moderntech.com"
  },
  {
      employeeId: 10,
      name: "Fatima Patel",
      position: "Customer Support Lead",
      department: "Support",
      salary: 58000,
      employmentHistory: "Joined in 2016",
      contact: "fatima.patel@moderntech.com"
  }
]

// Dummy data: payroll data
const payrollData = [
  {
      employeeId: 1,
      hoursWorked: 160,
      leaveDeductions: 8,
      finalSalary: 69500
  },
  {
      employeeId: 2,
      hoursWorked: 150,
      leaveDeductions: 10,
      finalSalary: 79000
  },
  {
      employeeId: 3,
      hoursWorked: 170,
      leaveDeductions: 4,
      finalSalary: 54800
  },
  {
      employeeId: 4,
      hoursWorked: 165,
      leaveDeductions: 6,
      finalSalary: 59700
  },
  {
      employeeId: 5,
      hoursWorked: 158,
      leaveDeductions: 5,
      finalSalary: 57850
  },
  {
      employeeId: 6,
      hoursWorked: 168,
      leaveDeductions: 2,
      finalSalary: 64800
  },
  {
      employeeId: 7,
      hoursWorked: 175,
      leaveDeductions: 3,
      finalSalary: 71800
  },
  {
      employeeId: 8,
      hoursWorked: 160,
      leaveDeductions: 0,
      finalSalary: 56000
  },
  {
      employeeId: 9,
      hoursWorked: 155,
      leaveDeductions: 5,
      finalSalary: 61500
  },
  {
      employeeId: 10,
      hoursWorked: 162,
      leaveDeductions: 4,
      finalSalary: 57750
  }
]

const employee = JSON.parse(localStorage.getItem("selectedEmployee"));

const payroll = payrollData.find(
    p => p.employeeId === employee.employeeId
);

const hourlyRates = payrollData.map(employee => ({
    employeeId: employee.employeeId,
    hourlyRate: (employee.finalSalary / (employee.hoursWorked - employee.leaveDeductions)).toFixed(2)
}));

const hourlyDeductions = payroll.leaveDeductions*hourlyRates;
document.getElementById("deduction").textContent = "R" + hourlyDeductions.toFixed(2);

document.getElementById("employeeName").textContent = employee.name;

document.getElementById("salary").textContent = "R" + employee.salary.toLocaleString();

document.getElementById("deduction").textContent = payroll.leaveDeductions + " Hours";

function generatePayslip(){
    localStorage.setItem("selectedEmployee", JSON.stringify(employee))

    window.location.href = "payslip.html"
}

function generatePayslip(selectedEmployee) {
    const employee = employees.find(emp => emp.employeeId ===1)
    const payroll = payrollData.find(pay => pay.employeeId)
    localStorage.setItem("selectedEmployee", JSON.stringify(employee));

    window.location.href = "payslip.html"
}