AL'ANSAR ACADEMY DEDERI — SCHOOL WEBSITE & MANAGEMENT SYSTEM

REQUIREMENTS: Node.js 22.5 or newer (uses built-in node:sqlite).

START
1. Extract this ZIP and open a terminal in the alansar-academy folder.
2. Run: node server.js
3. On first startup, school.db is created and a randomly generated admin password is printed in the terminal.
4. Login: http://localhost:3000/admin.html (username: admin).
5. Public website: http://localhost:3000

DATABASE
- SQLite file: school.db. Back it up regularly and keep it private.
- Choose a password on first run:
  Linux/macOS: ADMIN_PASSWORD='YourStrongPassword' node server.js
  Windows PowerShell: $env:ADMIN_PASSWORD='YourStrongPassword'; node server.js

FEATURES
- Student records, admission numbers, classes, guardian and medical information.
- Staff records and online admission applications.
- Examinations by session, term and class.
- CA and exam score entry; totals, grades and remarks are calculated and stored.
- Re-entering a student's result for the same exam updates that record.
- Print displayed result lists and existing school forms using the browser print dialog (A4).

DEFAULT GRADING: A 70–100%; B 60–69%; C 50–59%; D 45–49%; E 40–44%; F below 40%.
Each exam has configurable CA/exam maximum marks (default 40 + 60).

IMPORTANT DEPLOYMENT NOTES
- This is a Node.js + SQLite application, not a static-only website. Deploy to a Node.js host with persistent disk storage.
- Sessions are cleared when the server restarts; sign in again.
- Use HTTPS in production and maintain secure backups.
- The current authentication is an administrator account. Separate staff-role accounts and granular permissions are not yet implemented; do not share the admin password.
- Test with sample data before entering real student records.
