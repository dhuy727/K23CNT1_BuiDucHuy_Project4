async function uploadImage() {

    const imageFile =
        document.getElementById(
            "upload-image"
        ).files[0];

    if (!imageFile) return;

    const formData = new FormData();

    formData.append(
        "image",
        imageFile
    );

    const response = await fetch(
        `${API_BASE_URL}/bdh/upload/`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if (data.success) {

        document.getElementById(
            "image"
        ).value = data.filename;
    }
}

document.getElementById(
    "upload-image"
).addEventListener(
    "change",
    uploadImage
);

async function createProduct() {
    const product = {
        name: document.getElementById("name").value,
        categoryId: Number(document.getElementById("categoryId").value),
        material: document.getElementById("material").value,
        price: Number(document.getElementById("price").value),
        quantity: Number(document.getElementById("quantity").value),
        image: document.getElementById("image").value,
        description: document.getElementById("description").value
    };

    const response = await fetch(`${API_BASE_URL}/bdh/products/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
    });

    const data = await response.json();

    alert(data.message);

    window.location.href = "products.html";
}