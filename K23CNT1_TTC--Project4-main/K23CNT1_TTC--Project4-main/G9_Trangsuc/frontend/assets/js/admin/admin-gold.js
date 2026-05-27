
checkAdmin();

function renderGoldRows(items) {
    const tbody = document.getElementById("gold-body");
    if (!tbody) return;

    if (!items.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Chưa có dữ liệu giá vàng</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${escapeHtml(item.gold_type || "")}</td>
            <td>${formatMoney(item.buy_price)}</td>
            <td>${formatMoney(item.sell_price)}</td>
            <td>${formatDateTime(item.updated_at)}</td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-warning me-1" type="button" onclick='editGold(${JSON.stringify(item).replaceAll("'", "\\'")})'>Sửa</button>
                <button class="btn btn-sm btn-outline-danger" type="button" onclick="deleteGold(${item.id})">Xóa</button>
            </td>
        </tr>
    `).join("");
}

async function loadGoldPrices() {
    const tbody = document.getElementById("gold-body");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">Đang tải...</td></tr>`;
    try {
        const result = await apiFetch(`${API_BASE_URL}/gold/`);
        renderGoldRows(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-danger text-center py-4">Không tải được giá vàng</td></tr>`;
    }
}

function editGold(item) {
    window.location.href = `gold-edit.html?id=${item.id}`;
}

async function deleteGold(id) {
    if (!confirm("Xóa mục giá vàng này?")) return;
    try {
        const result = await apiFetch(`${API_BASE_URL}/gold/${id}`, {
            method: "DELETE"
        });
        alert(result.message || "Đã xóa giá vàng");
        await loadGoldPrices();
    } catch (error) {
        alert("Không thể xóa giá vàng");
    }
}

document.addEventListener("DOMContentLoaded", loadGoldPrices);
