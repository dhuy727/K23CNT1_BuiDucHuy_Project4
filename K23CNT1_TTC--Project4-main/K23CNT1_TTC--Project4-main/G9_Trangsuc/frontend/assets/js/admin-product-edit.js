const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProductEdit() {
    const response = await fetch(`${API_BASE_URL}/bdh/products/${productId}`);
    const product = await response.json();

    document.getElementById("name").value = product.name;
    document.getElementById("categoryId").value = product.categoryId;
    document.getElementById("material").value = product.material;
    document.getElementById("price").value = product.price;
    document.getElementById("quantity").value = product.quantity;
    document.getElementById("image").value = product.image;
    document.getElementById("description").value = product.description;
    document.getElementById("status").value = product.status;
}

async function updateProduct() {
    const product = {
        name: document.getElementById("name").value,
        categoryId: Number(document.getElementById("categoryId").value),
        material: document.getElementById("material").value,
        price: Number(document.getElementById("price").value),
        quantity: Number(document.getElementById("quantity").value),
        image: document.getElementById("image").value,
        description: document.getElementById("description").value,
        status: document.getElementById("status").value
    };

    const response = await fetch(`${API_BASE_URL}/bdh/products/update/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
    });

    const data = await response.json();

    alert(data.message);

    window.location.href = "products.html";
}

loadProductEdit();