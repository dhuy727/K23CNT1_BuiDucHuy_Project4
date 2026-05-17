const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let currentProduct = null;

async function loadProductDetail() {
    const response = await fetch(`${API_BASE_URL}/bdh/products/${productId}`);
    const product = await response.json();

    currentProduct = product;

    document.getElementById("product-image").src = `assets/img/${product.image}`;
    document.getElementById("product-name").innerText = product.name;
    document.getElementById("product-price").innerText = formatMoney(product.price);
    document.getElementById("product-material").innerText = "Chất liệu: " + product.material;
    document.getElementById("product-description").innerText = product.description;
}

function addProductToCart() {
    let cart = getCart();

    const existing = cart.find(item => item.id === currentProduct.id);

    if (existing) {
        existing.quantityCart += 1;
    } else {
        currentProduct.quantityCart = 1;
        cart.push(currentProduct);
    }

    saveCart(cart);

    alert("Đã thêm vào giỏ hàng");
}

async function loadReviews() {
    const response = await fetch(`${API_BASE_URL}/bdh/reviews/product/${productId}`);
    const reviews = await response.json();

    let html = "";

    reviews.forEach(item => {
        html += `
            <div class="border rounded p-3 mb-2">
                <strong>${item.user}</strong>
                <span class="text-warning">${"★".repeat(item.stars)}</span>
                <p>${item.content}</p>
                <small>${item.createdAt}</small>
            </div>
        `;
    });

    document.getElementById("review-list").innerHTML = html;
}

async function createReview() {
    const user = getUser();

    if (!user) {
        alert("Vui lòng đăng nhập để đánh giá");
        window.location.href = "login.html";
        return;
    }

    const data = {
        productId: Number(productId),
        userId: user.id,
        stars: Number(document.getElementById("review-stars").value),
        content: document.getElementById("review-content").value
    };

    const response = await fetch(`${API_BASE_URL}/bdh/reviews/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    alert(result.message);

    document.getElementById("review-content").value = "";

    loadReviews();
}

document.getElementById("btn-cart").addEventListener("click", addProductToCart);

loadProductDetail();
loadReviews();