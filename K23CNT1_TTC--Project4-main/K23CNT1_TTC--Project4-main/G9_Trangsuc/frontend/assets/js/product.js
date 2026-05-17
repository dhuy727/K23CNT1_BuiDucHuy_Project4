async function loadProducts() {
    const response = await fetch(`${API_BASE_URL}/bdh/products/`);
    const products = await response.json();

    renderProducts(products);
}

function renderProducts(products) {
    let html = "";

    products.forEach(product => {
        html += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">

                    <img src="assets/img/${product.image}" 
                         class="card-img-top" 
                         style="height:260px; object-fit:cover;">

                    <div class="card-body">

                        <h5>${product.name}</h5>

                        <p>Chất liệu: ${product.material || "Đang cập nhật"}</p>

                        <p class="text-danger fw-bold">
                            ${formatMoney(product.price)}
                        </p>

                        <a href="product-detail.html?id=${product.id}" 
                           class="btn btn-dark btn-sm">
                            Chi tiết
                        </a>

                        <button onclick='addToCart(${JSON.stringify(product)})' 
                                class="btn btn-warning btn-sm">
                            Thêm giỏ hàng
                        </button>
                        <button onclick='addWishlist(${JSON.stringify(product)})'
                            class="btn btn-danger btn-sm mt-2">
                            ♥ Yêu thích
                        </button>

                    </div>
                </div>
            </div>
        `;
    });

    const productList = document.getElementById("product-list");

    if (productList) {
        productList.innerHTML = html;
    }
}

async function searchProduct() {
    const keyword = document.getElementById("keyword").value;

    if (keyword.trim() === "") {
        loadProducts();
        return;
    }

    const response = await fetch(`${API_BASE_URL}/bdh/products/search/${keyword}`);
    const products = await response.json();

    renderProducts(products);
}

function addToCart(product) {
    let cart = getCart();

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantityCart += 1;
    } else {
        product.quantityCart = 1;
        cart.push(product);
    }

    saveCart(cart);

    alert("Đã thêm sản phẩm vào giỏ hàng");
}

loadProducts();

let currentPage = 1;
const pageSize = 6;
let allProducts = [];

function paginateProducts(page) {

    currentPage = page;

    const start =
        (page - 1) * pageSize;

    const end =
        start + pageSize;

    const products =
        allProducts.slice(start, end);

    renderProducts(products);

    renderPagination();
}

function renderPagination() {

    const totalPages =
        Math.ceil(
            allProducts.length / pageSize
        );

    let html = "";

    for (let i = 1; i <= totalPages; i++) {

        html += `
            <button
                onclick="paginateProducts(${i})"
                class="btn btn-sm btn-dark me-2">

                ${i}

            </button>
        `;
    }

    document.getElementById(
        "pagination"
    ).innerHTML = html;
}

allProducts = products;

paginateProducts(1);

function addWishlist(product) {
    let wishlist = getWishlist();

    const existed = wishlist.find(
        item => item.id === product.id
    );

    if (existed) {
        alert("Sản phẩm đã có trong yêu thích");
        return;
    }

    wishlist.push(product);

    saveWishlist(wishlist);

    alert("Đã thêm vào yêu thích");
}