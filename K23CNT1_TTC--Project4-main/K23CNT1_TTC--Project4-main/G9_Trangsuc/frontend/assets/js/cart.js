function loadCart() {
    const cart = getCart();

    let html = "";
    let total = 0;

    cart.forEach((item, index) => {
        const thanhTien = item.price * item.quantityCart;
        total += thanhTien;

        html += `
            <tr>
                <td>${item.name}</td>
                <td>${formatMoney(item.price)}</td>
                <td>${item.quantityCart}</td>
                <td>${formatMoney(thanhTien)}</td>
                <td>
                    <button onclick="removeCartItem(${index})" class="btn btn-danger btn-sm">
                        Xóa
                    </button>
                </td>
            </tr>
        `;
    });

    document.getElementById("cart-body").innerHTML = html;
    document.getElementById("cart-total").innerText =
        "Tổng tiền: " + formatMoney(total);
}

function removeCartItem(index) {
    let cart = getCart();

    cart.splice(index, 1);

    saveCart(cart);

    loadCart();
}

loadCart();