async function loadCategoryMenu() {

    const response = await fetch(
        `${API_BASE_URL}/bdh/categories/`
    );

    const categories = await response.json();

    let html = `
        <option value="">
            Tất cả danh mục
        </option>
    `;

    categories.forEach(item => {

        html += `
            <option value="${item.id}">
                ${item.name}
            </option>
        `;
    });

    document.getElementById(
        "category-filter"
    ).innerHTML = html;
}

async function filterByCategory() {

    const categoryId =
        document.getElementById(
            "category-filter"
        ).value;

    if (categoryId === "") {

        loadProducts();
        return;
    }

    const response = await fetch(
        `${API_BASE_URL}/bdh/products/category/${categoryId}`
    );

    const products = await response.json();

    renderProducts(products);
}

loadCategoryMenu();