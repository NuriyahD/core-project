core-project
ModernTech Solutions — HR Management Dashboard
A front-end prototype of an internal HR / Workforce Management platform for ModernTech Solutions. The project is a set of static, self-contained HTML pages (HTML + CSS + JavaScript, styled with Bootstrap) that together mimic a full HR suite: employee records, attendance, time tracking, scheduling, time off, performance reviews, and platform settings.

There is no backend server — each page either holds its data inline in JavaScript or loads it from the bundled JSON files (Employee_info.json, Attendence.json) using fetch(). This makes the project easy to preview locally, but it also means some data will not persist between page reloads unless a page specifically uses localStorage.

**Live site:** https://nuriyahd.github.io/core-project/
:rocket: Getting Started / How to Access the Site
Open the site in your browser:
   - `https://nuriyahd.github.io/core-project/index.html`
You’ll land on the Sign In page. Fill in the form with with our dummy data:
   - **Work email** — `dummytest@moderntech.com` email address (must match a registered employee)

   - **Department / Role** — your job title or department (e.g. `Software Engineer`, `HR`, `QA`). **Important:** entering `HR` here logs you in as an HR admin and routes you to the HR home page; anything else routes you to the standard employee dashboard.

   - **Password** — any password of **8 characters or more** ( the password is `ABC12345`)

3. Click **Sign In**.

   - :white_check_mark: If the email matches a registered account, you'll be redirected automatically:

     - `HR` role → `home.html` (HR dashboard)

     - Any other role → `dashboard.html` (employee dashboard)

   - :x: If the email isn't recognized, an "Account not found" popup will appear — double   check the email or use one of the sample accounts below.

4. No account? Use the **Create Account** link on the sign-in page (`signup.html`) to register a new employee email first.

Project Structure
.
├── employees.html              # Employee directory / records
├── Attendence.html             # Daily attendance tracker
├── TimeOff.html                # Leave / time-off request management
├── TimeSheet.html              # Weekly employee timesheets
├── TimeTracker.html            # Live task & project time tracker (stopwatch style)
├── Scheduling.html             # Employee shift schedule tracker
├── ReviewCycle.html            # Performance review cycle management
├── Payslip.html                # Employees payment records
├── performance_reviews.html    # Performance review dashboard (v2 design — primary)
├── setting.html                # Enterprise / platform settings
├── Employee_info.json          # Sample employee master data (used by several pages)
├── Attendence.json             # Sample attendance & leave data (used by several pages)
└── README.md                   # This file
File-by-File Guide
signup.html — Sign Up Page
Sign up page for creating a new employee account. Includes a form for entering employee details and submitting them to the server. Loads employee data from Employee_info.json.

index.html — Sign In Page
Sign in page for existing employees. Includes a form for entering employee details and submitting them to the server. Loads employee data from Employee_info.json.

dashboard.html — Employee Dashboard
Employee dashboard with quick stats, recent applications, and quick actions. Loads employee data from Employee_info.json.

employees.html — Employee Records
Employee directory listing staff with position, department, salary, and contact info. Includes an Add Staff modal (#addStaffModal) for creating new employee entries and search/filter controls. Loads employee data from Employee_info.json.

Attendence.html — Attendance Management
Daily attendance tracker showing Present/Absent status per employee. Includes an Add Entry modal, filtering, and save/clear controls. Pulls data from both Attendence.json and Employee_info.json.

TimeOff.html — Leave Management
Leave/time-off request workflow. Employees (or admins) can Submit Application via the #leaveModal modal; requests can be approved, declined, or filtered. Reads attendance/leave data from Attendence.json.

TimeSheet.html — Employee Time Sheets
Weekly timesheet view per employee with Log Hours and Save Entry actions, plus filtering by employee/date range. Loads employee data from Employee_info.json.

TimeTracker.html — Task & Project Time Tracker
A live stopwatch-style tracker for logging time against tasks/projects, with Start Tracker, Log Warning, and Reset All controls. Data is handled client-side in the page (no external JSON dependency detected).

Scheduling.html — Employee Shift Schedule Tracker
Shift-calendar view with Add New Shift / Save Shift modal, week navigation (Prev/Next), and filters. Data is handled client-side in the page.

payslip.html — Payslip Management
Payroll management page with employee list, salary details, and payment history. Includes Add Employee, Edit Salary, and Generate Payslip actions. Loads employee data from Employee_info.json.

ReviewCycle.html — Review Cycle Management
Admin view for managing active performance-review cycles (e.g. quarterly/annual cycles). Includes a Create Review cycle modal (#newCycleModal) and a Refresh View control. Loads employee data from Employee_info.json.

performance_reviews.html — Performance Review Dashboard (primary)
The main performance review dashboard: view, create (+ New Review), edit, and view full reviews via the #reviewModal modal. This is the more complete/blue-themed (--primary: #2563eb) version and appears to be the one linked to from most other pages.

setting.html — Enterprise Settings
Platform/admin settings page: General settings, Login & security (change password), and Members management, with Edit, Enable, and per-row action menus.

Data Files
Employee_info.json
Array of employee records under employeeInformation, each with:

{
  "employeeId": 1,
  "name": "Sibongile Nkosi",
  "position": "Software Engineer",
  "department": "Development",
  "salary": 70000,
  "employmentHistory": "Joined in 2015, promoted to Senior in 2018",
  "contact": "sibongile.nkosi@moderntech.com"
}
Used by: employees.html, Attendence.html, TimeOff.html(indirectly via Attendence.json), TimeSheet.html, ReviewCycle.html.

Attendence.json
Array of records under attendanceAndLeave, each keyed by employee with a list of daily attendance entries (date + status) and an associated leaveRequests array.

{
  "employeeId": 1,
  "name": "Sibongile Nkosi",
  "attendance": [
    { "date": "2025-07-25", "status": "Present" },
    { "date": "2025-07-26", "status": "Absent" }
  ],
  "leaveRequests": [ ... ]
}
Used by: Attendence.html, TimeOff.html.

Note: All sample data is fictional/placeholder and safe for demo purposes.

Tech Stack
HTML5 / CSS3 — page structure and custom styling (CSS custom properties for theming)

Bootstrap (and Bootstrap Icons on some pages) — layout, components, modals

JavaScript — interactivity, filtering, modal handling, fetch()-based data loading

JSON — static sample data source (no database/back end)

Roles
Krishendree — UI/UX Designer & Frontend Developer (did Figma design and built most pages such as TimeOff, Attendence, TimeSheet, Scheduling, ReviewCycle, performance_reviews, setting and the shared styling)

Ahlumile — Frontend Developer & QA/Integration Lead (auth pages and worked on login page, sign up page and performance review page)

Kirsten — Frontend Developer (sign in page, index page, home page and worked on the core structural dev work)

Nuriyah — Frontend Developer (single page — payslip)

Figma Design
https://www.figma.com/design/KXBXtBw0OjBTN9noFOXR3u/Untitled?node-id=0-1&t=5LtBvXbG7YwfSvMM-1

SDLC DOCUMENTATION
https://docs.google.com/document/d/1cZdYu6stUwmCBU7sThvh8VKTQPIH14wBo-9oE-zHsSU/edit?usp=sharing