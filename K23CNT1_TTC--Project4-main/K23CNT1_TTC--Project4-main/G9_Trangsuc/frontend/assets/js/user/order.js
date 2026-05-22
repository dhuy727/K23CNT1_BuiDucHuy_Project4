async function loadMyOrders() {
    const user = getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const response = await fetch(`${API_BASE_URL}/bdh/orders/user/${user.id}`);
    const orders = await response.json();

    let html = "";

    orders.forEach(order => {
        html += `
            <tr>
                <td>${order.id}</td>
                <td>${order.receiver}</td>
                <td>${order.phone}</td>
                <td>${order.address}</td>
                <td>${formatMoney(order.total)}</td>
                <td>${order.status}</td>
                <td>${order.createdAt}</td>
            </tr>
        `;
    });

    document.getElementById("order-body").innerHTML = html;
}

loadMyOrders();