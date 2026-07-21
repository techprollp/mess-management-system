// Dashboard.js - Admin analytics and metrics visualizations script with Month Isolation

document.addEventListener("DOMContentLoaded", () => {
    const kpiMembers = document.getElementById("kpi-members");
    const kpiExpenses = document.getElementById("kpi-expenses");
    const kpiCollected = document.getElementById("kpi-collected");
    const kpiBalance = document.getElementById("kpi-balance");
    const kpiCostPerMeal = document.getElementById("kpi-cost-per-meal");
    const kpiPrevClosing = document.getElementById("kpi-prev-closing");
    
    const duesTbody = document.getElementById("dashboard-dues-tbody");
    const duesMobile = document.getElementById("dashboard-dues-mobile");

    let financeChartInstance = null;
    let categoryChartInstance = null;

    function renderDashboard() {
        const selectedMonth = db.getSelectedMonth();
        const stats = db.getStats(selectedMonth);
        const settings = db.getSettings();
        const currency = settings.currency || "AED";

        // 1. Render KPI Cards
        kpiMembers.textContent = stats.totalMembers;
        kpiExpenses.textContent = `${currency} ${stats.totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        kpiCollected.textContent = `${currency} ${stats.amountCollected.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        kpiBalance.textContent = `${currency} ${stats.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        if (kpiCostPerMeal) kpiCostPerMeal.textContent = `${currency} ${(stats.costPerMeal || 0).toFixed(3)} / meal`;
        if (kpiPrevClosing) kpiPrevClosing.textContent = `${currency} ${stats.prevClosingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

        // Monthly Closing Control Banner Updates
        const statusBadge = document.getElementById("closing-status-badge");
        const statusDesc = document.getElementById("closing-status-desc");
        const closeBtn = document.getElementById("close-month-btn");

        if (statusBadge && statusDesc && closeBtn) {
            if (stats.isClosed) {
                statusBadge.textContent = "Closed & Finalized";
                statusBadge.className = "badge badge-danger";
                statusDesc.textContent = `Mess accounts for period (${stats.monthRange.shortLabel}) are closed & locked. Expenses start fresh at ${currency} 0 for new cycle.`;
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

        const downloadCsvBtn = document.getElementById("download-csv-btn");
        if (downloadCsvBtn) {
            downloadCsvBtn.onclick = () => {
                db.downloadCSVReport(selectedMonth);
            };
        }

        // 2. Render Charts
        renderFinanceChart(stats, currency);
        renderCategoryChart(stats, currency);

        // 3. Render Roommate Dues Table
        renderDuesTable(stats, currency);
    }

    function renderFinanceChart(stats, currency) {
        const ctx = document.getElementById("financeChart");
        if (!ctx) return;

        if (financeChartInstance) {
            financeChartInstance.destroy();
        }

        financeChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Total Expenses", "Collected", "Pending Balance"],
                datasets: [{
                    label: `Amount (${currency})`,
                    data: [stats.totalExpenses, stats.amountCollected, stats.balance],
                    backgroundColor: [
                        "rgba(245, 158, 11, 0.8)",  // Warning/Amber
                        "rgba(16, 185, 129, 0.8)",  // Success/Green
                        "rgba(239, 68, 68, 0.8)"    // Danger/Red
                    ],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    function renderCategoryChart(stats, currency) {
        const ctx = document.getElementById("categoryChart");
        if (!ctx) return;

        if (categoryChartInstance) {
            categoryChartInstance.destroy();
        }

        const categories = {};
        stats.bills.forEach(b => {
            const cat = b.category || "Others";
            categories[cat] = (categories[cat] || 0) + parseFloat(b.amount || 0);
        });

        const labels = Object.keys(categories);
        const data = Object.values(categories);

        if (labels.length === 0) {
            labels.push("No Expenses");
            data.push(1);
        }

        categoryChartInstance = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [
                        "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom" }
                }
            }
        });
    }

    function renderDuesTable(stats, currency) {
        duesTbody.innerHTML = "";
        duesMobile.innerHTML = "";

        const activeMembers = stats.members;

        if (activeMembers.length === 0) {
            duesTbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fa-solid fa-users-slash"></i><p>No active roommates registered yet. Click Members to add roommates.</p></td></tr>`;
            duesMobile.innerHTML = `<div class="empty-state"><i class="fa-solid fa-users-slash"></i><p>No active roommates registered yet.</p></div>`;
            return;
        }

        activeMembers.forEach(m => {
            const payInfo = stats.payments[m.id];
            const isPaid = payInfo ? payInfo.paid : false;
            const share = stats.memberShares[m.id] || { shareAmount: 0, applicableBillCount: 0 };
            const amountDisplay = isPaid ? (payInfo.amount || share.shareAmount) : share.shareAmount;

            // Desktop Row
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${m.name}</strong></td>
                <td>${m.phone}</td>
                <td><span class="badge badge-info" style="font-size:11px;"><i class="fa-solid fa-receipt"></i> ${share.applicableBillCount} invoice(s)</span></td>
                <td><strong>${currency} ${amountDisplay.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
                <td>
                    <span class="badge ${isPaid ? 'badge-success' : 'badge-danger'}">
                        ${isPaid ? 'Paid' : 'Pending'}
                    </span>
                </td>
                <td style="text-align: right;">
                    <a href="payments.html" class="btn btn-outline btn-sm"><i class="fa-solid fa-receipt"></i> Manage</a>
                </td>
            `;
            duesTbody.appendChild(tr);

            // Mobile Card
            const mobileCard = document.createElement("div");
            mobileCard.className = "mobile-table-card";
            mobileCard.innerHTML = `
                <div class="card-row">
                    <span class="row-label">Roommate</span>
                    <span class="row-value"><strong>${m.name}</strong></span>
                </div>
                <div class="card-row">
                    <span class="row-label">Owed Share</span>
                    <span class="row-value"><strong>${currency} ${amountDisplay.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></span>
                </div>
                <div class="card-row">
                    <span class="row-label">Status</span>
                    <span class="row-value">
                        <span class="badge ${isPaid ? 'badge-success' : 'badge-danger'}">
                            ${isPaid ? 'Paid' : 'Pending'}
                        </span>
                    </span>
                </div>
            `;
            duesMobile.appendChild(mobileCard);
        });
    }

    const checkResponsive = () => {
        if (window.innerWidth <= 768) {
            duesMobile.style.display = "block";
        } else {
            duesMobile.style.display = "none";
        }
    };
    window.addEventListener("resize", checkResponsive);
    checkResponsive();

    // Event listeners for month selector & DB updates
    document.addEventListener("month-changed", () => {
        renderDashboard();
    });

    document.addEventListener("db-updated", () => {
        renderDashboard();
    });

    renderDashboard();
});
