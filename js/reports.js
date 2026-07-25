// Reports.js - Monthly reporting and printing analytics controller

document.addEventListener("DOMContentLoaded", () => {
    const monthSelect = document.getElementById("report-month-select");
    const printBtn = document.getElementById("print-report-btn");
    const exportCsvBtn = document.getElementById("export-csv-btn");

    const activeMembersCount = document.getElementById("rep-active-members");
    const totalExpensesVal = document.getElementById("rep-total-expenses");
    const feePerMemberVal = document.getElementById("rep-fee-per-member");
    const totalCollectedVal = document.getElementById("rep-total-collected");
    const pendingBalanceVal = document.getElementById("rep-pending-balance");

    const categoryTbody = document.getElementById("category-report-tbody");
    const memberStatementTbody = document.getElementById("member-statement-tbody");
    const printBillingMonth = document.getElementById("print-billing-month");

    const settings = db.getSettings();
    const currency = settings.currency || "AED";
    let reportChart = null;

    // Listen for reactive cloud sync events
    document.addEventListener("db-updated", () => {
        generateReport(monthSelect.value);
    });

    // 1. Populate Month Options dynamically based on data
    function initMonthSelector() {
        const bills = db.getBills();
        const payments = db.getPayments();
        const months = new Set();

        bills.forEach(b => {
            if (b.date && b.date.length >= 10) {
                const messMonth = db.getMessMonthFromDate(b.date);
                if (messMonth) months.add(messMonth);
            }
        });

        Object.keys(payments).forEach(m => months.add(m));

        const selectedMonth = db.getSelectedMonth();
        months.add(selectedMonth);

        const sortedMonths = Array.from(months).sort((a, b) => b.localeCompare(a));

        monthSelect.innerHTML = "";
        sortedMonths.forEach(m => {
            const range = db.getMonthRange(m);
            const option = document.createElement("option");
            option.value = m;
            option.textContent = range.label;
            monthSelect.appendChild(option);
        });

        monthSelect.value = selectedMonth;
    }

    // 2. Generate and Populate Report
    function generateReport(month) {
        const stats = db.getStats(month);
        const range = db.getMonthRange(month);
        printBillingMonth.textContent = range.label;

        const printStatusEl = document.getElementById("print-closing-status");
        const reportBadgeEl = document.getElementById("report-closing-badge");

        if (printStatusEl) {
            printStatusEl.textContent = stats.isClosed ? "CLOSED & FINALIZED" : "ACTIVE CYCLE";
        }
        if (reportBadgeEl) {
            reportBadgeEl.textContent = stats.isClosed ? "Closed & Finalized" : "Active Cycle";
            if (stats.isClosed) {
                reportBadgeEl.style.backgroundColor = "#FF3B30";
            } else {
                reportBadgeEl.style.backgroundColor = "#34C759";
            }
        }

        const closeBtn = document.getElementById("close-month-btn");
        if (closeBtn) {
            if (stats.isClosed) {
                closeBtn.innerHTML = `<i class="fa-solid fa-lock-open"></i> Unlock Period`;
                closeBtn.className = "btn btn-outline btn-sm";
                closeBtn.style.color = "#FF9500";
                closeBtn.style.borderColor = "#FF9500";
                closeBtn.style.backgroundColor = "transparent";
            } else {
                closeBtn.innerHTML = `<i class="fa-solid fa-file-signature"></i> Finalize & Close Month`;
                closeBtn.className = "btn btn-primary btn-sm";
                closeBtn.style.backgroundColor = "#0071E3";
                closeBtn.style.color = "white";
                closeBtn.style.border = "none";
            }

            closeBtn.onclick = async () => {
                if (stats.isClosed) {
                    if (confirm(`Unlock mess period ${stats.monthRange.label} to allow editing expenses?`)) {
                        await db.setMonthClosed(month, false);
                        if (window.showToast) window.showToast(`Unlocked ${stats.monthRange.label}`);
                    }
                } else {
                    if (confirm(`Finalize and Close mess month ${stats.monthRange.label}? Past expenses will be locked and compiled.`)) {
                        await db.setMonthClosed(month, true);
                        if (window.showToast) window.showToast(`Closed & Finalized ${stats.monthRange.label}`);
                        setTimeout(() => {
                            if (confirm(`Month Finalized! Download CSV payment ledger report for ${stats.monthRange.shortLabel}?`)) {
                                db.downloadCSVReport(month);
                            }
                        }, 300);
                    }
                }
            };
        }

        // KPI Updates
        activeMembersCount.textContent = stats.totalMembers;
        totalExpensesVal.textContent = `${currency} ${stats.totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        
        // Show Cost per Meal Unit in the KPI card
        feePerMemberVal.innerHTML = `${currency} ${stats.costPerMeal.toLocaleString(undefined, {minimumFractionDigits: 3})}<br><span style="font-size:11px; font-weight:normal; color:#0071E3; opacity:0.8;">Per Meal Unit</span>`;
        
        totalCollectedVal.textContent = `${currency} ${stats.amountCollected.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        pendingBalanceVal.textContent = `${currency} ${stats.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

        // Category Aggregations
        categoryTbody.innerHTML = "";
        const catMap = {};
        const categories = ["Rent", "Food", "Groceries", "Utilities", "Others"];
        
        categories.forEach(c => catMap[c] = { count: 0, amount: 0 });

        stats.bills.forEach(bill => {
            const cat = bill.category || "Others";
            if (!catMap[cat]) {
                catMap[cat] = { count: 0, amount: 0 };
            }
            catMap[cat].count++;
            catMap[cat].amount += parseFloat(bill.amount);
        });

        Object.keys(catMap).forEach(cat => {
            const data = catMap[cat];
            if (data.amount > 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="color: var(--text-main); font-weight: 500;">${cat}</td>
                    <td style="color: var(--text-secondary);">${data.count}</td>
                    <td style="text-align: right; color: var(--text-main); font-weight: 600;">${currency} ${data.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                `;
                categoryTbody.appendChild(tr);
            }
        });

        if (stats.bills.length === 0) {
            categoryTbody.innerHTML = `<tr><td colspan="3" class="empty-state" style="padding:20px; text-align:center; color: var(--text-secondary);"><p>No expenses listed for this month.</p></td></tr>`;
        }

        // Detailed Roommates Statement
        memberStatementTbody.innerHTML = "";
        const payments = stats.payments;
        const memberShares = stats.memberShares;

        stats.members.forEach(member => {
            const payInfo = payments[member.id];
            const isPaid = payInfo ? payInfo.paid : false;
            const payDate = payInfo && payInfo.payDate ? payInfo.payDate : "--";

            // Get roommate's share and meals eaten
            const share = memberShares[member.id] || { mealsEaten: 0, netShareAmount: 0 };
            const amountCleared = isPaid ? (payInfo.amount || share.netShareAmount) : 0;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="color: var(--text-main); font-weight: 500;">${member.name}</td>
                <td>
                    <span style="color: var(--text-main);">${member.phone}</span><br>
                    <span style="font-size:12px; color: var(--text-secondary);"><i class="fa-solid fa-utensils"></i> ${share.mealsEaten} meals</span>
                </td>
                <td style="color: var(--text-main); font-weight: 600;">${currency} ${(share.netShareAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td>
                    <span class="badge" style="font-size: 11px; padding: 4px 8px; border-radius: 12px; ${isPaid ? 'background-color: #34C759; color: white;' : 'background-color: #FF3B30; color: white;'}">
                        ${isPaid ? 'Paid' : 'Pending'}
                    </span>
                </td>
                <td style="color: ${isPaid ? '#34C759' : '#1d1d1f'}; font-weight: 600;">${currency} ${amountCleared.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td style="color: var(--text-secondary); font-size: 13px;">${payDate}</td>
            `;
            memberStatementTbody.appendChild(tr);
        });

        if (stats.members.length === 0) {
            memberStatementTbody.innerHTML = `<tr><td colspan="6" class="empty-state" style="padding:20px; text-align:center; color: var(--text-secondary);"><p>No active members listed.</p></td></tr>`;
        }

        renderChart(catMap);
    }

    // 3. Render Chart
    function renderChart(catMap) {
        const labels = Object.keys(catMap).filter(k => catMap[k].amount > 0);
        const data = labels.map(k => catMap[k].amount);

        const ctx = document.getElementById("reportChart").getContext("2d");
        
        if (reportChart) {
            reportChart.destroy();
        }

        const isDarkMode = document.documentElement.classList.contains("dark-mode");
        const textColor = isDarkMode ? "#94a3b8" : "#86868b";
        const gridColor = isDarkMode ? "#223049" : "#e5e5ea";

        if (labels.length === 0) {
            labels.push("No Data");
            data.push(0);
        }

        reportChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `Expenses (${currency})`,
                    data: data,
                    backgroundColor: '#0071E3', // Apple Primary Blue
                    borderColor: '#0071E3',
                    borderRadius: 8, // Apple rounded corners
                    borderWidth: 0,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        padding: 12,
                        titleFont: { family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', size: 14 },
                        bodyFont: { family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', size: 14 },
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        ticks: { color: textColor, font: { family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', size: 12 } },
                        grid: { display: false }
                    },
                    y: {
                        ticks: { color: textColor, font: { family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', size: 12 } },
                        grid: { color: gridColor, drawBorder: false },
                        border: { display: false }
                    }
                }
            }
        });
    }

    // 4. Print Event
    printBtn.addEventListener("click", () => {
        window.print();
    });

    // 5. CSV Export Event
    exportCsvBtn.addEventListener("click", () => {
        const monthVal = monthSelect.value;
        const stats = db.getStats(monthVal);
        
        let csvContent = "data:text/csv;charset=utf-8,";
        
        csvContent += `Room ${settings.roomNo} Mess Statement - ${monthVal}\n\n`;
        
        csvContent += `Summary Statistics\n`;
        csvContent += `Total Active Members,${stats.totalMembers}\n`;
        csvContent += `Total Compiled Expenses (${currency}),${stats.totalExpenses}\n`;
        csvContent += `Total Meals Consumed,${stats.totalMealsEaten}\n`;
        csvContent += `Calculated Cost Per Meal (${currency}),${stats.costPerMeal}\n`;
        csvContent += `Amount Collected (${currency}),${stats.amountCollected}\n`;
        csvContent += `Remaining Balance (${currency}),${stats.balance}\n\n`;

        csvContent += `Roommates Payments Ledger (Pro-Rata)\n`;
        csvContent += `Member Name,Phone,Email,Meals Consumed,Required share (${currency}),Status,Amount paid (${currency}),Pay date\n`;
        
        stats.members.forEach(member => {
            const payInfo = stats.payments[member.id];
            const isPaid = payInfo ? payInfo.paid : false;
            const share = stats.memberShares[member.id] || { mealsEaten: 0, shareAmount: 0 };
            const amountPaid = isPaid ? (payInfo.amount || share.shareAmount) : 0;
            const payDate = payInfo && payInfo.payDate ? payInfo.payDate : "";
            
            csvContent += `"${member.name}","${member.phone}","${member.email || ''}",${share.mealsEaten},${share.shareAmount},"${isPaid ? 'Paid' : 'Pending'}",${amountPaid},"${payDate}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `mess_report_${settings.roomNo}_${monthVal}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    monthSelect.addEventListener("change", (e) => {
        generateReport(e.target.value);
    });

    initMonthSelector();
    generateReport(monthSelect.value);
});
