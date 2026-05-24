checkAdmin();

let editingPromotionId = null;

function resetPromotionForm() {
    editingPromotionId = null;
    document.getElementById("promotionId").value = "";
    document.getElementById("code").value = "";
    document.getElementById("discountValue").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("status").value = "Active";
}

function renderPromotionRows(items) {
    const tbody = document.getElementById("promotionTable");
    if (!tbody) return;

    if (!items.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Chưa có khuyến mãi nào.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${escapeHtml(item.code || "")}</td>
            <td>${Number(item.discount_value || 0).toLocaleString()} VNĐ</td>
            <td>${escapeHtml(item.status || "")}</td>
            <td>${formatDateTime(item.start_date)}</td>
            <td>${formatDateTime(item.end_date)}</td>
            <td class="text-nowrap">
                <button type="button" class="btn btn-sm btn-warning me-1" onclick='editPromotion(${JSON.stringify(item).replaceAll("'", "\\'")})'>Sửa</button>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="deletePromotion(${item.id})">Xóa</button>
            </td>
        </tr>
    `).join("");
}

async function loadPromotions() {
    const tbody = document.getElementById("promotionTable");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">Đang tải...</td></tr>`;
    }

    try {
        const result = await apiFetch(`${API_BASE_URL}/promotions/`);
        if (!result.success) throw new Error(result.message || "Không thể tải khuyến mãi");
        renderPromotionRows(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-danger text-center py-4">${escapeHtml(error.message || 'Lỗi tải dữ liệu')}</td></tr>`;
        }
        console.error(error);
    }
}

function editPromotion(item) {
    editingPromotionId = item.id;
    document.getElementById("promotionId").value = item.id || "";
    document.getElementById("code").value = item.code || "";
    document.getElementById("discountValue").value = item.discount_value || "";
    document.getElementById("startDate").value = item.start_date ? item.start_date.split('T')[0] : "";
    document.getElementById("endDate").value = item.end_date ? item.end_date.split('T')[0] : "";
    document.getElementById("status").value = item.status || "Active";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function savePromotion() {
    const payload = {
        code: document.getElementById("code")?.value.trim(),
        discount_value: Number(document.getElementById("discountValue")?.value || 0),
        start_date: document.getElementById("startDate")?.value || null,
        end_date: document.getElementById("endDate")?.value || null,
        status: document.getElementById("status")?.value || "Active",
        categories: []
    };

    if (!payload.code) {
        alert("Vui lòng nhập mã khuyến mãi");
        return;
    }
    if (!payload.start_date || !payload.end_date) {
        alert("Vui lòng chọn ngày bắt đầu và ngày kết thúc");
        return;
    }

    try {
        const url = editingPromotionId ? `${API_BASE_URL}/promotions/${editingPromotionId}` : `${API_BASE_URL}/promotions/`;
        const method = editingPromotionId ? "PUT" : "POST";
        const result = await apiFetch(url, {
            method,
            body: JSON.stringify(payload)
        });

        if (!result.success) throw new Error(result.message || "Lưu khuyến mãi thất bại");
        alert(result.message || (editingPromotionId ? "Đã cập nhật khuyến mãi" : "Đã thêm khuyến mãi"));
        resetPromotionForm();
        await loadPromotions();
    } catch (error) {
        alert(error.message || "Không thể lưu khuyến mãi");
    }
}

async function deletePromotion(id) {
    if (!confirm("Xóa khuyến mãi này?")) return;
    try {
        const result = await apiFetch(`${API_BASE_URL}/promotions/${id}`, {
            method: "DELETE"
        });
        if (!result.success) throw new Error(result.message || "Xóa khuyến mãi thất bại");
        alert(result.message || "Đã xóa khuyến mãi");
        await loadPromotions();
    } catch (error) {
        alert(error.message || "Không thể xóa khuyến mãi");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadPromotions();
    const form = document.getElementById("promotionForm");
    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();
            savePromotion();
        });
    }
});
