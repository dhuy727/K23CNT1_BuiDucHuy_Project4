async function checkout() {
    const user = getUser();

    if (!user) {
        Swal.fire({
            icon: "warning",
            title: "Vui lòng đăng nhập trước khi đặt hàng"
        });

        return;
    }

    const cartLocal = getCart();

    if (cartLocal.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "Giỏ hàng đang trống"
        });

        return;
    }

    const total = cartLocal.reduce(
        (sum, item) => sum + item.price * item.quantityCart,
        0
    );

    const response = await fetch(`${API_BASE_URL}/bdh/orders/checkout`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            userId: user.id,
            receiver: document.getElementById("receiver").value,
            phone: document.getElementById("phone").value,
            address: document.getElementById("address").value,
            paymentMethod: document.getElementById("paymentMethod").value,
            total: total,
            cart: cartLocal.map(item => ({
                id: item.id,
                price: item.price,
                quantity: item.quantityCart
            }))
        })
    });

    const data = await response.json();

    if (data.success) {
        clearCart();

        Swal.fire({
            icon: "success",
            title: data.message
        });

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    }
}