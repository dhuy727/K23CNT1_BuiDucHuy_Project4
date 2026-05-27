checkAdmin();

const goldId = new URLSearchParams(window.location.search).get("id");
let loadedGold = null;

async function loadGold() {
    if (!goldId) return;
    try {
        const result = await apiFetch(`${API_BASE_URL}/gold/${goldId}`);
        loadedGold = result.data || null;
        if (!loadedGold) return;

        document.getElementById("type").value = loadedGold.gold_type || "";
        document.getElementById("buyPrice").value = loadedGold.buy_price || "";
        document.getElementById("sellPrice").value = loadedGold.sell_price || "";
    } catch (error) {
        alert("Không tải được giá vàng");
    }
}

async function updateGold() {
    try {
        const payload = {
            gold_type: document.getElementById("type")?.value.trim(),
            buy_price: Number(document.getElementById("buyPrice")?.value || 0),
            sell_price: Number(document.getElementById("sellPrice")?.value || 0),
        };

        if (!payload.gold_type) {
            alert("Vui lòng nhập loại vàng");
            return;
        }

        const result = await apiFetch(`${API_BASE_URL}/gold/${goldId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });

        alert(result.message || "Đã cập nhật giá vàng");
        window.location.href = "gold-price.html";
    } catch (error) {
        alert(error.message || "Không thể cập nhật giá vàng");
    }
}

document.addEventListener("DOMContentLoaded", loadGold);
