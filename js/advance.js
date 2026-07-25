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
        const printContent = document.getElementById("printable-receipt").innerHTML;
        const printWindow = window.open("", "_blank", "width=700,height=700");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Advance Receipt - Room 803 Mess</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif; padding: 20px; background: #ffffff; color: var(--text-main); }
                    </style>
                </head>
                <body onload="window.print(); window.close();">
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
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
            desktopTbody.innerHTML = `<tr><td colspan="5" class="empty-state" style="padding: 24px; text-align: center; color: var(--text-secondary);"><i class="fa-solid fa-piggy-bank" style="font-size: 24px; margin-bottom: 8px;"></i><p>No advance payments recorded for this period.</p></td></tr>`;
            mobileList.innerHTML = `<div class="empty-state" style="padding: 24px; text-align: center; color: var(--text-secondary);"><i class="fa-solid fa-piggy-bank" style="font-size: 24px; margin-bottom: 8px;"></i><p>No advances found.</p></div>`;
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
                    <strong style="color: var(--text-main); font-weight: 500;">${name}</strong><br>
                    <span style="font-size:13px; color: var(--text-secondary);">${phone}</span>
                </td>
                <td><span class="badge" style="background: rgba(0, 113, 227, 0.1); color: #0071E3; font-weight: 600; padding: 4px 10px; border-radius: 12px; font-size: 12px;">${adv.category}</span></td>
                <td><strong style="color: var(--text-main); font-weight: 600;">${currency} ${parseFloat(adv.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
                <td style="color: var(--text-secondary);">${adv.date}</td>
                <td style="text-align: right;">
                    <div style="display:flex; justify-content: flex-end; gap:8px;">
                        <button class="btn btn-outline btn-sm print-receipt-btn-action" data-id="${adv.id}" style="border-radius: 8px; border-color: #0071E3; color: #0071E3;"><i class="fa-solid fa-print"></i></button>
                        <button class="btn btn-primary btn-sm edit-advance-btn-action" data-id="${adv.id}" style="border-radius: 8px; background-color: #0071E3;"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn btn-sm delete-advance-btn-action" data-id="${adv.id}" style="border-radius: 8px; background-color: #FF3B30; color: white;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            desktopTbody.appendChild(tr);

            // Mobile view list item card
            const mCard = document.createElement("div");
            mCard.className = "wallet-item contact-card animate-in";
            mCard.style.padding = "16px";
            mCard.style.borderBottom = "1px solid var(--border-color)";
            mCard.style.display = "flex";
            mCard.style.justifyContent = "space-between";
            mCard.style.alignItems = "center";
            mCard.innerHTML = `
                <div class="quick-item-details">
                    <span class="quick-item-title" style="font-size: 16px; font-weight: 600; color: var(--text-main);">${name}</span>
                    <span class="quick-item-sub" style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;"><i class="fa-solid fa-calendar"></i> ${adv.date} &bull; ${adv.category}</span>
                    <strong style="color: #0071E3; display:block; margin-top:6px; font-size: 15px;">${currency} ${parseFloat(adv.amount).toFixed(2)}</strong>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end;">
                    <div style="display:flex; gap: 6px;">
                        <button class="btn btn-outline btn-sm print-receipt-btn-action" style="padding:4px 8px; font-size:12px; border-radius: 8px; border-color: #0071E3; color: #0071E3;" data-id="${adv.id}"><i class="fa-solid fa-print"></i></button>
                        <button class="btn btn-primary btn-sm edit-advance-btn-action" style="padding:4px 8px; font-size:12px; border-radius: 8px; background-color: #0071E3;" data-id="${adv.id}"><i class="fa-solid fa-pen"></i></button>
                    </div>
                    <button class="btn btn-sm delete-advance-btn-action" style="padding:4px 8px; font-size:12px; border-radius: 8px; background-color: #FF3B30; color: white; width: 100%;" data-id="${adv.id}">Delete</button>
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
