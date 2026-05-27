checkAdmin();

async function createGold() {
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

        const result = await apiFetch(`${API_BASE_URL}/gold/`, {
            method: "POST",
            body: JSON.stringify(payload),
        });

        alert(result.message || "Đã thêm giá vàng");
        window.location.href = "gold-price.html";
    } catch (error) {
        alert(error.message || "Không thể tạo giá vàng");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("goldForm");
    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();
            createGold();
        });
    }
});
