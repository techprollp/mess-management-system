// Payments.js - Payment ledger management script with Digital Receipt Generation (v23.0)

document.addEventListener("DOMContentLoaded", () => {
    const desktopTbody = document.getElementById("payments-table-body");
    const mobileList = document.getElementById("payments-mobile-list");
    const searchInput = document.getElementById("payments-search");
    
    const recordModal = document.getElementById("record-payment-modal");
    const recordForm = document.getElementById("record-payment-form");
    const closeModalBtn = document.getElementById("close-payment-modal-btn");
    const cancelModalBtn = document.getElementById("cancel-payment-btn");
    const remindAllBtn = document.getElementById("remind-all-btn");

    const receiptModal = document.getElementById("receipt-modal");
    const closeReceiptBtn = document.getElementById("close-receipt-btn");
    const printReceiptBtn = document.getElementById("print-receipt-btn");

    const payStatPaid = document.getElementById("pay-stat-paid");
    const payStatPending = document.getElementById("pay-stat-pending");
    const payStatCollected = document.getElementById("pay-stat-collected");
    const payStatBalance = document.getElementById("pay-stat-balance");

    const settings = db.getSettings();
    const currency = settings.currency || "AED";

    document.addEventListener("db-updated", () => {
        renderLedger();
    });

    document.addEventListener("month-changed", () => {
        renderLedger();
    });

    function renderLedger() {
        desktopTbody.innerHTML = "";
        mobileList.innerHTML = "";

        const selectedMonth = db.getSelectedMonth();
        const stats = db.getStats(selectedMonth);

        payStatPaid.textContent = `${stats.paidMembers} / ${stats.totalMembers}`;
        payStatPending.textContent = stats.pendingMembers;
        payStatCollected.textContent = `${currency} ${stats.amountCollected.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        payStatBalance.textContent = `${currency} ${stats.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

        const searchQuery = searchInput.value.toLowerCase().trim();
        const activeMembers = stats.members;
        const payments = stats.payments;
        const memberShares = stats.memberShares;

        const filtered = activeMembers.filter(m => m.name.toLowerCase().includes(searchQuery));

        if (filtered.length === 0) {
            desktopTbody.innerHTML = `<tr><td colspan="8" class="empty-state"><i class="fa-solid fa-user-slash"></i><p>No roommates registered in the system yet for ${selectedMonth}.</p></td></tr>`;
            mobileList.innerHTML = `<div class="empty-state"><i class="fa-solid fa-user-slash"></i><p>No roommates registered yet.</p></div>`;
            return;
        }

        filtered.forEach(m => {
            const payInfo = payments[m.id] || {};
            const isPaid = payInfo ? payInfo.paid : false;
            const payDate = payInfo && payInfo.payDate ? payInfo.payDate : "--";
            
            const share = memberShares[m.id] || { mealsEaten: 0, grossShareAmount: 0, advancePaid: 0, netShareAmount: 0 };
            const paidAmount = isPaid ? (payInfo.amount || share.netShareAmount) : 0;
            const advanceMarkup = share.advancePaid > 0
                ? `<span class="badge badge-success" style="font-size:11px;">${currency} ${share.advancePaid.toFixed(2)}</span>`
                : `<span style="color:var(--text-muted); font-size:11px;">0.00</span>`;

            // Desktop Row
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <strong>${m.name}</strong><br>
                    <span style="font-size:11px; color:var(--text-muted);">${m.phone}</span>
                </td>
                <td>
                    <strong>${currency} ${share.grossShareAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong><br>
                    <span style="font-size:11px; color:var(--text-muted);"><i class="fa-solid fa-utensils"></i> ${share.mealsEaten} meals</span>
                </td>
                <td>${advanceMarkup}</td>
                <td><strong style="color: var(--primary-light);">${currency} ${share.netShareAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
                <td>
                    <span class="badge ${isPaid ? 'badge-success' : 'badge-danger'}">
                        <i class="fa-solid ${isPaid ? 'fa-circle-check' : 'fa-clock'}"></i>
                        ${isPaid ? 'Paid' : 'Pending'}
                    </span>
                </td>
                <td><strong>${currency} ${paidAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
                <td>${payDate}</td>
                <td style="text-align: right;">
                    <div style="display:flex; justify-content: flex-end; gap:6px;">
                        ${isPaid ? `
                            <button class="btn btn-outline btn-sm toggle-status-btn" data-id="${m.id}" data-action="unpaid"><i class="fa-solid fa-xmark"></i> Mark Unpaid</button>
                        ` : `
                            <button class="btn btn-primary btn-sm toggle-status-btn" data-id="${m.id}" data-action="paid"><i class="fa-solid fa-check"></i> Record Paid</button>
                        `}
                        <button class="btn btn-outline btn-sm edit-payment-btn" data-id="${m.id}"><i class="fa-solid fa-pen-to-square"></i> Edit / Advance</button>
                        <button class="btn btn-secondary btn-sm view-receipt-btn" data-id="${m.id}"><i class="fa-solid fa-receipt"></i> Receipt</button>
                        ${!isPaid ? `
                            <button class="btn btn-secondary btn-sm send-reminder-btn" style="color: #25d366; border-color: #25d366;" data-id="${m.id}"><i class="fa-brands fa-whatsapp"></i></button>
                        ` : ''}
                    </div>
                </td>
            `;
            desktopTbody.appendChild(tr);

            // Mobile Card
            const mobileCard = document.createElement("div");
            mobileCard.className = "mobile-table-card";
            mobileCard.innerHTML = `
                <div class="card-row">
                    <span class="row-label">Member</span>
                    <span class="row-value"><strong>${m.name}</strong></span>
                </div>
                <div class="card-row">
                    <span class="row-label">Status</span>
                    <span class="row-value">
                        <span class="badge ${isPaid ? 'badge-success' : 'badge-danger'}">
                            ${isPaid ? 'Paid' : 'Pending'}
                        </span>
                    </span>
                </div>
                <div class="card-row">
                    <span class="row-label">Meals Consumed</span>
                    <span class="row-value"><i class="fa-solid fa-utensils"></i> ${share.mealsEaten} meals</span>
                </div>
                <div class="card-row">
                    <span class="row-label">Gross Share</span>
                    <span class="row-value">${currency} ${share.grossShareAmount.toFixed(2)}</span>
                </div>
                <div class="card-row">
                    <span class="row-label">Advance Paid</span>
                    <span class="row-value">${advanceMarkup}</span>
                </div>
                <div class="card-row">
                    <span class="row-label">Net Owed Share</span>
                    <span class="row-value"><strong style="color:var(--primary-light);">${currency} ${share.netShareAmount.toFixed(2)}</strong></span>
                </div>
                <div class="card-row">
                    <span class="row-label">Paid Date</span>
                    <span class="row-value">${payDate}</span>
                </div>
                <div class="card-row" style="margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 8px;">
                    <span class="row-label">Actions</span>
                    <span class="row-value" style="display:flex; justify-content:flex-end; gap:6px;">
                        ${isPaid ? `
                            <button class="btn btn-outline btn-sm toggle-status-btn" style="width:auto; margin:0;" data-id="${m.id}" data-action="unpaid">Mark Unpaid</button>
                        ` : `
                            <button class="btn btn-primary btn-sm toggle-status-btn" style="width:auto; margin:0;" data-id="${m.id}" data-action="paid">Record Paid</button>
                        `}
                        <button class="btn btn-outline btn-sm edit-payment-btn" style="width:auto; margin:0;" data-id="${m.id}"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-secondary btn-sm view-receipt-btn" style="width:auto; margin:0;" data-id="${m.id}"><i class="fa-solid fa-receipt"></i></button>
                        ${!isPaid ? `
                            <button class="btn btn-secondary btn-sm send-reminder-btn" style="width:auto; margin:0; color: #25d366; border-color: #25d366;" data-id="${m.id}"><i class="fa-brands fa-whatsapp"></i></button>
                        ` : ''}
                    </span>
                </div>
            `;
            mobileList.appendChild(mobileCard);
        });

        document.querySelectorAll(".toggle-status-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const action = btn.dataset.action;

                if (action === "paid") {
                    openRecordModal(id);
                } else {
                    if (confirm("Are you sure you want to mark this member as Unpaid?")) {
                        updatePaymentStatus(id, false, 0, 0, "");
                    }
                }
            });
        });

        document.querySelectorAll(".edit-payment-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                openRecordModal(btn.dataset.id);
            });
        });

        document.querySelectorAll(".view-receipt-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                openReceiptModal(btn.dataset.id);
            });
        });

        document.querySelectorAll(".send-reminder-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                sendReminder(btn.dataset.id);
            });
        });
    }

    function openRecordModal(id) {
        const selectedMonth = db.getSelectedMonth();
        const stats = db.getStats(selectedMonth);
        const member = stats.members.find(m => m.id === id);
        if (!member) return;

        const payments = db.getPayments();
        const payInfo = payments[selectedMonth] ? payments[selectedMonth][id] : null;
        const share = stats.memberShares[id] || { netShareAmount: 0, advancePaid: 0 };

        document.getElementById("modal-member-name").textContent = member.name;
        document.getElementById("payment-member-id").value = member.id;
        
        const statusSelect = document.getElementById("payment-status-select");
        const amountInput = document.getElementById("payment-amount");
        const advanceInput = document.getElementById("payment-advance");
        const dateInput = document.getElementById("payment-date");

        if (payInfo && payInfo.paid) {
            statusSelect.value = "paid";
            amountInput.value = payInfo.amount;
            advanceInput.value = payInfo.advance || 0;
            dateInput.value = payInfo.payDate || new Date().toISOString().split('T')[0];
        } else {
            statusSelect.value = "paid";
            amountInput.value = share.netShareAmount;
            advanceInput.value = payInfo ? (payInfo.advance || 0) : 0;
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        recordModal.classList.add("active");
    }

    function closeRecordModal() {
        recordModal.classList.remove("active");
        recordForm.reset();
    }

    closeModalBtn.addEventListener("click", closeRecordModal);
    cancelModalBtn.addEventListener("click", closeRecordModal);

    recordForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const id = document.getElementById("payment-member-id").value;
        const status = document.getElementById("payment-status-select").value;
        const amount = parseFloat(document.getElementById("payment-amount").value || 0);
        const advance = parseFloat(document.getElementById("payment-advance").value || 0);
        const dateVal = document.getElementById("payment-date").value;

        updatePaymentStatus(id, status === "paid", amount, advance, dateVal);
        closeRecordModal();
        openReceiptModal(id);
    });

    function updatePaymentStatus(memberId, isPaid, amount, advance, payDate) {
        const selectedMonth = db.getSelectedMonth();
        const payments = db.getPayments();
        
        if (!payments[selectedMonth]) {
            payments[selectedMonth] = {};
        }

        payments[selectedMonth][memberId] = {
            paid: isPaid,
            amount: isPaid ? amount : 0,
            advance: advance || 0,
            payDate: isPaid ? payDate : ""
        };

        db.savePayments(payments);
        window.showToast(isPaid ? "Payment logged successfully." : "Payment / Advance updated.");
        renderLedger();
    }

    function openReceiptModal(memberId) {
        const selectedMonth = db.getSelectedMonth();
        const stats = db.getStats(selectedMonth);
        const member = stats.members.find(m => m.id === memberId);
        if (!member) return;

        const payInfo = stats.payments[memberId] || {};
        const share = stats.memberShares[memberId] || { netShareAmount: 0, advancePaid: 0, grossShareAmount: 0 };

        const isPaid = payInfo.paid;
        const advancePaid = payInfo.advance || share.advancePaid || 0;
        const paidAmount = isPaid ? (payInfo.amount || share.netShareAmount) : 0;
        const totalReceiptAmount = paidAmount + advancePaid;

        const receiptNo = `#REC-803-${selectedMonth.replace('-', '')}-${memberId.slice(-4)}`;
        document.getElementById("receipt-no").textContent = receiptNo;

        const typeBadge = document.getElementById("receipt-type-badge");
        if (isPaid && advancePaid > 0) {
            typeBadge.textContent = "Paid & Advance Receipt";
            typeBadge.style.background = "#dcfce7";
            typeBadge.style.color = "#166534";
        } else if (advancePaid > 0) {
            typeBadge.textContent = "Advance Paid Receipt";
            typeBadge.style.background = "#dbeafe";
            typeBadge.style.color = "#1e40af";
        } else {
            typeBadge.textContent = isPaid ? "Monthly Paid Receipt" : "Pending Statement";
            typeBadge.style.background = isPaid ? "#dcfce7" : "#fee2e2";
            typeBadge.style.color = isPaid ? "#166534" : "#991b1b";
        }

        const range = db.getMonthRange(selectedMonth);
        document.getElementById("receipt-member-name").textContent = member.name;
        document.getElementById("receipt-member-phone").textContent = member.phone || "Room 803 Roommate";
        document.getElementById("receipt-date").textContent = payInfo.payDate || new Date().toISOString().split('T')[0];
        document.getElementById("receipt-month").textContent = `Period: ${range.label}`;

        document.getElementById("receipt-desc-title").textContent = `Monthly Mess Share (${share.mealsEaten} meals)`;
        document.getElementById("receipt-desc-amount").textContent = `${currency} ${paidAmount.toFixed(2)}`;

        const advanceRow = document.getElementById("receipt-advance-row");
        if (advancePaid > 0) {
            advanceRow.style.display = "table-row";
            document.getElementById("receipt-advance-amount").textContent = `${currency} ${advancePaid.toFixed(2)}`;
        } else {
            advanceRow.style.display = "none";
        }

        document.getElementById("receipt-total-amount").textContent = `${currency} ${totalReceiptAmount.toFixed(2)}`;
        receiptModal.classList.add("active");
    }

    closeReceiptBtn.addEventListener("click", () => {
        receiptModal.classList.remove("active");
    });

    printReceiptBtn.addEventListener("click", () => {
        const printContent = document.getElementById("printable-receipt").innerHTML;
        const printWindow = window.open("", "_blank", "width=700,height=700");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Payment Receipt - Room 803 Mess</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: #ffffff; color: #1e293b; }
                    </style>
                </head>
                <body onload="window.print(); window.close();">
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
    });

    function sendReminder(memberId) {
        const selectedMonth = db.getSelectedMonth();
        const range = db.getMonthRange(selectedMonth);
        const stats = db.getStats(selectedMonth);
        const member = stats.members.find(m => m.id === memberId);
        if (!member) return;

        const share = stats.memberShares[memberId] || { mealsEaten: 0, grossShareAmount: 0, advancePaid: 0, netShareAmount: 0 };
        const cleanPhone = member.phone.replace(/[^0-9+]/g, "");
        let message = `Hi ${member.name}, this is a friendly update from Room ${settings.roomNo} Mess. Your net split share for ${share.mealsEaten} meals for period (${range.shortLabel}) is ${currency} ${share.netShareAmount.toFixed(2)}.`;
        
        if (share.advancePaid > 0) {
            message += ` (Gross Share: ${currency} ${share.grossShareAmount.toFixed(2)}, Advance Credit: ${currency} ${share.advancePaid.toFixed(2)}).`;
        }
        message += ` Please transfer the payment to clear your pending status. Thanks!`;
        
        const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    }

    remindAllBtn.addEventListener("click", () => {
        const selectedMonth = db.getSelectedMonth();
        const stats = db.getStats(selectedMonth);
        const unpaidMembers = stats.members.filter(m => {
            const payInfo = stats.payments[m.id];
            return !payInfo || !payInfo.paid;
        });

        if (unpaidMembers.length === 0) {
            window.showToast("Excellent! All active members have paid.", "success");
            return;
        }

        if (confirm(`Send WhatsApp reminder to first pending member (${unpaidMembers[0].name})?`)) {
            sendReminder(unpaidMembers[0].id);
        }
    });

    const checkResponsive = () => {
        if (window.innerWidth <= 768) {
            mobileList.style.display = "block";
        } else {
            mobileList.style.display = "none";
        }
    };
    window.addEventListener("resize", checkResponsive);
    checkResponsive();

    searchInput.addEventListener("input", renderLedger);
    renderLedger();
});
