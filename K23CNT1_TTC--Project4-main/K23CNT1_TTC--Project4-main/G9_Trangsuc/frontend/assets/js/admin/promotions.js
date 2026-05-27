checkAdmin();

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
    window.location.href = `promotion-edit.html?id=${item.id}`;
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

document.addEventListener("DOMContentLoaded", loadPromotions);
