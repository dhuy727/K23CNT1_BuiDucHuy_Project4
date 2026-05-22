
checkAdmin();

async function loadGoldPrices() {
    const response = await fetch(`${API_BASE_URL}/bdh/gold/latest`);
    const prices = await response.json();

    let html = "";

    prices.forEach(item => {
        html += `
            <div class="col-md-4 mb-4">
                <div class="card border-warning shadow">
                    <div class="card-body">
                        <h4 class="text-warning">${item.type}</h4>

                        <p>Giá mua: 
                            <strong>${formatMoney(item.buyPrice)}</strong>
                        </p>

                        <p>Giá bán: 
                            <strong>${formatMoney(item.sellPrice)}</strong>
                        </p>

                        <small>Cập nhật: ${item.updatedAt}</small>
                    </div>
                </div>
            </div>
        `;
    });

    const goldList = document.getElementById("gold-list");

    if (goldList) {
        goldList.innerHTML = html;
    }
}

loadGoldPrices();