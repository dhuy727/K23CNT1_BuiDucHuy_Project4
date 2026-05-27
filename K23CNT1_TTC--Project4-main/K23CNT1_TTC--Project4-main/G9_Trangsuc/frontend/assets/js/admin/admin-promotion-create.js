checkAdmin();

async function createPromotion() {
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

        const result = await apiFetch(`${API_BASE_URL}/promotions/`, {
            method: "POST",
            body: JSON.stringify(payload),
        });

        alert(result.message || "Đã thêm khuyến mãi");
        window.location.href = "promotions.html";
    } catch (error) {
        alert(error.message || "Không thể tạo khuyến mãi");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("promotionForm");
    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();
            createPromotion();
        });
    }
});
