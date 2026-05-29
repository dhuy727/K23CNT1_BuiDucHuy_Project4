
checkAdmin();

const productId = new URLSearchParams(window.location.search).get("id");
let loadedProduct = null;

async function uploadSelectedImage() {
    const fileInput = document.getElementById("upload-image");
    const imageInput = document.getElementById("image");
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return "";

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    const response = await fetch(`${API_BASE_URL}/upload/`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.message || "Upload ảnh thất bại");
    }

    if (imageInput) imageInput.value = result.filename || fileInput.files[0].name;
    return imageInput ? imageInput.value : (result.filename || "");
}

async function loadProduct() {
    try {
        const result = await apiFetch(`${API_BASE_URL}/products/${productId}`);
        if (!result || result.success === false || !result.data) {
            throw new Error(result?.message || "Không tải được sản phẩm");
        }
        loadedProduct = result.data;

        document.getElementById("name").value = loadedProduct.name || "";
        document.getElementById("categoryId").value = loadedProduct.category_id || "";
        document.getElementById("material").value = loadedProduct.material || "";
        document.getElementById("price").value = loadedProduct.price || "";
        document.getElementById("quantity").value = loadedProduct.quantity || "";
        document.getElementById("image").value = loadedProduct.image || "";
        document.getElementById("description").value = loadedProduct.description || "";
        document.getElementById("status").value = loadedProduct.status || "Còn hàng";
        syncStatusWithQuantity();
    } catch (error) {
        alert(error.message || "Không tải được sản phẩm");
        window.location.href = "products.html";
    }
}

function syncStatusWithQuantity() {
    const quantityInput = document.getElementById("quantity");
    const statusSelect = document.getElementById("status");
    if (!quantityInput || !statusSelect) return;

    const quantity = Number(quantityInput.value || 0);
    if (quantity <= 0) {
        statusSelect.value = "Hết hàng";
    } else if (statusSelect.value === "Hết hàng") {
        statusSelect.value = "Còn hàng";
    }
}

async function updateProduct() {
    try {
        const image = document.getElementById("image")?.value.trim() || await uploadSelectedImage();
        const payload = {
            name: document.getElementById("name")?.value.trim(),
            category_id: Number(document.getElementById("categoryId")?.value || 0) || null,
            material: document.getElementById("material")?.value.trim(),
            price: Number(document.getElementById("price")?.value || 0),
            quantity: Number(document.getElementById("quantity")?.value || 0),
            image,
            description: document.getElementById("description")?.value.trim(),
            status: document.getElementById("status")?.value || "Còn hàng",
        };

        const result = await apiFetch(`${API_BASE_URL}/products/${productId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });

        alert(result.message || "Đã cập nhật sản phẩm");
        window.location.href = "products.html";
    } catch (error) {
        alert(error.message || "Không thể cập nhật sản phẩm");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (!productId) {
        alert("Không tìm thấy ID sản phẩm");
        window.location.href = "products.html";
        return;
    }
    loadProduct();
    document.getElementById("quantity")?.addEventListener("input", syncStatusWithQuantity);

    const fileInput = document.getElementById("upload-image");
    if (fileInput) {
        fileInput.addEventListener("change", async () => {
            try {
                await uploadSelectedImage();
            } catch (error) {
                alert(error.message || "Không thể upload ảnh");
            }
        });
    }
});
