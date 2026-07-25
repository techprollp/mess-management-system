// App.js — Apple HIG Global Layout, Navigation, Theme, PWA & Month Picker (v30.0)

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

    // 5. Register PWA
    initPWA();

    // 6. Global Header Actions
    initHeaderActions();

    // 7. Global Month Selector
    initMonthPicker();

    // 7.5 View-Only Mode Enforcement
    if (sessionStorage.getItem("user_role") === "viewer") {
        document.body.classList.add("viewer-mode");
        
        // Use a slight delay to ensure dynamic content like tables and modals have rendered
        setInterval(() => {
            // Disable all form inputs
            document.querySelectorAll("input:not([type='search']):not(#global-month-picker), select, textarea").forEach(el => {
                el.disabled = true;
                el.style.opacity = "0.6";
                el.style.pointerEvents = "none";
            });

            // Hide any remaining edit/delete/action buttons
            const actionBtns = document.querySelectorAll(`
                .edit-meal-btn, .edit-member-btn, .edit-bill-btn, 
                .edit-payment-btn, .delete-btn, .toggle-status-btn, 
                .send-reminder-btn, [data-action="paid"], [data-action="unpaid"],
                #open-add-bill-btn, #add-member-btn, #close-month-btn
            `);
            actionBtns.forEach(btn => btn.style.display = 'none');
        }, 1000);

        // Global click interceptor (capture phase) to prevent any edits/saves
        document.addEventListener("click", (e) => {
            const target = e.target;
            const btn = target.closest("button");
            
            if (btn) {
                // Check if button is safe
                const isSafe = btn.classList.contains("nav-item") || 
                               btn.classList.contains("view-receipt-btn") || 
                               btn.id === "recalc-btn" || 
                               btn.classList.contains("global-sync-btn") || 
                               btn.classList.contains("global-backup-btn") ||
                               btn.classList.contains("theme-toggle") ||
                               btn.classList.contains("mobile-menu-toggle") ||
                               btn.classList.contains("segment-btn") || 
                               btn.id === "print-report-btn" ||
                               btn.id === "export-csv-btn";
                               
                if (!isSafe && !btn.closest(".nav-items") && !btn.closest(".header-actions")) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.showToast("Action disabled in View-Only mode.", "warning");
                }
            }
        }, true);
    }

    // 8. Toast Notification Helper (Apple pill style)
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
        }, 2500);
    };
});

