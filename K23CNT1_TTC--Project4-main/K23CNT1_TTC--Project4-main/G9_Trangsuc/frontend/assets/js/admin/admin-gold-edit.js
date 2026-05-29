checkAdmin();

const goldId = new URLSearchParams(window.location.search).get("id");

async function loadGold() {
    const result = await apiFetch(`${API_BASE_URL}/gold/${goldId}`);
    if (!result || result.success === false || !result.data) {
        throw new Error(result?.message || "Không tải được giá vàng");
    }

    const item = result.data;
    document.getElementById("type").value = item.gold_type || "";
    document.getElementById("buyPrice").value = item.buy_price ?? "";
    document.getElementById("sellPrice").value = item.sell_price ?? "";
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

        if (result.success === false) {
            throw new Error(result.message || "Không thể cập nhật giá vàng");
        }

        alert(result.message || "Đã cập nhật giá vàng");
        window.location.href = "gold-price.html";
    } catch (error) {
        alert(error.message || "Không thể cập nhật giá vàng");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    if (!goldId) {
        alert("Không tìm thấy ID giá vàng");
        window.location.href = "gold-price.html";
        return;
    }

    try {
        await loadGold();
    } catch (error) {
        alert(error.message || "Không tải được giá vàng");
        window.location.href = "gold-price.html";
    }
});
