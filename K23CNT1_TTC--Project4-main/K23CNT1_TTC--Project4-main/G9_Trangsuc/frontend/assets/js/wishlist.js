function loadWishlist() {
    const wishlist = getWishlist();

    let html = "";

    wishlist.forEach(product => {
        html += `
            <div class="col-md-4 mb-4">
                <div class="card shadow">

                    <img src="assets/img/${product.image}"
                         class="card-img-top"
                         style="height:250px; object-fit:cover;">

                    <div class="card-body">
                        <h5>${product.name}</h5>

                        <p class="text-danger fw-bold">
                            ${formatMoney(product.price)}
                        </p>

                        <a href="product-detail.html?id=${product.id}"
                           class="btn btn-dark btn-sm">
                            Chi tiết
                        </a>
                    </div>

                </div>
            </div>
        `;
    });

    document.getElementById("wishlist-list").innerHTML = html;
}

loadWishlist();