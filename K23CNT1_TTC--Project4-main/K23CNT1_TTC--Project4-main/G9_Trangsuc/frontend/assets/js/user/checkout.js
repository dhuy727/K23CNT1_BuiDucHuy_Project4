// ==============================
// FILE: checkout.js
// CHỨC NĂNG:
// - Kiểm tra đăng nhập
// - Gửi thông tin thanh toán
// - Tạo đơn hàng từ giỏ hàng
// ==============================


// ==============================
// KIỂM TRA ĐĂNG NHẬP
// ==============================
checkLogin();


// ==============================
// LẤY USER ĐANG ĐĂNG NHẬP
// ==============================
const user = getCurrentUser();


// ==============================
// LẤY FORM THANH TOÁN
// ==============================
const checkoutForm = document.getElementById("checkoutForm");


// ==============================
// XỬ LÝ KHI BẤM NÚT ĐẶT HÀNG
// ==============================
checkoutForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Lấy dữ liệu từ form
    const receiverName = document.getElementById("receiverName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const paymentMethod = document.getElementById("paymentMethod").value;

    // Kiểm tra dữ liệu nhập
    if (!receiverName || !phone || !address) {
        alert("Vui lòng nhập đầy đủ thông tin thanh toán");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user.id,
                receiver_name: receiverName,
                phone: phone,
                address: address,
                payment_method: paymentMethod
            })
        });

        const result = await response.json();

        if (result.success) {
            alert("Đặt hàng thành công");
            window.location.href = `payment-success.html?order_id=${result.order_id}`;
        } else {
            alert(result.message);
        }

    } catch (error) {
        alert("Lỗi khi đặt hàng");
        console.error("Lỗi checkout:", error);
    }
});