let categoriesData = [];

async function loadCategories() {
    const response = await fetch(`${API_BASE_URL}/bdh/categories/`);
    const categories = await response.json();

    categoriesData = categories;

    let html = "";

    categories.forEach(item => {
        html += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.description || ""}</td>
                <td>${item.parentId || "Không có"}</td>
                <td>
                    <span class="badge ${item.status === "Hoạt động" ? "bg-success" : "bg-secondary"}">
                        ${item.status}
                    </span>
                </td>
                <td>
                    <button onclick="editCategory(${item.id})" class="btn btn-warning btn-sm">
                        Sửa
                    </button>

                    <button onclick="hideCategory(${item.id})" class="btn btn-secondary btn-sm">
                        Ẩn
                    </button>

                    <button onclick="deleteCategory(${item.id})" class="btn btn-danger btn-sm">
                        Xóa
                    </button>
                </td>
            </tr>
        `;
    });

    document.getElementById("category-body").innerHTML = html;
}

function editCategory(id) {
    const item = categoriesData.find(x => x.id === id);

    document.getElementById("categoryId").value = item.id;
    document.getElementById("name").value = item.name;
    document.getElementById("description").value = item.description || "";
    document.getElementById("parentId").value = item.parentId || "";
    document.getElementById("status").value = item.status;
}

async function saveCategory() {
    const id = document.getElementById("categoryId").value;
    const parentValue = document.getElementById("parentId").value;

    const data = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        parentId: parentValue === "" ? null : Number(parentValue),
        status: document.getElementById("status").value
    };

    let url = `${API_BASE_URL}/bdh/categories/create`;
    let method = "POST";

    if (id) {
        url = `${API_BASE_URL}/bdh/categories/update/${id}`;
        method = "PUT";
    }

    const response = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    alert(result.message);

    resetForm();
    loadCategories();
}

async function hideCategory(id) {
    const response = await fetch(`${API_BASE_URL}/bdh/categories/update-status/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: "Ẩn"
        })
    });

    const result = await response.json();

    alert(result.message);

    loadCategories();
}

async function deleteCategory(id) {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) {
        return;
    }

    const response = await fetch(`${API_BASE_URL}/bdh/categories/delete/${id}`, {
        method: "DELETE"
    });

    const result = await response.json();

    alert(result.message);

    loadCategories();
}

function resetForm() {
    document.getElementById("categoryId").value = "";
    document.getElementById("name").value = "";
    document.getElementById("description").value = "";
    document.getElementById("parentId").value = "";
    document.getElementById("status").value = "Hoạt động";
}

loadCategories();