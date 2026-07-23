// Advance.js - Advance Payment registry management script (v1.0)

document.addEventListener("DOMContentLoaded", () => {
    const desktopTbody = document.getElementById("advances-table-body");
    const mobileList = document.getElementById("advances-mobile-list");
    const searchInput = document.getElementById("advance-search");
    const categoryFilter = document.getElementById("category-filter");
    const printLedgerBtn = document.getElementById("print-ledger-btn");

    const modal = document.getElementById("advance-modal");
    const form = document.getElementById("advance-form");
    const modalTitle = document.getElementById("modal-title");
    const closeBtn = document.getElementById("close-modal-btn");
    const cancelBtn = document.getElementById("cancel-modal-btn");
    const openAddBtn = document.getElementById("open-add-advance-modal-btn");

    const memberSelect = document.getElementById("advance-member-select");
    const amountInput = document.getElementById("advance-amount");
    const dateInput = document.getElementById("advance-date");
    const categorySelect = document.getElementById("advance-category");
    const idInput = document.getElementById("advance-id");

    const receiptModal = document.getElementById("receipt-modal");
    const closeReceiptBtn = document.getElementById("close-receipt-btn");
    const printReceiptBtn = document.getElementById("print-receipt-btn");

    const settings = db.getSettings();
    const currency = settings.currency || "AED";

    // Listeners
    document.addEventListener("db-updated", () => {
        populateMembers();
        renderAdvances();
    });

    document.addEventListener("month-changed", () => {
        renderAdvances();
    });

    searchInput.addEventListener("input", renderAdvances);
    categoryFilter.addEventListener("change", renderAdvances);
    printLedgerBtn.addEventListener("click", () => {
        window.print();
    });

    // Open Add Modal
    openAddBtn.addEventListener("click", () => {
        openModal();
    });

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        saveAdvance();
    });

    closeReceiptBtn.addEventListener("click", () => {
        receiptModal.classList.remove("active");
    });

    printReceiptBtn.addEventListener("click", () => {
        window.print();
    });

    // Populate members in select dropdown
    function populateMembers() {
        memberSelect.innerHTML = '<option value="" disabled selected>-- Select Roommate --</option>';
        const activeMembers = db.getMembers().filter(m => m.status === "active");
        activeMembers.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent = m.name;
            memberSelect.appendChild(opt);
        });
    }

    // Render registry table
    function renderAdvances() {
        desktopTbody.innerHTML = "";
        mobileList.innerHTML = "";

        const selectedMonth = db.getSelectedMonth();
        const range = db.getMonthRange(selectedMonth);
        const allAdvances = db.getAdvances();
        const members = db.getMembers();

        const searchQuery = searchInput.value.toLowerCase().trim();
        const catFilter = categoryFilter.value;

        // Filter advances by month range, search query, and category
        const filtered = allAdvances.filter(adv => {
            if (!adv || !adv.date) return false;
            // Month Range constraint
            const inMonth = adv.date >= range.startDate && adv.date <= range.endDate;
            if (!inMonth) return false;

            // Search query (member name)
            const member = members.find(m => m.id === adv.memberId);
            const mName = member ? member.name.toLowerCase() : (adv.memberName || "").toLowerCase();
            const matchesSearch = mName.includes(searchQuery);
            if (!matchesSearch) return false;

            // Category filter
            if (catFilter !== "all" && adv.category !== catFilter) return false;

            return true;
        });

        // Sort by date descending
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filtered.length === 0) {
            desktopTbody.innerHTML = `<tr><td colspan="5" class="empty-state"><i class="fa-solid fa-piggy-bank"></i><p>No advance payments recorded for this period.</p></td></tr>`;
            mobileList.innerHTML = `<div class="empty-state"><i class="fa-solid fa-piggy-bank"></i><p>No advances found.</p></div>`;
            return;
        }

        filtered.forEach(adv => {
            const member = members.find(m => m.id === adv.memberId);
            const name = member ? member.name : (adv.memberName || "Unknown Roommate");
            const phone = member ? member.phone : "";

            // Desktop Table Row
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <strong>${name}</strong><br>
                    <span style="font-size:11px; color:var(--text-muted);">${phone}</span>
                </td>
                <td><span class="badge" style="background: var(--primary-light); color: white;">${adv.category}</span></td>
                <td><strong>${currency} ${parseFloat(adv.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
                <td>${adv.date}</td>
                <td style="text-align: right;">
                    <div style="display:flex; justify-content: flex-end; gap:6px;">
                        <button class="btn btn-outline btn-sm print-receipt-btn-action" data-id="${adv.id}"><i class="fa-solid fa-print"></i> Print</button>
                        <button class="btn btn-primary btn-sm edit-advance-btn-action" data-id="${adv.id}"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                        <button class="btn btn-secondary btn-sm delete-advance-btn-action" style="color:var(--danger); border-color:var(--danger);" data-id="${adv.id}"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>
                </td>
            `;
            desktopTbody.appendChild(tr);

            // Mobile view list item card
            const mCard = document.createElement("div");
            mCard.className = "quick-list-item";
            mCard.innerHTML = `
                <div class="quick-item-details">
                    <span class="quick-item-title">${name}</span>
                    <span class="quick-item-sub"><i class="fa-solid fa-calendar"></i> ${adv.date} &bull; ${adv.category}</span>
                    <strong style="color: var(--primary-light); display:block; margin-top:4px;">${currency} ${parseFloat(adv.amount).toFixed(2)}</strong>
                </div>
                <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
                    <button class="btn btn-outline btn-sm print-receipt-btn-action" style="padding:2px 6px; font-size:11px;" data-id="${adv.id}">Print</button>
                    <button class="btn btn-primary btn-sm edit-advance-btn-action" style="padding:2px 6px; font-size:11px;" data-id="${adv.id}">Edit</button>
                    <button class="btn btn-secondary btn-sm delete-advance-btn-action" style="padding:2px 6px; font-size:11px; color:var(--danger); border-color:var(--danger);" data-id="${adv.id}">Delete</button>
                </div>
            `;
            mobileList.appendChild(mCard);
        });

        // Event listeners for action buttons
        document.querySelectorAll(".print-receipt-btn-action").forEach(btn => {
            btn.addEventListener("click", () => {
                openReceipt(btn.dataset.id);
            });
        });

        document.querySelectorAll(".edit-advance-btn-action").forEach(btn => {
            btn.addEventListener("click", () => {
                openModal(btn.dataset.id);
            });
        });

        document.querySelectorAll(".delete-advance-btn-action").forEach(btn => {
            btn.addEventListener("click", () => {
                deleteAdvance(btn.dataset.id);
            });
        });
    }

    // Modal Control
    function openModal(id = "") {
        populateMembers();
        
        // Block action if month is closed
        const selectedMonth = db.getSelectedMonth();
        if (db.isMonthClosed(selectedMonth)) {
            alert(`This mess month (${selectedMonth}) is closed & finalized. Unlock it in dashboard or reports before making changes.`);
            return;
        }

        if (id) {
            modalTitle.textContent = "Edit Advance Payment";
            const adv = db.getAdvances().find(a => a.id === id);
            if (!adv) return;

            idInput.value = adv.id;
            memberSelect.value = adv.memberId;
            amountInput.value = adv.amount;
            dateInput.value = adv.date;
            categorySelect.value = adv.category;
        } else {
            modalTitle.textContent = "Add Advance Payment";
            form.reset();
            idInput.value = "";
            dateInput.value = new Date().toISOString().split("T")[0];
        }

        modal.classList.add("active");
    }

    function closeModal() {
        modal.classList.remove("active");
        form.reset();
        idInput.value = "";
    }

    // Save Advance Action
    function saveAdvance() {
        const id = idInput.value;
        const memberId = memberSelect.value;
        const amount = parseFloat(amountInput.value || 0);
        const date = dateInput.value;
        const category = categorySelect.value;

        if (!memberId || !amount || !date || !category) {
            alert("Please fill in all required fields.");
            return;
        }

        const members = db.getMembers();
        const member = members.find(m => m.id === memberId);
        const memberName = member ? member.name : "Unknown Roommate";

        const advances = db.getAdvances();

        if (id) {
            // Edit
            const idx = advances.findIndex(a => a.id === id);
            if (idx !== -1) {
                advances[idx] = { id, memberId, memberName, amount, date, category };
            }
        } else {
            // Add
            const newId = `adv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            advances.push({ id: newId, memberId, memberName, amount, date, category });
        }

        db.saveAdvances(advances);
        window.showToast("Advance payment saved successfully.");
        closeModal();
        renderAdvances();
    }

    // Delete Advance Action
    function deleteAdvance(id) {
        const selectedMonth = db.getSelectedMonth();
        if (db.isMonthClosed(selectedMonth)) {
            alert(`This mess month (${selectedMonth}) is closed & finalized. Unlock it in dashboard or reports before making changes.`);
            return;
        }

        if (confirm("Are you sure you want to delete this advance payment record?")) {
            const advances = db.getAdvances().filter(a => a.id !== id);
            db.saveAdvances(advances);
            window.showToast("Record deleted.");
            renderAdvances();
        }
    }

    // Print Receipt Modal Action
    function openReceipt(id) {
        const adv = db.getAdvances().find(a => a.id === id);
        if (!adv) return;

        const members = db.getMembers();
        const member = members.find(m => m.id === adv.memberId);
        const name = member ? member.name : (adv.memberName || "Unknown Roommate");
        const phone = member ? member.phone : "";

        document.getElementById("receipt-no").textContent = `#ADV-${adv.id.slice(-6).toUpperCase()}`;
        document.getElementById("receipt-member-name").textContent = name;
        document.getElementById("receipt-member-phone").textContent = phone || "--";
        document.getElementById("receipt-date").textContent = adv.date;
        document.getElementById("receipt-category-desc").textContent = `Category: ${adv.category}`;
        document.getElementById("receipt-amount").textContent = `${currency} ${parseFloat(adv.amount).toFixed(2)}`;
        document.getElementById("receipt-total").textContent = `${currency} ${parseFloat(adv.amount).toFixed(2)}`;

        receiptModal.classList.add("active");
    }

    // Initial load
    populateMembers();
    renderAdvances();
});
