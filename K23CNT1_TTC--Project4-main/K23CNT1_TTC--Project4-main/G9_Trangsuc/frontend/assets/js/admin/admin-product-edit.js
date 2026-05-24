
checkAdmin();

const productId = new URLSearchParams(window.location.search).get("id");
let loadedProduct = null;

async function loadProduct() {
    if (!productId) return;
    try {
        const result = await apiFetch(`${API_BASE_URL}/products/${productId}`);
        loadedProduct = result.data || null;
        if (!loadedProduct) return;

        document.getElementById("name").value = loadedProduct.name || "";
        document.getElementById("categoryId").value = loadedProduct.category_id || "";
        document.getElementById("material").value = loadedProduct.material || "";
        document.getElementById("price").value = loadedProduct.price || "";
        document.getElementById("quantity").value = loadedProduct.quantity || "";
        document.getElementById("image").value = loadedProduct.image || "";
        document.getElementById("description").value = loadedProduct.description || "";
        document.getElementById("status").value = loadedProduct.status || "Còn hàng";
    } catch (error) {
        alert("Không tải được sản phẩm");
    }
}

async function updateProduct() {
    try {
        const payload = {
            name: document.getElementById("name")?.value.trim(),
            category_id: Number(document.getElementById("categoryId")?.value || 0) || null,
            material: document.getElementById("material")?.value.trim(),
            price: Number(document.getElementById("price")?.value || 0),
            quantity: Number(document.getElementById("quantity")?.value || 0),
            image: document.getElementById("image")?.value.trim(),
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

document.addEventListener("DOMContentLoaded", loadProduct);
