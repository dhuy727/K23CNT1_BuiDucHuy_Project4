
const productParams = new URLSearchParams(window.location.search);
const productId = productParams.get('id');

async function loadProductDetail() {
    const box = document.getElementById('productDetail');
    if (!box) return;
    box.innerHTML = `<div class='skeleton' style='height: 320px;'></div>`;

    if (!productId) {
        box.innerHTML = `<div class='alert alert-warning'>Không có ID sản phẩm. Vui lòng thử lại từ trang danh sách sản phẩm.</div>`;
        return;
    }

    try {
        const data = await apiFetch(`${API_BASE_URL}/products/${productId}`);
        const product = data.data;

        if (!product) {
            box.innerHTML = `<div class='alert alert-warning'>Không tìm thấy sản phẩm.</div>`;
            return;
        }

        const imageUrl = getImageUrl(String(product.image || "").replace(/\\/g, "/"));
        const stockLabel = Number(product.quantity || 0) > 0 ? `<span class="badge bg-success">Còn hàng</span>` : `<span class="badge bg-secondary">Hết hàng</span>`;

        box.innerHTML = `
            <div class="mb-4">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb mb-0">
                        <li class="breadcrumb-item"><a href="products.html">Sản phẩm</a></li>
                        <li class="breadcrumb-item active" aria-current="page">${escapeHtml(product.name)}</li>
                    </ol>
                </nav>
            </div>
            <div class="row g-4 align-items-start fade-up">
                <div class="col-lg-6">
                    <div class="card border-0 shadow-sm overflow-hidden">
                        <img src="${escapeHtml(imageUrl)}" class="img-fluid" alt="${escapeHtml(product.name)}">
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="surface-card p-4 p-lg-5">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <span class="badge badge-soft">${escapeHtml(product.category_name || 'Trang sức')}</span>
                            ${stockLabel}
                        </div>
                        <h1 class="h2 fw-black mb-3">${escapeHtml(product.name)}</h1>
                        <div class="product-price mb-3">${formatMoney(product.price)}</div>
                        <div class="row row-cols-2 g-2 mb-4">
                            <div class="col"><strong>Chất liệu:</strong> ${escapeHtml(product.material || 'Chưa cập nhật')}</div>
                            <div class="col"><strong>Kho:</strong> ${escapeHtml(product.quantity ?? '0')}</div>
                        </div>
                        <p class="text-muted lh-lg mb-4">${escapeHtml(product.description || 'Chưa có mô tả cho sản phẩm này.')}</p>
                        <div class="d-flex flex-wrap gap-3 align-items-center">
                            <div class="input-group" style="max-width: 150px;">
                                <span class="input-group-text">SL</span>
                                <input type="number" id="quantity" class="form-control" min="1" value="1">
                            </div>
                            <button type="button" class="btn btn-gold px-4" onclick="addToCartFromDetail()">Thêm vào giỏ hàng</button>
                            <a href="products.html" class="btn btn-outline-gold px-4">Quay lại</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-5">
                <ul class="nav nav-pills mb-3" id="productDetailTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="tab-info-btn" data-bs-toggle="pill" data-bs-target="#tab-info" type="button" role="tab">Mô tả</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-reviews-btn" data-bs-toggle="pill" data-bs-target="#tab-reviews" type="button" role="tab">Đánh giá</button>
                    </li>
                </ul>
                <div class="tab-content" id="productDetailTabContent">
                    <div class="tab-pane fade show active" id="tab-info" role="tabpanel" aria-labelledby="tab-info-btn">
                        <div class="surface-card p-4 p-lg-5">
                            <h3 class="mb-3">Thông tin sản phẩm</h3>
                            <p class="text-muted mb-0">${escapeHtml(product.description || 'Chưa có mô tả cho sản phẩm này.')}</p>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="tab-reviews" role="tabpanel" aria-labelledby="tab-reviews-btn">
                        <div id="reviewSummary" class="mb-4"></div>
                        <div id="reviewList" class="mb-4"></div>
                        <div id="reviewFormContainer"></div>
                    </div>
                </div>
            </div>
        `;
        loadProductReviews(productId);
    } catch (error) {
        box.innerHTML = `<div class='alert alert-danger'>Không tải được chi tiết sản phẩm.</div>`;
        console.error(error);
    }
}

function renderReviewStars(score) {
    const filled = Number(score) || 0;
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
        stars.push(`<i class="fa-solid fa-star${i <= filled ? " text-warning" : " text-muted"}"></i>`);
    }
    return stars.join(" ");
}

function renderRatingSummary(reviews) {
    const count = reviews.length;
    const average = count ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / count : 0;
    return `
        <div class="surface-card p-4 p-lg-5">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                <div>
                    <div class="text-muted">Đánh giá trung bình</div>
                    <div class="fs-3 fw-bold">${average.toFixed(1)} / 5</div>
                </div>
                <div class="text-end">
                    <div class="text-muted">Tổng đánh giá</div>
                    <div class="fs-5 fw-semibold">${count} nhận xét</div>
                </div>
            </div>
            <div>${renderReviewStars(Math.round(average))}</div>
        </div>
    `;
}

