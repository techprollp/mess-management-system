// Bills.js - Expense tracker management script with Month Isolation & Full Expense Invoice Editing

document.addEventListener("DOMContentLoaded", () => {
    const desktopTbody = document.getElementById("bills-table-body");
    const mobileList = document.getElementById("bills-mobile-list");
    
    // Add Modal Elements
    const openModalBtn = document.getElementById("open-add-bill-btn");
    const closeModalBtn = document.getElementById("close-bill-modal-btn");
    const cancelModalBtn = document.getElementById("cancel-bill-btn");
    const addBillModal = document.getElementById("add-bill-modal");
    const addBillForm = document.getElementById("add-bill-form");
    const billDateInput = document.getElementById("bill-date");

    const scopeAllRadio = document.getElementById("scope-all");
    const scopeSpecificRadio = document.getElementById("scope-specific");
    const specificContainer = document.getElementById("specific-members-container");
    const membersChecklist = document.getElementById("bill-members-checklist");
    const toggleMembersBtn = document.getElementById("toggle-all-bill-members");

    // Edit Modal Elements
    const editBillModal = document.getElementById("edit-bill-modal");
    const editBillForm = document.getElementById("edit-bill-form");
    const closeEditModalBtn = document.getElementById("close-edit-bill-modal-btn");
    const cancelEditModalBtn = document.getElementById("cancel-edit-bill-btn");
    const editScopeAllRadio = document.getElementById("edit-scope-all");
    const editScopeSpecificRadio = document.getElementById("edit-scope-specific");
    const editSpecificContainer = document.getElementById("edit-specific-members-container");
    const editMembersChecklist = document.getElementById("edit-bill-members-checklist");
    const editToggleMembersBtn = document.getElementById("edit-toggle-all-bill-members");

    const totalExpensesVal = document.getElementById("total-expenses-value");
    const activeMembersCount = document.getElementById("active-members-count");

    const settings = db.getSettings();
    const currency = settings.currency || "AED";

    let billsList = db.getBills();

    document.addEventListener("db-updated", () => {
        renderBills();
    });

    document.addEventListener("month-changed", () => {
        renderBills();
    });

    scopeAllRadio.addEventListener("change", () => {
        specificContainer.style.display = "none";
    });

    scopeSpecificRadio.addEventListener("change", () => {
        specificContainer.style.display = "block";
    });

    editScopeAllRadio.addEventListener("change", () => {
        editSpecificContainer.style.display = "none";
    });

    editScopeSpecificRadio.addEventListener("change", () => {
        editSpecificContainer.style.display = "block";
    });

    function renderBills() {
        desktopTbody.innerHTML = "";
        mobileList.innerHTML = "";

        const selectedMonth = db.getSelectedMonth();
        const monthRange = db.getMonthRange(selectedMonth);
        billsList = db.getBills();

        const filteredBills = billsList.filter(b => {
            if (!b || !b.date) return false;
            return b.date >= monthRange.startDate && b.date <= monthRange.endDate;
        });

        const stats = db.getStats(selectedMonth);
        
        totalExpensesVal.textContent = `${currency} ${stats.totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        activeMembersCount.textContent = stats.totalMembers;

        const statusBadge = document.getElementById("bills-closing-badge");
        const statusDesc = document.getElementById("bills-closing-desc");
        const closeBtn = document.getElementById("close-month-btn");

        if (statusBadge && statusDesc && closeBtn) {
            if (stats.isClosed) {
                statusBadge.textContent = "Closed & Finalized";
                statusBadge.className = "badge badge-danger";
                statusDesc.textContent = `Period (${stats.monthRange.shortLabel}) is closed. Expenses are locked. New month starts on 10th at ${currency} 0.`;
                closeBtn.innerHTML = `<i class="fa-solid fa-lock-open"></i> Unlock Period`;
                closeBtn.className = "btn btn-outline btn-sm";
            } else {
                statusBadge.textContent = `Active Cycle (${stats.monthRange.shortLabel})`;
                statusBadge.className = "badge badge-success";
                statusDesc.textContent = `Active cycle (10th to 9th). After 9th, close month to finalize accounts; 10th starts new cycle at ${currency} 0.`;
                closeBtn.innerHTML = `<i class="fa-solid fa-file-signature"></i> Finalize & Close Month`;
                closeBtn.className = "btn btn-primary btn-sm";
            }

            closeBtn.onclick = async () => {
                if (stats.isClosed) {
                    if (confirm(`Unlock mess period ${stats.monthRange.label} to allow editing expenses?`)) {
                        await db.setMonthClosed(selectedMonth, false);
                        if (window.showToast) window.showToast(`Unlocked ${stats.monthRange.label}`);
                    }
                } else {
                    if (confirm(`Finalize and Close mess month ${stats.monthRange.label}? Past expenses will be locked and compiled.`)) {
                        await db.setMonthClosed(selectedMonth, true);
                        if (window.showToast) window.showToast(`Closed & Finalized ${stats.monthRange.label}`);
                        setTimeout(() => {
                            if (confirm(`Month Finalized! Download CSV payment ledger report for ${stats.monthRange.shortLabel}?`)) {
                                db.downloadCSVReport(selectedMonth);
                            }
                        }, 300);
                    }
                }
            };
        }

        const sortedBills = [...filteredBills].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedBills.length === 0) {
            desktopTbody.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-file-invoice"></i><p>No expenses recorded for ${monthRange.shortLabel}. Total Expenses: ${currency} 0</p></td></tr>`;
            mobileList.innerHTML = `<div class="empty-state"><i class="fa-solid fa-file-invoice"></i><p>No expenses recorded for ${monthRange.shortLabel}. Total Expenses: ${currency} 0</p></div>`;
            return;
        }

        const activeMembers = db.getMembers().filter(m => m.status === "active");
        const totalActiveCount = activeMembers.length;

        sortedBills.forEach(bill => {
            const hasInvoice = !!bill.invoiceName;
            const invoiceMarkup = hasInvoice 
                ? `<a href="#" class="view-invoice-link" data-filename="${bill.invoiceName}" style="color: var(--primary-light); text-decoration: none;"><i class="fa-solid fa-file-pdf"></i> ${bill.invoiceName}</a>`
                : `<span style="color:var(--text-muted); font-style:italic;">No Invoice</span>`;

            const targetedCount = Array.isArray(bill.applicableMembers) && bill.applicableMembers.length > 0 
                ? bill.applicableMembers.length 
                : totalActiveCount;
            
            const isAllTargeted = targetedCount === totalActiveCount;
            const targetBadge = `<span class="badge ${isAllTargeted ? 'badge-info' : 'badge-warning'}" style="font-size:11px;">
                <i class="fa-solid fa-users"></i> ${isAllTargeted ? 'All Members' : `${targetedCount} roommates`}
            </span>`;

            // Desktop Row
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${bill.title}</strong></td>
                <td><span class="badge badge-warning" style="background-color:rgba(245,158,11,0.1); color:var(--warning);">${bill.category}</span></td>
                <td><strong>${currency} ${parseFloat(bill.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
                <td>${targetBadge}</td>
                <td>${bill.date}</td>
                <td>${invoiceMarkup}</td>
                <td style="text-align: right;">
                    <div style="display:flex; justify-content: flex-end; gap:8px;">
                        <button class="btn btn-outline btn-sm edit-bill-btn" data-id="${bill.id}"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="btn btn-danger btn-sm delete-bill-btn" data-id="${bill.id}"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>
                </td>
            `;
            desktopTbody.appendChild(tr);

            // Mobile Card
            const mobileCard = document.createElement("div");
            mobileCard.className = "mobile-table-card";
            mobileCard.innerHTML = `
                <div class="card-row">
                    <span class="row-label">Item</span>
                    <span class="row-value"><strong>${bill.title}</strong></span>
                </div>
                <div class="card-row">
                    <span class="row-label">Amount</span>
                    <span class="row-value"><strong>${currency} ${parseFloat(bill.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></span>
                </div>
                <div class="card-row">
                    <span class="row-label">Category</span>
                    <span class="row-value"><span class="badge badge-warning" style="background-color:rgba(245,158,11,0.1); color:var(--warning);">${bill.category}</span></span>
                </div>
                <div class="card-row">
                    <span class="row-label">Applied To</span>
                    <span class="row-value">${targetBadge}</span>
                </div>
                <div class="card-row">
                    <span class="row-label">Date</span>
                    <span class="row-value">${bill.date}</span>
                </div>
                <div class="card-row">
                    <span class="row-label">Invoice</span>
                    <span class="row-value">${invoiceMarkup}</span>
                </div>
                <div class="card-row" style="margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 8px;">
                    <span class="row-label">Actions</span>
                    <span class="row-value" style="display:flex; justify-content:flex-end; gap:6px;">
                        <button class="btn btn-outline btn-sm edit-bill-btn" style="width:auto; margin:0;" data-id="${bill.id}"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="btn btn-danger btn-sm delete-bill-btn" style="width:auto; margin:0;" data-id="${bill.id}"><i class="fa-solid fa-trash"></i> Delete</button>
                    </span>
                </div>
            `;
            mobileList.appendChild(mobileCard);
        });

        document.querySelectorAll(".view-invoice-link").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                alert(`[SIMULATION] Viewing invoice file: "${link.dataset.filename}"`);
            });
        });

        document.querySelectorAll(".edit-bill-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                openEditModal(btn.dataset.id);
            });
        });

        document.querySelectorAll(".delete-bill-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                deleteBill(btn.dataset.id);
            });
        });
    }

    function renderRoommateChecklist(containerEl, classPrefix = "bill") {
        containerEl.innerHTML = "";
        const activeMembers = db.getMembers().filter(m => m.status === "active");

        activeMembers.forEach(m => {
            const label = document.createElement("label");
            label.style.display = "flex";
            label.style.alignItems = "center";
            label.style.gap = "6px";
            label.style.fontSize = "12px";
            label.style.cursor = "pointer";
            label.innerHTML = `
                <input type="checkbox" value="${m.id}" class="${classPrefix}-member-cb" style="width:16px; height:16px;">
                <span>${m.name}</span>
            `;
            containerEl.appendChild(label);
        });
    }

    let allChecked = false;
    toggleMembersBtn.addEventListener("click", () => {
        allChecked = !allChecked;
        document.querySelectorAll(".bill-member-cb").forEach(cb => cb.checked = allChecked);
        toggleMembersBtn.textContent = allChecked ? "Deselect All" : "Select All";
    });

    let editAllChecked = false;
    editToggleMembersBtn.addEventListener("click", () => {
        editAllChecked = !editAllChecked;
        document.querySelectorAll(".edit-member-cb").forEach(cb => cb.checked = editAllChecked);
        editToggleMembersBtn.textContent = editAllChecked ? "Deselect All" : "Select All";
    });

    function openAddModal() {
        const selectedMonth = db.getSelectedMonth();
        if (db.isMonthClosed(selectedMonth)) {
            if (!confirm(`Mess period (${db.getMonthRange(selectedMonth).shortLabel}) is CLOSED & FINALIZED. Unlock period to add new expenses?`)) {
                return;
            }
        }
        const range = db.getMonthRange(selectedMonth);
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        billDateInput.value = (dateStr >= range.startDate && dateStr <= range.endDate) ? dateStr : range.startDate;
        scopeAllRadio.checked = true;
        specificContainer.style.display = "none";
        renderRoommateChecklist(membersChecklist, "bill");
        addBillModal.classList.add("active");
    }

    function closeAddModal() {
        addBillModal.classList.remove("active");
        addBillForm.reset();
    }

    openModalBtn.addEventListener("click", openAddModal);
    closeModalBtn.addEventListener("click", closeAddModal);
    cancelModalBtn.addEventListener("click", closeAddModal);

    addBillForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = document.getElementById("bill-title").value.trim();
        const amount = parseFloat(document.getElementById("bill-amount").value);
        const dateVal = billDateInput.value;
        const category = document.getElementById("bill-category").value;
        const notes = document.getElementById("bill-notes").value.trim();
        const fileInput = document.getElementById("bill-invoice");

        let selectedMemberIds = [];
        const isSpecific = scopeSpecificRadio.checked;

        if (isSpecific) {
            document.querySelectorAll(".bill-member-cb:checked").forEach(cb => {
                selectedMemberIds.push(cb.value);
            });

            if (selectedMemberIds.length === 0) {
                window.showToast("Please check at least one roommate for this specific invoice.", "danger");
                return;
            }
        } else {
            const activeMembers = db.getMembers().filter(m => m.status === "active");
            selectedMemberIds = activeMembers.map(m => m.id);
        }

        let invoiceName = "";
        if (fileInput.files.length > 0) {
            invoiceName = fileInput.files[0].name;
        }

        const newBill = {
            id: "b" + Date.now(),
            title,
            amount,
            date: dateVal,
            category,
            notes,
            invoiceName,
            applicableMembers: selectedMemberIds
        };

        billsList.push(newBill);
        db.saveBills(billsList);
        
        closeAddModal();
        window.showToast("Expense recorded successfully.");
        renderBills();
    });

    // EDIT EXPENSE MODAL LOGIC
    function openEditModal(id) {
        const selectedMonth = db.getSelectedMonth();
        if (db.isMonthClosed(selectedMonth)) {
            if (!confirm(`Mess period (${db.getMonthRange(selectedMonth).shortLabel}) is CLOSED & FINALIZED. Unlock period to edit this expense?`)) {
                return;
            }
        }
        const bill = billsList.find(b => b.id === id);
        if (!bill) return;

        document.getElementById("edit-bill-id").value = bill.id;
        document.getElementById("edit-bill-title").value = bill.title;
        document.getElementById("edit-bill-amount").value = bill.amount;
        document.getElementById("edit-bill-date").value = bill.date;
        document.getElementById("edit-bill-category").value = bill.category || "Groceries";
        document.getElementById("edit-bill-notes").value = bill.notes || "";

        renderRoommateChecklist(editMembersChecklist, "edit");

        const activeMembers = db.getMembers().filter(m => m.status === "active");
        const totalActiveCount = activeMembers.length;

        const isSpecific = Array.isArray(bill.applicableMembers) && bill.applicableMembers.length > 0 && bill.applicableMembers.length < totalActiveCount;

        if (isSpecific) {
            editScopeSpecificRadio.checked = true;
            editSpecificContainer.style.display = "block";
            
            document.querySelectorAll(".edit-member-cb").forEach(cb => {
                if (bill.applicableMembers.includes(cb.value)) {
                    cb.checked = true;
                }
            });
        } else {
            editScopeAllRadio.checked = true;
            editSpecificContainer.style.display = "none";
        }

        editBillModal.classList.add("active");
    }

    function closeEditModal() {
        editBillModal.classList.remove("active");
        editBillForm.reset();
    }

    closeEditModalBtn.addEventListener("click", closeEditModal);
    cancelEditModalBtn.addEventListener("click", closeEditModal);

    editBillForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const id = document.getElementById("edit-bill-id").value;
        const title = document.getElementById("edit-bill-title").value.trim();
        const amount = parseFloat(document.getElementById("edit-bill-amount").value);
        const dateVal = document.getElementById("edit-bill-date").value;
        const category = document.getElementById("edit-bill-category").value;
        const notes = document.getElementById("edit-bill-notes").value.trim();
        const fileInput = document.getElementById("edit-bill-invoice");

        let selectedMemberIds = [];
        const isSpecific = editScopeSpecificRadio.checked;

        if (isSpecific) {
            document.querySelectorAll(".edit-member-cb:checked").forEach(cb => {
                selectedMemberIds.push(cb.value);
            });

            if (selectedMemberIds.length === 0) {
                window.showToast("Please check at least one roommate for this specific invoice.", "danger");
                return;
            }
        } else {
            const activeMembers = db.getMembers().filter(m => m.status === "active");
            selectedMemberIds = activeMembers.map(m => m.id);
        }

        billsList = billsList.map(b => {
            if (b.id === id) {
                let invoiceName = b.invoiceName || "";
                if (fileInput.files.length > 0) {
                    invoiceName = fileInput.files[0].name;
                }
                return {
                    ...b,
                    title,
                    amount,
                    date: dateVal,
                    category,
                    notes,
                    invoiceName,
                    applicableMembers: selectedMemberIds
                };
            }
            return b;
        });

        db.saveBills(billsList);
        closeEditModal();
        window.showToast("Expense invoice updated successfully.");
        renderBills();
    });

    function deleteBill(id) {
        const selectedMonth = db.getSelectedMonth();
        if (db.isMonthClosed(selectedMonth)) {
            if (!confirm(`Mess period (${db.getMonthRange(selectedMonth).shortLabel}) is CLOSED & FINALIZED. Unlock period to delete this expense?`)) {
                return;
            }
        }
        const bill = billsList.find(b => b.id === id);
        if (!bill) return;

        if (confirm(`Delete the expense '${bill.title}' for ${currency} ${bill.amount}?`)) {
            billsList = billsList.filter(b => b.id !== id);
            db.saveBills(billsList);
            window.showToast("Expense deleted successfully.");
            renderBills();
        }
    }

    const checkResponsive = () => {
        if (window.innerWidth <= 768) {
            mobileList.style.display = "block";
        } else {
            mobileList.style.display = "none";
        }
    };
    window.addEventListener("resize", checkResponsive);
    checkResponsive();

    renderBills();
});
