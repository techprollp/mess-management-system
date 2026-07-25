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

        const colors = ['#0071E3', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#FF2D55'];

        activeMembers.forEach((m, index) => {
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

            const initial = m.name ? m.name.charAt(0).toUpperCase() : '?';
            const avatarColor = colors[m.id % colors.length] || colors[0];
            const animationDelay = (index * 0.05).toFixed(2);

            // Mobile Card Markup
            const mobileCard = document.createElement("div");
            mobileCard.className = "contact-card animate-in";
            mobileCard.style.animationDelay = `${animationDelay}s`;
            mobileCard.style.marginBottom = "12px";
            mobileCard.style.display = "flex";
            mobileCard.style.alignItems = "center";
            mobileCard.style.gap = "12px";
            mobileCard.style.width = "100%";
            mobileCard.innerHTML = `
                <div class="avatar" style="background-color: ${avatarColor}; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">${initial}</div>
                <div style="flex-grow: 1;">
                    <div style="font-weight: 600; font-size: 16px; color: var(--text-color);">${m.name}</div>
                    <div style="font-size: 13px; color: var(--text-muted);">${m.phone || 'No phone'}</div>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <button type="button" class="btn btn-sm ${hasLunch ? 'btn-success' : 'btn-outline'}" id="mob-lunch-btn-${m.id}" style="border-radius: 20px; font-size:12px; padding: 4px 10px; width: 90px; display:flex; justify-content:space-between; align-items:center; transition: all 0.2s;">
                        <span>☀️ Lunch</span> <span>${hasLunch ? '●' : '○'}</span>
                    </button>
                    <button type="button" class="btn btn-sm ${hasDinner ? 'btn-success' : 'btn-outline'}" id="mob-dinner-btn-${m.id}" style="border-radius: 20px; font-size:12px; padding: 4px 10px; width: 90px; display:flex; justify-content:space-between; align-items:center; transition: all 0.2s;">
                        <span>🌙 Dinner</span> <span>${hasDinner ? '●' : '○'}</span>
                    </button>
                    <input type="checkbox" id="mob-lunch-${m.id}" data-id="${m.id}" data-type="lunch" class="lunch-cb" style="display:none;" ${hasLunch ? 'checked' : ''}>
                    <input type="checkbox" id="mob-dinner-${m.id}" data-id="${m.id}" data-type="dinner" class="dinner-cb" style="display:none;" ${hasDinner ? 'checked' : ''}>
                </div>
            `;
            mobileList.appendChild(mobileCard);

            // Link desktop and mobile inputs so toggling one updates the other!
            const dl = tr.querySelector(`#desk-lunch-${m.id}`);
            const dd = tr.querySelector(`#desk-dinner-${m.id}`);
            const ml = mobileCard.querySelector(`#mob-lunch-${m.id}`);
            const md = mobileCard.querySelector(`#mob-dinner-${m.id}`);
            const mlBtn = mobileCard.querySelector(`#mob-lunch-btn-${m.id}`);
            const mdBtn = mobileCard.querySelector(`#mob-dinner-btn-${m.id}`);

            const updateMobileBtn = (btn, isChecked, type) => {
                if (isChecked) {
                    btn.className = "btn btn-sm btn-success";
                    btn.innerHTML = `<span>${type === 'lunch' ? '☀️ Lunch' : '🌙 Dinner'}</span> <span>●</span>`;
                } else {
                    btn.className = "btn btn-sm btn-outline";
                    btn.innerHTML = `<span>${type === 'lunch' ? '☀️ Lunch' : '🌙 Dinner'}</span> <span>○</span>`;
                }
            };

            mlBtn.addEventListener("click", () => {
                ml.checked = !ml.checked;
                dl.checked = ml.checked;
                updateMobileBtn(mlBtn, ml.checked, 'lunch');
            });

            mdBtn.addEventListener("click", () => {
                md.checked = !md.checked;
                dd.checked = md.checked;
                updateMobileBtn(mdBtn, md.checked, 'dinner');
            });

            dl.addEventListener("change", (e) => {
                ml.checked = e.target.checked;
                updateMobileBtn(mlBtn, ml.checked, 'lunch');
            });

            dd.addEventListener("change", (e) => {
                md.checked = e.target.checked;
                updateMobileBtn(mdBtn, md.checked, 'dinner');
            });

            ml.addEventListener("change", (e) => {
                dl.checked = e.target.checked;
                updateMobileBtn(mlBtn, ml.checked, 'lunch');
            });

            md.addEventListener("change", (e) => {
                dd.checked = e.target.checked;
                updateMobileBtn(mdBtn, md.checked, 'dinner');
            });
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
            if (cb.checked !== allLunchChecked) {
                cb.checked = allLunchChecked;
                cb.dispatchEvent(new Event('change'));
            }
        });
        window.showToast(allLunchChecked ? "All Lunch checked" : "All Lunch unchecked", "info");
    });

    toggleDinnerBtn.addEventListener("click", () => {
        allDinnerChecked = !allDinnerChecked;
        document.querySelectorAll(".dinner-cb").forEach(cb => {
            if (cb.checked !== allDinnerChecked) {
                cb.checked = allDinnerChecked;
                cb.dispatchEvent(new Event('change'));
            }
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
