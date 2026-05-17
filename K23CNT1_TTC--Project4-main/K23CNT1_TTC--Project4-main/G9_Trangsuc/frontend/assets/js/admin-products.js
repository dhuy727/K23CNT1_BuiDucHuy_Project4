async function loadAdminProducts() {
    const response = await fetch(`${API_BASE_URL}/bdh/products/`);
    const products = await response.json();

    let html = "";

    products.forEach(product => {
        html += `
            <tr>
                <td>${product.id}</td>

                <td>
                    <img src="../assets/img/${product.image}" width="70">
                </td>

                <td>${product.name}</td>

                <td>${formatMoney(product.price)}</td>

                <td>${product.quantity}</td>

                <td>${product.status}</td>

                <td>
                    <a href="product-edit.html?id=${product.id}" 
                       class="btn btn-warning btn-sm">
                        Sửa
                    </a>

                    <button onclick="deleteProduct(${product.id})" 
                            class="btn btn-danger btn-sm">
                        Xóa
                    </button>
                </td>
            </tr>
        `;
    });

    document.getElementById("admin-product-body").innerHTML = html;
}

async function deleteProduct(id) {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        return;
    }

    const response = await fetch(`${API_BASE_URL}/bdh/products/delete/${id}`, {
        method: "DELETE"
    });

    const data = await response.json();

    alert(data.message);

    loadAdminProducts();
}

loadAdminProducts();