// ════════════════════════════════════════
// Layout Injection — Apple Clean Nav
// ════════════════════════════════════════
function injectLayout(pageName, isLoggedIn, roomNo, activeAdminUser) {
    const rootElement = document.getElementById("app");
    if (!rootElement) return;

    const appContainer = document.createElement("div");
    appContainer.className = "app-container";

    // Build sidebar nav items
    let navItems = "";
    if (isLoggedIn) {
        navItems = `
            <a href="admin.html" class="nav-item ${pageName === 'admin.html' ? 'active' : ''}"><i class="fa-solid fa-house"></i><span>Dashboard</span></a>
            <a href="members.html" class="nav-item ${pageName === 'members.html' || pageName === 'register.html' ? 'active' : ''}"><i class="fa-solid fa-person.2"></i><span>Members</span></a>
            <a href="attendance.html" class="nav-item ${pageName === 'attendance.html' ? 'active' : ''}"><i class="fa-solid fa-clipboard-check"></i><span>Attendance</span></a>
            <a href="menu.html" class="nav-item ${pageName === 'menu.html' ? 'active' : ''}"><i class="fa-solid fa-utensils"></i><span>Menu</span></a>
            <a href="bills.html" class="nav-item ${pageName === 'bills.html' ? 'active' : ''}"><i class="fa-solid fa-receipt"></i><span>Expenses</span></a>
            <a href="payments.html" class="nav-item ${pageName === 'payments.html' ? 'active' : ''}"><i class="fa-solid fa-credit-card"></i><span>Payments</span></a>
            <a href="advance.html" class="nav-item ${pageName === 'advance.html' ? 'active' : ''}"><i class="fa-solid fa-piggy-bank"></i><span>Advance</span></a>
            <a href="reports.html" class="nav-item ${pageName === 'reports.html' ? 'active' : ''}"><i class="fa-solid fa-chart-pie"></i><span>Reports</span></a>
            <a href="settings.html" class="nav-item ${pageName === 'settings.html' ? 'active' : ''}"><i class="fa-solid fa-gear"></i><span>Settings</span></a>
        `;
    } else {
        navItems = `
            <a href="index.html" class="nav-item ${pageName === 'index.html' ? 'active' : ''}"><i class="fa-solid fa-house"></i><span>Home</span></a>
            <a href="login.html" class="nav-item ${pageName === 'login.html' ? 'active' : ''}"><i class="fa-solid fa-lock"></i><span>Sign In</span></a>
        `;
    }

    // Fix FontAwesome icon class names (person.2 is SF Symbols, use fa-users instead)
    navItems = navItems.replace('fa-person.2', 'fa-users');

    // ── Sidebar (Desktop) ──
    const sidebar = document.createElement("aside");
    sidebar.className = "sidebar";
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <div class="sidebar-logo">🍽️</div>
            <div class="sidebar-title">
                <h1>Room ${roomNo}</h1>
                <span>${isLoggedIn ? activeAdminUser : 'Public Portal'}</span>
            </div>
        </div>
        <nav class="sidebar-nav">
            ${navItems}
        </nav>
        <div class="sidebar-footer">
            <button id="theme-toggle-desktop" class="nav-item" style="border:none; background:none; cursor:pointer; width:100%; text-align:left; font-family:inherit; font-size:14px;">
                <i class="fa-solid fa-moon"></i><span>Dark Mode</span>
            </button>
            ${isLoggedIn ? `
                <a href="#" id="logout-btn-desktop" class="nav-item" style="color: var(--danger);">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i><span>Sign Out</span>
                </a>
            ` : ''}
        </div>
    `;

    // ── Mobile Header ──
    const mobileHeader = document.createElement("header");
    mobileHeader.className = "mobile-header";
    mobileHeader.innerHTML = `
        <div class="mobile-logo">
            <div class="mobile-logo-box">🍽️</div>
            <span>Room ${roomNo}</span>
        </div>
        <div style="display: flex; gap: 6px; align-items: center;">
            ${isLoggedIn ? `
                <input type="month" id="global-month-picker-mobile" class="form-control" style="width:110px; font-size:11px; padding:4px 6px; border-radius:8px; height:32px; border:1px solid var(--separator);">
                <button class="btn-circle global-sync-btn" style="width:32px; height:32px; border-radius:50%; border:1px solid var(--separator); background:var(--bg-card); color:var(--text-secondary); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px;" title="Sync"><i class="fa-solid fa-arrow-rotate-right"></i></button>
            ` : ''}
            <button id="theme-toggle-mobile" class="theme-toggle" style="width:32px; height:32px; font-size:14px;"><i class="fa-solid fa-moon"></i></button>
            ${isLoggedIn ? `
                <button id="logout-btn-mobile" style="width:32px; height:32px; border-radius:50%; border:1px solid var(--separator); background:var(--bg-card); color:var(--danger); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px;" title="Sign Out"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
            ` : ''}
        </div>
    `;

    // ── Mobile Bottom Tab Bar (Apple Style) ──
    const mobileNav = document.createElement("nav");
    mobileNav.className = "mobile-nav-bar";
    if (isLoggedIn) {
        mobileNav.innerHTML = `
            <a href="admin.html" class="mobile-nav-item ${pageName === 'admin.html' ? 'active' : ''}"><i class="fa-solid fa-house"></i><span>Home</span></a>
            <a href="attendance.html" class="mobile-nav-item ${pageName === 'attendance.html' || pageName === 'menu.html' ? 'active' : ''}"><i class="fa-solid fa-utensils"></i><span>Meals</span></a>
            <a href="bills.html" class="mobile-nav-item ${pageName === 'bills.html' || pageName === 'payments.html' || pageName === 'advance.html' ? 'active' : ''}"><i class="fa-solid fa-credit-card"></i><span>Bills</span></a>
            <a href="members.html" class="mobile-nav-item ${pageName === 'members.html' || pageName === 'register.html' ? 'active' : ''}"><i class="fa-solid fa-users"></i><span>Members</span></a>
            <a href="settings.html" class="mobile-nav-item ${pageName === 'settings.html' || pageName === 'reports.html' ? 'active' : ''}"><i class="fa-solid fa-ellipsis"></i><span>More</span></a>
        `;
    } else {
        mobileNav.innerHTML = `
            <a href="index.html" class="mobile-nav-item ${pageName === 'index.html' ? 'active' : ''}"><i class="fa-solid fa-house"></i><span>Home</span></a>
            <a href="login.html" class="mobile-nav-item ${pageName === 'login.html' ? 'active' : ''}"><i class="fa-solid fa-lock"></i><span>Sign In</span></a>
        `;
    }

    // ── Assemble Layout ──
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

    // ── Logout Handlers ──
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

// ════════════════════════════════════════
// Theme Toggle
// ════════════════════════════════════════
function initTheme() {
    const savedTheme = localStorage.getItem("mess_theme") || "light";
    if (savedTheme === "dark") {
        document.documentElement.classList.add("dark-mode");
    }

    const toggleTheme = () => {
        const isDark = document.documentElement.classList.toggle("dark-mode");
        localStorage.setItem("mess_theme", isDark ? "dark" : "light");
        updateThemeToggleIcons(isDark);
        updateChartTheme(isDark);
    };

    const btnDesktop = document.getElementById("theme-toggle-desktop");
    const btnMobile = document.getElementById("theme-toggle-mobile");

    if (btnDesktop) btnDesktop.addEventListener("click", toggleTheme);
    if (btnMobile) btnMobile.addEventListener("click", toggleTheme);

    updateThemeToggleIcons(savedTheme === "dark");
    updateChartTheme(savedTheme === "dark");
}

function updateChartTheme(isDark) {
    if (window.Chart && Chart.defaults) {
        Chart.defaults.color = isDark ? "#FFFFFF" : "#6E6E73";
        Chart.defaults.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
        
        // Update existing chart instances if they exist
        for (let id in Chart.instances) {
            Chart.instances[id].update();
        }
    }
}

function updateThemeToggleIcons(isDark) {
    const desktopBtn = document.getElementById("theme-toggle-desktop");
    const mobileBtn = document.getElementById("theme-toggle-mobile");

    const iconClass = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    const textVal = isDark ? "Light Mode" : "Dark Mode";

    if (desktopBtn) {
        const icon = desktopBtn.querySelector("i");
        const span = desktopBtn.querySelector("span");
        if (icon) icon.className = iconClass;
        if (span) span.textContent = textVal;
    }
    if (mobileBtn) {
        const icon = mobileBtn.querySelector("i");
        if (icon) icon.className = iconClass;
    }
}

// ════════════════════════════════════════
// PWA
// ════════════════════════════════════════
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
        meta.content = '#0071E3';
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

// ════════════════════════════════════════
// Header Actions (Backup & Sync)
// ════════════════════════════════════════
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
            link.setAttribute("download", `room_${settings.roomNo || '803'}_mess_backup.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (window.showToast) window.showToast("Backup downloaded", "success");
        }

        if (syncBtn) {
            e.preventDefault();
            db.syncAll();
            if (window.showToast) window.showToast("Cloud sync completed", "success");
        }
    });
}

// ════════════════════════════════════════
// Month Picker
// ════════════════════════════════════════
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
