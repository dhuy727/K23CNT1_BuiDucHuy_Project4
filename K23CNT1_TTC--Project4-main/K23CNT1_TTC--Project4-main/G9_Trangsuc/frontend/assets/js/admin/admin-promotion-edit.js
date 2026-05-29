checkAdmin();

const promotionId = new URLSearchParams(window.location.search).get("id");

function toDateInputValue(value) {
    if (!value) return "";
    return String(value).split("T")[0].split(" ")[0];
}

async function loadPromotion() {
    const result = await apiFetch(`${API_BASE_URL}/promotions/${promotionId}`);
    if (!result || result.success === false || !result.data) {
        throw new Error(result?.message || "Không tải được khuyến mãi");
    }

    const item = result.data;
    document.getElementById("code").value = item.code || "";
    document.getElementById("discountValue").value = item.discount_value ?? "";
    document.getElementById("startDate").value = toDateInputValue(item.start_date);
    document.getElementById("endDate").value = toDateInputValue(item.end_date);
    document.getElementById("status").value = item.status || "Active";
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

        if (result.success === false) {
            throw new Error(result.message || "Không thể cập nhật khuyến mãi");
        }

        alert(result.message || "Đã cập nhật khuyến mãi");
        window.location.href = "promotions.html";
    } catch (error) {
        alert(error.message || "Không thể cập nhật khuyến mãi");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    if (!promotionId) {
        alert("Không tìm thấy ID khuyến mãi");
        window.location.href = "promotions.html";
        return;
    }

    try {
        await loadPromotion();
    } catch (error) {
        alert(error.message || "Không tải được khuyến mãi");
        window.location.href = "promotions.html";
    }
});
