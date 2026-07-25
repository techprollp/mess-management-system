// Login.js — Apple-style Admin Login Handler (v30.0)

document.addEventListener("DOMContentLoaded", () => {
    // Redirect if already logged in
    if (sessionStorage.getItem("admin_logged_in") === "true") {
        window.location.href = "admin.html";
        return;
    }

    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const togglePwEye = document.getElementById("toggle-pw-eye");
    const segmentBtns = document.querySelectorAll(".segment-btn");

    // 1. Segmented Control — Apple style account switcher
    segmentBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            segmentBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            usernameInput.value = btn.dataset.user;
        });
    });

    // 2. Password Visibility Toggle
    if (togglePwEye && passwordInput) {
        togglePwEye.addEventListener("click", () => {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            const icon = togglePwEye.querySelector("i");
            icon.className = type === "text" ? "fa-solid fa-eye" : "fa-solid fa-eye-slash";
        });
    }

    // 3. Form submission handler
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const username = usernameInput ? usernameInput.value.trim().toLowerCase() : "admin";
            const inputPassword = passwordInput.value;
            const settings = db.getSettings();
            const correctPassword = settings.adminPassword || "admin";
            const validAdmins = ["admin", "mithun"];

            if (username === "members" && inputPassword === "123") {
                sessionStorage.setItem("admin_logged_in", "true");
                sessionStorage.setItem("current_admin_user", "Members");
                sessionStorage.setItem("user_role", "viewer");
                
                showLocalToast(`Welcome, Members`, "success");
                setTimeout(() => window.location.href = "admin.html", 600);
            } else if (validAdmins.includes(username) && inputPassword === correctPassword) {
                const displayName = username === "mithun" ? "Mithun" : "Admin";
                sessionStorage.setItem("admin_logged_in", "true");
                sessionStorage.setItem("current_admin_user", displayName);
                sessionStorage.setItem("user_role", "admin");

                showLocalToast(`Welcome, ${displayName}`, "success");

                setTimeout(() => {
                    window.location.href = "admin.html";
                }, 600);
            } else {
                showLocalToast("Incorrect password", "danger");
                passwordInput.value = "";
                passwordInput.focus();

                // Shake animation on wrong password
                const card = document.querySelector(".login-card");
                card.style.animation = "none";
                card.offsetHeight; // trigger reflow
                card.style.animation = "shake 0.4s ease";
            }
        });
    }

    // Toast notification (Apple pill style)
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
            <i class="fa-solid ${type === 'success' ? 'fa-checkmark.circle' : 'fa-circle-exclamation'}"></i>
            <span>${message}</span>
        `;
        // Fix icon
        const icon = toast.querySelector("i");
        icon.className = `fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add("show"), 10);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // Shake keyframes (injected once)
    if (!document.querySelector("#shake-style")) {
        const style = document.createElement("style");
        style.id = "shake-style";
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-8px); }
                40% { transform: translateX(8px); }
                60% { transform: translateX(-6px); }
                80% { transform: translateX(6px); }
            }
        `;
        document.head.appendChild(style);
    }
});
