// Login.js - Admin login page handler with Mithun & Admin Full Permission Accounts (v29.0)

document.addEventListener("DOMContentLoaded", () => {
    // Redirect if already logged in
    if (sessionStorage.getItem("admin_logged_in") === "true") {
        window.location.href = "admin.html";
        return;
    }

    const loginForm = document.getElementById("login-form");
    const usernameSelect = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const togglePwEye = document.getElementById("toggle-pw-eye");

    // 1. Password Visibility Toggle
    if (togglePwEye && passwordInput) {
        togglePwEye.addEventListener("click", () => {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            
            if (type === "text") {
                togglePwEye.classList.remove("fa-eye-slash");
                togglePwEye.classList.add("fa-eye");
            } else {
                togglePwEye.classList.remove("fa-eye");
                togglePwEye.classList.add("fa-eye-slash");
            }
        });
    }

    // 2. Form submission handler
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const username = usernameSelect ? usernameSelect.value.trim().toLowerCase() : "admin";
            const inputPassword = passwordInput.value;
            const settings = db.getSettings();
            const correctPassword = settings.adminPassword || "admin";

            const validAdmins = ["admin", "mithun"];

            if (validAdmins.includes(username) && inputPassword === correctPassword) {
                const displayName = username === "mithun" ? "Mithun" : "Admin";
                sessionStorage.setItem("admin_logged_in", "true");
                sessionStorage.setItem("current_admin_user", displayName);
                
                showLocalToast(`Welcome Admin ${displayName}! Redirecting...`, "success");
                
                setTimeout(() => {
                    window.location.href = "admin.html";
                }, 800);
            } else {
                showLocalToast("Incorrect password. Please try again.", "danger");
                passwordInput.value = "";
                passwordInput.focus();
            }
        });
    }

    // Simple toast inside login context
    function showLocalToast(message, type = "success") {
        let container = document.querySelector(".toast-container");
        if (!container) {
            container = document.createElement("div");
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add("show"), 10);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});