function renderReviewItem(review) {
    return `
        <div class="surface-card p-4 mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="fw-semibold">${escapeHtml(review.full_name || 'Khách hàng')}</div>
                <div>${renderReviewStars(review.rating)}</div>
            </div>
            <div class="text-muted small mb-2">${escapeHtml(review.created_at || '')}</div>
            <div>${escapeHtml(review.content || '')}</div>
        </div>
    `;
}

async function loadProductReviews(productId) {
    const summary = document.getElementById('reviewSummary');
    const list = document.getElementById('reviewList');
    const form = document.getElementById('reviewFormContainer');

    if (!summary || !list || !form) return;

    summary.innerHTML = `<div class='skeleton' style='height: 120px;'></div>`;
    list.innerHTML = `<div class='skeleton' style='height: 180px;'></div>`;
    form.innerHTML = '';

    try {
        const response = await apiFetch(`${API_BASE_URL}/reviews/product/${productId}`);
        const reviews = Array.isArray(response.data) ? response.data : [];

        summary.innerHTML = renderRatingSummary(reviews);
        list.innerHTML = reviews.length
            ? reviews.map(renderReviewItem).join('')
            : `<div class="alert alert-info">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đánh giá đầu tiên!</div>`;

        const user = getCurrentUser();
        if (user) {
            form.innerHTML = `
                <div class="surface-card p-4 p-lg-5">
                    <h3 class="mb-3">Viết đánh giá</h3>
                    <div class="mb-3">
                        <label class="form-label">Số sao</label>
                        <select id="reviewRating" class="form-select">
                            <option value="5">5 sao</option>
                            <option value="4">4 sao</option>
                            <option value="3">3 sao</option>
                            <option value="2">2 sao</option>
                            <option value="1">1 sao</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nội dung đánh giá</label>
                        <textarea id="reviewContent" class="form-control" rows="4" placeholder="Chia sẻ cảm nhận của bạn về sản phẩm"></textarea>
                    </div>
                    <button type="button" class="btn btn-warning" onclick="submitReview()">Gửi đánh giá</button>
                </div>
            `;
        } else {
            form.innerHTML = `
                <div class="alert alert-secondary">
                    <strong>Đăng nhập để viết đánh giá.</strong>
                    <a href="login.html" class="btn btn-outline-gold btn-sm ms-2">Đăng nhập</a>
                </div>
            `;
        }
    } catch (error) {
        summary.innerHTML = `<div class='alert alert-danger'>Không tải được đánh giá.</div>`;
        list.innerHTML = '';
        form.innerHTML = '';
        console.error(error);
    }
}

async function submitReview() {
    const rating = Number(document.getElementById('reviewRating')?.value || 0);
    const content = String(document.getElementById('reviewContent')?.value || '').trim();
    const user = getCurrentUser();
    const token = getToken();

    if (!user || !token) {
        showToast('Bạn cần đăng nhập để đánh giá.', 'info');
        return;
    }

    if (rating < 1 || rating > 5) {
        showToast('Vui lòng chọn số sao.', 'error');
        return;
    }

    if (content.length < 10) {
        showToast('Đánh giá cần ít nhất 10 ký tự.', 'error');
        return;
    }

    try {
        const result = await apiFetch(`${API_BASE_URL}/reviews/`, {
            method: 'POST',
            body: JSON.stringify({
                product_id: Number(productId),
                rating,
                content
            })
        });

        if (result.success) {
            showToast(result.message || 'Đã gửi đánh giá.', 'success');
            loadProductReviews(productId);
            document.getElementById('reviewContent').value = '';
            document.getElementById('reviewRating').value = '5';
        } else {
            showToast(result.message || 'Không thể gửi đánh giá.', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Lỗi khi gửi đánh giá.', 'error');
    }
}

async function addToCartFromDetail() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Bạn cần đăng nhập để mua hàng.', 'info');
        setTimeout(() => window.location.href = 'login.html', 800);
        return;
    }
    const quantity = Number(document.getElementById('quantity')?.value || 1);
    if (quantity < 1) {
        showToast('Số lượng phải lớn hơn 0', 'error');
        return;
    }

    try {
        const result = await apiFetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            body: JSON.stringify({
                user_id: user.id,
                product_id: Number(productId),
                quantity
            })
        });

        if (result.success) {
            showToast(result.message || 'Đã thêm vào giỏ hàng', 'success');
            dispatchCartChanged();
        } else {
            showToast(result.message || 'Không thể thêm vào giỏ hàng', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Lỗi khi thêm vào giỏ hàng', 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadProductDetail);
