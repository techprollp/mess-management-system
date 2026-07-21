// Menu.js - Weekly Menu planner handler

document.addEventListener("DOMContentLoaded", () => {
    const menuContainer = document.getElementById("weekly-menu-cards");
    const editModal = document.getElementById("edit-menu-modal");
    const editForm = document.getElementById("edit-menu-form");
    const closeBtn = document.getElementById("close-menu-modal-btn");
    const cancelBtn = document.getElementById("cancel-menu-edit-btn");
    const resetBtn = document.getElementById("reset-menu-btn");

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    function renderMenu() {
        menuContainer.innerHTML = "";
        const menu = db.getMenu();

        // Get current day to highlight it
        const date = new Date();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayDay = days[date.getDay()];

        daysOfWeek.forEach(day => {
            const dayMenu = menu[day] || { lunch: "Not Scheduled", dinner: "Not Scheduled" };
            const isToday = day === todayDay;

            const card = document.createElement("div");
            card.className = "card menu-widget";
            card.style.margin = "0";
            if (isToday) {
                card.style.border = "2px solid var(--primary-light)";
                card.style.boxShadow = "var(--shadow-md)";
            }

            card.innerHTML = `
                <div class="menu-day-title" style="${isToday ? 'background: linear-gradient(135deg, var(--primary), var(--primary-light));' : ''}">
                    <span><i class="fa-solid fa-calendar-day"></i> ${day}</span>
                    ${isToday ? '<span class="badge badge-success" style="color:var(--success); background-color:white; font-size:10px; padding:3px 8px;">TODAY</span>' : ''}
                </div>
                <div class="menu-meals">
                    <div class="menu-meal-block">
                        <div class="meal-label"><i class="fa-solid fa-sun"></i> Lunch</div>
                        <div class="meal-value">${dayMenu.lunch}</div>
                    </div>
                    <div class="menu-meal-block" style="border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 12px;">
                        <div class="meal-label" style="color: var(--info);"><i class="fa-solid fa-moon"></i> Dinner</div>
                        <div class="meal-value">${dayMenu.dinner}</div>
                    </div>
                </div>
                <div style="padding: 0 20px 20px 20px;">
                    <button class="btn btn-outline edit-menu-btn" data-day="${day}" style="width: 100%;"><i class="fa-solid fa-pen-to-square"></i> Edit Day Menu</button>
                </div>
            `;

            menuContainer.appendChild(card);
        });

        // Add event listeners to edit buttons
        document.querySelectorAll(".edit-menu-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                openEditModal(btn.dataset.day);
            });
        });
    }

    function openEditModal(day) {
        const menu = db.getMenu();
        const dayMenu = menu[day] || { lunch: "", dinner: "" };

        document.getElementById("modal-day-name").textContent = day;
        document.getElementById("edit-day-key").value = day;
        document.getElementById("edit-lunch-input").value = dayMenu.lunch;
        document.getElementById("edit-dinner-input").value = dayMenu.dinner;

        editModal.classList.add("active");
    }

    function closeEditModal() {
        editModal.classList.remove("active");
        editForm.reset();
    }

    closeBtn.addEventListener("click", closeEditModal);
    cancelBtn.addEventListener("click", closeEditModal);

    // Save menu changes
    editForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const day = document.getElementById("edit-day-key").value;
        const lunch = document.getElementById("edit-lunch-input").value.trim();
        const dinner = document.getElementById("edit-dinner-input").value.trim();

        const menu = db.getMenu();
        menu[day] = { lunch, dinner };

        db.saveMenu(menu);
        closeEditModal();
        window.showToast(`${day} menu updated successfully.`);
        renderMenu();
    });

    // Reset weekly menu to default values
    resetBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset the weekly menu to the default meal plan?")) {
            const DEFAULT_MENU = {
                "Monday": { lunch: "Chicken Biryani + Salad", dinner: "Chapati + Dal + Chicken Curry" },
                "Tuesday": { lunch: "Beef Pulao + Raita", dinner: "Roti + Mix Veg + Fried Fish" },
                "Wednesday": { lunch: "Egg Fried Rice + Manchurian", dinner: "Chapati + Mutton Karahi" },
                "Thursday": { lunch: "Khichdi + Omelette", dinner: "Roti + Aloo Keema" },
                "Friday": { lunch: "Special Mutton Biryani + Salad", dinner: "Paratha + Khabsa" },
                "Saturday": { lunch: "White Rice + Lentil soup (Dal)", dinner: "Chapati + Butter Chicken" },
                "Sunday": { lunch: "Vegetable Pulao", dinner: "Chapati + Beef Haleem" }
            };
            db.saveMenu(DEFAULT_MENU);
            window.showToast("Weekly menu reset to defaults.");
            renderMenu();
        }
    });

    // Initial render
    renderMenu();
});
