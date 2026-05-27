checkAdmin();

const promotionId = new URLSearchParams(window.location.search).get("id");
let loadedPromotion = null;

async function loadPromotion() {
    if (!promotionId) return;
    try {
        const result = await apiFetch(`${API_BASE_URL}/promotions/${promotionId}`);
        loadedPromotion = result.data || null;
        if (!loadedPromotion) return;

        document.getElementById("code").value = loadedPromotion.code || "";
        document.getElementById("discountValue").value = loadedPromotion.discount_value || "";
        document.getElementById("startDate").value = loadedPromotion.start_date ? loadedPromotion.start_date.split('T')[0] : "";
        document.getElementById("endDate").value = loadedPromotion.end_date ? loadedPromotion.end_date.split('T')[0] : "";
        document.getElementById("status").value = loadedPromotion.status || "Active";
    } catch (error) {
        alert("Không tải được khuyến mãi");
    }
}

async function updatePromotion() {
    try {
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

        const result = await apiFetch(`${API_BASE_URL}/promotions/${promotionId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });

        alert(result.message || "Đã cập nhật khuyến mãi");
        window.location.href = "promotions.html";
    } catch (error) {
        alert(error.message || "Không thể cập nhật khuyến mãi");
    }
}

document.addEventListener("DOMContentLoaded", loadPromotion);
