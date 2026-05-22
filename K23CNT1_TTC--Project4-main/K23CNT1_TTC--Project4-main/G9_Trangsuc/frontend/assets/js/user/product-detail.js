// ==============================
// FILE: product-detail.js
// CHỨC NĂNG:
// - Lấy id sản phẩm từ URL
// - Hiển thị chi tiết sản phẩm
// - Thêm vào giỏ hàng
// ==============================

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProductDetail() {
    const box = document.getElementById("productDetail");

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const result = await response.json();

        const product = result.data;

        box.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <img src="../assets/images/products/${product.image || 'default.jpg'}"
                         class="img-fluid rounded shadow">
                </div>

                <div class="col-md-6">
                    <h2>${product.name}</h2>

                    <h4 class="text-danger">
                        ${Number(product.price).toLocaleString()} VNĐ
                    </h4>

                    <p><b>Danh mục:</b> ${product.category_name || ""}</p>
                    <p><b>Chất liệu:</b> ${product.material || ""}</p>
                    <p><b>Số lượng:</b> ${product.quantity}</p>
                    <p>${product.description || ""}</p>

                    <input type="number" id="quantity" value="1" min="1" 
                           class="form-control mb-3" style="width:120px;">

                    <button onclick="addToCart()" class="btn btn-warning">
                        Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        `;

    } catch (error) {
        box.innerHTML = `<p class="text-danger">Không tải được chi tiết sản phẩm</p>`;
        console.error(error);
    }
}

async function addToCart() {
    const quantity = document.getElementById("quantity").value;

    const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: CURRENT_USER_ID,
            product_id: productId,
            quantity: quantity
        })
    });

    const result = await response.json();
    alert(result.message);
}

loadProductDetail();