// ==============================
// FILE: products.js
// CHỨC NĂNG:
// - Lấy danh sách sản phẩm từ API
// - Hiển thị ra trang products.html
// ==============================

async function loadProducts() {
    const productList = document.getElementById("productList");

    try {
        const response = await fetch(`${API_BASE_URL}/products/`);
        const result = await response.json();

        productList.innerHTML = "";

        result.data.forEach(product => {
            productList.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="../assets/images/products/${product.image || 'default.jpg'}"
                             class="card-img-top"
                             style="height:250px; object-fit:cover;">

                        <div class="card-body">
                            <h5>${product.name}</h5>

                            <p class="text-danger fw-bold">
                                ${Number(product.price).toLocaleString()} VNĐ
                            </p>

                            <p class="text-muted">
                                ${product.category_name || ""}
                            </p>

                            <a href="product-detail.html?id=${product.id}" 
                               class="btn btn-warning w-100 mb-2">
                                Xem chi tiết
                            </a>

                            <button onclick="addToCart(${product.id})" 
                                    class="btn btn-dark w-100">
                                Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        productList.innerHTML = `<p class="text-danger">Không tải được sản phẩm.</p>`;
        console.error(error);
    }
}


// ==============================
// THÊM SẢN PHẨM VÀO GIỎ
// ==============================
async function addToCart(productId) {
    const user = getCurrentUser();

    if (!user) {
        alert("Bạn cần đăng nhập để thêm vào giỏ hàng");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user.id,
                product_id: productId,
                quantity: 1
            })
        });

        const result = await response.json();
        alert(result.message);

    } catch (error) {
        alert("Lỗi khi thêm vào giỏ hàng");
        console.error(error);
    }
}

loadProducts();