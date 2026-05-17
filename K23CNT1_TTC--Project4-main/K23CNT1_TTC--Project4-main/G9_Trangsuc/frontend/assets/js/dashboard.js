async function loadDashboard() {

    const response = await fetch(
        `${API_BASE_URL}/bdh/dashboard/statistics`
    );

    const data = await response.json();

    document.getElementById("product-count").innerText =
        data.products;

    document.getElementById("order-count").innerText =
        data.orders;

    document.getElementById("user-count").innerText =
        data.users;

    document.getElementById("revenue").innerText =
        formatMoney(data.revenue);

    createChart(data);
}

function createChart(data) {

    const ctx =
        document.getElementById("chart");

    new Chart(ctx, {

        type: "bar",

        data: {

            labels: [
                "Sản phẩm",
                "Đơn hàng",
                "Người dùng",
                "Tin tức"
            ],

            datasets: [{

                label: "Thống kê hệ thống",

                data: [
                    data.products,
                    data.orders,
                    data.users,
                    data.news
                ]

            }]
        }
    });
}

loadDashboard();