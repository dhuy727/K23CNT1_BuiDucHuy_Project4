// ==============================
// FILE: cart.js
// CHỨC NĂNG:
// - Kiểm tra đăng nhập
// - Hiển thị giỏ hàng theo user đang đăng nhập
// - Cập nhật số lượng
// - Xóa sản phẩm khỏi giỏ
// ==============================


// ==============================
// KIỂM TRA NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP CHƯA
// ==============================
checkLogin();


// ==============================
// LẤY THÔNG TIN USER TỪ LOCALSTORAGE
// ==============================
const user = getCurrentUser();


// ==============================
// LOAD GIỎ HÀNG
// ==============================
async function loadCart() {
    const cartBody = document.getElementById("cartBody");
    const totalBox = document.getElementById("totalBox");

    try {
        const response = await fetch(`${API_BASE_URL}/cart/${user.id}`);
        const result = await response.json();

        cartBody.innerHTML = "";

        let grandTotal = 0;

        // Nếu giỏ hàng trống
        if (!result.data || result.data.length === 0) {
            cartBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        Giỏ hàng của bạn đang trống
                    </td>
                </tr>
            `;

            totalBox.innerHTML = `Tổng tiền: 0 VNĐ`;
            return;
        }

        // Hiển thị từng sản phẩm trong giỏ hàng
        result.data.forEach(item => {
            grandTotal += Number(item.total);

            cartBody.innerHTML += `
                <tr>
                    <td>
                        <img src="../assets/images/products/${item.image || 'default.jpg'}"
                             width="70"
                             style="height:70px; object-fit:cover;">
                    </td>

                    <td>${item.product_name}</td>

                    <td>${Number(item.price).toLocaleString()} VNĐ</td>

                    <td>
                        <input type="number"
                               min="1"
                               value="${item.quantity}"
                               class="form-control"
                               style="width:90px;"
                               onchange="updateCart(${item.cart_detail_id}, this.value)">
                    </td>

                    <td>${Number(item.total).toLocaleString()} VNĐ</td>

                    <td>
                        <button class="btn btn-danger btn-sm"
                                onclick="deleteCartItem(${item.cart_detail_id})">
                            Xóa
                        </button>
                    </td>
                </tr>
            `;
        });

        totalBox.innerHTML = `
            Tổng tiền: ${grandTotal.toLocaleString()} VNĐ
        `;

    } catch (error) {
        cartBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-danger text-center">
                    Không tải được giỏ hàng
                </td>
            </tr>
        `;

        console.error("Lỗi load giỏ hàng:", error);
    }
}


// ==============================
// CẬP NHẬT SỐ LƯỢNG SẢN PHẨM
// ==============================
async function updateCart(cartDetailId, quantity) {
    if (quantity < 1) {
        alert("Số lượng phải lớn hơn hoặc bằng 1");
        loadCart();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/update/${cartDetailId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                quantity: quantity
            })
        });

        const result = await response.json();

        if (!result.success) {
            alert(result.message);
        }

        loadCart();

    } catch (error) {
        alert("Lỗi khi cập nhật giỏ hàng");
        console.error("Lỗi update giỏ hàng:", error);
    }
}


// ==============================
// XÓA SẢN PHẨM KHỎI GIỎ
// ==============================
async function deleteCartItem(cartDetailId) {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/delete/${cartDetailId}`, {
            method: "DELETE"
        });

        const result = await response.json();

        alert(result.message);

        loadCart();

    } catch (error) {
        alert("Lỗi khi xóa sản phẩm khỏi giỏ hàng");
        console.error("Lỗi xóa giỏ hàng:", error);
    }
}


// ==============================
// GỌI HÀM LOAD GIỎ HÀNG KHI MỞ TRANG
// ==============================
loadCart();