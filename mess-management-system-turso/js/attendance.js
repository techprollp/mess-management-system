// Attendance.js - Attendance logger management script

document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("attendance-date");
    const dateBadge = document.getElementById("date-badge-label");
    const desktopTbody = document.getElementById("attendance-table-body");
    const mobileList = document.getElementById("attendance-mobile-list");
    const logForm = document.getElementById("attendance-log-form");

    const toggleLunchBtn = document.getElementById("toggle-all-lunch");
    const toggleDinnerBtn = document.getElementById("toggle-all-dinner");

    // Initialize with today's date
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Trigger updates if cloud changes occur
    document.addEventListener("db-updated", () => {
        renderChecklist();
    });

    function renderChecklist() {
        desktopTbody.innerHTML = "";
        mobileList.innerHTML = "";

        const selectedDate = dateInput.value;
        
        // Update today indicator badge
        const isToday = selectedDate === today;
        dateBadge.textContent = isToday ? "Today" : selectedDate;
        dateBadge.className = `badge ${isToday ? 'badge-success' : 'badge-warning'}`;

        const activeMembers = db.getMembers().filter(m => m.status === "active");
        const attendance = db.getAttendance();
        const dailyRecord = attendance[selectedDate] || {};

        if (activeMembers.length === 0) {
            desktopTbody.innerHTML = `<tr><td colspan="4" class="empty-state"><i class="fa-solid fa-user-slash"></i><p>No active members to show.</p></td></tr>`;
            mobileList.innerHTML = `<div class="empty-state"><i class="fa-solid fa-user-slash"></i><p>No active members.</p></div>`;
            return;
        }

        activeMembers.forEach(m => {
            // If no record exists for this date, default to true
            let hasLunch = true;
            let hasDinner = true;

            if (dailyRecord[m.id] !== undefined) {
                hasLunch = dailyRecord[m.id].lunch !== false;
                hasDinner = dailyRecord[m.id].dinner !== false;
            }

            // Desktop Row Markup (Styled checkbox styling)
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${m.name}</strong></td>
                <td><span style="font-size:12px; color:var(--text-muted);">${m.phone}</span></td>
                <td style="text-align: center;">
                    <input type="checkbox" id="desk-lunch-${m.id}" data-id="${m.id}" data-type="lunch" class="lunch-cb form-control" style="width:20px; height:20px; margin:0 auto;" ${hasLunch ? 'checked' : ''}>
                </td>
                <td style="text-align: center;">
                    <input type="checkbox" id="desk-dinner-${m.id}" data-id="${m.id}" data-type="dinner" class="dinner-cb form-control" style="width:20px; height:20px; margin:0 auto;" ${hasDinner ? 'checked' : ''}>
                </td>
            `;
            desktopTbody.appendChild(tr);

            // Mobile Card Markup
            const mobileCard = document.createElement("div");
            mobileCard.className = "mobile-table-card";
            mobileCard.innerHTML = `
                <div class="card-row">
                    <span class="row-label">Roommate</span>
                    <span class="row-value"><strong>${m.name}</strong></span>
                </div>
                <div class="card-row" style="margin-top: 6px;">
                    <span class="row-label"><i class="fa-solid fa-sun" style="color:var(--warning);"></i> Lunch</span>
                    <span class="row-value">
                        <input type="checkbox" id="mob-lunch-${m.id}" data-id="${m.id}" data-type="lunch" class="lunch-cb form-control" style="width:22px; height:22px;" ${hasLunch ? 'checked' : ''}>
                    </span>
                </div>
                <div class="card-row">
                    <span class="row-label"><i class="fa-solid fa-moon" style="color:var(--info);"></i> Dinner</span>
                    <span class="row-value">
                        <input type="checkbox" id="mob-dinner-${m.id}" data-id="${m.id}" data-type="dinner" class="dinner-cb form-control" style="width:22px; height:22px;" ${hasDinner ? 'checked' : ''}>
                    </span>
                </div>
            `;
            mobileList.appendChild(mobileCard);

            // Link desktop and mobile inputs so toggling one updates the other!
            const dl = tr.querySelector(`#desk-lunch-${m.id}`);
            const dd = tr.querySelector(`#desk-dinner-${m.id}`);
            const ml = mobileCard.querySelector(`#mob-lunch-${m.id}`);
            const md = mobileCard.querySelector(`#mob-dinner-${m.id}`);

            dl.addEventListener("change", (e) => ml.checked = e.target.checked);
            ml.addEventListener("change", (e) => dl.checked = e.target.checked);
            dd.addEventListener("change", (e) => md.checked = e.target.checked);
            md.addEventListener("change", (e) => dd.checked = e.target.checked);
        });

        // Hide/Show tables
        const checkResponsive = () => {
            if (window.innerWidth <= 768) {
                mobileList.style.display = "block";
            } else {
                mobileList.style.display = "none";
            }
        };
        window.addEventListener("resize", checkResponsive);
        checkResponsive();
    }

    // Toggle all columns helper
    let allLunchChecked = true;
    let allDinnerChecked = true;

    toggleLunchBtn.addEventListener("click", () => {
        allLunchChecked = !allLunchChecked;
        document.querySelectorAll(".lunch-cb").forEach(cb => {
            cb.checked = allLunchChecked;
        });
        window.showToast(allLunchChecked ? "All Lunch checked" : "All Lunch unchecked", "info");
    });

    toggleDinnerBtn.addEventListener("click", () => {
        allDinnerChecked = !allDinnerChecked;
        document.querySelectorAll(".dinner-cb").forEach(cb => {
            cb.checked = allDinnerChecked;
        });
        window.showToast(allDinnerChecked ? "All Dinner checked" : "All Dinner unchecked", "info");
    });

    // Form Save
    logForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const selectedDate = dateInput.value;
        const activeMembers = db.getMembers().filter(m => m.status === "active");
        
        const record = {};
        
        activeMembers.forEach(m => {
            // Read either desktop or mobile checkbox (linked)
            const lunchCheckbox = document.getElementById(`desk-lunch-${m.id}`) || document.getElementById(`mob-lunch-${m.id}`);
            const dinnerCheckbox = document.getElementById(`desk-dinner-${m.id}`) || document.getElementById(`mob-dinner-${m.id}`);
            
            record[m.id] = {
                lunch: lunchCheckbox ? lunchCheckbox.checked : true,
                dinner: dinnerCheckbox ? dinnerCheckbox.checked : true
            };
        });

        const attendance = db.getAttendance();
        attendance[selectedDate] = record;
        db.saveAttendance(attendance);

        window.showToast(`Saved attendance for ${selectedDate} successfully.`);
        renderChecklist();
    });

    // Date change trigger
    dateInput.addEventListener("change", renderChecklist);

    // Run initial rendering
    renderChecklist();
});
