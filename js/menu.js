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

        daysOfWeek.forEach((day, index) => {
            const dayMenu = menu[day] || { lunch: "Not Scheduled", dinner: "Not Scheduled" };
            const isToday = day === todayDay;

            const card = document.createElement("div");
            card.className = "card menu-widget animate-in";
            card.style.margin = "0";
            card.style.borderRadius = "24px";
            card.style.animationDelay = `${index * 0.05}s`;
            
            if (isToday) {
                card.style.border = "2px solid #0071E3";
            } else {
                card.style.border = "1px solid var(--border-color)";
                card.style.boxShadow = "none";
            }

            card.innerHTML = `
                <div class="menu-day-title" style="padding: 16px 20px; font-weight: 600; border-bottom: 1px solid var(--border-color); ${isToday ? 'background-color: #0071E3; color: white;' : 'background-color: var(--bg-secondary); color: var(--text-main);'} border-top-left-radius: 24px; border-top-right-radius: 24px;">
                    <span><i class="fa-solid fa-calendar-day"></i> ${day}</span>
                    ${isToday ? '<span class="badge" style="color:#0071E3; background-color:white; font-size:11px; padding:4px 8px; border-radius: 12px; font-weight: 600;">TODAY</span>' : ''}
                </div>
                <div class="menu-meals" style="padding: 20px;">
                    <div class="menu-meal-block">
                        <div class="meal-label" style="color: #FF9500; font-weight: 500;"><i class="fa-solid fa-sun"></i> Lunch</div>
                        <div class="meal-value" style="font-size: 15px; color: var(--text-main); margin-top: 4px;">${dayMenu.lunch}</div>
                    </div>
                    <div class="menu-meal-block" style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px;">
                        <div class="meal-label" style="color: #0071E3; font-weight: 500;"><i class="fa-solid fa-moon"></i> Dinner</div>
                        <div class="meal-value" style="font-size: 15px; color: var(--text-main); margin-top: 4px;">${dayMenu.dinner}</div>
                    </div>
                </div>
                <div style="padding: 0 20px 20px 20px;">
                    <button class="btn btn-outline edit-menu-btn" data-day="${day}" style="width: 100%; border-radius: 12px; font-weight: 500; ${isToday ? 'border-color: #0071E3; color: #0071E3;' : ''}"><i class="fa-solid fa-pen-to-square"></i> Edit Day Menu</button>
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
