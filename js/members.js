// Members.js - Directory and Inline Registration Logic with Real-Time Reactive Listeners (v30.0)

document.addEventListener("DOMContentLoaded", () => {
    initMembersDirectoryPage();
});

function initMembersDirectoryPage() {
    const pendingToast = sessionStorage.getItem("toast_message");
    const pendingToastType = sessionStorage.getItem("toast_type") || "success";
    if (pendingToast) {
        window.showToast(pendingToast, pendingToastType);
        sessionStorage.removeItem("toast_message");
        sessionStorage.removeItem("toast_type");
    }

    const searchInput = document.getElementById("member-search");
    const filterSelect = document.getElementById("status-filter");
    const desktopTbody = document.getElementById("members-table-body");
    const mobileList = document.getElementById("members-mobile-list");

    const addModal = document.getElementById("add-member-modal");
    const addForm = document.getElementById("add-member-form");
    const openAddBtn = document.getElementById("open-add-member-modal-btn");
    const closeAddModalBtn = document.getElementById("close-add-modal-btn");
    const cancelAddBtn = document.getElementById("cancel-add-btn");
    const addDateInput = document.getElementById("add-member-date");

    const editModal = document.getElementById("edit-member-modal");
    const editForm = document.getElementById("edit-member-form");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");

    if (addDateInput) {
        addDateInput.value = new Date().toISOString().split('T')[0];
    }

    const colors = ['blue','green','orange','red','purple','pink','teal'];

    let membersList = db.getMembers();

    // Reactive DB listener
    document.addEventListener("db-updated", () => {
        membersList = db.getMembers();
        renderMembers();
    });

    function renderMembers() {
        if (!desktopTbody || !mobileList) return;
        desktopTbody.innerHTML = "";
        mobileList.innerHTML = "";

        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const filter = filterSelect ? filterSelect.value : "all";

        membersList = db.getMembers();

        const filtered = membersList.filter(m => {
            const matchesQuery = m.name.toLowerCase().includes(query) || m.phone.includes(query) || (m.email && m.email.toLowerCase().includes(query));
            const matchesStatus = filter === "all" || m.status === filter;
            return matchesQuery && matchesStatus;
        });

        if (filtered.length === 0) {
            const emptyContent = `
                <div class="empty-state">
                    <i class="fa-solid fa-users-slash"></i>
                    <p>No members found matching your search. Click "Add New Member" to add roommates.</p>
                </div>
            `;
            desktopTbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fa-solid fa-users-slash"></i><p>No members found. Click "Add New Member" to register roommates.</p></td></tr>`;
            mobileList.innerHTML = emptyContent;
            return;
        }

        filtered.forEach((m, index) => {
            const isActive = m.status === "active";

            // Desktop Row
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${m.name}</strong></td>
                <td>${m.phone}</td>
                <td>${m.email || '<span style="color:var(--text-muted); font-style:italic;">None</span>'}</td>
                <td>
                    <span class="badge ${isActive ? 'badge-success' : 'badge-danger'}">
                        ${isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${m.joinedDate || '--'}</td>
                <td style="text-align: right;">
                    <div style="display:flex; justify-content: flex-end; gap:8px;">
                        <button class="btn btn-outline btn-sm edit-btn" data-id="${m.id}"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${m.id}"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>
                </td>
            `;
            desktopTbody.appendChild(tr);

            // Mobile Card
            const color = colors[index % colors.length];
            const initial = m.name.charAt(0).toUpperCase();

            const mobileCard = document.createElement("div");
            mobileCard.className = "contact-card";
            mobileCard.innerHTML = `
                <div class="contact-card-inner">
                    <div class="avatar ${color}">${initial}</div>
                    <div class="contact-info">
                        <h4>${m.name}</h4>
                        <p>${m.phone}</p>
                    </div>
                    <div class="contact-status">
                        <span class="badge ${isActive ? 'badge-success' : 'badge-danger'}">
                            ${isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                <div class="contact-actions">
                    <button class="btn btn-outline btn-sm edit-btn" data-id="${m.id}"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${m.id}"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            `;
            mobileList.appendChild(mobileCard);
        });

        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => openEditModal(btn.dataset.id));
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteMember(btn.dataset.id));
        });
    }

    // Add Member Dialog Handlers
    function openAddModal() {
        if (addModal) {
            addDateInput.value = new Date().toISOString().split('T')[0];
            addModal.classList.add("active");
        }
    }

    function closeAddModal() {
        if (addModal) {
            addModal.classList.remove("active");
            addForm.reset();
        }
    }

    if (openAddBtn) openAddBtn.addEventListener("click", openAddModal);
    if (closeAddModalBtn) closeAddModalBtn.addEventListener("click", closeAddModal);
    if (cancelAddBtn) cancelAddBtn.addEventListener("click", closeAddModal);

    if (addForm) {
        addForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("add-member-name").value.trim();
            const phone = document.getElementById("add-member-phone").value.trim();
            const email = document.getElementById("add-member-email").value.trim();
            const joinedDate = addDateInput.value || new Date().toISOString().split('T')[0];

            if (!name || !phone) {
                window.showToast("Please fill in required name and phone fields.", "danger");
                return;
            }

            const currentMembers = db.getMembers();
            const newId = "m" + Date.now();

            const newMember = {
                id: newId,
                name,
                phone,
                email: email || "",
                status: "active",
                joinedDate
            };

            currentMembers.push(newMember);
            db.saveMembers(currentMembers);

            const currentMonthStr = joinedDate.substring(0, 7);
            const payments = db.getPayments();
            
            if (!payments[currentMonthStr]) {
                payments[currentMonthStr] = {};
            }
            
            payments[currentMonthStr][newId] = {
                paid: false,
                amount: 0,
                payDate: ""
            };
            db.savePayments(payments);

            closeAddModal();
            window.showToast(`Roommate '${name}' added successfully!`, "success");
            renderMembers();
        });
    }

    // Edit Member Dialog Handlers
    function openEditModal(id) {
        const member = membersList.find(m => m.id === id);
        if (!member) return;

        document.getElementById("edit-member-id").value = member.id;
        document.getElementById("edit-member-name").value = member.name;
        document.getElementById("edit-member-phone").value = member.phone;
        document.getElementById("edit-member-email").value = member.email;
        document.getElementById("edit-member-status").value = member.status;

        editModal.classList.add("active");
    }

    function closeEditModal() {
        editModal.classList.remove("active");
        editForm.reset();
    }

    if (closeModalBtn) closeModalBtn.addEventListener("click", closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditModal);
    
    if (editForm) {
        editForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const id = document.getElementById("edit-member-id").value;
            const name = document.getElementById("edit-member-name").value.trim();
            const phone = document.getElementById("edit-member-phone").value.trim();
            const email = document.getElementById("edit-member-email").value.trim();
            const status = document.getElementById("edit-member-status").value;

            if (!name || !phone) {
                window.showToast("Please fill in required fields.", "danger");
                return;
            }

            membersList = membersList.map(m => {
                if (m.id === id) {
                    return { ...m, name, phone, email, status };
                }
                return m;
            });

            db.saveMembers(membersList);
            closeEditModal();
            window.showToast("Member updated successfully.");
            renderMembers();
        });
    }

    function deleteMember(id) {
        const member = membersList.find(m => m.id === id);
        if (!member) return;

        if (confirm(`Are you absolutely sure you want to delete ${member.name}? This will remove them from all calculations.`)) {
            membersList = membersList.filter(m => m.id !== id);
            db.saveMembers(membersList);
            
            const payments = db.getPayments();
            Object.keys(payments).forEach(month => {
                if (payments[month] && payments[month][id]) {
                    delete payments[month][id];
                }
            });
            db.savePayments(payments);

            window.showToast(`Deleted ${member.name} successfully.`, "success");
            renderMembers();
        }
    }

    const checkResponsive = () => {
        if (!mobileList) return;
        if (window.innerWidth <= 768) {
            mobileList.style.display = "block";
        } else {
            mobileList.style.display = "none";
        }
    };
    window.addEventListener("resize", checkResponsive);
    checkResponsive();

    if (searchInput) searchInput.addEventListener("input", renderMembers);
    if (filterSelect) filterSelect.addEventListener("change", renderMembers);

    renderMembers();
}
