# Room 803 Mess Management System

A premium, modern, and fully responsive **Mess Management & Expense Sharing Web Application** designed specifically for Room 803. Built as a lightweight, static frontend that requires **no servers or databases** to run, making it 100% compatible with free hosting on **GitHub Pages**.

All data is stored securely in the browser's `LocalStorage` database with full JSON support for database backups, restores, and reset operations.

---

## 🚀 Key Features

*   🔐 **Admin login** (Secure, client-side session authentication).
*   👤 **Roommates Registry** (Search, filter, add, edit, and delete members).
*   🍛 **Weekly Meal Planner** (Configure lunch and dinner menus daily).
*   💰 **Automatic Monthly Expense Splitting** (Instantly aggregates costs and divides them by active members).
*   📄 **Bills & Invoice Tracker** (Attach receipt files, simulate files retrieval, categorize charges).
*   🟢 **Payment Status Tracker** (Mark members Paid/Pending, log transaction dates, record variable payments).
*   💬 **WhatsApp Payment Reminders** (Generate personalized message templates and launch WhatsApp chat for unpaid members with one click).
*   📊 **Analytics Dashboard** (KPI counters, visual expense distribution and collection doughnut/pie charts using Chart.js).
*   📈 **Consolidated Monthly Reports** (Category summary, member ledger statements, dynamic month filters, CSV export capability).
*   🖨️ **Print-Ready Accounts** (Custom print stylesheet that compiles accounts into a clean A4 printed sheet).
*   🌙 **Light & Dark Mode** (System preference detection with toggle switch).
*   📱 **Mobile-First Responsive Layout** (Sticky bottom navigation bar with fluid animations for mobile devices and sidebar layout for desktop).
*   💾 **Backup & Restore Panel** (Export database state as JSON and restore on any other browser or device).

---

## 📂 Project Structure

```text
mess-management-system/
│
├── index.html         # Public Home portal (Member view, meal plans, status checker)
├── login.html         # Administrative Login portal
├── admin.html         # Admin Dashboard (KPI metrics & Chart.js charts)
├── register.html      # Add New Member registration form
├── members.html       # Members Directory directory list
├── menu.html          # Weekly Meal Planner
├── bills.html         # Expense & Receipt Invoices log
├── payments.html      # Payments ledger manager
├── reports.html       # Printable monthly summaries & CSV exporter
├── settings.html      # System room settings, passwords & backup tools
│
├── css/
│   ├── style.css      # Core theme, variables, typography, layouts & dark mode
│   ├── dashboard.css  # Stats grid, charts containers & tables
│   └── responsive.css # Media queries, mobile bottom nav & compact lists
│
└── js/
    ├── storage.js     # DB LocalStorage access layer & initial 24 members seed data
    ├── app.js         # Navigation builder, router checks, header/sidebar injection & theme
    ├── login.js       # Admin authentication & redirects
    ├── dashboard.js   # Chart.js renderers & stats aggregation
    ├── members.js     # Members CRUD, filter routines & modal dialogs
    ├── menu.js        # Menu scheduler actions
    ├── bills.js       # Bill items recorder & fee calculations
    ├── payments.js    # Ledger controller & WhatsApp link launcher
    └── reports.js     # Report aggregators, PDF print & CSV download
```

---

## 🛠️ Installation & Setup

Since this is a client-side static application, running it locally is extremely simple:

1.  **Clone or Download** this folder to your machine.
2.  Open [index.html](file:///C:/Users/User/.gemini/antigravity/scratch/mess-management-system/index.html) in any modern web browser (Google Chrome, Microsoft Edge, Safari, Mozilla Firefox).
3.  **That's it!** The system automatically seeds 24 active members and July 2026 expenses so you can test all features immediately.

### Admin Credentials (Default)
*   **Username**: `Admin` (Fixed)
*   **Password**: `admin` (Can be modified inside the Settings tab)

---

## 🌐 Deploy to GitHub Pages (Free Hosting)

Host this website online for free so all room members can access the Home portal and search their payment status:

1.  Create a new repository on GitHub (e.g. `mess-management-system`).
2.  Commit and push the project files to the repository.
3.  Go to repository **Settings** -> **Pages**.
4.  Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
5.  Select your branch (usually `main` or `master`) and folder (`/root`), then click **Save**.
6.  GitHub will give you a live URL (e.g., `https://username.github.io/mess-management-system/`). Share this URL with your roommates!

---

## 💾 Database Backups (Import/Export)

Since the website stores database records inside browser local storage:
1.  Navigate to the **Settings** page.
2.  Click **Export JSON Backup** to download your database file (`room_803_mess_database_backup.json`).
3.  To transfer data to another device or browser, open Settings on that device, choose the exported JSON backup file, and click **Import**.
