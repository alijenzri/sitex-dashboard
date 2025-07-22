# Sitex Dashboard

## Application Overview

Sitex Dashboard is a web application developed for managing and monitoring quality and production within the Sitex company. It allows administrators to access interactive dashboards, view reports, track key performance indicators (KPIs), and analyze production defects and waste.

**Note:** All statistics displayed on the dashboard and provided by the backend are based on the latest data available in the database.

This application was created as part of a summer internship by a computer science student.

## Main Features

- **Production Dashboard:** View production statistics, KPIs, and real-time production states.
- **Article Defect Management:** List and analyze defects detected on produced articles.
- **Reports Center:** Access quality visit reports, article measurements, and export data.
- **Waste Tracking:** Analyze production waste to improve quality and reduce losses.
- **Modern & Responsive Interface:** Professional, ergonomic design, adapted to all devices.

## Use Cases

- Daily monitoring of production and quality by managers and administrators.
- Defect analysis to improve industrial processes.
- Generation and consultation of reports for quality audits.
- Decision-making based on visual indicators and up-to-date statistics.

## Admin Access

Access to the application is strictly reserved for administrators via a dedicated login page.

### Login Credentials
- **Username:** `sitexadmin`
- **Password:** `sitexadmin`

No registration or password reset is available. Access is limited to the administrator.

### Login Page Functionality
- **Design:** Centered Sitex logo, clean interface, floating label fields, color palette harmonized with the application.
- **Security:**
  - Client-side credential validation only (no server authentication).
  - Session managed via `sessionStorage` (`sitexadmin_logged_in`).
  - Rate limiting: 5 incorrect attempts trigger a 60-second lockout.
  - Password is masked by default, with show/hide option.
- **User Feedback:** Shake animation and red border on error, password field cleared, loading spinner during login.
- **Responsive:** Interface adapts to mobile and tablet devices.

### After Login
- Automatic redirection to the admin dashboard upon successful login.
- Logging out (closing the tab or clearing the session) requires re-authentication.

### Security Notice
> This authentication is for demonstration or internal use only. For production use, secure server-side authentication is essential.

## Author

Project created by a computer science student during a summer internship at Sitex. 