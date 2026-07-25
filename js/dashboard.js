// Dashboard.js - Admin analytics and metrics visualizations script with Month Isolation

document.addEventListener("DOMContentLoaded", () => {
    const kpiMembers = document.getElementById("kpi-members");
    const kpiExpenses = document.getElementById("kpi-expenses");
    const kpiCollected = document.getElementById("kpi-collected");
    const kpiBalance = document.getElementById("kpi-balance");
    const kpiCostPerMeal = document.getElementById("kpi-cost-per-meal");
    const kpiPrevClosing = document.getElementById("kpi-prev-closing");
    const greetingTitle = document.getElementById("greeting-title");
    
    const duesTbody = document.getElementById("dashboard-dues-tbody");
    const duesMobile = document.getElementById("dashboard-dues-mobile");

    let financeChartInstance = null;
    let categoryChartInstance = null;

    const AVATAR_COLORS = ['#0071E3', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#FF2D55', '#5AC8FA'];

    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning, Admin";
        if (hour < 18) return "Good Afternoon, Admin";
        return "Good Evening, Admin";
    }

    function renderDashboard() {
        if (greetingTitle) {
            greetingTitle.textContent = getGreeting();
        }

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
                statusBadge.style.backgroundColor = "#FF3B3020";
                statusBadge.style.color = "#FF3B30";
                statusDesc.textContent = `Mess accounts for period (${stats.monthRange.shortLabel}) are closed & locked. Expenses start fresh at ${currency} 0 for new cycle.`;
                closeBtn.innerHTML = `<i class="fa-solid fa-lock-open"></i> Unlock Period`;
                closeBtn.className = "btn btn-outline btn-sm";
            } else {
                statusBadge.textContent = `Active Cycle (${stats.monthRange.shortLabel})`;
                statusBadge.style.backgroundColor = "#34C75920";
                statusBadge.style.color = "#34C759";
                statusDesc.textContent = `Active cycle (10th to 9th). After 9th, close month to finalize accounts; 10th starts new cycle at ${currency} 0.`;
                closeBtn.innerHTML = `<i class="fa-solid fa-file-signature"></i> Finalize Month`;
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
                        "#FF9500",  // Apple Warning/Amber
                        "#34C759",  // Apple Success/Green
                        "#FF3B30"   // Apple Danger/Red
                    ],
                    borderRadius: 8
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
                        "#0071E3", "#34C759", "#FF9500", "#FF3B30", "#5856D6", "#FF2D55", "#5AC8FA"
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
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
            duesTbody.innerHTML = `<tr><td colspan="6" class="empty-state" style="text-align: center; padding: 32px;"><i class="fa-solid fa-users-slash" style="font-size: 24px; color: var(--text-muted); margin-bottom: 8px;"></i><p>No active roommates registered yet.</p></td></tr>`;
            duesMobile.innerHTML = `<div class="empty-state" style="text-align: center; padding: 32px;"><i class="fa-solid fa-users-slash" style="font-size: 24px; color: var(--text-muted); margin-bottom: 8px;"></i><p>No active roommates registered yet.</p></div>`;
            return;
        }

        activeMembers.forEach((m, idx) => {
            const payInfo = stats.payments[m.id];
            const isPaid = payInfo ? payInfo.paid : false;
            const share = stats.memberShares[m.id] || { shareAmount: 0, applicableBillCount: 0 };
            const amountDisplay = isPaid ? (payInfo.amount || share.shareAmount) : share.shareAmount;
            
            const initial = m.name ? m.name.charAt(0).toUpperCase() : '?';
            const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];

            // Desktop Row
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="avatar" style="width: 32px; height: 32px; border-radius: 50%; background-color: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${initial}</div>
                        <strong>${m.name}</strong>
                    </div>
                </td>
                <td>${m.phone}</td>
                <td><span class="badge" style="background-color: #0071E315; color: #0071E3;"><i class="fa-solid fa-receipt"></i> ${share.applicableBillCount} invoices</span></td>
                <td><strong>${currency} ${amountDisplay.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
                <td>
                    <span class="badge" style="background-color: ${isPaid ? '#34C75920' : '#FF3B3020'}; color: ${isPaid ? '#34C759' : '#FF3B30'};">
                        ${isPaid ? 'Paid' : 'Pending'}
                    </span>
                </td>
                <td style="text-align: right;">
                    <a href="payments.html" class="btn btn-outline btn-sm" style="border-radius: 16px;"><i class="fa-solid fa-receipt"></i> Manage</a>
                </td>
            `;
            duesTbody.appendChild(tr);

            // Mobile Card using Apple HIG .contact-card / .wallet-item structure
            const mobileCard = document.createElement("div");
            mobileCard.className = "contact-card";
            mobileCard.innerHTML = `
                <div class="avatar" style="background-color: ${color}; color: white; font-weight: bold;">${initial}</div>
                <div class="contact-info">
                    <h4>${m.name}</h4>
                    <p style="font-size: 13px;">Owed: ${currency} ${amountDisplay.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
                <div class="contact-actions" style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                    <span class="badge" style="background-color: ${isPaid ? '#34C75920' : '#FF3B3020'}; color: ${isPaid ? '#34C759' : '#FF3B30'}; font-size: 11px;">
                        ${isPaid ? 'Paid' : 'Pending'}
                    </span>
                </div>
            `;
            // Add click listener to mobile card to jump to payments
            mobileCard.onclick = () => {
                window.location.href = "payments.html";
            };
            duesMobile.appendChild(mobileCard);
        });
    }

    const checkResponsive = () => {
        if (window.innerWidth <= 768) {
            duesMobile.style.display = "block";
            duesTbody.parentElement.parentElement.style.display = "none";
        } else {
            duesMobile.style.display = "none";
            duesTbody.parentElement.parentElement.style.display = "block";
        }
    };
    window.addEventListener("resize", checkResponsive);
    // Initial call is handled after DOM load, but let's call it just in case
    setTimeout(checkResponsive, 100);

    // Event listeners for month selector & DB updates
    document.addEventListener("month-changed", () => {
        renderDashboard();
    });

    document.addEventListener("db-updated", () => {
        renderDashboard();
    });

    renderDashboard();
});
