
checkAdmin();

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

async function createProduct() {
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
            status: "Còn hàng",
        };

        const result = await apiFetch(`${API_BASE_URL}/products/`, {
            method: "POST",
            body: JSON.stringify(payload),
        });

        alert(result.message || "Đã thêm sản phẩm");
        window.location.href = "products.html";
    } catch (error) {
        alert(error.message || "Không thể tạo sản phẩm");
    }
}

document.addEventListener("DOMContentLoaded", () => {
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
