// App.js - Global setup, layout injection, theme control, navigation management, PWA & Month Picker (v29.0)

document.addEventListener("DOMContentLoaded", () => {
    // 1. Authentication Guards
    const path = window.location.pathname;
    const pageName = path.split("/").pop() || "index.html";
    const isAdminPage = !["index.html", "login.html", ""].includes(pageName);
    const isLoggedIn = sessionStorage.getItem("admin_logged_in") === "true";
    const activeAdminUser = sessionStorage.getItem("current_admin_user") || "Admin";

    if (isAdminPage && !isLoggedIn) {
        window.location.href = "login.html";
        return;
    }

    // 2. Setup Database & Settings
    const settings = db.getSettings();
    const currency = settings.currency || "AED";
    const roomNo = settings.roomNo || "803";

    // 3. Inject Navigation (Sidebar & Mobile Nav)
    injectLayout(pageName, isLoggedIn, roomNo, activeAdminUser);

    // 4. Initialize Theme Toggle
    initTheme();

    // 5. Register PWA Manifest & Service Worker for Native App & APK generation
    initPWA();

    // 6. Global Header Backup & Sync Action Handlers
    initHeaderActions();

    // 7. Initialize Global Month Selector
    initMonthPicker();

    // 8. Setup Toast Notification Helper
    window.showToast = function(message, type = "success") {
        let container = document.querySelector(".toast-container");
        if (!container) {
            container = document.createElement("div");
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : (type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-exclamation')}"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add("show"), 10);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };
});

function injectLayout(pageName, isLoggedIn, roomNo, activeAdminUser) {
    const rootElement = document.getElementById("app");
    if (!rootElement) return;

    const appContainer = document.createElement("div");
    appContainer.className = "app-container";

    let navItems = "";
    if (isLoggedIn) {
        navItems = `
            <a href="admin.html" class="nav-item ${pageName === 'admin.html' ? 'active' : ''}"><i class="fa-solid fa-chart-line"></i><span>Dashboard</span></a>
            <a href="members.html" class="nav-item ${pageName === 'members.html' || pageName === 'register.html' ? 'active' : ''}"><i class="fa-solid fa-users"></i><span>Members</span></a>
            <a href="attendance.html" class="nav-item ${pageName === 'attendance.html' ? 'active' : ''}"><i class="fa-solid fa-clipboard-user"></i><span>Daily Attendance</span></a>
            <a href="menu.html" class="nav-item ${pageName === 'menu.html' ? 'active' : ''}"><i class="fa-solid fa-utensils"></i><span>Daily Menu</span></a>
            <a href="bills.html" class="nav-item ${pageName === 'bills.html' ? 'active' : ''}"><i class="fa-solid fa-file-invoice-dollar"></i><span>Bills & Expenses</span></a>
            <a href="payments.html" class="nav-item ${pageName === 'payments.html' ? 'active' : ''}"><i class="fa-solid fa-hand-holding-dollar"></i><span>Payments</span></a>
            <a href="reports.html" class="nav-item ${pageName === 'reports.html' ? 'active' : ''}"><i class="fa-solid fa-chart-pie"></i><span>Monthly Reports</span></a>
            <a href="settings.html" class="nav-item ${pageName === 'settings.html' ? 'active' : ''}"><i class="fa-solid fa-gear"></i><span>Settings</span></a>
            <a href="index.html" class="nav-item"><i class="fa-solid fa-globe"></i><span>Public Page</span></a>
        `;
    } else {
        navItems = `
            <a href="index.html" class="nav-item ${pageName === 'index.html' ? 'active' : ''}"><i class="fa-solid fa-house"></i><span>Home Portal</span></a>
            <a href="login.html" class="nav-item ${pageName === 'login.html' ? 'active' : ''}"><i class="fa-solid fa-lock"></i><span>Admin Login</span></a>
        `;
    }

    const sidebar = document.createElement("aside");
    sidebar.className = "sidebar";
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <div class="sidebar-logo"><i class="fa-solid fa-hotel"></i></div>
            <div class="sidebar-title">
                <h1>Mess System</h1>
                <span>Room ${roomNo} • ${isLoggedIn ? activeAdminUser : 'Public'}</span>
            </div>
        </div>
        <nav class="sidebar-nav">
            ${navItems}
        </nav>
        <div class="sidebar-footer">
            <button id="theme-toggle-desktop" class="theme-toggle" style="width: 100%; border-radius: var(--radius-md); gap: 10px; justify-content: flex-start; padding: 10px 16px;">
                <i class="fa-solid fa-moon"></i> <span>Dark Mode</span>
            </button>
            ${isLoggedIn ? `
                <a href="#" id="logout-btn-desktop" class="nav-item" style="color: var(--danger);"><i class="fa-solid fa-right-from-bracket"></i><span>Logout (${activeAdminUser})</span></a>
            ` : ''}
        </div>
    `;

    const mobileHeader = document.createElement("header");
    mobileHeader.className = "mobile-header";
    mobileHeader.innerHTML = `
        <div class="mobile-logo">
            <div class="mobile-logo-box"><i class="fa-solid fa-hotel"></i></div>
            <span>Room ${roomNo} ${isLoggedIn ? '• ' + activeAdminUser : ''}</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
            ${isLoggedIn ? `
                <input type="month" id="global-month-picker-mobile" class="form-control" style="width:115px; font-size:11px; padding:2px 6px; border-radius:var(--radius-sm); height:34px;">
                <button class="btn btn-outline btn-circle global-sync-btn" title="Sync Cloud" style="width:34px; height:34px; border-radius:50%; display:flex; justify-content:center; align-items:center; padding:0;"><i class="fa-solid fa-rotate"></i></button>
                <button class="btn btn-outline btn-circle global-backup-btn" title="Backup Database" style="width:34px; height:34px; border-radius:50%; display:flex; justify-content:center; align-items:center; padding:0;"><i class="fa-solid fa-cloud-arrow-down"></i></button>
            ` : ''}
            <button id="theme-toggle-mobile" class="theme-toggle" style="width:34px; height:34px;"><i class="fa-solid fa-moon"></i></button>
            ${isLoggedIn ? `
                <button id="logout-btn-mobile" class="btn btn-outline btn-circle" style="border-radius:50%; width:34px; height:34px; display:flex; justify-content:center; align-items:center; color: var(--danger); border-color: var(--danger); padding:0;" title="Logout"><i class="fa-solid fa-right-from-bracket"></i></button>
            ` : ''}
        </div>
    `;

    const mobileNav = document.createElement("nav");
    mobileNav.className = "mobile-nav-bar";
    if (isLoggedIn) {
        mobileNav.innerHTML = `
            <a href="admin.html" class="mobile-nav-item ${pageName === 'admin.html' ? 'active' : ''}"><i class="fa-solid fa-chart-line"></i><span>Dashboard</span></a>
            <a href="attendance.html" class="mobile-nav-item ${pageName === 'attendance.html' ? 'active' : ''}"><i class="fa-solid fa-clipboard-user"></i><span>Attendance</span></a>
            <a href="members.html" class="mobile-nav-item ${pageName === 'members.html' || pageName === 'register.html' ? 'active' : ''}"><i class="fa-solid fa-users"></i><span>Members</span></a>
            <a href="bills.html" class="mobile-nav-item ${pageName === 'bills.html' || pageName === 'payments.html' ? 'active' : ''}"><i class="fa-solid fa-file-invoice-dollar"></i><span>Expenses</span></a>
            <a href="settings.html" class="mobile-nav-item ${pageName === 'settings.html' ? 'active' : ''}"><i class="fa-solid fa-gear"></i><span>Settings</span></a>
        `;
    } else {
        mobileNav.innerHTML = `
            <a href="index.html" class="mobile-nav-item ${pageName === 'index.html' ? 'active' : ''}"><i class="fa-solid fa-house"></i><span>Home</span></a>
            <a href="login.html" class="mobile-nav-item ${pageName === 'login.html' ? 'active' : ''}"><i class="fa-solid fa-lock"></i><span>Login</span></a>
        `;
    }

    const mainContent = document.createElement("main");
    mainContent.className = "main-content";
    
    while (rootElement.firstChild) {
        mainContent.appendChild(rootElement.firstChild);
    }

    appContainer.appendChild(sidebar);
    rootElement.appendChild(mobileHeader);
    appContainer.appendChild(mainContent);
    rootElement.appendChild(appContainer);
    rootElement.appendChild(mobileNav);

    const handleLogout = (e) => {
        e.preventDefault();
        sessionStorage.removeItem("admin_logged_in");
        sessionStorage.removeItem("current_admin_user");
        window.location.href = "index.html";
    };

    const logoutDesktop = document.getElementById("logout-btn-desktop");
    const logoutMobile = document.getElementById("logout-btn-mobile");
    if (logoutDesktop) logoutDesktop.addEventListener("click", handleLogout);
    if (logoutMobile) logoutMobile.addEventListener("click", handleLogout);
}

function initTheme() {
    const savedTheme = localStorage.getItem("mess_theme") || "light";
    if (savedTheme === "dark") {
        document.documentElement.classList.add("dark-mode");
    }

    const toggleTheme = () => {
        const isDark = document.documentElement.classList.toggle("dark-mode");
        localStorage.setItem("mess_theme", isDark ? "dark" : "light");
        updateThemeToggleIcons(isDark);
    };

    const btnDesktop = document.getElementById("theme-toggle-desktop");
    const btnMobile = document.getElementById("theme-toggle-mobile");

    if (btnDesktop) btnDesktop.addEventListener("click", toggleTheme);
    if (btnMobile) btnMobile.addEventListener("click", toggleTheme);

    updateThemeToggleIcons(savedTheme === "dark");
}

function updateThemeToggleIcons(isDark) {
    const desktopBtn = document.getElementById("theme-toggle-desktop");
    const mobileBtn = document.getElementById("theme-toggle-mobile");

    const iconClass = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    const textVal = isDark ? "Light Mode" : "Dark Mode";

    if (desktopBtn) {
        desktopBtn.querySelector("i").className = iconClass;
        desktopBtn.querySelector("span").textContent = textVal;
    }
    if (mobileBtn) {
        mobileBtn.querySelector("i").className = iconClass;
    }
}

function initPWA() {
    if (!document.querySelector('link[rel="manifest"]')) {
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = 'manifest.json';
        document.head.appendChild(manifestLink);
    }

    if (!document.querySelector('meta[name="theme-color"]')) {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = '#2563eb';
        document.head.appendChild(meta);
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('PWA Service Worker registered.'))
                .catch(err => console.log('Service Worker failed:', err));
        });
    }
}

function initHeaderActions() {
    document.addEventListener("click", (e) => {
        const backupBtn = e.target.closest(".global-backup-btn");
        const syncBtn = e.target.closest(".global-sync-btn");

        if (backupBtn) {
            e.preventDefault();
            const settings = db.getSettings();
            const data = db.exportData();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 4));
            
            const link = document.createElement("a");
            link.setAttribute("href", dataStr);
            link.setAttribute("download", `room_${settings.roomNo || '803'}_mess_database_backup.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (window.showToast) window.showToast("JSON Database Backup downloaded!", "success");
        }

        if (syncBtn) {
            e.preventDefault();
            db.syncAll();
            if (window.showToast) window.showToast("Manual cloud sync completed!", "success");
        }
    });
}

function initMonthPicker() {
    const selectedMonth = db.getSelectedMonth();
    const desktopPicker = document.getElementById("global-month-picker");
    const mobilePicker = document.getElementById("global-month-picker-mobile");

    const setupPicker = (element) => {
        if (!element) return;
        element.value = selectedMonth;
        element.addEventListener("change", (e) => {
            const newMonth = e.target.value;
            if (newMonth) {
                db.setSelectedMonth(newMonth);
            }
        });
    };

    setupPicker(desktopPicker);
    setupPicker(mobilePicker);

    document.addEventListener("month-changed", (e) => {
        const newMonth = e.detail.month;
        if (desktopPicker && desktopPicker.value !== newMonth) desktopPicker.value = newMonth;
        if (mobilePicker && mobilePicker.value !== newMonth) mobilePicker.value = newMonth;
    });
}
