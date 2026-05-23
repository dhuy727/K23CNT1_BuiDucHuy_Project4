
async function loadGoldPrices() {
    const box = document.getElementById('gold-list') || document.getElementById('goldList');
    if (!box) return;
    box.innerHTML = `<div class='col-12'><div class='skeleton' style='height: 110px;'></div></div>`;
    try {
        const data = await apiFetch(`${API_BASE_URL}/gold/`);
        const items = Array.isArray(data.data) ? data.data : Array.isArray(data.items) ? data.items : [];
        if (!items.length) { box.innerHTML = `<div class='col-12 text-center text-muted'>Chưa có dữ liệu giá vàng.</div>`; return; }
        box.innerHTML = items.map(item => `
            <div class="col-md-6 col-xl-4 mb-4 fade-up">
                <div class="price-card h-100">
                    <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
                        <div>
                            <div class="price-label">${escapeHtml(item.gold_type)}</div>
                            <div class="small text-muted mt-1">Cập nhật: ${formatDateTime(item.updated_at)}</div>
                        </div>
                        <span class="badge badge-soft">Giá vàng</span>
                    </div>
                    <div class="price-row"><span>Giá mua</span><span class="price-value">${formatMoney(item.buy_price)}</span></div>
                    <div class="price-row"><span>Giá bán</span><span class="price-value">${formatMoney(item.sell_price)}</span></div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        box.innerHTML = `<div class='col-12 text-danger text-center'>Không tải được giá vàng.</div>`;
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', loadGoldPrices);
