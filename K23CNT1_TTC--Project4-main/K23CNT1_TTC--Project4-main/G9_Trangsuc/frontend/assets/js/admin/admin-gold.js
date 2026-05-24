
checkAdmin();

let editingGoldId = null;

function resetGoldForm() {
    editingGoldId = null;
    const goldId = document.getElementById("goldId");
    const type = document.getElementById("type");
    const buyPrice = document.getElementById("buyPrice");
    const sellPrice = document.getElementById("sellPrice");
    if (goldId) goldId.value = "";
    if (type) type.value = "";
    if (buyPrice) buyPrice.value = "";
    if (sellPrice) sellPrice.value = "";
}

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
    editingGoldId = item.id;
    document.getElementById("goldId").value = item.id || "";
    document.getElementById("type").value = item.gold_type || "";
    document.getElementById("buyPrice").value = item.buy_price ?? "";
    document.getElementById("sellPrice").value = item.sell_price ?? "";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function saveGold() {
    const payload = {
        gold_type: document.getElementById("type")?.value.trim(),
        buy_price: Number(document.getElementById("buyPrice")?.value || 0),
        sell_price: Number(document.getElementById("sellPrice")?.value || 0),
    };

    if (!payload.gold_type) {
        alert("Vui lòng nhập loại vàng");
        return;
    }

    try {
        const url = editingGoldId ? `${API_BASE_URL}/gold/${editingGoldId}` : `${API_BASE_URL}/gold/`;
        const method = editingGoldId ? "PUT" : "POST";
        const result = await apiFetch(url, { method, body: JSON.stringify(payload) });
        alert(result.message || "Đã lưu giá vàng");
        resetGoldForm();
        await loadGoldPrices();
    } catch (error) {
        alert("Không thể lưu giá vàng");
    }
}

async function deleteGold(id) {
    if (!confirm("Xóa mục giá vàng này?")) return;
    alert("Backend hiện chưa hỗ trợ xóa giá vàng.");
}

document.addEventListener("DOMContentLoaded", () => {
    loadGoldPrices();
    const formButtons = document.querySelectorAll('button[onclick="saveGold()"]');
    formButtons.forEach(btn => btn.removeAttribute("onclick"));
});
